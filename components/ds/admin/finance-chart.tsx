'use client';

import { useState } from 'react';
import { cn } from '../primitives';
import { brl } from './display';
import type { MesFinanceiro } from './types';

const HATCH =
  'bg-[repeating-linear-gradient(135deg,color-mix(in_oklch,var(--ds-fg)_45%,transparent)_0_1.5px,transparent_1.5px_5px)] ring-1 ring-inset ring-ds-fg/40';

/**
 * Recebido × a receber por mês. Uma única cor (tinta do texto):
 * o "a receber" se diferencia por textura, não por matiz.
 */
export function MonthlyBars({ data, current }: { data: MesFinanceiro[]; current: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(0, ...data.map((d) => d.recebido + d.aReceber));
  const top = Math.max(5000, Math.ceil(max / 5000) * 5000);
  const ticks = [top, top / 2, 0];
  const H = 168;

  return (
    <figure>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2" aria-hidden>
        <span className="inline-flex items-center gap-2 text-xs text-ds-muted">
          <span className="size-2.5 rounded-[2px] bg-ds-fg" /> Recebido
        </span>
        <span className="inline-flex items-center gap-2 text-xs text-ds-muted">
          <span className={cn('size-2.5 rounded-[2px]', HATCH)} /> A receber
        </span>
      </div>

      <div className="relative grid grid-cols-[3rem_1fr]">
        <div className="relative" style={{ height: H }} aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="ds-annot absolute right-2 -translate-y-1/2 tabular-nums" style={{ top: H - (t / top) * H }}>
              {t === 0 ? '0' : `${t / 1000}k`}
            </span>
          ))}
        </div>
        <div className="relative" style={{ height: H }}>
          {ticks.map((t) => (
            <span
              key={t}
              className={cn('absolute inset-x-0 border-t', t === 0 ? 'border-ds-line-strong' : 'border-dashed border-ds-line')}
              style={{ top: H - (t / top) * H }}
              aria-hidden
            />
          ))}
          <div className="absolute inset-0 flex items-end gap-2 px-1 sm:gap-4">
            {data.map((d, i) => {
              const rec = (d.recebido / top) * H;
              const ar = (d.aReceber / top) * H;
              const on = hover === i;
              return (
                <div
                  key={`${d.mes}-${d.ano ?? ''}`}
                  className="group relative flex h-full flex-1 cursor-default flex-col justify-end"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  aria-label={`${d.mes}: recebido ${brl(d.recebido)}, a receber ${brl(d.aReceber)}`}
                >
                  <div className={cn('mx-auto flex w-full max-w-10 flex-col gap-[2px] transition-opacity', hover !== null && !on && 'opacity-40')}>
                    {ar > 0 && <span className={cn('block rounded-t-[4px]', HATCH)} style={{ height: ar }} />}
                    {rec > 0 && <span className={cn('block bg-ds-fg', ar > 0 ? '' : 'rounded-t-[4px]')} style={{ height: rec }} />}
                  </div>
                  {on && (
                    <div className={cn('pointer-events-none absolute bottom-full z-20 mb-2 w-44 rounded-ds-sm border border-ds-line bg-ds-surface-2 p-3 text-xs shadow-[0_12px_32px_-12px_oklch(0%_0_0/0.4)]', i === 0 ? 'left-0' : i >= data.length - 2 ? 'right-0' : 'left-1/2 -translate-x-1/2')}>
                      <p className="ds-annot uppercase">
                        {d.mes} {d.ano ?? ''}
                      </p>
                      <dl className="mt-2 space-y-1">
                        <div className="flex justify-between gap-3">
                          <dt className="text-ds-muted">Recebido</dt>
                          <dd className="font-ds-mono tabular-nums text-ds-fg">{brl(d.recebido)}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-ds-muted">A receber</dt>
                          <dd className="font-ds-mono tabular-nums text-ds-fg">{brl(d.aReceber)}</dd>
                        </div>
                        <div className="flex justify-between gap-3 border-t border-ds-line pt-1">
                          <dt className="text-ds-muted">Total</dt>
                          <dd className="font-ds-mono tabular-nums text-ds-fg">{brl(d.recebido + d.aReceber)}</dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <span />
        <div className="flex gap-2 px-1 pt-2 sm:gap-4" aria-hidden>
          {data.map((d) => (
            <span key={`${d.mes}-${d.ano ?? ''}`} className={cn('ds-annot flex-1 text-center uppercase', d.mes === current && 'text-ds-fg')}>
              {d.mes}
            </span>
          ))}
        </div>
      </div>

      <table className="sr-only">
        <caption>Recebido e a receber por mês</caption>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Recebido</th>
            <th>A receber</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={`${d.mes}-${d.ano ?? ''}`}>
              <td>{d.mes}</td>
              <td>{brl(d.recebido)}</td>
              <td>{brl(d.aReceber)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
