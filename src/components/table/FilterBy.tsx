'use client';

import * as React from "react";
import { Filter, ChevronDown, X } from "lucide-react";

export type FilterGroup = {
  id: string;           
  title: string;       
  options: string[];    
};

export type FilterValuesMap = Record<string, Set<string>>;

type FilterByProps = {
  groups: FilterGroup[];                         
  values: FilterValuesMap;                       
  onChange: (groupId: string, next: Set<string>) => void; 
  onClear: () => void;                           
  onApply: (v: FilterValuesMap) => void;         

  className?: string;
  buttonText?: string;
};

function useOutsideClose<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  return ref;
}

function FilterGroupUI({
  title, items, checked, onToggle,
}: {
  title: string;
  items: string[];
  checked: (item: string) => boolean;
  onToggle: (item: string) => void;
}) {
  return (
    <section className="p-4">
      <h5 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h5>
      <ul className="space-y-2">
        {items.length === 0 && <li className="text-xs text-muted-foreground">No options</li>}
        {items.map((it) => (
          <li key={it} className="flex items-center gap-2">
            <input
              id={`${title}-${it}`}
              type="checkbox"
              checked={checked(it)}
              onChange={() => onToggle(it)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-0"
            />
            <label htmlFor={`${title}-${it}`} className="text-sm text-foreground">
              {it}
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function FilterBy({
  groups,
  values,
  onChange,
  onClear,
  onApply,
  className = "",
  buttonText = "Filter By",
}: FilterByProps) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const wrapRef = useOutsideClose<HTMLDivElement>(open, () => setOpen(false));

  const filterList = (list: string[]) =>
    q.trim() ? list.filter((x) => x.toLowerCase().includes(q.toLowerCase())) : list;

  const selectedCount = React.useMemo(
    () => Object.values(values).reduce((sum, s) => sum + (s?.size ?? 0), 0),
    [values]
  );

  return (
    <div ref={wrapRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="
          inline-flex items-center gap-2 rounded-full
          border border-border bg-card text-foreground
          px-4 py-2 text-sm font-medium shadow-sm
          transition-colors hover:bg-accent/40 dark:hover:bg-accent/30
          focus:outline-none focus:ring-0
        "
      >
        <Filter className="h-4 w-4 text-muted-foreground" />
        {buttonText}
        {selectedCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
            {selectedCount}
          </span>
        )}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute z-[1000] mt-2 w-[360px] rounded-lg border border-border bg-card text-card-foreground shadow-xl"
        >
          <div className="flex items-center gap-2 border-b border-border p-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search filter options..."
              className="flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-0"
            />
            {q && (
              <button
                className="rounded p-1 text-muted-foreground hover:bg-accent/40"
                title="Clear search"
                onClick={() => setQ("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {groups.map((g) => {
              const selected = values[g.id] ?? new Set<string>();
              const toggle = (item: string) => {
                const next = new Set(selected);
                next.has(item) ? next.delete(item) : next.add(item);
                onChange(g.id, next);
              };
              return (
                <FilterGroupUI
                  key={g.id}
                  title={g.title}
                  items={filterList(g.options)}
                  checked={(i) => selected.has(i)}
                  onToggle={toggle}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-border p-3">
            <button
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => { onClear(); setOpen(false); }}
              type="button"
            >
              Clear
            </button>
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              onClick={() => { onApply(values); setOpen(false); }}
              type="button"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
