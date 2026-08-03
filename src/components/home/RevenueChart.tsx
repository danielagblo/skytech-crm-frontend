"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardOverview } from "@/types/dashboard.types";
import { formatCurrency } from "@/lib/utils";
export const RevenueChart = ({
  data,
}: {
  data: DashboardOverview["topRevenuePerAgent"];
}) => (
  <section className="surface p-5">
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h3 className="font-semibold">Top revenue per salesperson</h3>
        <p className="text-xs text-muted-foreground">Live paid revenue</p>
      </div>
      <span className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
        Revenue
      </span>
    </div>
    <div className="h-64">
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Revenue appears after payments are recorded.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.map((item) => ({
              ...item,
              initials: item.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 3),
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="initials" tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value: number) => `${value / 1000}K`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Revenue"]}
            />
            <Bar dataKey="revenue" fill="#4ADE80" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </section>
);
