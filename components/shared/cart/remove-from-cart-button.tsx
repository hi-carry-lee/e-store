import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { removeItemFromCart } from "@/lib/actions/cart.actions";

import { Loader, Minus } from "lucide-react";
import { useTransition } from "react";

const RemoveFromCartButton = ({
  productId,
  actionLabel,
  onActionClick,
}: {
  productId: string;
  actionLabel?: string;
  onActionClick?: () => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleRemoveFromCart(productId: string) {
    startTransition(async () => {
      const res = await removeItemFromCart(productId);
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
  return (
    <Button
      disabled={isPending}
      variant="outline"
      type="button"
      onClick={() => handleRemoveFromCart(productId)}
    >
      {isPending ? (
        <Loader className="animate-spin" />
      ) : (
        // ! "w-4 h-4" doesn't affect, after asking AI, it suggest add '!'
        <Minus className="!w-3 !h-3" />
      )}
    </Button>
  );
};

export default RemoveFromCartButton;
