import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// convert prisma object into a regular JS object;
export function converToPlainObject<T>(data: T) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "object" &&
      value !== null &&
      typeof value.toJSON === "function"
        ? value.toJSON()
        : value
    )
  );
}
/*
original code "return JSON.parse(JSON.stringify(value));" can't convert the Prisma Decimal object to string;
利用了replacer函数：
  JSON.stringify接受第二个参数(replacer)，可用于自定义序列化过程
检测并使用toJSON方法：
  Prisma的Decimal类型实现了toJSON()方法
  这个方法会将Decimal值转换为字符串
  我们的replacer函数检测到toJSON方法并调用它
类型转换过程：
  Decimal对象 → 调用toJSON() → 返回字符串 → 序列化为JSON → 反序列化为纯JavaScript对象
*/

// format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00}`;
}
