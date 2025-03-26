"use server";

import { PrismaClient } from "@prisma/client";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants/index";

// get latest products
export async function getLatestProducts() {
  const prisma = new PrismaClient();

  const products = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return products;
}
