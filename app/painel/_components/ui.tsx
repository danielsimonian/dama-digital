'use client';

import type { ReactNode } from 'react';
import { cn } from '@/components/ds/primitives';

export function ScreenHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ds-line px-4 py-5 md:px-6">
      <div>
        {sub && <p className="ds-annot uppercase">{sub}</p>}
        <h1 className="mt-1 text-2xl font-medium tracking-tight">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('min-w-0 border border-ds-line', className)}>
      <header className="flex items-center justify-between gap-3 border-b border-ds-line px-4 py-2.5">
        <h2 className="font-ds-mono text-[11px] uppercase tracking-wider text-ds-muted">{title}</h2>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Chips<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors',
            value === o.id ? 'border-ds-fg bg-ds-fg text-ds-bg' : 'border-ds-line text-ds-muted hover:border-ds-line-strong hover:text-ds-fg',
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="font-ds-mono tabular-nums opacity-70">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
