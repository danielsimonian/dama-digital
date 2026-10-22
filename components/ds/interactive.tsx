'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, CircleCheck, CircleX, Info } from 'lucide-react';
import { cn } from './primitives';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

function useDismiss(open: boolean, onClose: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open, onClose, ref]);
}

/* ------------------------------------------------------------------ */
/* Dropdown                                                            */
/* ------------------------------------------------------------------ */

export type MenuItem = { label: string; hint?: string; icon?: ReactNode; danger?: boolean; onSelect?: () => void };

export function Dropdown({
  trigger,
  items,
  align = 'start',
}: {
  trigger: (props: { open: boolean; toggle: () => void; id: string }) => ReactNode;
  items: MenuItem[];
  align?: 'start' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref);

  return (
    <div ref={ref} className="relative inline-flex">
      {trigger({ open, toggle: () => setOpen((o) => !o), id })}
      <AnimatePresence>
        {open && (
          <motion.ul
            id={id}
            role="menu"
            initial={{ opacity: 0, transform: 'translateY(-4px) scale(0.97)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(-4px) scale(0.97)', transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className={cn(
              'absolute top-full z-30 mt-2 min-w-56 rounded-ds-sm border border-ds-line bg-ds-surface-2 p-1 shadow-[0_12px_32px_-12px_oklch(0%_0_0/0.5)]',
              align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            )}
          >
            {items.map((item) => (
              <li key={item.label} role="none">
                <button
                  role="menuitem"
                  onClick={() => {
                    item.onSelect?.();
                    close();
                  }}
                  className={cn(
                    'flex h-10 w-full items-center gap-3 rounded-ds-xs px-3 text-left text-sm transition-colors',
                    item.danger ? 'text-ds-danger hover:bg-ds-danger-soft' : 'text-ds-fg hover:bg-ds-surface-3',
                  )}
                >
                  {item.icon && <span className="text-ds-subtle">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {item.hint && <span className="ds-annot">{item.hint}</span>}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Accordion                                                           */
/* ------------------------------------------------------------------ */

export function Accordion({ items }: { items: { q: string; a: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <div className="border-t border-ds-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-ds-line">
            <h3>
              <button
                id={`${base}-h${i}`}
                aria-expanded={isOpen}
                aria-controls={`${base}-p${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-14 w-full items-center gap-4 py-4 text-left text-base text-ds-fg"
              >
                <span className="ds-annot w-6">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 font-medium tracking-tight">{item.q}</span>
                <Plus
                  className={cn('size-4 text-ds-subtle transition-transform duration-200 ease-ds-out', isOpen && 'rotate-45')}
                  strokeWidth={1.5}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={`${base}-p${i}`}
              role="region"
              aria-labelledby={`${base}-h${i}`}
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-ds-out',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="pb-5 pl-10 pr-8 text-sm leading-relaxed text-ds-muted">{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

export function Tabs({
  tabs,
  variant = 'line',
}: {
  tabs: { id: string; label: string; count?: number; content: ReactNode }[];
  variant?: 'line' | 'segmented';
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    const next = (i + dir + tabs.length) % tabs.length;
    setActive(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        className={cn(
          'flex gap-1 overflow-x-auto',
          variant === 'line' ? 'border-b border-ds-line' : 'inline-flex rounded-ds-sm border border-ds-line p-1',
        )}
      >
        {tabs.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              id={`${base}-t-${t.id}`}
              aria-selected={selected}
              aria-controls={`${base}-p-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                // contorno para dentro: a lista rola na horizontal e cortaria o de fora
                'relative inline-flex h-10 shrink-0 items-center gap-2 px-3 text-sm transition-colors focus-visible:-outline-offset-2!',
                variant === 'line'
                  ? selected
                    ? 'text-ds-fg'
                    : 'text-ds-subtle hover:text-ds-fg'
                  : cn('rounded-ds-xs', selected ? 'bg-ds-surface-3 text-ds-fg' : 'text-ds-subtle hover:text-ds-fg'),
              )}
            >
              {t.label}
              {t.count !== undefined && <span className="ds-annot">{t.count}</span>}
              {variant === 'line' && selected && (
                <motion.span layoutId={`${base}-ink`} className="absolute inset-x-0 -bottom-px h-px bg-ds-accent" />
              )}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-p-${t.id}`}
          aria-labelledby={`${base}-t-${t.id}`}
          hidden={t.id !== active}
          className="pt-6"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Paginação                                                           */
/* ------------------------------------------------------------------ */

export function Pagination({ total, initial = 1 }: { total: number; initial?: number }) {
  const [page, setPage] = useState(initial);
  const pages = Array.from({ length: total }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === total || Math.abs(p - page) <= 1,
  );
  const cell =
    'ds-press inline-flex h-10 min-w-10 items-center justify-center rounded-ds-xs px-2 font-ds-mono text-xs tabular-nums transition-colors';
  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center gap-1">
      <button
        className={cn(cell, 'text-ds-muted hover:bg-ds-surface-2 disabled:opacity-30')}
        onClick={() => setPage((p) => p - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" strokeWidth={1.5} />
      </button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && p - pages[i - 1] > 1 && <span className="ds-annot px-1">…</span>}
          <button
            onClick={() => setPage(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              cell,
              p === page ? 'border border-ds-line-strong text-ds-fg' : 'text-ds-subtle hover:bg-ds-surface-2 hover:text-ds-fg',
            )}
          >
            {String(p).padStart(2, '0')}
          </button>
        </span>
      ))}
      <button
        className={cn(cell, 'text-ds-muted hover:bg-ds-surface-2 disabled:opacity-30')}
        onClick={() => setPage((p) => p + 1)}
        disabled={page === total}
        aria-label="Próxima página"
      >
        <ChevronRight className="size-4" strokeWidth={1.5} />
      </button>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Chips de filtro                                                     */
/* ------------------------------------------------------------------ */

export function FilterChips({
  options,
  multiple = false,
  onChange,
  label,
}: {
  options: string[];
  multiple?: boolean;
  onChange?: (selected: string[]) => void;
  label?: string;
}) {
  const [selected, setSelected] = useState<string[]>([options[0]]);
  const toggle = (o: string) => {
    const next = multiple ? (selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o]) : [o];
    setSelected(next);
    onChange?.(next);
  };
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            aria-pressed={on}
            onClick={() => toggle(o)}
            className={cn(
              'ds-press inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors',
              on
                ? 'border-ds-accent bg-ds-accent-soft text-ds-fg'
                : 'border-ds-line text-ds-muted hover:border-ds-line-strong hover:text-ds-fg',
            )}
          >
            {on && <span className="size-1.5 rounded-full bg-ds-accent" aria-hidden />}
            {o}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal & Drawer                                                      */
/* ------------------------------------------------------------------ */

function useLockAndEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
}

export function Modal({
  open,
  onClose,
  title,
  index,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  index?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useLockAndEscape(open, onClose);
  const titleId = useId();
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
          <motion.div
            className="absolute inset-0 bg-[oklch(10%_0_0/0.6)] backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, transform: 'scale(0.96)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            exit={{ opacity: 0, transform: 'scale(0.98)', transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="ds-corners relative w-full max-w-lg border border-ds-line bg-ds-surface p-6 [--ds-corner:var(--ds-accent)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                {index && <p className="ds-annot mb-2 uppercase">{index}</p>}
                <h2 id={titleId} className="text-xl font-medium">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="-mr-2 -mt-2 inline-flex size-11 items-center justify-center text-ds-subtle hover:text-ds-fg"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="mt-4 text-sm leading-relaxed text-ds-muted">{children}</div>
            {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: 'right' | 'left';
}) {
  useLockAndEscape(open, onClose);
  const titleId = useId();
  const off = side === 'right' ? 'translateX(100%)' : 'translateX(-100%)';
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-[oklch(10%_0_0/0.6)]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ transform: off }}
            animate={{ transform: 'translateX(0%)' }}
            exit={{ transform: off, transition: { duration: 0.25, ease: EASE_DRAWER } }}
            transition={{ duration: 0.4, ease: EASE_DRAWER }}
            className={cn(
              'absolute inset-y-0 flex w-full max-w-md flex-col border-ds-line bg-ds-surface',
              side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
            )}
          >
            <div className="flex h-16 items-center justify-between border-b border-ds-line px-6">
              <h2 id={titleId} className="text-base font-medium">
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="-mr-3 inline-flex size-11 items-center justify-center text-ds-subtle hover:text-ds-fg"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */

type ToastTone = 'success' | 'danger' | 'info';
type ToastItem = { id: number; title: string; description?: string; tone: ToastTone };

const ToastCtx = createContext<(t: Omit<ToastItem, 'id'>) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

const TOAST_ICON = { success: CircleCheck, danger: CircleX, info: Info } as const;
const TOAST_TONE = { success: 'text-ds-success', danger: 'text-ds-danger', info: 'text-ds-info' } as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const reduce = useReducedMotion();
  const push = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((all) => [...all.slice(-2), { ...t, id }]);
    setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 left-4 right-4 z-[1000] flex flex-col items-end gap-2 sm:left-auto"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = TOAST_ICON[t.tone];
            return (
              <motion.div
                key={t.id}
                layout={!reduce}
                initial={{ opacity: 0, transform: 'translateY(12px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                exit={{ opacity: 0, transform: 'translateX(24px)', transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="pointer-events-auto flex w-full max-w-sm gap-3 rounded-ds-sm border border-ds-line bg-ds-surface-2 p-4 shadow-[0_16px_40px_-16px_oklch(0%_0_0/0.6)]"
              >
                <Icon className={cn('mt-0.5 size-4 shrink-0', TOAST_TONE[t.tone])} strokeWidth={1.5} aria-hidden />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium text-ds-fg">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-ds-muted">{t.description}</p>}
                </div>
                <button
                  onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
                  aria-label="Dispensar"
                  className="-m-2 inline-flex size-9 items-center justify-center text-ds-subtle hover:text-ds-fg"
                >
                  <X className="size-3.5" strokeWidth={1.5} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

