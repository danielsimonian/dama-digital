'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '../primitives';

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sort?: (row: T) => number | string;
  align?: 'left' | 'right';
  width?: string;
  /** some do layout de tabela abaixo deste breakpoint (no mobile vira card) */
  hideBelow?: 'lg' | 'xl';
};

/**
 * Tabela densa com cabeçalho fixo, ordenação, linha selecionável e
 * versão em cards no mobile (primeira coluna vira título).
 */
export function DataTable<T>({
  rows,
  columns,
  getId,
  selectedId,
  onSelect,
  empty,
  loading,
  dense,
}: {
  rows: T[];
  columns: Column<T>[];
  getId: (row: T) => string;
  selectedId?: string | null;
  onSelect?: (row: T) => void;
  empty?: ReactNode;
  loading?: boolean;
  dense?: boolean;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sort) return rows;
    const get = col.sort;
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      return (va > vb ? 1 : va < vb ? -1 : 0) * sort.dir;
    });
  }, [rows, columns, sort]);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: 1 } : s.dir === 1 ? { key, dir: -1 } : null));

  const hide = (c: Column<T>) => (c.hideBelow === 'lg' ? 'hidden lg:table-cell' : c.hideBelow === 'xl' ? 'hidden xl:table-cell' : '');
  const pad = dense ? 'px-3 py-2' : 'px-3 py-3';

  if (loading) {
    return (
      <div className="divide-y divide-ds-line border-y border-ds-line" aria-busy>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-3 py-3.5">
            <span className="size-7 shrink-0 animate-pulse rounded-full bg-ds-surface-2" />
            <span className="h-3 w-40 animate-pulse bg-ds-surface-2" />
            <span className="ml-auto h-3 w-16 animate-pulse bg-ds-surface-2" />
          </div>
        ))}
      </div>
    );
  }

  if (!rows.length) return <>{empty}</>;

  return (
    <>
      {/* tabela (≥ md) */}
      <div className="hidden md:block">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-ds-bg">
            <tr className="border-b border-ds-line">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}
                    style={{ width: c.width }}
                    className={cn('px-3 py-2 text-left font-normal', c.align === 'right' && 'text-right', hide(c))}
                  >
                    {c.sort ? (
                      <button
                        onClick={() => toggleSort(c.key)}
                        className={cn(
                          'inline-flex items-center gap-1 font-ds-mono text-[11px] uppercase tracking-wider transition-colors hover:text-ds-fg',
                          active ? 'text-ds-fg' : 'text-ds-subtle',
                        )}
                      >
                        {c.header}
                        {active &&
                          (sort.dir === 1 ? (
                            <ArrowUp className="size-3" strokeWidth={1.5} aria-hidden />
                          ) : (
                            <ArrowDown className="size-3" strokeWidth={1.5} aria-hidden />
                          ))}
                      </button>
                    ) : (
                      <span className="font-ds-mono text-[11px] uppercase tracking-wider text-ds-subtle">{c.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const id = getId(row);
              const selected = id === selectedId;
              return (
                <tr
                  key={id}
                  onClick={onSelect ? () => onSelect(row) : undefined}
                  onKeyDown={onSelect ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(row)) : undefined}
                  tabIndex={onSelect ? 0 : undefined}
                  aria-selected={onSelect ? selected : undefined}
                  className={cn(
                    'border-b border-ds-line transition-colors',
                    onSelect && 'cursor-pointer hover:bg-ds-surface focus-visible:bg-ds-surface',
                    selected && 'bg-ds-surface-2 hover:bg-ds-surface-2 shadow-[inset_2px_0_0_var(--ds-accent)]',
                  )}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn(pad, 'align-middle', c.align === 'right' && 'text-right tabular-nums', hide(c))}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* cards (< md) */}
      <ul className="divide-y divide-ds-line border-y border-ds-line md:hidden">
        {sorted.map((row) => {
          const id = getId(row);
          const [first, ...rest] = columns;
          const Tag = onSelect ? 'button' : 'div';
          return (
            <li key={id}>
              <Tag
                onClick={onSelect ? () => onSelect(row) : undefined}
                className={cn('block w-full px-3 py-3 text-left', id === selectedId && 'bg-ds-surface-2')}
              >
                <div className="text-sm">{first.cell(row)}</div>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {rest.slice(0, 4).map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="ds-annot uppercase">{c.header}</dt>
                      <dd className="truncate text-sm">{c.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
              </Tag>
            </li>
          );
        })}
      </ul>
    </>
  );
}
