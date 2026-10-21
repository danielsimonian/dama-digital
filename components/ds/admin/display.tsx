import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Check, X, RotateCcw, Minus } from 'lucide-react';
import { cn } from '../primitives';
import type { Papel, Presenca, LancamentoStatus, OrcamentoStatus, PacoteHoras, Plano } from './types';

export function brl(v: number, cents = false) {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
}

/* ------------------------------------------------------------------ */
/* Papéis e status                                                     */
/* ------------------------------------------------------------------ */

const PAPEL: Record<Papel, { label: string; divisao: 'tech' | 'sports' | 'studio' }> = {
  aluno: { label: 'Aluno', divisao: 'studio' },
  estudio: { label: 'Estúdio', divisao: 'studio' },
  tech: { label: 'Tech', divisao: 'tech' },
  sports: { label: 'Sports', divisao: 'sports' },
};

export function PapelBadge({ papel }: { papel: Papel }) {
  const p = PAPEL[papel];
  return (
    <span
      data-divisao={p.divisao}
      className="inline-flex h-5 items-center gap-1 rounded-ds-xs border border-ds-line px-1.5 font-ds-mono text-[10px] uppercase tracking-wider text-ds-muted"
    >
      <span className="size-1.5 rounded-full bg-ds-accent" aria-hidden />
      {p.label}
    </span>
  );
}

const LANC: Record<LancamentoStatus, { label: string; dot: string; text: string }> = {
  pago: { label: 'Pago', dot: 'bg-ds-success', text: 'text-ds-success' },
  pendente: { label: 'Pendente', dot: 'border border-ds-warning', text: 'text-ds-warning' },
  atrasado: { label: 'Atrasado', dot: 'bg-ds-danger', text: 'text-ds-danger' },
  previsto: { label: 'Previsto', dot: 'border border-dashed border-ds-subtle', text: 'text-ds-subtle' },
};

export function LancamentoStatusLabel({ status }: { status: LancamentoStatus }) {
  const s = LANC[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-ds-mono text-[11px] uppercase tracking-wider', s.text)}>
      <span className={cn('size-2 rounded-full', s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}

const ORC: Record<OrcamentoStatus, { label: string; step: number }> = {
  rascunho: { label: 'Rascunho', step: 0 },
  enviado: { label: 'Enviado', step: 1 },
  visualizado: { label: 'Visualizado', step: 2 },
  aprovado: { label: 'Aprovado', step: 3 },
  recusado: { label: 'Recusado', step: 3 },
};

/** Trilha do orçamento: rascunho → enviado → visualizado → aprovado. */
export function QuoteTrack({ status, compact }: { status: OrcamentoStatus; compact?: boolean }) {
  const step = ORC[status].step;
  const steps = ['Rascunho', 'Enviado', 'Visualizado', status === 'recusado' ? 'Recusado' : 'Aprovado'];
  if (compact) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="flex gap-0.5" aria-hidden>
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 w-3',
                i <= step ? (status === 'recusado' && i === 3 ? 'bg-ds-danger' : status === 'aprovado' ? 'bg-ds-success' : 'bg-ds-fg') : 'bg-ds-line',
              )}
            />
          ))}
        </span>
        <span className="font-ds-mono text-[11px] uppercase tracking-wider text-ds-muted">{ORC[status].label}</span>
      </span>
    );
  }
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label={`Status: ${ORC[status].label}`}>
      {steps.map((s, i) => (
        <li key={s} className="min-w-0">
          <span className={cn('block h-px', i <= step ? 'bg-ds-accent' : 'bg-ds-line')} />
          <span className={cn('ds-annot mt-1.5 block truncate', i === step && 'text-ds-fg')} title={s}>
            {s}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* KPI                                                                 */
/* ------------------------------------------------------------------ */

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 28 - ((v - min) / (max - min || 1)) * 24;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = pts[pts.length - 1].split(',');
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={cn('h-8 w-24 overflow-visible', className)} aria-hidden>
      <polyline points={pts.join(' ')} fill="none" className="stroke-ds-muted" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r={2.5} className="fill-ds-accent" />
    </svg>
  );
}

export function KpiTile({
  label,
  value,
  delta,
  note,
  spark,
  tone,
}: {
  label: string;
  value: string;
  delta?: { value: string; up: boolean; good: boolean };
  note?: string;
  spark?: number[];
  tone?: 'danger';
}) {
  return (
    <div className="ds-corners relative flex min-w-0 flex-col justify-between gap-4 bg-ds-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="ds-annot uppercase">{label}</p>
        {tone === 'danger' && <span className="size-2 rounded-full bg-ds-danger" aria-label="atenção" />}
        {spark && <Sparkline values={spark} className="-mt-1 h-6 w-16 shrink-0" />}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className={cn('truncate text-2xl font-medium tabular-nums tracking-tight', tone === 'danger' ? 'text-ds-danger' : 'text-ds-fg')}>
            {value}
          </p>
          {(delta || note) && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ds-subtle">
              {delta && (
                <span className={cn('inline-flex items-center gap-0.5 font-ds-mono tabular-nums', delta.good ? 'text-ds-success' : 'text-ds-danger')}>
                  {delta.up ? <ArrowUpRight className="size-3" strokeWidth={1.5} /> : <ArrowDownRight className="size-3" strokeWidth={1.5} />}
                  {delta.value}
                </span>
              )}
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pacote de horas e plano                                             */
/* ------------------------------------------------------------------ */

export function HoursMeter({ pacote, compact }: { pacote: PacoteHoras; compact?: boolean }) {
  const restantes = pacote.total - pacote.usadas;
  const pct = pacote.usadas / pacote.total;
  const low = restantes <= 2;
  const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  return (
    <div data-divisao="studio" className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-ds-fg">
          <span className="font-ds-mono tabular-nums">{fmt(pacote.usadas)}</span>
          <span className="text-ds-subtle"> de {fmt(pacote.total)} h</span>
        </p>
        <p className={cn('ds-annot', low && 'text-ds-warning')}>
          {low ? 'renovar · ' : ''}
          {fmt(restantes)} h restantes
        </p>
      </div>
      <div className="mt-2 flex h-2 gap-[2px]" role="meter" aria-valuemin={0} aria-valuemax={pacote.total} aria-valuenow={pacote.usadas} aria-label="Horas usadas do pacote">
        {Array.from({ length: pacote.total }, (_, i) => {
          const fill = Math.min(1, Math.max(0, pacote.usadas - i));
          return (
            <span key={i} className="relative flex-1 overflow-hidden bg-ds-surface-3">
              <span className="absolute inset-y-0 left-0 bg-ds-accent" style={{ width: `${fill * 100}%` }} />
            </span>
          );
        })}
      </div>
      {!compact && (
        <p className="ds-annot mt-2">
          {brl(pacote.valor)} · válido até {pacote.validade} · {Math.round(pct * 100)}% usado
        </p>
      )}
    </div>
  );
}

export function PlanSummary({ plano }: { plano: Plano }) {
  return (
    <dl className="grid grid-cols-3 gap-px border border-ds-line bg-ds-line text-sm">
      {[
        ['Plano', plano.nome],
        ['Valor', `${brl(plano.valor)}/mês`],
        ['Vence', `dia ${plano.vencimento}`],
      ].map(([k, v]) => (
        <div key={k} className="min-w-0 bg-ds-bg p-3">
          <dt className="ds-annot uppercase">{k}</dt>
          <dd className="mt-1 text-ds-fg">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/* Frequência (presença por aula — forma + cor, nunca só cor)          */
/* ------------------------------------------------------------------ */

const PRES: Record<Presenca, { label: string; className: string; icon?: ReactNode }> = {
  realizada: { label: 'Realizada', className: 'bg-ds-accent text-ds-accent-fg border-ds-accent', icon: <Check className="size-3" strokeWidth={2} /> },
  falta: { label: 'Falta', className: 'border-ds-danger text-ds-danger', icon: <X className="size-3" strokeWidth={2} /> },
  justificada: { label: 'Justificada', className: 'border-ds-warning text-ds-warning', icon: <Minus className="size-3" strokeWidth={2} /> },
  reposicao: { label: 'Reposição', className: 'border-ds-info text-ds-info border-dashed', icon: <RotateCcw className="size-3" strokeWidth={2} /> },
  agendada: { label: 'Agendada', className: 'border-ds-line-strong text-ds-subtle border-dashed' },
};

export const PRESENCA_LABEL: Record<Presenca, string> = Object.fromEntries(
  Object.entries(PRES).map(([k, v]) => [k, v.label]),
) as Record<Presenca, string>;

export function PresencaMark({ presenca, size = 'md' }: { presenca: Presenca; size?: 'sm' | 'md' }) {
  const p = PRES[presenca];
  return (
    <span
      title={p.label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center border',
        size === 'md' ? 'size-6' : 'size-4 [&_svg]:size-2.5',
        p.className,
      )}
    >
      {p.icon}
      <span className="sr-only">{p.label}</span>
    </span>
  );
}

export function AttendanceStrip({ items, meta, legend }: { items: Presenca[]; meta: number; legend?: boolean }) {
  const feitas = items.filter((p) => p === 'realizada').length;
  return (
    <div data-divisao="studio">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {items.map((p, i) => (
            <PresencaMark key={i} presenca={p} />
          ))}
        </div>
        <p className="ds-annot shrink-0 tabular-nums">
          <span className="text-ds-fg">{feitas}</span>/{meta} no mês
        </p>
      </div>
      {legend && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {(Object.keys(PRES) as Presenca[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5 text-xs text-ds-muted">
              <PresencaMark presenca={k} size="sm" />
              {PRES[k].label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Linha do tempo                                                      */
/* ------------------------------------------------------------------ */

export type TimelineItem = { when: string; title: string; desc?: string; icon: ReactNode; tone?: 'success' | 'danger' | 'accent' };

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative">
      <span className="absolute bottom-3 left-[13px] top-3 w-px bg-ds-line" aria-hidden />
      {items.map((it, i) => (
        <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
          <span
            className={cn(
              'relative z-10 inline-flex size-7 shrink-0 items-center justify-center rounded-full border bg-ds-bg [&_svg]:size-3.5',
              it.tone === 'success' && 'border-ds-success text-ds-success',
              it.tone === 'danger' && 'border-ds-danger text-ds-danger',
              it.tone === 'accent' && 'border-ds-accent text-ds-accent',
              !it.tone && 'border-ds-line-strong text-ds-muted',
            )}
          >
            {it.icon}
          </span>
          <div className="min-w-0 pt-1">
            <p className="text-sm text-ds-fg">{it.title}</p>
            {it.desc && <p className="mt-0.5 text-xs text-ds-muted">{it.desc}</p>}
            <p className="ds-annot mt-1">{it.when}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
