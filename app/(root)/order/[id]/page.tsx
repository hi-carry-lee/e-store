import OrderDetailsTable from "./order-details-table";
import { getOrderById } from "@/lib/actions/order.actions";
import { ShippingAddress } from "@/types";
import { notFound } from "next/navigation";

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;
  const { id } = params;

  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
      }}
      // sb stand for sandbox
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
    />
  );
};

export default OrderDetailsPage;
