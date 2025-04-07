"use server";

import {
  paymentMethodSchema,
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
} from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError, formatErrorPlus } from "@/lib/utils";
import { ShippingAddress } from "@/types";
import * as z from "zod";

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

export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    // here it use customized error format function to handle error, so it's not suitable to use safeParse
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;
    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    // it's not required, just optional
    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "User created successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const { fieldErrors, generalError } = formatErrorPlus(error);

    return {
      success: false,
      fieldErrors,
      generalError: generalError || "注册失败",
    };
  }
}

// Get user by id
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found!");
  }
  return user;
}

// Update the user's address
// ! address is just a field of user table;
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update payment method of user
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) throw new Error("User not found");

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return {
      success: true,
      message: "User payment method updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
