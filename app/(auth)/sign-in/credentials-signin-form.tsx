"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { useSearchParams } from "next/navigation";

const CredentialsSignInForm = () => {
  const searchParams = useSearchParams();
  // 在这里获取callbackUrl是为了在action中跳转用，当前还未用到
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // from React 19, recommend useActionState instead of useFormState;
  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: "",
  });

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder={signInDefaultValues.email}
            type="email"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="******"
            type="password"
            required
          />
        </div>
        <div>
          <SignInButton />
        </div>
        {data && !data.success && (
          <div className="text-center text-destructive">{data.message}</div>
        )}
        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button variant="ghost" asChild>
            {/* target="_self" is the default behavior of Link, no need to specify explicitly */}
            <Link target="_self" className="link font-semibold" href="/sign-up">
              Sign Up
            </Link>
          </Button>
        </div>
      </div>
    </form>
  );
};

// 表单按钮组件
function SignInButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="default" className="w-full" disabled={pending}>
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  );
}
export default CredentialsSignInForm;
