"use server";

import { CartItem } from "@/types";
import { cartItemSchema, insertCartSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Calculate cart price based on items
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    // TODO Store the price needed for shipping cost calculation in the configuration table
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    // TODO Store the tax rate in the configuration table
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export const addItemToCart = async (data: CartItem) => {
  try {
    // check for cart cookie
    const requestCookies = await cookies();
    const sessionCartId = requestCookies.get("sessionCartId")?.value;
    if (!sessionCartId) {
      throw new Error("Cart session not found!");
    }

    // check for user id
    const session = await auth();
    const userId = session?.user.id ? session?.user.id : undefined;

    // Get cart from database
    const cart = await getMyCart();

    // Parse and validate submitted item data
    const item = cartItemSchema.parse(data);

    // Find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found");

    if (!cart) {
      // Create new cart object
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });

      // Add to database
      await prisma.cart.create({
        data: newCart,
      });

      // Revalidate product page
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: "Item added to cart successfully",
      };
    } else {
      // Check for existing item in cart
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );
      // If cart item already exists
      if (existItem) {
        // Standard inventory management workflow:
        // 1. Adding to cart: Only check if stock is available, do not reduce actual inventory
        // 2. Order creation: Check and lock inventory (temporary status)
        // 3. After payment: Formally reduce inventory
        // 4. Order cancellation/timeout: Release locked inventory
        // If not enough stock, throw error
        // this code suit the case that every time only add one product to cart
        if (product.stock < existItem.qty + 1) {
          throw new Error("Not enough stock");
        }

        // Increase quantity of existing item
        existItem.qty = existItem.qty + 1;
      } else {
        // If stock, add item to cart
        if (product.stock < 1) throw new Error("Not enough stock");
        cart.items.push(item);
      }

      // Save to database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items,
          ...calcPrice(cart.items as CartItem[]),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existItem ? "updated in" : "added to"
        } cart successfully`,
      };
    }
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export async function getMyCart() {
  // check for cart cookie
  const requestCookies = await cookies();
  const sessionCartId = requestCookies.get("sessionCartId")?.value;
  if (!sessionCartId) {
    throw new Error("Cart session not found!");
  }

  // Get session and user ID
  const session = await auth();
  const userId = session?.user.id;

  // Get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  // Convert Decimal values to strings
  // return convertToPlainObject({
  //   ...cart,
  //   items: cart.items as CartItem[],
  //   itemsPrice: cart.itemsPrice.toString(),
  //   totalPrice: cart.totalPrice.toString(),
  //   shippingPrice: cart.shippingPrice.toString(),
  //   taxPrice: cart.taxPrice.toString(),
  // });

  // since I have override convertToPlainObject, no need to desctructure param
  // !conver prisma object to plain js object
  return convertToPlainObject(cart);
}

export async function removeItemFromCart(productId: string) {
  try {
    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }

    // Get user cart
    const cart = await getMyCart();
    if (!cart) {
      throw new Error("Cart not found!");
    }

    // Check for items
    const cartItemExist = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    );
    if (!cartItemExist) {
      throw new Error("Cart Item not found!");
    }

    // Check if only one quantity
    if (cartItemExist.qty === 1) {
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== productId
      );
    } else {
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
        cartItemExist.qty - 1;
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);
    return { success: true, message: `${product.name} was removed from cart!` };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
