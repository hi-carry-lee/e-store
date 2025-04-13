import PaginationPlus from "@/components/shared/pagination-plus";
import PaginationSimple from "@/components/shared/pagination-simple";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Order } from "@/types";
import Link from "next/link";

const OrderTables = ({
  orders,
  totalPages,
  page,
}: {
  orders: Order[];
  totalPages: number;
  page: number | string;
}) => {
  return (
    <div className="space-y-2">
      <h2 className="h2-bold">Orders</h2>
      <div className="overflow-x-auto">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              {/* 为每列设置固定宽度 */}
              <TableHead className="w-[15%]">Id</TableHead>
              <TableHead className="w-[20%]">Date</TableHead>
              <TableHead className="w-[15%]">Total</TableHead>
              <TableHead className="w-[15%]">Paid</TableHead>
              <TableHead className="w-[20%]">Delivered</TableHead>
              <TableHead className="w-[15%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell>
                  {formatDateTime(order.createdAt).dateTime}
                </TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  {/* Since deliveredAt is Date || null, so we need ensure if exists */}
                  {order.isPaid && order.paidAt
                    ? formatDateTime(order.paidAt).dateTime
                    : "Not Paid"}
                </TableCell>
                <TableCell>
                  {order.isDelivered && order.deliveredAt
                    ? formatDateTime(order.deliveredAt).dateTime
                    : "Not Delivered"}
                </TableCell>
                <TableCell>
                  <Link href={`/order/${order.id}`}>
                    <span className="px-3 py-1 bg-gray-200 rounded-full">
                      Details -&gt;
                    </span>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <PaginationSimple page={Number(page) || 1} totalPages={totalPages} />
        )}
        {totalPages > 1 && (
          <PaginationPlus page={Number(page) || 1} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
};

export default OrderTables;
