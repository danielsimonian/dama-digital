'use client';

import { useState } from 'react';
import { FilterChips } from '@/components/ds/interactive';
import { ReleaseCard } from '@/components/ds/cards';
import { studioReleases } from '@/lib/site-data';

const TODOS = 'Todos';
const anos = Array.from(new Set(studioReleases.map((r) => r.year)));

/** Catálogo completo de lançamentos, agrupado por ano, com filtro por ano. */
export function Catalogo() {
  const [ano, setAno] = useState(TODOS);
  const visiveis = ano === TODOS ? anos : anos.filter((a) => String(a) === ano);

  return (
    <div>
      <FilterChips label="Filtrar por ano" options={[TODOS, ...anos.map(String)]} onChange={(s) => setAno(s[0] ?? TODOS)} />
      <div className="mt-10 space-y-14">
        {visiveis.map((a) => {
          const lista = studioReleases.filter((r) => r.year === a);
          return (
            <section key={a} aria-labelledby={`ano-${a}`}>
              <h2 id={`ano-${a}`} className="mb-5 flex items-baseline gap-3 border-b border-ds-line pb-3">
                <span className="text-2xl font-medium tabular-nums tracking-tight text-ds-fg">{a}</span>
                <span className="ds-annot">
                  {String(lista.length).padStart(2, '0')} {lista.length === 1 ? 'lançamento' : 'lançamentos'}
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {lista.map((r) => (
                  <ReleaseCard key={`${r.artist}-${r.title}`} release={r} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
