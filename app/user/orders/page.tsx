import { Metadata } from "next";
import { getMyOrders } from "@/lib/actions/order.actions";

import OrderTables from "./order-tables";
import { PAGE_SIZE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and manage your orders.",
};

const UserOrders = async (props: {
  searchParams: Promise<{ page: string }>;
}) => {
  const { page } = await props.searchParams;

  const response = await getMyOrders({
    limit: PAGE_SIZE,
    page: Number(page) || 1, // since there might be no page in the url, it will be undefined, so we need to ensure it is a number
  });
  if (!response.success) {
    return <div className="h2-bold">{response.message}</div>;
  }

  const orders = response.data;
  const totalPages = response.totalPages || 0;
  return (
    <>
      <OrderTables
        orders={orders}
        totalPages={totalPages}
        page={Number(page) || 1}
      />
    </>
  );
};

export default UserOrders;
