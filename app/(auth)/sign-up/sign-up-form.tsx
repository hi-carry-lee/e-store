"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { signUpUser } from "@/lib/actions/user.actions";
import { useSearchParams } from "next/navigation";

const SignUpForm = () => {
  const searchParams = useSearchParams();
  // 在这里获取callbackUrl是为了在action中跳转用，当前还未用到
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [data, action] = useActionState(signUpUser, {
    success: false,
    fieldErrors: {},
    generalError: "",
  });

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="John" type="text" />
          <FieldError name="name" errors={data?.fieldErrors} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="example@test.com"
            type="email"
          />
          <FieldError name="email" errors={data?.fieldErrors} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="******"
            type="password"
          />
          <FieldError name="password" errors={data?.fieldErrors} />
        </div>
        <div>
          <Label htmlFor="password">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            placeholder="******"
            type="password"
          />
          <FieldError name="confirmPassword" errors={data?.fieldErrors} />
        </div>
        <div>
          <SignUpButton />
        </div>
        {data && !data.success && (
          <div className="text-center text-destructive">{data.message}</div>
        )}
        <div className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Button variant="ghost" asChild>
            {/* target="_self" is the default behavior of Link, no need to specify explicitly */}
            <Link target="_self" className="link font-semibold" href="/sign-in">
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </form>
  );
};

// 表单按钮组件
function SignUpButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="default" className="w-full" disabled={pending}>
      {pending ? "Submitting..." : "Sign Up"}
    </Button>
  );
}

// 字段错误显示组件（原始方案只能在最下方展示错误信息，如果多个字段校验错误，那么错误信息展示地不够明确）
// 这种方式是模拟使用React Hook Form + Shadcn 组件中展示错误的方式
const FieldError = ({
  name,
  errors,
}: {
  name: string;
  errors?: Record<string, string>;
}) => {
  const error = errors?.[name];

  if (!error) return null;
  return <p className="text-sm text-destructive mt-1">{error}</p>;
};

export default SignUpForm;
