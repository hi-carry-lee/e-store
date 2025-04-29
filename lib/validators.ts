import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";
import { PAYMENT_METHODS } from "./constants";

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exactly two decimal places"
  );

// schema from inserting products
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  category: z.string().min(3, "Category must be at least 3 characters"),
  brand: z.string().min(3, "Brand must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Product must have at least one image"),
  isFeatured: z.boolean(), // 是否特色/推荐
  banner: z.string().nullable(),
  price: currency,
});

// Schema for updating a product
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, "Id is required"),
});

export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must have 6 characters"),
});

export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must have 6 characters"),
    confirmPassword: z.string().min(6, "Password must have 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Item Schema (A Cart will have many items)
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required!"),
  name: z.string().min(1, "Name is required!"),
  slug: z.string().min(1, "Slug is required!"),
  qty: z.number().int().nonnegative("Quantity must be a non-negative number!"),
  image: z.string().min(1, "Image is required!"),
  price: z
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(Number(value).toFixed(2)),
      "Price must have exactly two decimal places (e.g., 49.99)"
    ),
});

// Cart schema ( schema for cart it self)
export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, "Session cart id is required!"),
  // optional() means it accept undefined value, but null is not ok;
  // nullable() means it accept null value, but undefined is not ok
  userId: z.string().optional().nullable(),
});

// Schema for shipping address
export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required!"),
  streetAddress: z.string().min(1, "Address is required!"),
  city: z.string().min(1, "City is required!"),
  postalCode: z.string().min(1, "Postal Code is required!"),
  country: z.string().min(1, "Country is required!"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method",
  });

export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User is required"),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  // make sure the value is one of the three
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method",
  }),
  shippingAddress: shippingAddressSchema,
});

export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  qty: z.number(),
});

export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});

// Update User Schema
export const updateUserSchema = updateProfileSchema.extend({
  id: z.string().min(1, "Id is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  role: z.string().min(1, "Role is required"),
});

// Insert Review Schema
export const insertReviewSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  productId: z.string().min(1, "Product is required"),
  userId: z.string().min(1, "User is required"),
  rating: z.coerce
    .number()
    .int() // 为什么这里的类型是Int，但是展示的时候有半颗星？这里想实现的是：只让用户输入整数，但是平均值有小数
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
});
