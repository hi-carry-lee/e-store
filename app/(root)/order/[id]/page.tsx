import { auth } from "@/auth";
import OrderDetailsTable from "./order-details-table";
import { getOrderById } from "@/lib/actions/order.actions";
import { ShippingAddress } from "@/types";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await auth();

  let client_secret = null;

  // Check if using Stripe and not paid
  if (order.paymentMethod === "Stripe" && !order.isPaid) {
    // Initialize Stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    // Create a new payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: "USD",
      metadata: { orderId: order.id },
    });
    client_secret = paymentIntent.client_secret;
  }

  // Redirect the user if they don't own the order
  if (order.userId !== session?.user.id && session?.user.role !== "admin") {
    return redirect("/unauthorized");
  }

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
      }}
      stripeClientSecret={client_secret}
      // sb stand for sandbox
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      isAdmin={session?.user.role === "admin" || false}
    />
  );
};

export default OrderDetailsPage;
