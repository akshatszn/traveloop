"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const colors = ["#15171c", "#0891b2", "#f76f53", "#16a34a", "#f59e0b", "#7c3aed", "#64748b"];

export function BudgetChart({
  data,
  currency = "USD"
}: {
  data: Array<{ category: string; plannedCents: number; actualCents: number }>;
  currency?: string;
}) {
  const total = data.reduce((sum, item) => sum + item.plannedCents, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Budget shape</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 md:grid-cols-[190px_1fr]">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="plannedCents" innerRadius={58} outerRadius={86} paddingAngle={2}>
                  {data.map((entry, index) => (
                    <Cell key={entry.category} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value), currency)}
                  contentStyle={{ borderRadius: 8, border: "1px solid rgba(20,23,28,.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid content-center gap-2">
            <div className="text-sm font-medium text-muted-foreground">Total planned</div>
            <div className="text-3xl font-bold">{formatCurrency(total, currency)}</div>
            <div className="mt-3 grid gap-2">
              {data.slice(0, 6).map((item, index) => (
                <div key={item.category} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />
                    <span className="font-medium capitalize">{item.category.toLowerCase()}</span>
                  </div>
                  <span className="text-muted-foreground">{Math.round((item.plannedCents / Math.max(total, 1)) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
