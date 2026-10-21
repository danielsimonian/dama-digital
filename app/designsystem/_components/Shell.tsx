'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { List, Moon, Sun } from 'lucide-react';
import type { Divisao } from '@/lib/supabase';
import { cn } from '@/components/ds/primitives';
import { Drawer, ToastProvider } from '@/components/ds/interactive';
import { DamaLogo } from '@/components/ds/site';

export type NavGroup = { title: string; items: { id: string; index: string; label: string }[] };

type Theme = 'dark' | 'light';
type Accent = 'neutro' | Divisao;

const ACCENTS: { id: Accent; label: string }[] = [
  { id: 'neutro', label: 'Neutro' },
  { id: 'tech', label: 'Tech' },
  { id: 'sports', label: 'Sports' },
  { id: 'studio', label: 'Studio' },
];

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* armazenamento indisponível — segue sem lembrar */
  }
}

function NavList({ groups, active, onNavigate }: { groups: NavGroup[]; active: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Índice do design system" className="space-y-8">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="ds-annot mb-3 uppercase">{g.title}</p>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const on = item.id === active;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={onNavigate}
                    aria-current={on ? 'location' : undefined}
                    className={cn(
                      'flex h-8 items-center gap-3 border-l pl-3 text-sm transition-colors',
                      on ? 'border-ds-accent text-ds-fg' : 'border-ds-line text-ds-subtle hover:text-ds-fg',
                    )}
                  >
                    <span className="font-ds-mono text-[10px] tabular-nums">{item.index}</span>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: ReactNode; aria?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-ds-sm border border-ds-line p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          aria-label={o.aria}
          data-divisao={o.id === 'neutro' || o.id === 'dark' || o.id === 'light' ? undefined : o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            'inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-ds-xs px-2 font-ds-mono text-[11px] uppercase tracking-wider transition-colors',
            value === o.id ? 'bg-ds-surface-3 text-ds-fg' : 'text-ds-subtle hover:text-ds-fg',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Shell({ groups, children }: { groups: NavGroup[]; children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [accent, setAccent] = useState<Accent>('neutro');
  const [active, setActive] = useState(groups[0]?.items[0]?.id ?? '');
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const t = read('dama-ds-theme');
    const a = read('dama-ds-accent');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preferências locais só existem no cliente
    if (t === 'light' || t === 'dark') setTheme(t);
    if (a && ACCENTS.some((x) => x.id === a)) setAccent(a as Accent);
  }, []);

  useEffect(() => {
    const ids = groups.flatMap((g) => g.items.map((i) => i.id));
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [groups]);

  const changeTheme = (t: Theme) => {
    setTheme(t);
    write('dama-ds-theme', t);
  };
  const changeAccent = (a: Accent) => {
    setAccent(a);
    write('dama-ds-accent', a);
  };

  return (
    <div className="ds min-h-dvh" data-theme={theme}>
      <ToastProvider>
        <div className="sticky top-0 z-50 border-b border-ds-line bg-ds-bg/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-4 md:px-6">
            <Link href="/" aria-label="DAMA Digital — início" className="shrink-0">
              <DamaLogo className="h-6" />
            </Link>
            <span className="hidden h-5 w-px bg-ds-line sm:block" aria-hidden />
            <span className="ds-annot hidden uppercase sm:inline">Design System · v2.0</span>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:block">
                <Segmented
                  label="Acento de pré-visualização"
                  value={accent}
                  onChange={changeAccent}
                  options={ACCENTS.map((a) => ({
                    id: a.id,
                    label: (
                      <>
                        {a.id !== 'neutro' && <span className="size-1.5 rounded-full bg-ds-accent" aria-hidden />}
                        {a.label}
                      </>
                    ),
                  }))}
                />
              </div>
              <Segmented
                label="Tema"
                value={theme}
                onChange={changeTheme}
                options={[
                  { id: 'dark', label: <Moon className="size-3.5" strokeWidth={1.5} />, aria: 'Tema escuro' },
                  { id: 'light', label: <Sun className="size-3.5" strokeWidth={1.5} />, aria: 'Tema claro' },
                ]}
              />
              <button
                onClick={() => setNavOpen(true)}
                aria-label="Abrir índice"
                className="-mr-2 inline-flex size-11 items-center justify-center text-ds-fg lg:hidden"
              >
                <List className="size-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[15rem_1fr]">
          <aside className="hidden border-r border-ds-line lg:block">
            <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto px-6 py-10">
              <NavList groups={groups} active={active} />
            </div>
          </aside>
          <main data-divisao={accent === 'neutro' ? undefined : accent} className="min-w-0">
            {children}
          </main>
        </div>

        <Drawer open={navOpen} onClose={() => setNavOpen(false)} title="Índice" side="left">
          <div className="mb-8 md:hidden">
            <p className="ds-annot mb-3 uppercase">Acento</p>
            <Segmented
              label="Acento de pré-visualização"
              value={accent}
              onChange={changeAccent}
              options={ACCENTS.map((a) => ({ id: a.id, label: a.label }))}
            />
          </div>
          <NavList groups={groups} active={active} onNavigate={() => setNavOpen(false)} />
        </Drawer>
      </ToastProvider>
    </div>
  );
}
