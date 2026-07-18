"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrencyBOB } from "@/lib/format-currency";
import type { MonthlySales } from "@/lib/dashboard-types";

const CHART_STROKE_COLOR = "var(--brand)";
const THOUSAND = 1000;

interface SalesChartProps {
  data: MonthlySales[];
}

function formatCompactBOB(value: number): string {
  return `${value / THOUSAND}k`;
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas mensuales</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={formatCompactBOB}
              className="text-xs"
            />
            <Tooltip formatter={(value) => formatCurrencyBOB(Number(value))} />
            <Line
              type="monotone"
              dataKey="totalBOB"
              name="Ventas"
              stroke={CHART_STROKE_COLOR}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
