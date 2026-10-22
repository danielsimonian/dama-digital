'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';
import { cn, Avatar, Kbd } from '../primitives';
import { DamaLogo } from '../site';

export type NavItem = { id: string; label: string; icon: ReactNode; count?: number; alert?: boolean };

export function AdminSidebar({
  items,
  active,
  onChange,
  onSearch,
  footer,
}: {
  items: NavItem[];
  active: string;
  onChange: (id: string) => void;
  onSearch?: () => void;
  footer?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-ds-line px-4">
        <DamaLogo className="h-5" />
        <span className="ds-annot uppercase">admin</span>
      </div>
      <div className="p-3">
        <button
          onClick={onSearch}
          className="flex h-9 w-full items-center gap-2 rounded-ds-sm border border-ds-line bg-ds-surface px-2.5 text-sm text-ds-subtle transition-colors hover:border-ds-line-strong hover:text-ds-fg"
        >
          <Search className="size-4" strokeWidth={1.5} aria-hidden />
          <span className="flex-1 text-left">Buscar ou agir…</span>
          <Kbd>⌘K</Kbd>
        </button>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5">
          {items.map((it, i) => {
            const on = it.id === active;
            return (
              <li key={it.id}>
                <button
                  onClick={() => onChange(it.id)}
                  aria-current={on ? 'page' : undefined}
                  className={cn(
                    'group flex h-9 w-full items-center gap-2.5 rounded-ds-xs px-2.5 text-sm transition-colors',
                    on ? 'bg-ds-surface-2 text-ds-fg' : 'text-ds-muted hover:bg-ds-surface hover:text-ds-fg',
                  )}
                >
                  <span className="font-ds-mono text-[10px] tabular-nums text-ds-subtle">{String(i + 1).padStart(2, '0')}</span>
                  <span className={cn('[&_svg]:size-4', on ? 'text-ds-fg' : 'text-ds-subtle group-hover:text-ds-muted')}>{it.icon}</span>
                  <span className="flex-1 text-left">{it.label}</span>
                  {it.alert && <span className="size-1.5 rounded-full bg-ds-danger" aria-label="pendências" />}
                  {it.count !== undefined && <span className="font-ds-mono text-[11px] tabular-nums text-ds-subtle">{it.count}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {footer && <div className="border-t border-ds-line p-3">{footer}</div>}
    </div>
  );
}

export function UserSwitch({
  users,
  active,
  onChange,
}: {
  users: { id: string; nome: string; foto: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  const cur = users.find((u) => u.id === active) ?? users[0];
  const other = users.find((u) => u.id !== cur.id);
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={cur.nome} src={cur.foto} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ds-fg">{cur.nome.split(' ')[0]}</p>
        <p className="ds-annot">sócio(a)</p>
      </div>
      {other && (
        <button
          onClick={() => onChange(other.id)}
          className="ds-annot rounded-ds-xs border border-ds-line px-1.5 py-1 hover:text-ds-fg"
          aria-label={`Trocar para ${other.nome}`}
        >
          trocar
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Paleta de comandos — abre sem animação (ação de teclado)            */
/* ------------------------------------------------------------------ */

export type Command = { id: string; group: string; label: string; hint?: string; icon?: ReactNode; run: () => void };

export function CommandPalette({ open, onClose, commands }: { open: boolean; onClose: () => void; commands: Command[] }) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? commands.filter((c) => c.label.toLowerCase().includes(s) || c.group.toLowerCase().includes(s)) : commands;
  }, [q, commands]);

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  if (!open) return null;

  const groups = [...new Set(filtered.map((c) => c.group))];
  const run = (c: Command) => {
    c.run();
    setQ('');
    setIdx(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-[oklch(10%_0_0/0.45)]" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Paleta de comandos" className="relative w-full max-w-xl overflow-hidden rounded-ds-md border border-ds-line bg-ds-surface shadow-[0_24px_64px_-24px_oklch(0%_0_0/0.6)]">
        <div className="flex items-center gap-3 border-b border-ds-line px-4">
          <Search className="size-4 text-ds-subtle" strokeWidth={1.5} aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIdx((i) => Math.min(i + 1, filtered.length - 1));
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIdx((i) => Math.max(i - 1, 0));
              }
              if (e.key === 'Enter' && filtered[idx]) run(filtered[idx]);
            }}
            placeholder="Buscar cliente, ir para tela ou criar…"
            aria-label="Comando"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-ds-subtle focus-visible:outline-none"
          />
          <Kbd>esc</Kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && <p className="px-3 py-8 text-center text-sm text-ds-subtle">Nada encontrado para “{q}”.</p>}
          {groups.map((g) => (
            <div key={g} className="mb-2">
              <p className="ds-annot px-3 py-1.5 uppercase">{g}</p>
              {filtered
                .filter((c) => c.group === g)
                .map((c) => {
                  const i = filtered.indexOf(c);
                  const on = i === idx;
                  return (
                    <button
                      key={c.id}
                      onMouseEnter={() => setIdx(i)}
                      onClick={() => run(c)}
                      className={cn('flex h-10 w-full items-center gap-3 rounded-ds-xs px-3 text-left text-sm', on ? 'bg-ds-surface-3 text-ds-fg' : 'text-ds-muted')}
                    >
                      <span className="text-ds-subtle [&_svg]:size-4">{c.icon}</span>
                      <span className="flex-1 truncate">{c.label}</span>
                      {c.hint && <span className="ds-annot">{c.hint}</span>}
                      {on && <CornerDownLeft className="size-3.5 text-ds-subtle" strokeWidth={1.5} aria-hidden />}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
        <div className="flex gap-4 border-t border-ds-line px-4 py-2">
          <span className="ds-annot">↑↓ navegar</span>
          <span className="ds-annot">↵ abrir</span>
          <span className="ds-annot">esc fechar</span>
        </div>
      </div>
    </div>
  );
}
