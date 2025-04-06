"use client";

import { Cart, CartItem } from "@/types";
import { useRouter } from "next/navigation";
import RemoveFromCartButton from "./remove-from-cart-button";
import AddToCartButton from "./add-to-cart-button";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();

  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div className="flex-center space-x-2">
      <RemoveFromCartButton
        productId={item.productId}
        actionLabel="Go To Cart"
        onActionClick={() => router.push("/cart")}
      />
      <span className="px-2">{existItem.qty}</span>
      <AddToCartButton
        existingItem={true}
        item={item}
        actionLabel="Go To Cart"
        onActionClick={() => router.push("/cart")}
      />
    </div>
  ) : (
    <AddToCartButton
      existingItem={false}
      item={item}
      actionLabel="Go To Cart"
      onActionClick={() => router.push("/cart")}
    />
  );
};

export default AddToCart;
