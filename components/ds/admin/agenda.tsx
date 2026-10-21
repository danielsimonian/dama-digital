'use client';

import { cn } from '../primitives';
import { PresencaMark, PRESENCA_LABEL } from './display';
import type { Evento, Presenca } from './types';

const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

function hora(h: number) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export { hora as formatHora };

/**
 * Semana em grade. Aula = bloco com filete à esquerda; sessão de estúdio = bloco preenchido.
 * Presença aparece como marca no canto (forma + cor).
 */
export function WeekCalendar({
  eventos,
  nomes,
  datas,
  hoje,
  agora,
  selectedId,
  onSelect,
  start = 9,
  end = 23,
}: {
  eventos: Evento[];
  nomes: Record<string, string>;
  datas: number[];
  hoje: number;
  agora?: number;
  selectedId?: string | null;
  onSelect?: (e: Evento) => void;
  start?: number;
  end?: number;
}) {
  const H = 44;
  const hours = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <>
      {/* grade (≥ md) */}
      <div className="hidden overflow-x-auto md:block" data-divisao="studio">
        <div className="min-w-[680px]">
          <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-ds-line">
            <span />
            {DIAS.map((d, i) => (
              <div key={d} className="px-2 py-2 text-center">
                <span className={cn('ds-annot uppercase', i === hoje && 'text-ds-accent')}>{d}</span>
                <span
                  className={cn(
                    'mx-auto mt-0.5 flex size-7 items-center justify-center rounded-full text-sm tabular-nums',
                    i === hoje ? 'bg-ds-accent text-ds-accent-fg' : 'text-ds-fg',
                  )}
                >
                  {datas[i]}
                </span>
              </div>
            ))}
          </div>
          <div className="relative grid grid-cols-[3rem_repeat(7,1fr)]" style={{ height: hours.length * H }}>
            {/* horas */}
            <div className="relative">
              {hours.map((h, i) => (
                <span key={h} className="ds-annot absolute right-2 -translate-y-1/2" style={{ top: i * H }}>
                  {i === 0 ? '' : `${h}h`}
                </span>
              ))}
            </div>
            {DIAS.map((d, dia) => (
              <div key={d} className={cn('relative border-l border-ds-line', dia === hoje && 'bg-ds-accent-soft/40', dia >= 5 && 'bg-ds-surface/60')}>
                {hours.map((h, i) => (
                  <span key={h} className="absolute inset-x-0 border-t border-ds-line/60" style={{ top: i * H }} aria-hidden />
                ))}
                {eventos
                  .filter((e) => e.dia === dia)
                  .map((e) => {
                    const top = (e.inicio - start) * H;
                    const height = Math.max(22, (e.fim - e.inicio) * H - 3);
                    const sel = e.id === selectedId;
                    return (
                      <button
                        key={e.id}
                        onClick={() => onSelect?.(e)}
                        aria-pressed={sel}
                        aria-label={`${e.tipo === 'aula' ? 'Aula' : 'Sessão'} ${e.titulo} com ${nomes[e.pessoaId]}, ${DIAS[dia]} ${hora(e.inicio)}, ${PRESENCA_LABEL[e.presenca]}`}
                        className={cn(
                          'absolute inset-x-1 overflow-hidden px-1.5 py-1 text-left transition-[box-shadow,background-color]',
                          e.tipo === 'aula'
                            ? 'border-l-2 border-ds-accent bg-ds-surface-2 hover:bg-ds-surface-3'
                            : 'bg-ds-accent-soft ring-1 ring-inset ring-ds-accent/40 hover:ring-ds-accent',
                          e.presenca === 'reposicao' && 'border-dashed',
                          sel && 'ring-2 ring-inset ring-ds-fg',
                        )}
                        style={{ top: top + 1, height }}
                      >
                        <span className="flex items-start justify-between gap-1">
                          <span className="truncate text-[12px] font-medium leading-tight text-ds-fg">{nomes[e.pessoaId]}</span>
                          {e.presenca !== 'agendada' && <PresencaMark presenca={e.presenca} size="sm" />}
                        </span>
                        {height > 30 && (
                          <span className="block truncate font-ds-mono text-[10px] leading-tight text-ds-muted">
                            {hora(e.inicio)} · {e.titulo}
                          </span>
                        )}
                      </button>
                    );
                  })}
                {dia === hoje && agora !== undefined && (
                  <span className="pointer-events-none absolute inset-x-0 z-10 h-px bg-ds-danger" style={{ top: (agora - start) * H }}>
                    <span className="absolute -left-1 -top-1 size-2 rounded-full bg-ds-danger" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* lista por dia (< md) */}
      <ol className="space-y-5 md:hidden" data-divisao="studio">
        {DIAS.map((d, dia) => {
          const list = eventos.filter((e) => e.dia === dia).sort((a, b) => a.inicio - b.inicio);
          if (!list.length) return null;
          return (
            <li key={d}>
              <p className={cn('ds-annot mb-2 uppercase', dia === hoje && 'text-ds-accent')}>
                {d} {datas[dia]} {dia === hoje && '· hoje'}
              </p>
              <ul className="divide-y divide-ds-line border-y border-ds-line">
                {list.map((e) => (
                  <li key={e.id}>
                    <button onClick={() => onSelect?.(e)} className="flex w-full items-center gap-3 py-3 text-left">
                      <span className="w-12 shrink-0 font-ds-mono text-xs tabular-nums text-ds-muted">{hora(e.inicio)}</span>
                      <span className={cn('h-8 w-0.5 shrink-0', e.tipo === 'aula' ? 'bg-ds-accent' : 'bg-ds-accent/40')} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ds-fg">{nomes[e.pessoaId]}</span>
                        <span className="block truncate text-xs text-ds-muted">
                          {e.tipo === 'aula' ? 'Aula' : 'Sessão'} · {e.titulo}
                        </span>
                      </span>
                      <PresencaMark presenca={e.presenca} />
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </>
  );
}

const OPCOES: Presenca[] = ['realizada', 'falta', 'justificada', 'reposicao'];

/** Marcação de presença em um toque. */
export function AttendanceControl({ value, onChange, wide }: { value: Presenca; onChange: (p: Presenca) => void; wide?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Presença" className={cn('grid grid-cols-2 gap-1', wide && 'sm:grid-cols-4')} data-divisao="studio">
      {OPCOES.map((p) => {
        const on = value === p;
        return (
          <button
            key={p}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(on ? 'agendada' : p)}
            className={cn(
              'ds-press flex h-11 items-center gap-2 rounded-ds-xs border px-2.5 text-sm transition-colors',
              on ? 'border-ds-fg bg-ds-surface-2 text-ds-fg' : 'border-ds-line text-ds-muted hover:border-ds-line-strong hover:text-ds-fg',
            )}
          >
            <PresencaMark presenca={p} size="sm" />
            {PRESENCA_LABEL[p]}
          </button>
        );
      })}
    </div>
  );
}
