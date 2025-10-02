import React from "react";

type StatCardProps = {
  value: number | string;
  label: string;
  /** visual accent for the value */
  accent?: "blue" | "amber" | "rose";
};

const StatCard: React.FC<StatCardProps> = ({ value, label, accent = "blue" }) => {
  // map accents to palette-aware text colors
  const accentClass =
    accent === "blue"
      ? "text-primary"
      : accent === "amber"
      ? "text-amber-500"
      : "text-rose-500";

  return (
    <div className="text-center rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className={`text-3xl font-semibold leading-none ${accentClass}`}>{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

export default StatCard;
