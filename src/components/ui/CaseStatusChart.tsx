'use client';

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from "recharts";
import type { Props } from "@/types/typedata";

const CaseStatusChart: React.FC<Props> = ({
  title = "Case Status Overview",
  data,
  max = 2,
}) => {
  const colorMap: Record<string, string> = {
    Active: "var(--color-primary)",           
    Pending: "#F59E0B",                      
    Closed: "var(--color-muted-foreground)",   
    Cancelled: "var(--color-destructive)",    
  };

  const safeMax = Math.max(1, max);
  const ticks = [0, safeMax / 4, safeMax / 2, (3 * safeMax) / 4, safeMax];

  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>

      <div className="h-[330px] w-full flex justify-center">
        <ResponsiveContainer width="80%" height="100%">
          <BarChart data={data} barCategoryGap={32} barSize={70}>
            <CartesianGrid
              stroke="var(--color-border)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)" }}
              domain={[0, safeMax]}
              ticks={ticks}
            />
            <Tooltip
              cursor={{ fill: "rgba(148,163,184,0.15)" }}
              contentStyle={{
                background: "var(--color-card)",
                color: "var(--color-foreground)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={colorMap[entry.name] || "var(--color-primary)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default CaseStatusChart;
