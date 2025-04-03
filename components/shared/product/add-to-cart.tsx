"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart } from "@/lib/actions/cart.actions";
import { CartItem } from "@/types";
import { ToastAction } from "@radix-ui/react-toast";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();
  const { toast } = useToast();
  console.log("add to cart component, param item: ", item);

  const handleAddToCart = async () => {
    const res = await addItemToCart(item);

    if (!res.success) {
      toast({
        variant: "destructive",
        description: res.message,
      });
      return;
    }

    // Handle success add to cart
    toast({
      description: res.message,
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
  };

  return (
    <>
      <Button className="w-full" type="button" onClick={handleAddToCart}>
        <PlusIcon /> Add To Cart
      </Button>
    </>
  );
};

export default AddToCart;
