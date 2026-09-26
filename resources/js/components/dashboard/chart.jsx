"use client"

import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { ChartContainer } from "@/components/ui/chart"

const chartConfig = {
  orders: {
    label: "Orders",
    color: "#2563eb",
  },
}

export function StockOverviewChart({
  totalPurchases = 0,
  approvedPurchases = 0,
  pendingPurchases = 0,
  cancelledPurchases = 0,
}) {
  const chartData = [
    { status: "Total", orders: Number(totalPurchases) || 0, fill: "#2563eb" },
    { status: "Approved", orders: Number(approvedPurchases) || 0, fill: "#16a34a" },
    { status: "Pending", orders: Number(pendingPurchases) || 0, fill: "#f59e0b" },
    { status: "Cancelled", orders: Number(cancelledPurchases) || 0, fill: "#dc2626" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Order Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[260px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="status" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="orders" radius={4}>
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
