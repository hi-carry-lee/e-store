"use server";

import { basePrisma, prisma } from "@/db/prisma";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "@/lib/constants/index";
import { convertToPlainObject, formatError } from "../utils";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "../auth-guard";
import { insertProductSchema, updateProductSchema } from "../validators";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// get latest products
export async function getLatestProducts() {
  const products = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return products;
}

// Get Single product by its slug
export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug },
  });
}

// Get all products for admin
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  category: string;
  limit?: number;
  page: number;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  // Query filter
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query, // LIKE '%value%', 默认区分大小写
            mode: "insensitive" as const,
            // "insensitive" 作为 Prisma 的查询参数值，需要是特定的字面量值，而不是任意字符串
            // 字面量类型指的是类型系统中明确指定的值，而不是动态计算的值
          },
        }
      : {};

  // Category filter
  const categoryFilter = category && category !== "all" ? { category } : {};

  // Price filter
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          },
        }
      : {};

  // Rating filter
  const ratingFilter =
    rating && rating !== "all"
      ? {
          rating: {
            gte: Number(rating),
          },
        }
      : {};

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
        ? { price: "desc" }
        : sort === "rating"
        ? { rating: "desc" }
        : { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
  });

  return {
    data: convertToPlainObject(data),
    totalPages: Math.ceil(dataCount / limit),
  };
}

// delelte product for admin
export async function deleteProduct(id: string) {
  try {
    requireAdmin();
    const productExists = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExists) throw new Error("Product not found");

    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Create product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    // Validate and create product
    const product = insertProductSchema.parse(data);
    await prisma.product.create({ data: product });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update Product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    // Validate and find product
    const product = updateProductSchema.parse(data);
    const productExists = await prisma.product.findFirst({
      where: { id: product.id },
    });

    if (!productExists) throw new Error("Product not found");

    // Update product
    await prisma.product.update({ where: { id: product.id }, data: product });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get single product by id
export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: { id: productId },
  });

  return convertToPlainObject(data);
}

/*
export async function getAllCategories1() {
  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });

  return data;
}

上面这个函数存在TS类型问题：
This expression is not callable.
  Each member of the union type '(<A extends ProductGroupByArgs<InternalArgs & { result: { product: { price: () => { compute(product: { price: Decimal; rating: Decimal; id: string; createdAt: Date; name: string; slug: string; ... 7 more ...; banner: string | null; }): string; }; rating: () => { ...; }; }; cart: { ...; }; order: { ...; }; orderItem:...' has signatures, but none of those signatures are compatible with each other.ts(2349)
原因：
  1. $extends 方法对 Prisma 客户端进行扩展可能导致基础数据类型（例如 Decimal）被更改为 string，这与 groupBy 方法的预期类型定义不兼容
  2. 使用 $extends 方法扩展 Prisma 客户端时，实际上修改了整个 product 模型的类型定义；
  3. 即使 groupBy 方法处理的主要是 category 字段，Prisma 在解析模型时仍然需要了解整个模型的结构。这包括 Product 模型的所有字段，包括在$extends 中定义的 price 和 rating

解决方案：
  1. 使用原始 Prisma 客户端执行 groupBy 查询

改造后的 getAllCategories1 函数
export async function getAllCategories() {
  使用原始 Prisma 客户端执行 groupBy 查询
  const data = await basePrisma.product.groupBy({
    by: ["category"],
    _count: true,
    // 和上面的方法作用相同
    // _count: {
    //   _all: true,
    // },
  });
  return data;
}
*/

export async function getAllCategories() {
  // 使用原始 Prisma 客户端执行 groupBy 查询
  const data = await basePrisma.product.groupBy({
    by: ["category"],
    _count: true,
    // 和上面的方法作用相同
    // _count: {
    //   _all: true,
    // },
  });
  return data;
}

// 这是一个折中方法，不过存在效率问题，不建议使用
// export async function getAllCategories() {
//   const categories = await prisma.product.findMany({
//     select: {
//       category: true,
//     },
//     distinct: ["category"],
//   });

//   const categoriesWithCount = await Promise.all(
//     categories.map(async ({ category }) => {
//       const count = await prisma.product.count({
//         where: { category },
//       });
//       return { category, count };
//     })
//   );

//   return categoriesWithCount;
// }

export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    // TODO：后期数据量大了，需要为isFeatured, createdAt创建复合索引
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    // 只选择轮播图需要的字段
    select: {
      id: true,
      slug: true,
      name: true,
      banner: true,
    },
  });

  return convertToPlainObject(data);
}
