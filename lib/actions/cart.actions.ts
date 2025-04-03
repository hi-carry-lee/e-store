"use server";

import { CartItem } from "@/types";

export const addItemToCart = async (item: CartItem) => {
  return {
    success: false,
    message: `${item.name} added to cart successfully!`,
  };
};
