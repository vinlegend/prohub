'use client';

import * as React from "react";
import { useRouter } from "next/navigation";

import AppShell from "@/components/layout/appshell";
import StatCard from "@/components/ui/StatCard";
import CaseStatusChart from "@/components/ui/CaseStatusChart";
import DataTable, { type Column } from "@/components/table/DataTable";
import FilterBy, { type FilterGroup, type FilterValuesMap } from "@/components/table/FilterBy";
import { Button } from "@/components/ui/Button";
import { Paginations } from "@/components/table/Paginations";

import { chartData, activecases, pendingquotes, unpaidinvoices } from "@/data/data";
import type { casePoint, activeCases, pendingQuotes, unpaidInvoices } from "@/types/typedata";

import { SquarePenIcon, ExternalLink, Plus } from "lucide-react";

/* ───────────────────────── helpers/constants ───────────────────────── */
const PAGE_SIZE = 5;
const MONTHS = [
  "All","January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const YEARS = ["All","2024","2025","2026"];

const anyOrHas = (s: Set<string>, v: string) => s.size === 0 || s.has(v);
const monthNumber = (name: string) => MONTHS.indexOf(name);
const parseYMD = (s: string) => { const [y, m] = s.split("-").map(Number); return { y, m }; };

function paginate<T>(rows: T[], page: number, pageSize: number) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  return { page: safePage, total, totalPages, rows: rows.slice(start, end) };
}

const maxValue = Math.max(...chartData.map((item: casePoint) => item.value));
function valueOf(name: string) {
  const hit = chartData.find(d => d.name.toLowerCase() === name.toLowerCase());
  return hit?.value ?? 0;
}

/* ───────────────────────── component ───────────────────────── */
export default function DashboardPage() {
  const router = useRouter();

  /* sorting */
  const [activeSort, setActiveSort]   = React.useState<{ col: string | null; dir: "asc" | "desc" }>({ col: null, dir: "asc" });
  const [pendingSort, setPendingSort] = React.useState<{ col: string | null; dir: "asc" | "desc" }>({ col: null, dir: "asc" });
  const [unpaidSort, setUnpaidSort]   = React.useState<{ col: string | null; dir: "asc" | "desc" }>({ col: null, dir: "asc" });

  const handleActiveSort = (col: string) =>
    setActiveSort(s => (s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" }));
  const handlePendingSort = (col: string) =>
    setPendingSort(s => (s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" }));
  const handleUnpaidSort = (col: string) =>
    setUnpaidSort(s => (s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" }));

  const sortedActive = React.useMemo(() => {
    if (!activeSort.col) return activecases;
    const col = activeSort.col as keyof activeCases;
    return [...activecases].sort((a, b) => {
      const A = a[col] ?? ""; const B = b[col] ?? "";
      return activeSort.dir === "asc" ? String(A).localeCompare(String(B)) : String(B).localeCompare(String(A));
    });
  }, [activeSort]);

  const sortedPending = React.useMemo(() => {
    if (!pendingSort.col) return pendingquotes;
    const col = pendingSort.col as keyof pendingQuotes;
    return [...pendingquotes].sort((a, b) => {
      const A = a[col] ?? ""; const B = b[col] ?? "";
      return pendingSort.dir === "asc" ? String(A).localeCompare(String(B)) : String(B).localeCompare(String(A));
    });
  }, [pendingSort]);

  /* FilterBy (generic) — declare per-page filter groups & state */
  const DRIVER_OPTIONS    = React.useMemo(() => Array.from(new Set([...activecases, ...pendingquotes].map(r => r.driver))).filter(Boolean), []);
  const DEPT_OPTIONS      = React.useMemo(() => Array.from(new Set([...activecases, ...pendingquotes].map(r => r.service))).filter(Boolean), []);
  const CUSTOMER_OPTIONS  = React.useMemo(() => Array.from(new Set([...activecases, ...pendingquotes].map(r => r.customer))).filter(Boolean), []);
  const STATUS_OPTIONS    = React.useMemo(() => Array.from(new Set(activecases.map(r => r.status))).filter(Boolean), []);

  const groups: FilterGroup[] = [
    { id: "pic",       title: "Person in Charge", options: DRIVER_OPTIONS },
    { id: "dept",      title: "Department",       options: DEPT_OPTIONS },
    { id: "customers", title: "Customers",        options: CUSTOMER_OPTIONS },
    { id: "status",    title: "Status",           options: STATUS_OPTIONS },
  ];

  const [filters, setFilters]   = React.useState<FilterValuesMap>({
    pic: new Set(), dept: new Set(), customers: new Set(), status: new Set()
  });
  const [applied, setApplied]   = React.useState<FilterValuesMap>(filters);

  const handleFilterChange = (id: string, next: Set<string>) =>
    setFilters((v) => ({ ...v, [id]: next }));

  const handleApply = (v: FilterValuesMap) => {
    setFilters(v);
    setApplied(v);
  };

  const handleClear = () => {
    const empty: FilterValuesMap = { pic: new Set(), dept: new Set(), customers: new Set(), status: new Set() };
    setFilters(empty);
    setApplied(empty);
  };

  /* apply filters */
  const filteredActive = React.useMemo(
    () => sortedActive.filter(r =>
      anyOrHas(applied.pic ?? new Set(), r.driver) &&
      anyOrHas(applied.dept ?? new Set(), r.service) &&
      anyOrHas(applied.customers ?? new Set(), r.customer) &&
      anyOrHas(applied.status ?? new Set(), r.status)
    ),
    [sortedActive, applied]
  );

  const filteredPending = React.useMemo(
    () => sortedPending.filter(r =>
      anyOrHas(applied.pic ?? new Set(), r.driver) &&
      anyOrHas(applied.dept ?? new Set(), r.service) &&
      anyOrHas(applied.customers ?? new Set(), r.customer)
    ),
    [sortedPending, applied]
  );

  /* unpaid month/year filters */
  const now = new Date();
  const CURRENT_MONTH = MONTHS[now.getMonth() + 1];
  const CURRENT_YEAR  = String(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState<string>(CURRENT_MONTH);
  const [selectedYear, setSelectedYear]   = React.useState<string>(CURRENT_YEAR);
  const [monthTouched, setMonthTouched]   = React.useState(false);
  const [yearTouched, setYearTouched]     = React.useState(false);

  const baseUnpaid = React.useMemo(
    () => unpaidinvoices.filter(r => anyOrHas(applied.customers ?? new Set(), r.customer)),
    [applied.customers]
  );

  const displayedUnpaid = React.useMemo(() => {
    const applyMonth = monthTouched && selectedMonth !== "All";
    const applyYear  = yearTouched && selectedYear !== "All";
    const mNum = applyMonth ? monthNumber(selectedMonth) : null;
    const yNum = applyYear ? Number(selectedYear) : null;

    const filtered = baseUnpaid.filter(row => {
      const { y, m } = parseYMD(row.dateDue);
      if (applyMonth && m !== mNum) return false;
      if (applyYear && y !== yNum) return false;
      return true;
    });

    const arr = [...filtered];
    if (unpaidSort.col) {
      const col = unpaidSort.col as keyof unpaidInvoices;
      arr.sort((a, b) => {
        let A: any = a[col] ?? ""; let B: any = b[col] ?? "";
        if (col === "totalAmount") {
          const toNum = (v: string) => Number(String(v).replace(/[^0-9.]/g, "")) || 0;
          A = toNum(A); B = toNum(B);
          return unpaidSort.dir === "asc" ? A - B : B - A;
        }
        return unpaidSort.dir === "asc" ? String(A).localeCompare(String(B)) : String(B).localeCompare(String(A));
      });
    } else {
      arr.sort((a, b) => a.dateDue.localeCompare(b.dateDue));
    }
    return arr;
  }, [baseUnpaid, unpaidSort, selectedMonth, selectedYear, monthTouched, yearTouched]);

  /* pagination state */
  const [activePage, setPageActive]   = React.useState(1);
  const [pendingPage, setPagePending] = React.useState(1);
  const [unpaidPage, setPageUnpaid]   = React.useState(1);

  React.useEffect(() => { setPageActive(1); }, [applied, activeSort]);
  React.useEffect(() => { setPagePending(1); }, [applied, pendingSort]);
  React.useEffect(() => { setPageUnpaid(1); }, [applied, unpaidSort, selectedMonth, selectedYear, monthTouched, yearTouched]);

  const activePaged  = React.useMemo(() => paginate(filteredActive,  activePage,  PAGE_SIZE), [filteredActive,  activePage]);
  const pendingPaged = React.useMemo(() => paginate(filteredPending, pendingPage, PAGE_SIZE), [filteredPending, pendingPage]);
  const unpaidPaged  = React.useMemo(() => paginate(displayedUnpaid, unpaidPage,  PAGE_SIZE), [displayedUnpaid, unpaidPage]);

  /* action cell */
  function TableAction({ variant }: { variant: "edit" | "open" }) {
    return (
      <div className="flex items-center gap-2">
        {variant === "edit" ? (
          <button className="rounded-md border border-border bg-card p-1.5 hover:bg-accent" title="Edit" type="button">
            <SquarePenIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        ) : (
          <button className="rounded-md border border-border bg-card p-1.5 hover:bg-accent" title="Open" type="button">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }

  /* columns */
  const activeColumns: Column<activeCases>[] = [
    { key: "caseNo", header: "Case #", sortable: true, align: "left" },
    { key: "customer", header: "Customer", sortable: true, align: "left" },
    { key: "service",  header: "Service",  sortable: true, align: "left" },
    { key: "status",   header: "Status",   sortable: true, align: "left" },
    { key: "pic",      header: "PIC",      sortable: true, align: "left" },
    { key: "driver",   header: "Driver",   sortable: true, align: "left" },
    { key: "pickupDate", header: "Pickup Date", sortable: true, align: "left" },
    { header: "Action", render: () => <TableAction variant="edit" />, className: "pr-2 w-32", align: "left" },
  ];

  const pendingColumns: Column<pendingQuotes>[] = [
    { key: "caseNo", header: "Case #", sortable: true, align: "left" },
    { key: "customer", header: "Customer", sortable: true, align: "left" },
    { key: "service",  header: "Service",  sortable: true, align: "left" },
    { key: "pic",      header: "PIC",      sortable: true, align: "left" },
    { key: "driver",   header: "Driver",   sortable: true, align: "left" },
    { key: "pickupDate", header: "Pickup Date", sortable: true, align: "left" },
    { header: "Action", render: () => <TableAction variant="edit" />, className: "pr-2 w-32", align: "left" },
  ];

  const unpaidColumns: Column<unpaidInvoices>[] = [
    { key: "caseNo", header: "Case #", sortable: true, align: "left" },
    { key: "customer", header: "Customer", sortable: true, align: "left" },
    { key: "totalAmount", header: "Total Amount", sortable: true, align: "left" },
    { key: "dateDue", header: "Date Due", sortable: true, align: "left" },
    {
      header: "Action",
      // @ts-ignore
      render: (row: unpaidInvoices) => (
        <button
          type="button"
          onClick={() => router.push(`/unpaidinvoices/${encodeURIComponent(row.caseNo)}`)}
          className="inline-flex items-center rounded-md border border-border bg-card p-1.5 hover:bg-accent"
          title={`Open ${row.caseNo}`}
        >
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Open detail</span>
        </button>
      ),
      className: "pr-2 w-32",
      align: "left",
    },
  ];

  return (
    <AppShell title="Operations Dashboard">
      {/* top stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard value={valueOf("Active")} label="Active Cases" accent="blue" />
        <StatCard value={valueOf("Pending")} label="Pending Quotes" accent="amber" />
        <StatCard value={valueOf("Cancelled")} label="Incidents" accent="rose" />
      </div>

      <CaseStatusChart data={chartData} max={maxValue} />

      {/* header controls */}
      <div className="px-6 mt-4 flex items-center justify-between">
        <FilterBy
          groups={groups}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleClear}
          onApply={handleApply}
        />
        <Button variant="primary" onClick={() => router.push("./case/createcase")}>
          <Plus className="h-5 w-5" />
          Create New Case
        </Button>
      </div>

<section className="mt-6">
  <DataTable
    title="All Active Cases"
    data={activePaged.rows}
    columns={activeColumns}
    rowKey={(r) => r.caseNo}
    sort={activeSort}
    onSort={handleActiveSort}
    footer={
      <Paginations
        page={activePaged.page}
        totalPages={activePaged.totalPages}
        total={activePaged.total}
        pageSize={PAGE_SIZE}
        onPrev={() => setPageActive(p => Math.max(1, p - 1))}
        onNext={() => setPageActive(p => Math.min(activePaged.totalPages, p + 1))}
      />
    }
  />
</section>

<section className="mt-6">
  <DataTable
    title="Pending Quotes"
    data={pendingPaged.rows}
    columns={pendingColumns}
    rowKey={(r) => r.caseNo}
    sort={pendingSort}
    onSort={handlePendingSort}
    footer={
      <Paginations
        page={pendingPaged.page}
        totalPages={pendingPaged.totalPages}
        total={pendingPaged.total}
        pageSize={PAGE_SIZE}
        onPrev={() => setPagePending(p => Math.max(1, p - 1))}
        onNext={() => setPagePending(p => Math.min(pendingPaged.totalPages, p + 1))}
      />
    }
  />
</section>

      {/* Unpaid Invoices */}
      <section className="mt-6">
        <div className="px-4 py-3 border border-border border-b-0 rounded-t-lg bg-card">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground pb-2">Unpaid Invoices</h3>
            <div className="mt-2 flex gap-2">
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(e.target.value); setUnpaidSort({ col: null, dir: "asc" }); setMonthTouched(true); }}
                  className="select-token"
                >
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/90 text-xs">▾</span>
              </div>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => { setSelectedYear(e.target.value); setUnpaidSort({ col: null, dir: "asc" }); setYearTouched(true); }}
                  className="select-token"
                >
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/90 text-xs">▾</span>
              </div>
            </div>
          </div>
        </div>

        <DataTable
          data={unpaidPaged.rows}
          columns={unpaidColumns}
          rowKey={(r, i) => `${r.caseNo}-${r.dateDue}-${i}`}
          sort={unpaidSort}
          onSort={handleUnpaidSort}
          footer={
            <Paginations
              page={unpaidPaged.page}
              totalPages={unpaidPaged.totalPages}
              total={unpaidPaged.total}
              pageSize={PAGE_SIZE}
              onPrev={() => setPageUnpaid(p => Math.max(1, p - 1))}
              onNext={() => setPageUnpaid(p => Math.min(unpaidPaged.totalPages, p + 1))}
            />
          }
          className="rounded-t-none"
        />
      </section>
    </AppShell>
  );
}
