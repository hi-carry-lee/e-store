"use client";

import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart } from "@/lib/actions/cart.actions";
import { CartItem } from "@/types";
import { Loader, Plus, PlusIcon } from "lucide-react";
import { useTransition } from "react";

const AddToCartButton = ({
  existingItem,
  item,
  actionLabel,
  onActionClick,
}: {
  existingItem: boolean;
  item: CartItem;
  actionLabel?: string;
  onActionClick?: () => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleAddToCart(item: CartItem) {
    startTransition(async () => {
      const res = await addItemToCart(item);
      toast({
        variant: res.success ? "default" : "destructive",
        duration: 1500,
        description: res.message,
        action:
          actionLabel && onActionClick ? (
            <ToastAction
              altText={actionLabel}
              onClick={onActionClick}
              className="bg-primary text-white rounded-md text-sm w-auto whitespace-nowrap px-2 py-1 hover:bg-gray-800"
            >
              {actionLabel}
            </ToastAction>
          ) : undefined,
      });
      return;
    });
  }

  return existingItem ? (
    <Button
      disabled={isPending}
      variant="outline"
      type="button"
      onClick={() => handleAddToCart(item)}
    >
      {isPending ? (
        <Loader className="!w-3 !h-3 animate-spin" />
      ) : (
        // ! "w-4 h-4" doesn't affect, after asking AI, it suggest add '!'
        <Plus className="!w-3 !h-3" />
      )}
    </Button>
  ) : (
    <Button
      className="w-full"
      type="button"
      onClick={() => handleAddToCart(item)}
    >
      <PlusIcon /> Add To Cart
    </Button>
  );
};

export default AddToCartButton;
