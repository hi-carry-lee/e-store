import { formatNumberWithDecimal, round2 } from "./utils";

describe("formatNumberWithDecimal", () => {
  test("formats integers with .00", () => {
    expect(formatNumberWithDecimal(5)).toBe("5.00");
    expect(formatNumberWithDecimal(100)).toBe("100.00");
  });

  test("pads decimals to 2 places", () => {
    expect(formatNumberWithDecimal(5.1)).toBe("5.10");
    expect(formatNumberWithDecimal(10.5)).toBe("10.50");
  });

  test("handles numbers with more than 2 decimal places", () => {
    expect(formatNumberWithDecimal(5.123)).toBe("5.12"); // 应该截断而非四舍五入
    expect(formatNumberWithDecimal(10.999)).toBe("10.99");
  });

  test("handles zero and negative numbers", () => {
    expect(formatNumberWithDecimal(0)).toBe("0.00");
    expect(formatNumberWithDecimal(-5.5)).toBe("-5.50");
  });

  // 测试修复后的函数，确保不再有额外的花括号问题
  test("does not have extra curly braces", () => {
    const result = formatNumberWithDecimal(5);
    expect(result.endsWith("}")).toBe(false);
  });
});

describe("round2", () => {
  // 测试数字类型输入
  test("rounds numbers to 2 decimal places", () => {
    // 整数和已经是2位小数的数
    expect(round2(5)).toBe(5);
    expect(round2(5.12)).toBe(5.12);

    // 小于2位小数的数
    expect(round2(5.1)).toBe(5.1);

    // 大于2位小数的数 - 四舍
    expect(round2(5.123)).toBe(5.12);
    expect(round2(5.124)).toBe(5.12);

    // 大于2位小数的数 - 五入
    expect(round2(5.125)).toBe(5.13);
    expect(round2(5.555)).toBe(5.56);

    // 特殊情况 - 边界测试
    expect(round2(5.995)).toBe(6); // 进位到整数
    expect(round2(0.005)).toBe(0.01); // 接近零的值
    expect(round2(-5.125)).toBe(-5.13); // 负数
  });

  // 测试字符串类型输入
  test("rounds string representations of numbers", () => {
    expect(round2("5")).toBe(5);
    expect(round2("5.12")).toBe(5.12);
    expect(round2("5.125")).toBe(5.13);
    expect(round2("-0.994")).toBe(-0.99);
    expect(round2("0.995")).toBe(1);
  });

  // 测试错误处理
  test("throws error for invalid input types", () => {
    // @ts-expect-error - 测试null值应该抛出错误
    expect(() => round2(null)).toThrow();
    // @ts-expect-error - 测试undefined值应该抛出错误
    expect(() => round2(undefined)).toThrow();
    // @ts-expect-error - 测试对象值应该抛出错误
    expect(() => round2({})).toThrow();
    // @ts-expect-error - 测试数组值应该抛出错误
    expect(() => round2([])).toThrow();
    // @ts-expect-error - 测试布尔值应该抛出错误
    expect(() => round2(true)).toThrow();
  });

  // 测试处理JavaScript浮点数精度问题
  test("handles JavaScript floating point precision issues", () => {
    expect(round2(0.1 + 0.2)).toBe(0.3); // 正常应该是0.30000000000000004
    expect(round2(1.005)).toBe(1.01); // 正常可能是1.00499...
  });
});
