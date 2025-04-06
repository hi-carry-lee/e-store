"use client";

import { Cart } from "@/types";
import { useRouter } from "next/navigation";

import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RemoveFromCartButton from "@/components/shared/cart/remove-from-cart-button";
import AddToCartButton from "@/components/shared/cart/add-to-cart-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();

  return (
    <>
      <h2 className="py-4 h2-bold">Shopping Cart</h2>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="md:col-span-3 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        className="flex items-center gap-2"
                        href={`/product/${item.slug}`}
                      >
                        <Image
                          src={item.image}
                          width={50}
                          height={50}
                          alt={item.name}
                        />
                        <span>{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="flex-center gap-2">
                      <RemoveFromCartButton productId={item.productId} />
                      {item.qty}
                      <AddToCartButton item={item} existingItem={true} />
                    </TableCell>
                    <TableCell className="text-right">${item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* the height won't increase while the TableRow increasing */}
          <div className="h-fit md:sticky md:top-4">
            <Card>
              <CardContent className="p-4 gap-4 pb-8">
                <div className="pb-3 text-xl">
                  Subtotal({cart.items.reduce((acc, item) => acc + item.qty, 0)}
                  ):
                  <span className="font-bold">
                    {formatCurrency(cart.itemsPrice)}
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => router.push("/shipping-address")}
                >
                  <ArrowRight /> Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default CartTable;
