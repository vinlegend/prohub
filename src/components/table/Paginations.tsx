'use client';

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export function Paginations({
  page,
  totalPages,
  total,
  pageSize,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  // border follows text color in any theme
  const borderStyle: React.CSSProperties = {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "currentColor",
  };

  // shared button classes
  const btnCls = (disabled: boolean) =>
    [
      "inline-flex h-9 w-9 items-center justify-center rounded-lg",
      "bg-card transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      disabled
        ? "cursor-not-allowed text-foreground/30"
        : "text-foreground/70 hover:text-foreground hover:bg-accent/40 dark:hover:bg-accent/30",
    ].join(" ");

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2">
      <span className="text-xs text-muted-foreground">
        Showing page {page} of {totalPages}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={prevDisabled}
          onClick={onPrev}
          className={btnCls(prevDisabled)}
          style={borderStyle}
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        <span className="text-xs text-muted-foreground">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          disabled={nextDisabled}
          onClick={onNext}
          className={btnCls(nextDisabled)}
          style={borderStyle}
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
