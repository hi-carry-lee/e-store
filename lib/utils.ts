import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// convert prisma object into a regular JS object;
export function convertToPlainObject<T>(data: T) {
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
  // * convert to string, then split it into two parts
  const [int, decimal] = num.toString().split(".");

  // if no decimal part, then return directly;
  if (!decimal) {
    return `${int}.00`;
  }

  // intercept first two number,
  const formattedDecimal = decimal.substring(0, 2).padEnd(2, "0");
  return `${int}.${formattedDecimal}`;
}

// Format Errors
// when deploy to vercel, it will throw an error, so we disable eslint here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any): string {
  if (error.name === "ZodError") {
    // Handle Zod error
    const fieldErrors = Object.keys(error.errors).map((field) => {
      const message = error.errors[field].message;
      return typeof message === "string" ? message : JSON.stringify(message);
    });

    return fieldErrors.join(". ");
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002" // P2002 is Prisma specified error
  ) {
    // Handle Prisma error
    const field = error.meta?.target ? error.meta.target[0] : "Field";
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message);
  }
}
/*
通过这种方式，获取catch中的error信息，然后写出上面的格式化错误数据的函数
console.log(error.name);
console.log(error.code);
console.log(error.errors);
console.log(error.meta?.target)
*/

// ------------------------------------------------
// !For form field error
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatErrorPlus(error: any): {
  fieldErrors: Record<string, string>;
  generalError?: string;
} {
  if (error.name === "ZodError") {
    // 处理Zod错误，将每个字段的错误分别存储
    const fieldErrors: Record<string, string> = {};

    for (const issue of error.errors) {
      const field = issue.path[0];
      fieldErrors[field] = issue.message;
    }

    return { fieldErrors };
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    // 处理Prisma唯一性约束错误
    const field = error.meta?.target ? error.meta.target[0] : "field";
    return {
      fieldErrors: {
        [field]: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } already exists`,
      },
    };
  } else {
    // 处理其他一般性错误
    return {
      fieldErrors: {},
      generalError:
        typeof error.message === "string"
          ? error.message
          : JSON.stringify(error.message),
    };
  }
}

// Round to 2 decimal places
export const round2 = (value: number | string) => {
  if (typeof value !== "number" && typeof value !== "string") {
    throw new Error("value is not a number nor a string");
  }

  const num = typeof value === "number" ? value : Number(value);

  // 分别处理正负数情况
  const multiplier = 100;
  if (num >= 0) {
    return Math.round((num + Number.EPSILON) * multiplier) / multiplier;
  } else {
    // 负数情况：处理符号，对绝对值四舍五入，再恢复符号
    return -Math.round((-num + Number.EPSILON) * multiplier) / multiplier;
  }
};

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
});

// Format currency
export function formatCurrency(amount: number | string | null) {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return "NaN";
  }
}

// Short order id
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

// Format date and time, return them respectively
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// Form Pagination Links
export function formUrlQuery({
  params,
  key,
  value,
  pathname,
}: {
  params: string;
  key: string;
  value: string | null;
  pathname: string;
}) {
  const query = qs.parse(params);

  query[key] = value;

  return qs.stringifyUrl(
    {
      // url: window.location.pathname,
      url: pathname, // 使用传入的pathname,而非window.location.pathname
      query,
    },
    { skipNull: true }
  );
}
// ! 使用 window.location.pathname 的问题：在Next.js中，组件首先在服务器端渲染，但window对象只在浏览器环境中可用
// ! why 使用传入的pathname能解决问题？
