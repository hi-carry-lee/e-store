"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { Cart, CartItem } from "@/types";
import { ToastAction } from "@radix-ui/react-toast";
import { Loader, Minus, Plus, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

// TODO: use useOptimistic instead of useTransition
const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast({
          variant: "destructive",
          duration: 1500,
          description: res.message,
        });
        return;
      }

      // Handle success add to cart
      toast({
        description: res.message,
        duration: 1500,
        action: (
          <ToastAction
            className="bg-primary text-white rounded-md text-sm w-auto whitespace-nowrap px-2 py-1 hover:bg-gray-800"
            altText="Go To Cart"
            onClick={() => router.push("/cart")}
          >
            Go To Cart
          </ToastAction>
        ),
      });
    });
  };

  const handleRemoveItem = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      toast({
        variant: res.success ? "default" : "destructive",
        duration: 1500,
        description: res.message,
      });

      return;
    });
  };

  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div className="flex-center space-x-2">
      <Button type="button" variant="outline" onClick={handleRemoveItem}>
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button
        // className="w-4 h-4"
        type="button"
        variant="outline"
        onClick={handleAddToCart}
      >
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      <PlusIcon /> Add To Cart
    </Button>
  );
};

export default AddToCart;
