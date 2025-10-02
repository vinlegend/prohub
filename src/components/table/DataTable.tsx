'use client';

import React from "react";

export type SortDir = "asc" | "desc";

export type Column<T> = {
  key?: keyof T | string;
  header: React.ReactNode;
  sortable?: boolean;
  render?: (row: T, rowIndex: number) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
};

export type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T, index: number) => string;
  sort?: { col: string | null; dir: SortDir };
  onSort?: (col: string) => void;
  emptyText?: string;
  footer?: React.ReactNode;
  className?: string;

  title?: React.ReactNode;
};

function Th({
  children,
  sortable,
  active,
  dir,
  onClick,
  className = "",
  align = "left",
}: {
  children: React.ReactNode;
  sortable?: boolean;
  active?: boolean;
  dir?: SortDir;
  onClick?: () => void;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <th
      onClick={sortable ? onClick : undefined}
      title={sortable ? "Sort" : undefined}
      scope="col"
      // header color from palette; falls back to muted tokens
      style={{
        background: "var(--color-table-hd, hsl(var(--muted)))",
        color: "var(--color-table-hd-foreground, hsl(var(--muted-foreground)))",
      }}
      className={[
        "px-4 py-3 text-[13px] font-semibold select-none transition-colors",
        sortable ? "cursor-pointer hover:opacity-90" : "",
        "border-b border-border/60",
        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left",
        className,
      ].join(" ")}
    >
      <span className="inline-flex items-center">
        {children}
        {sortable && (
          <span
            className={[
              "ml-1 text-[10px] leading-none transition-transform",
              active ? "opacity-90" : "opacity-60",
              active && dir === "desc" ? "rotate-180" : "",
            ].join(" ")}
          >
            ▲
          </span>
        )}
      </span>
    </th>
  );
}

export default function DataTable<T>({
  data,
  columns,
  rowKey,
  sort,
  onSort,
  emptyText = "No data",
  footer,
  className = "",
  title, // NEW
}: DataTableProps<T>) {
  return (
    <div
      className={[
        "w-full rounded-xl bg-card text-card-foreground shadow-sm",
        "ring-1 ring-inset ring-border/50 dark:ring-border/30",
        className,
      ].join(" ")}
    >
      {/* Header inside the card (optional) */}
      {title && (
        <div className="px-4 py-3 font-semibold text-foreground">
          {title}
        </div>
      )}

      {/* inner wrapper to give the table ~98% width of the card */}
      <div className="p-3">
        <div className="w-[98%] mx-auto overflow-x-auto rounded-lg border border-border/60 dark:border-border/40">
          <table className="w-full border-collapse text-sm table-zebra">
            <thead>
              <tr>
                {columns.map((col, i) => {
                  const colKey = String(col.key ?? "");
                  const isActive = !!sort?.col && sort.col === colKey;
                  return (
                    <Th
                      key={i}
                      sortable={!!col.sortable && !!col.key}
                      active={isActive}
                      dir={sort?.dir}
                      onClick={() => col.key && onSort?.(colKey)}
                      className={col.className}
                      align={col.align}
                    >
                      {col.header}
                    </Th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {data.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-muted-foreground" colSpan={columns.length}>
                    {emptyText}
                  </td>
                </tr>
              )}

              {data.map((row, rIdx) => (
                <tr
                  key={rowKey(row, rIdx)}
                  className={[
                    "transition-colors",
                    "hover:bg-accent/40 dark:hover:bg-accent/30",
                  ].join(" ")}
                >
                  {columns.map((col, cIdx) => {
                    const value = col.render
                      ? col.render(row, rIdx)
                      : col.key
                      ? (row as any)[col.key as any]
                      : null;

                    return (
                      <td
                        key={cIdx}
                        className={[
                          "px-4 py-3 text-foreground",
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                            ? "text-right"
                            : "text-left",
                          col.className ?? "",
                        ].join(" ")}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {footer && (
          <div className="mt-2 flex w-[98%] mx-auto">
            <div className="w-full rounded-md px-3 py-2 bg-card/60">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
