"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const MonthlyCharts = ({
  data: { salesData },
}: {
  data: { salesData: { month: string; totalSales: number }[] };
}) => {
  console.log(salesData);
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={salesData}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          // 显示刻度线
          tickLine={true}
          // 显示轴线
          axisLine={true}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={true}
          axisLine={true}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey="totalSales"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
          maxBarSize={60} // 限制最大宽度
          // barSize={60} // 控制柱子宽度为固定像素值
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyCharts;
