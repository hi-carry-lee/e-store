"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { CartItem, PaymentResult, ShippingAddress } from "@/types/index";
import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";
import { paypal } from "@/lib/paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { sendPurchaseReceipt } from "@/email";

// Create order and create order items
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: "No shipping address",
        redirectTo: "/shipping-address",
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No payment method",
        redirectTo: "/payment-method",
      };
    }

    // Create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // Create a transaction to create order and order items in database
    const insertedOrderId = await (
      prisma.$transaction as (
        // 使用 as 强制匹配交互式事务类型，否则会默认匹配批量事务
        fn: (tx: Prisma.TransactionClient) => Promise<string>
      ) => Promise<string>
    )(async (tx) => {
      // Create order
      const insertedOrder = await tx.order.create({ data: order });
      // Create order items from the cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }
      // Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });
      // since we need order id, so we return it, and it should match the Promise<string>
      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error("Order not created");

    return {
      success: true,
      message: "Order created",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

export async function getOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { email: true, name: true } },
    },
  });

  return convertToPlainObject(order);
}

export async function createPaypalOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error("Order not found");
    }
    const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: paypalOrder.id,
          email_address: "",
          status: "",
          pricePaid: "0",
        },
      },
    });

    return {
      success: true,
      message: "Paypal order created successfully",
      data: paypalOrder.id,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Once the user has entered their credentials and payment is made, we get back the order id from PayPal，and we need to approve the order
// this action is used to approve the payment;
export async function approvePayPalOrder(
  orderId: string, // order id of our app
  data: { orderID: string } // order id of Paypal
) {
  try {
    // Security Check: Find the order in the database
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });
    if (!order) throw new Error("Order not found");

    // Result Check: Check if the order is already paid
    // transfer money from the customer to the seller
    const captureData = await paypal.capturePayment(data.orderID);
    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== "COMPLETED"
    )
      throw new Error("Error in paypal payment");

    // ! forget to use await, so after payment is done, it can't refresh the page, then payment button is still there.
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Your order has been successfully paid by PayPal",
    };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // Find the order in the database and include the order items
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
    },
  });

  if (!order) throw new Error("Order not found");

  if (order.isPaid) throw new Error("Order is already paid");

  // Transaction to update the order and update the product quantities
  await (
    prisma.$transaction as (
      fn: (tx: Prisma.TransactionClient) => Promise<void>
    ) => Promise<void>
  )(async (tx) => {
    // Update all item quantities in the database
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.qty } },
      });
    }

    // Set the order to paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  // Get the updated order after the transaction
  const updatedOrder = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!updatedOrder) {
    throw new Error("Order not found");
  }

  // Send the purchase receipt email with the updated order
  sendPurchaseReceipt({
    order: {
      ...updatedOrder,
      itemsPrice: updatedOrder.itemsPrice.toString(),
      shippingPrice: updatedOrder.shippingPrice.toString(),
      taxPrice: updatedOrder.taxPrice.toString(),
      totalPrice: updatedOrder.totalPrice.toString(),
      orderItems: updatedOrder.orderItems.map((item) => ({
        ...item,
        price: item.price.toString(),
      })),
      shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
      paymentResult: updatedOrder.paymentResult as PaymentResult,
    },
  });
  // 为什么手动将金额类型转换为字符串？而且在Prisma的客户端扩展中已经将金额类型转换为字符串了？
  // 1. Prisma 扩展中的 $extends 确实会在运行时将 Decimal 值转换为字符串，但这只影响运行时的值，不会改变 TypeScript 的静态类型定义
  // 2. 当您使用 prisma.$extends 时，TypeScript 并不会自动更新其返回类型，类型系统仍然认为这些字段是 Decimal 类型，即使运行时它们会被转换为字符串
  // 3. 即使数据在运行时被转换为字符串，TypeScript 编译器在编译时仍然使用原始的 Prisma 生成的类型
}

export async function getMyOrders({
  limit = PAGE_SIZE,
  page = 1,
}: {
  limit?: number;
  page?: number;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("User  is not authenticated");

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    });

    const dataCount = await prisma.order.count({
      where: { userId },
    });

    return {
      success: true,
      message: "Orders fetched successfully",
      data: convertToPlainObject(orders),
      totalPages: Math.ceil(dataCount / limit),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

export async function getOrderSummary() {
  // get counts for each resources
  const usersCount = await prisma.user.count();
  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();

  // calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: {
      totalPrice: true,
    },
  });

  // Get monthly sales
  // 在 PostgreSQL 中，当你使用不带双引号的别名时，别名会被自动转换为小写：
  // 所以，as totalSales会被转换为totalsales，应该加上引号
  const salesDataRaw =
    await prisma.$queryRaw<SalesDataType>`select to_char("createdAt", 'MM/YY') as month, sum("totalPrice") as "totalSales" from "Order" group by month`;

  const salesData = salesDataRaw.map((item) => ({
    month: item.month,
    totalSales: Number(item.totalSales),
  }));

  // Get the latest 6 orders
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
    take: 6,
  });

  return {
    usersCount,
    productsCount,
    ordersCount,
    totalSales,
    salesData,
    latestSales,
  };
}

// Get All Orders (Admin)
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter: Prisma.OrderWhereInput =
    query && query !== "all"
      ? {
          user: {
            name: {
              contains: query,
              mode: "insensitive",
            } as Prisma.StringFilter,
          },
        }
      : {};

  const data = await prisma.order.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: { user: { select: { name: true } } },
  });

  const dataCount = await prisma.order.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete an order
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });

    revalidatePath("/admin/orders");

    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// when we use Cash on Delivery, we need another method to update the order to paid
export async function updateOrderToPaidByCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: "Order paid successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// Update Order To Delivered
export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error("Order not found");
    if (!order.isPaid) throw new Error("Order is not paid");

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: "Order delivered successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}
