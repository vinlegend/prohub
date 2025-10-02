'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import AppShell from '@/components/layout/appshell';
import { Button } from '@/components/ui/Button';
import DataTable, { type Column, type SortDir } from '@/components/table/DataTable';
import FilterBy, { type FilterGroup, type FilterValuesMap } from '@/components/table/FilterBy';
import { Paginations } from '@/components/table/Paginations';
import AlertBanner from '@/components/form/AlertBanner';

import { Plus, SquarePenIcon, SearchIcon } from 'lucide-react';

import { INCIDENTS } from '@/data/data';
import type { Incident } from '@/types/typedata';

export default function IncidentDashboardPage() {
  const router = useRouter();
  const search = useSearchParams();

  // 🔔 success toast from edit/resolve
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastTitle, setToastTitle] = React.useState('');
  const [toastMsg, setToastMsg] = React.useState('');

  React.useEffect(() => {
    const toast = search.get('toast');
    const id = search.get('id');

    if (toast === 'resolved' && id) {
      setToastTitle('Incident resolved');
      setToastMsg(`Incident ${id} has been resolved.`);
      setToastOpen(true);
      // clean URL so refresh doesn't re-trigger
      router.replace('/ops/incident');
    } else if (toast === 'updated' && id) {
      setToastTitle('Incident updated');
      setToastMsg(`Your changes for ${id} have been saved.`);
      setToastOpen(true);
      router.replace('/ops/incident');
    }
  }, [search, router]);

  // ── sorting ─────────────────────────────────────────────────────────────
  const [sort, setSort] = React.useState<{ col: string | null; dir: SortDir }>({
    col: null,
    dir: 'asc',
  });
  const handleSort = (col: string) =>
    setSort((s) => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }));

  // ── filter options (from data) ─────────────────────────────────────────
  const ISSUE_OPTIONS = React.useMemo(
    () => Array.from(new Set(INCIDENTS.map((i) => i.issueType))).sort(),
    []
  );
  const PIC_OPTIONS = React.useMemo(
    () => Array.from(new Set(INCIDENTS.map((i) => i.pic))).sort(),
    []
  );
  const STATUS_OPTIONS = React.useMemo(
    () => Array.from(new Set(INCIDENTS.map((i) => i.status))).sort(),
    []
  );

  const groups: FilterGroup[] = [
    { id: 'issueType', title: 'Issue Type', options: ISSUE_OPTIONS },
    { id: 'pic', title: 'PIC', options: PIC_OPTIONS },
    { id: 'status', title: 'Status', options: STATUS_OPTIONS },
  ];
  const [filters, setFilters] = React.useState<FilterValuesMap>({
    issueType: new Set<string>(),
    pic: new Set<string>(),
    status: new Set<string>(),
  });

  // ── filter + sort ──────────────────────────────────────────────────────
  const processed = React.useMemo(() => {
    let rows = INCIDENTS.slice();

    const issueSet = filters.issueType ?? new Set<string>();
    const picSet = filters.pic ?? new Set<string>();
    const statusSet = filters.status ?? new Set<string>();

    if (issueSet.size) rows = rows.filter((r) => issueSet.has(r.issueType));
    if (picSet.size) rows = rows.filter((r) => picSet.has(r.pic));
    if (statusSet.size) rows = rows.filter((r) => statusSet.has(r.status));

    if (sort.col) {
      rows.sort((a: any, b: any) => {
        const av = a[sort.col as keyof Incident];
        const bv = b[sort.col as keyof Incident];
        if (av < bv) return sort.dir === 'asc' ? -1 : 1;
        if (av > bv) return sort.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [filters, sort]);

  // split into Active vs Resolved sections
  const activeRows = processed.filter((r) => r.status !== 'Resolved');
  const resolvedRows = processed.filter((r) => r.status === 'Resolved');

  // ── pagination (separate per section) ───────────────────────────────────
  const [pageActive, setPageActive] = React.useState(1);
  const [pageResolved, setPageResolved] = React.useState(1);
  const pageSize = 5;

  const totalActive = activeRows.length;
  const totalResolved = resolvedRows.length;

  const activePaged = React.useMemo(
    () => activeRows.slice((pageActive - 1) * pageSize, pageActive * pageSize),
    [activeRows, pageActive]
  );
  const resolvedPaged = React.useMemo(
    () => resolvedRows.slice((pageResolved - 1) * pageSize, pageResolved * pageSize),
    [resolvedRows, pageResolved]
  );

  React.useEffect(() => {
    const maxA = Math.max(1, Math.ceil(totalActive / pageSize));
    if (pageActive > maxA) setPageActive(1);
    const maxR = Math.max(1, Math.ceil(totalResolved / pageSize));
    if (pageResolved > maxR) setPageResolved(1);
  }, [totalActive, totalResolved, pageActive, pageResolved]);

  // ── columns ─────────────────────────────────────────────────────────────
  const columns: Column<Incident>[] = [
    { key: 'id', header: 'Incident ID', sortable: true },
    { key: 'case', header: 'Case #', sortable: true },
    { key: 'issueType', header: 'Issue Type', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'pic', header: 'PIC', sortable: true },
    {
      header: 'Action',
      align: 'center',
      render: (row) =>
        row.status === 'Resolved' ? (
          <Link
            href={`/ops/incident/${encodeURIComponent(row.id)}/detail`}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card p-1.5 hover:bg-accent"
            title="View Details"
            aria-label="View"
          >
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
          </Link>
        ) : (
          <Link
            href={`/ops/incident/${encodeURIComponent(row.id)}/edit`}
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
    <AppShell title="Incident">
      <div className="mx-auto space-y-6">
        {/* success toast from edit/resolve */}
        <AlertBanner
          open={toastOpen}
          variant="success"
          title={toastTitle}
          description={toastMsg}
          onClose={() => setToastOpen(false)}
        />

        {/* header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Incident Dashboard</h2>
          <Button onClick={() => router.push('/ops/incident/create')}>
            <Plus className="h-5 w-5" />
            Create New Incident
          </Button>
        </div>

        {/* filters */}
        <div className="flex items-center justify-between">
          <FilterBy
            groups={groups}
            values={filters}
            onChange={(id, next) => setFilters((v) => ({ ...v, [id]: next }))}
            onClear={() =>
              setFilters({ issueType: new Set(), pic: new Set(), status: new Set() })
            }
            onApply={(v) => setFilters(v)}
            buttonText="Filter By"
          />
        </div>

        {/* Active section */}
        <section className="space-y-2">
          <DataTable<Incident>
            title="Active Incident"
            data={activePaged}
            columns={columns}
            rowKey={(r) => r.id}
            sort={sort}
            onSort={handleSort}
            emptyText="No active incidents found"
            footer={
              <Paginations
                page={pageActive}
                totalPages={Math.max(1, Math.ceil(totalActive / pageSize))}
                total={totalActive}
                pageSize={pageSize}
                onPrev={() => setPageActive((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setPageActive((p) =>
                    Math.min(Math.max(1, Math.ceil(totalActive / pageSize)), p + 1)
                  )
                }
              />
            }
          />
        </section>

        {/* Resolved section */}
        <section className="space-y-2">
          <DataTable<Incident>
            title="Resolved Incident"
            data={resolvedPaged}
            columns={columns}
            rowKey={(r) => r.id}
            sort={sort}
            onSort={handleSort}
            emptyText="No resolved incidents found"
            footer={
              <Paginations
                page={pageResolved}
                totalPages={Math.max(1, Math.ceil(totalResolved / pageSize))}
                total={totalResolved}
                pageSize={pageSize}
                onPrev={() => setPageResolved((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setPageResolved((p) =>
                    Math.min(Math.max(1, Math.ceil(totalResolved / pageSize)), p + 1)
                  )
                }
              />
            }
          />
        </section>
      </div>
    </AppShell>
  );
}
