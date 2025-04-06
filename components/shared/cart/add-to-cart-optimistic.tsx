"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { formatError } from "@/lib/utils";
import { Cart, CartItem } from "@/types";
import { ToastAction } from "@radix-ui/react-toast";
import { Loader, Minus, Plus, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // 定义乐观更新函数
  const [optimisticCart, addOptimisticCart] = useOptimistic(
    cart || { items: [] },
    (state, action: { type: "add" | "remove"; item: CartItem }) => {
      // 创建新的购物车状态
      const newState = JSON.parse(JSON.stringify(state)) as Cart;
      if (action.type === "add") {
        const existItem = newState.items.find(
          (x) => x.productId === action.item.productId
        );

        if (existItem) {
          // 增加数量
          existItem.qty += 1;
        } else {
          // 添加新商品
          newState.items.push(action.item);
        }
        return newState;
      } else if (action.type === "remove") {
        const existItemIndex = newState.items.findIndex(
          (x) => x.productId === action.item.productId
        );

        if (existItemIndex >= 0) {
          // 减少数量或移除
          if (newState.items[existItemIndex].qty > 1) {
            newState.items[existItemIndex].qty -= 1;
          } else {
            newState.items.splice(existItemIndex, 1);
          }
        }
        return newState;
      }
      return state;
    }
  );

  const handleAddToCart = async () => {
    startTransition(async () => {
      // 乐观更新
      addOptimisticCart({ type: "add", item });

      try {
        const res = await addItemToCart(item);

        if (!res.success) {
          toast({
            variant: "destructive",
            description: res.message,
          });
        } else {
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
        }
      } catch (error) {
        toast({
          variant: "destructive",
          description: formatError(error),
        });
      }
    });
  };

  const handleRemoveItem = async () => {
    startTransition(async () => {
      // 乐观更新
      addOptimisticCart({ type: "remove", item });

      try {
        const res = await removeItemFromCart(item.productId);

        toast({
          variant: res.success ? "default" : "destructive",
          description: res.message,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          description: formatError(error),
        });
      }
    });
  };

  const existItem = optimisticCart.items.find(
    (x) => x.productId === item.productId
  );

  return existItem ? (
    <div className="flex-center space-x-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleRemoveItem}
        disabled={isPending}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button
        type="button"
        variant="outline"
        onClick={handleAddToCart}
        disabled={isPending}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  ) : (
    <Button
      className="w-full"
      type="button"
      onClick={handleAddToCart}
      disabled={isPending}
    >
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <PlusIcon />
      )}{" "}
      Add To Cart
    </Button>
  );
};

export default AddToCart;
