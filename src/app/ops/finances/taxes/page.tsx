'use client';

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import AppShell from "@/components/layout/appshell";
import { Button } from "@/components/ui/Button";
import DataTable, { type Column, type SortDir } from "@/components/table/DataTable";
import FilterBy, { type FilterGroup, type FilterValuesMap } from "@/components/table/FilterBy";
import { Paginations } from "@/components/table/Paginations";
import AlertBanner from "@/components/form/AlertBanner";

import { Plus, SquarePenIcon } from "lucide-react";

import { TAXES } from "@/data/data";
import type { Tax } from "@/types/typedata";



export default function TaxesPage() {
  const router = useRouter();
  const search = useSearchParams();

  // 🔔 success toast from edit
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState("");

  React.useEffect(() => {
    const toast = search.get("toast");
    const id = search.get("id");
    if (toast === "updated" && id) {
      setToastMsg(`Your changes for ${id} have been saved.`);
      setToastOpen(true);
      // clean URL so refresh doesn't re-trigger
      router.replace("/ops/finances/taxes");
    }
  }, [search, router]);

  // ── sorting ─────────────────────────────────────────────────────────────
  const [sort, setSort] = React.useState<{ col: string | null; dir: SortDir }>({
    col: null,
    dir: "asc",
  });
  const handleSort = (col: string) =>
    setSort((s) => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }));

  // ── filter config (rate from real data) ─────────────────────────────────
  const RATE_OPTIONS = React.useMemo(
    () => Array.from(new Set(TAXES.map((t) => `${t.rate}%`))).sort(),
    []
  );
  const groups: FilterGroup[] = [{ id: "rate", title: "Tax Rate", options: RATE_OPTIONS }];
  const [filters, setFilters] = React.useState<FilterValuesMap>({ rate: new Set<string>() });

  // ── pagination ──────────────────────────────────────────────────────────
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  // ── filter + sort + paginate ────────────────────────────────────────────
  const processedRows = React.useMemo(() => {
    let rows = TAXES.slice();

    const rateSet = filters.rate ?? new Set<string>();
    if (rateSet.size > 0) rows = rows.filter((t) => rateSet.has(`${t.rate}%`));

    if (sort.col) {
      rows.sort((a: any, b: any) => {
        const av = a[sort.col as keyof Tax];
        const bv = b[sort.col as keyof Tax];
        if (av < bv) return sort.dir === "asc" ? -1 : 1;
        if (av > bv) return sort.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [filters, sort]);

  const total = processedRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pagedRows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, page, pageSize]);

  // ── table columns ───────────────────────────────────────────────────────
  const columns: Column<Tax>[] = [
    { key: "id", header: "ID", sortable: true },
    {
      key: "name_en",
      header: "Name (EN)",
      sortable: true,
      render: (row) => <span className="font-semibold">{row.name_en}</span>,
    },
    { key: "name_jp", header: "Name (JP)" },
    {
      key: "rate",
      header: "Tax Rate",
      sortable: true,
      render: (row) => `${row.rate}%`,
      align: "center",
    },
    {
      header: "Action",
      align: "center",
      render: (row) => (
        <Link
          href={`/ops/finances/taxes/${encodeURIComponent(row.id)}/edit`}
          className="inline-flex items-center justify-center rounded-md border border-border bg-card p-1.5 hover:bg-accent"
          title="Edit"
          aria-label="Edit"
        >
          <SquarePenIcon className="h-4 w-4 text-muted-foreground" />
        </Link>
      ),
    },
  ];

  return (
    <AppShell title="Dashboard Taxes">
      <div className="mx-auto space-y-4">
        {/* success toast from edit */}
        <AlertBanner
          open={toastOpen}
          variant="success"
          title="Tax updated"
          description={toastMsg}
          onClose={() => setToastOpen(false)}
        />

        {/* header controls */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Tax Management</h2>
          <div className="flex items-center gap-3">
            <Button onClick={() => router.push("/ops/finances/taxes/create")}>
              <Plus className="h-5 w-5" />
              Create New Tax
            </Button>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <FilterBy
            groups={groups}
            values={filters}
            onChange={(id, next) => setFilters((v) => ({ ...v, [id]: next }))}
            onClear={() => setFilters({ rate: new Set() })}
            onApply={(v) => setFilters(v)}
            buttonText="Filter By"
          />
        </div>

        <DataTable<Tax>
          data={pagedRows}
          columns={columns}
          rowKey={(r) => r.id}
          sort={sort}
          onSort={handleSort}
          emptyText="No taxes found"
          footer={
            <Paginations
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          }
        />
      </div>
    </AppShell>
  );
}
