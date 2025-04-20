// 用于创建和管理Neon数据库连接池; 全局配置对象，用于设置Neon客户端行为
import { Pool, neonConfig } from "@neondatabase/serverless";
// 允许Prisma ORM使用Neon的特殊连接方法
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// 声明全局类型，用于缓存Prisma实例
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// 声明一个函数来创建Prisma实例
function createPrismaClient() {
  // Sets up WebSocket connections, which enables Neon to use WebSocket communication.
  // 配置Neon使用WebSocket通信机制
  neonConfig.webSocketConstructor = ws;
  const connectionString = `${process.env.DATABASE_URL}`;

  // Creates a new connection pool using the provided connection string, allowing multiple concurrent connections.
  // 创建数据库连接池
  const pool = new Pool({ connectionString });

  // Instantiates the Prisma adapter using the Neon connection pool to handle the connection between Prisma and Neon.
  // 创建Neon适配器实例
  const adapter = new PrismaNeon(pool);

  // Extends the PrismaClient with a custom result transformer to convert the price and rating fields to strings.
  // 基于适配器实例，创建并配置Prisma客户端，同时添加自定义数据转换
  return new PrismaClient({ adapter }).$extends({
    result: {
      product: {
        price: {
          compute(product) {
            return product.price.toString();
          },
        },
        rating: {
          compute(product) {
            return product.rating.toString();
          },
        },
      },
      cart: {
        itemsPrice: {
          needs: { itemsPrice: true },
          compute(cart) {
            return cart.itemsPrice.toString();
          },
        },
        shippingPrice: {
          needs: { shippingPrice: true },
          compute(cart) {
            return cart.shippingPrice.toString();
          },
        },
        taxPrice: {
          needs: { taxPrice: true },
          compute(cart) {
            return cart.taxPrice.toString();
          },
        },
        totalPrice: {
          needs: { totalPrice: true },
          compute(cart) {
            return cart.totalPrice.toString();
          },
        },
      },
      order: {
        itemsPrice: {
          needs: { itemsPrice: true },
          compute(cart) {
            return cart.itemsPrice.toString();
          },
        },
        shippingPrice: {
          needs: { shippingPrice: true },
          compute(cart) {
            return cart.shippingPrice.toString();
          },
        },
        taxPrice: {
          needs: { taxPrice: true },
          compute(cart) {
            return cart.taxPrice.toString();
          },
        },
        totalPrice: {
          needs: { totalPrice: true },
          compute(cart) {
            return cart.totalPrice.toString();
          },
        },
      },
      orderItem: {
        price: {
          compute(cart) {
            return cart.price.toString();
          },
        },
      },
    },
  });
}

// 复用已有实例或创建新实例
export const prisma = globalForPrisma.prisma || createPrismaClient();

// 在开发环境中将实例保存到全局变量
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma as PrismaClient;
}

// 创建一个原始的 Prisma 客户端实例
export const basePrisma = new PrismaClient();

// 在开发环境中将实例保存到全局变量
if (process.env.NODE_ENV !== "production") {
  (global as unknown as { basePrisma: PrismaClient }).basePrisma = basePrisma;
}

// 清理 Prisma 客户端的连接
async function cleanupPrisma() {
  await basePrisma.$disconnect();
}

// 可以根据需要增加其他逻辑，例如在应用程序退出时进行清理
process.on("exit", cleanupPrisma);
