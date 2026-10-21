'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Divisao } from '@/lib/supabase';
import { cn, ArrowLink, DIVISAO_LABEL } from '@/components/ds/primitives';
import { ProjectCard, ReleaseCard, TournamentCard } from '@/components/ds/cards';
import { Gallery } from '@/components/ds/media';
import { gallery, projects, releases, tournaments } from '@/lib/site-data';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const DIVISOES: { id: Divisao; resumo: string; destaque: string; href: string; link: string }[] = [
  {
    id: 'tech',
    resumo: 'Sites, sistemas e produtos digitais feitos sob medida, do primeiro rascunho ao ar.',
    destaque: 'Últimos projetos',
    href: '/tech',
    link: 'Conhecer a DAMA Tech',
  },
  {
    id: 'sports',
    resumo: 'Torneios de ponta a ponta: estrutura, transmissão ao vivo, foto e vídeo.',
    destaque: 'Último torneio',
    href: '/sports',
    link: 'Conhecer a DAMA Sports',
  },
  {
    id: 'studio',
    resumo: 'Produção musical, mixagem, master, distribuição e aulas de música.',
    destaque: 'Últimos lançamentos',
    href: '/studio',
    link: 'Conhecer a DAMA Studio',
  },
];

const spfc = tournaments.find((t) => t.href === '/sports/6o-open-spfc') ?? tournaments[0];
// uma faixa só (3 fotos fora a capa), todas em paisagem para caber numa linha
const fotos = gallery
  .filter((g) => g.src !== spfc.cover)
  .slice(0, 3)
  .map((g) => ({ ...g, portrait: false }));

function Destaque({ divisao }: { divisao: Divisao }) {
  if (divisao === 'tech') {
    return (
      <div className="border-b border-ds-line">
        {projects.slice(0, 3).map((p, i) => (
          <ProjectCard key={p.name} project={p} index={i} />
        ))}
      </div>
    );
  }
  if (divisao === 'sports') {
    return (
      <div className="space-y-4">
        <TournamentCard t={spfc} featured />
        <Gallery items={fotos} caption="6º Open SPFC · CT São Paulo FC · 29–31 MAI 2026" />
      </div>
    );
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {releases.slice(0, 3).map((r) => (
          <ReleaseCard key={r.title} release={r} />
        ))}
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-ds-line pt-4">
        {[
          ['15', 'artistas'],
          ['40+', 'lançamentos'],
          ['12+', 'anos de estúdio'],
        ].map(([v, l]) => (
          <div key={l}>
            <dt className="ds-annot uppercase">{l}</dt>
            <dd className="mt-1 text-2xl font-medium tabular-nums tracking-tight text-ds-accent">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** As três divisões: escolher uma (passar o mouse, tocar ou usar o teclado) troca o destaque ao lado. */
export function Divisoes() {
  const [ativa, setAtiva] = useState<Divisao>('sports');
  const info = DIVISOES.find((d) => d.id === ativa)!;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-12">
      <div role="tablist" aria-label="Divisões" aria-orientation="vertical" className="grid grid-cols-3 self-start border-t border-ds-line lg:sticky lg:top-24 lg:grid-cols-1">
        {DIVISOES.map((d, i) => {
          const on = d.id === ativa;
          return (
            <button
              key={d.id}
              id={`divisao-${d.id}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls="divisao-painel"
              tabIndex={on ? 0 : -1}
              data-divisao={d.id}
              onClick={() => setAtiva(d.id)}
              onMouseEnter={() => setAtiva(d.id)}
              onKeyDown={(e) => {
                const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
                if (!dir) return;
                e.preventDefault();
                const prox = DIVISOES[(i + dir + DIVISOES.length) % DIVISOES.length];
                setAtiva(prox.id);
                document.getElementById(`divisao-${prox.id}`)?.focus();
              }}
              className={cn(
                'group relative border-b border-ds-line py-4 text-left transition-colors lg:py-6',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-accent',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'absolute bottom-[-1px] left-0 h-px bg-ds-accent transition-[width] duration-300 ease-ds-out',
                  on ? 'w-full' : 'w-0',
                )}
              />
              <span className="flex items-center gap-3">
                <span className={cn('ds-annot tabular-nums transition-colors', on && 'text-ds-accent')}>{String(i + 1).padStart(2, '0')}</span>
                <span className={cn('size-1.5 rounded-full bg-ds-accent transition-opacity', on ? 'opacity-100' : 'opacity-0')} aria-hidden />
              </span>
              <span className={cn('mt-2 block text-base font-medium tracking-tight transition-colors sm:text-xl lg:text-2xl', on ? 'text-ds-fg' : 'text-ds-muted group-hover:text-ds-fg')}>
                <span className="hidden sm:inline">DAMA </span>
                {DIVISAO_LABEL[d.id].replace('DAMA ', '')}
              </span>
              <span className="mt-2 hidden max-w-[34ch] text-sm leading-relaxed text-ds-muted lg:block">{d.resumo}</span>
            </button>
          );
        })}
      </div>

      <div id="divisao-painel" role="tabpanel" aria-labelledby={`divisao-${ativa}`} data-divisao={ativa} className="min-w-0 lg:min-h-[40rem]">
        <p className="mb-4 text-sm leading-relaxed text-ds-muted lg:hidden">{info.resumo}</p>
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="ds-annot uppercase">
            <span className="text-ds-accent">●</span> {info.destaque}
          </p>
          <ArrowLink href={info.href}>{info.link}</ArrowLink>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={ativa}
            initial={{ opacity: 0, transform: 'translateY(8px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <Destaque divisao={ativa} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
