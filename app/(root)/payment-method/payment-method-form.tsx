"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useTransition } from "react";
import { paymentMethodSchema } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateUserPaymentMethod } from "@/lib/actions/user.actions";

const PaymentMethodForm = ({
  preferredPaymentMethod,
}: {
  preferredPaymentMethod: string | null; // ! it's better to accept an empty argument or default value
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  /*
  why useEffect?
  问题在于 RadioGroupItem 的 checked 属性。
  在 React 中，单选按钮的 checked 状态在服务器端和客户端之间可能会有不一致，特别是当它依赖于动态值（如 field.value）时。这是因为：
    服务器端渲染时确定了一个初始状态
    客户端水合时，React Hook Form 可能会对表单状态进行重新计算，导致 field.value 变化
    这种变化导致 checked 属性在服务器和客户端渲染之间不一致
  最可靠的解决方案是使用 useEffect 和 useState 来延迟表单的渲染，直到客户端水合完成
  */
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // ！不能把 if (!isMounted) 放在这里，因为React中 hooks需要在所有的if之前执行

  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD,
    },
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: z.infer<typeof paymentMethodSchema>) => {
    startTransition(async () => {
      const res = await updateUserPaymentMethod(values);

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
        return;
      }

      router.push("/place-order");
    });
  };

  if (!isMounted) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Payment Method</h1>
        <p className="text-sm text-muted-foreground">
          Please select a payment method
        </p>
        <div>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Payment Method</h1>
        <p className="text-sm text-muted-foreground">
          Please select a payment method
        </p>
        <Form {...form}>
          <form
            method="post"
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        className="flex flex-col space-y-2"
                      >
                        {PAYMENT_METHODS.map((paymentMethod) => (
                          <FormItem
                            key={paymentMethod}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem
                                value={paymentMethod}
                                checked={field.value === paymentMethod}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {paymentMethod}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}{" "}
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default PaymentMethodForm;
