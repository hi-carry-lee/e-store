"use server";

import { signInFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

/*
  Why user this params? since we will use this action in the useFormState hook, it requires these params
*/
// User Sign In Action
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  const parseResult = signInFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (parseResult.error) {
    return { success: false, message: "Invalid credentials" };
  }

  const credentials = parseResult.data;
  try {
    await signIn("credentials", credentials);
    return { success: true, message: "Signed in successfully!" };
  } catch (error) {
    // this is a Nextjs flow control function, it use this to implement redirecting;
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: "Incorrect email or password!" };
  }
}

export async function signOutUser() {
  await signOut();
}
