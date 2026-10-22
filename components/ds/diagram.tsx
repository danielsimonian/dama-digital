'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { Divisao } from '@/lib/supabase';
import { cn, DIVISAO_LABEL } from './primitives';

const EASE = [0.23, 1, 0.32, 1] as const;

const CIRCLES: { id: Divisao; cx: number; cy: number; angle: string; label: { x: number; y: number; anchor: 'start' | 'end' | 'middle' } }[] = [
  { id: 'tech', cx: 190, cy: 170, angle: '210°', label: { x: 70, y: 70, anchor: 'start' } },
  { id: 'sports', cx: 310, cy: 170, angle: '330°', label: { x: 430, y: 70, anchor: 'end' } },
  { id: 'studio', cx: 250, cy: 274, angle: '90°', label: { x: 250, y: 396, anchor: 'middle' } },
];

const STROKE: Record<Divisao, string> = {
  tech: 'stroke-ds-tech',
  sports: 'stroke-ds-sports',
  studio: 'stroke-ds-studio',
};
const FILL: Record<Divisao, string> = {
  tech: 'fill-ds-tech',
  sports: 'fill-ds-sports',
  studio: 'fill-ds-studio',
};

/**
 * Diagrama das divisões: três círculos de construção com o núcleo DAMA no centro.
 * Ao passar o mouse (ou focar a legenda), a divisão acende com seu acento.
 */
export function DivisionDiagram({
  active: controlled,
  onActiveChange,
  showLegend = true,
  className,
}: {
  active?: Divisao | null;
  onActiveChange?: (d: Divisao | null) => void;
  showLegend?: boolean;
  className?: string;
}) {
  const [inner, setInner] = useState<Divisao | null>(null);
  const active = controlled !== undefined ? controlled : inner;
  const reduce = useReducedMotion();
  // o Safari do iPhone não dispara o "entrou na tela" em elementos internos do SVG;
  // observamos a caixa de fora e animamos tudo a partir dela
  const ref = useRef<HTMLDivElement>(null);
  const visto = useInView(ref, { once: true, amount: 0.2 });
  const set = (d: Divisao | null) => {
    setInner(d);
    onActiveChange?.(d);
  };

  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: visto ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
          transition: { pathLength: { duration: 1.4, ease: EASE, delay }, opacity: { duration: 0.2, delay } },
        };

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: visto ? 1 : 0 },
          transition: { duration: 0.6, delay },
        };

  return (
    <div ref={ref} className={cn('w-full', className)}>
      <svg viewBox="0 0 500 410" className="h-auto w-full overflow-visible" role="img" aria-label="Diagrama das três divisões da DAMA: Tech, Sports e Studio, ligadas ao núcleo DAMA">
        {/* eixos de construção */}
        <g className="stroke-ds-line" strokeWidth={1} fill="none">
          <motion.path d="M20 210H480" strokeDasharray="2 4" {...draw(0)} />
          <motion.path d="M250 20V400" strokeDasharray="2 4" {...draw(0.05)} />
          <motion.path d="M70 40 430 380M430 40 70 380" strokeDasharray="1 5" {...draw(0.1)} />
        </g>

        {/* círculos das divisões */}
        {CIRCLES.map((c, i) => {
          const on = active === c.id;
          const dim = active && !on;
          return (
            <g
              key={c.id}
              onMouseEnter={() => set(c.id)}
              onMouseLeave={() => set(null)}
              className="cursor-pointer"
            >
              <circle cx={c.cx} cy={c.cy} r={112} className={cn(FILL[c.id], 'transition-opacity duration-300')} opacity={on ? 0.1 : 0} />
              <motion.circle
                cx={c.cx}
                cy={c.cy}
                r={112}
                fill="none"
                strokeWidth={on ? 1.5 : 1}
                className={cn(
                  'transition-[stroke,opacity] duration-300',
                  on ? STROKE[c.id] : 'stroke-ds-line-strong',
                  dim && 'opacity-40',
                )}
                {...draw(0.25 + i * 0.18)}
              />
              <circle cx={c.cx} cy={c.cy} r={2.5} className={on ? FILL[c.id] : 'fill-ds-line-strong'} />
              <motion.g {...fade(1 + i * 0.1)}>
                <path
                  d={`M${c.cx} ${c.cy}L${c.label.x} ${c.label.y + (c.id === 'studio' ? -14 : 8)}`}
                  className={cn('transition-[stroke] duration-300', on ? STROKE[c.id] : 'stroke-ds-line')}
                  strokeDasharray="2 3"
                  fill="none"
                />
                <text
                  x={c.label.x}
                  y={c.label.y}
                  textAnchor={c.label.anchor}
                  className={cn('font-ds-mono text-[11px] uppercase tracking-wider transition-[fill] duration-300', on ? FILL[c.id] : 'fill-ds-muted')}
                >
                  {DIVISAO_LABEL[c.id].replace('DAMA ', '')}
                </text>
                <text
                  x={c.label.x}
                  y={c.label.y + (c.id === 'studio' ? -28 : -14)}
                  textAnchor={c.label.anchor}
                  className="fill-ds-subtle font-ds-mono text-[10px]"
                >
                  {String(i + 1).padStart(2, '0')} · {c.angle}
                </text>
              </motion.g>
            </g>
          );
        })}

        {/* núcleo */}
        <motion.g {...fade(1.3)}>
          <circle cx={250} cy={205} r={26} className="fill-ds-bg stroke-ds-fg" strokeWidth={1} />
          <text x={250} y={209} textAnchor="middle" className="fill-ds-fg font-ds-mono text-[10px] font-medium tracking-widest">
            DAMA
          </text>
          <text x={286} y={246} className="fill-ds-subtle font-ds-mono text-[10px]">
            r 112
          </text>
        </motion.g>
      </svg>

      {showLegend && (
        <div className="mt-4 flex flex-wrap justify-center gap-2" role="group" aria-label="Destacar divisão">
          {CIRCLES.map((c) => (
            <button
              key={c.id}
              data-divisao={c.id}
              onFocus={() => set(c.id)}
              onBlur={() => set(null)}
              onMouseEnter={() => set(c.id)}
              onMouseLeave={() => set(null)}
              aria-pressed={active === c.id}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full border px-3 font-ds-mono text-[11px] uppercase tracking-wider transition-colors',
                active === c.id ? 'border-ds-accent text-ds-fg' : 'border-ds-line text-ds-subtle',
              )}
            >
              <span className="size-1.5 rounded-full bg-ds-accent" aria-hidden />
              {DIVISAO_LABEL[c.id].replace('DAMA ', '')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Processo em nós                                                     */
/* ------------------------------------------------------------------ */

export type ProcessStep = { title: string; desc: string; note: string };

export function ProcessNodes({ steps, divisao }: { steps: ProcessStep[]; divisao?: Divisao }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  return (
    <ol data-divisao={divisao} className="relative grid gap-0 md:grid-cols-4">
      {/* linha de conexão (desktop) */}
      <motion.span
        aria-hidden
        className="absolute left-[12.5%] right-[12.5%] top-5 hidden h-px origin-left bg-ds-line-strong md:block"
        initial={reduce ? undefined : { transform: 'scaleX(0)' }}
        whileInView={reduce ? undefined : { transform: 'scaleX(1)' }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE }}
      />
      {/* linha de conexão (mobile) */}
      <span aria-hidden className="absolute bottom-6 left-5 top-5 w-px bg-ds-line-strong md:hidden" />
      {steps.map((s, i) => {
        const on = i === active;
        return (
          <li key={s.title} className="relative">
            <button
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="flex w-full gap-5 pb-8 text-left md:flex-col md:items-center md:gap-4 md:px-4 md:pb-0 md:text-center"
            >
              <span
                className={cn(
                  'relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full border font-ds-mono text-xs tabular-nums transition-colors duration-200',
                  on ? 'border-ds-accent bg-ds-accent text-ds-accent-fg' : 'border-ds-line-strong bg-ds-bg text-ds-muted',
                )}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="pt-2 md:pt-0">
                <span className="block text-lg font-medium tracking-tight text-ds-fg">{s.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-ds-muted">{s.desc}</span>
                <span className={cn('ds-annot mt-2 block transition-colors', on && 'text-ds-accent')}>{s.note}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
