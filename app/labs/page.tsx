import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SitePage, SiteSection } from '@/components/ds/page';
import { Reveal } from '@/components/ds/reveal';
import { Eyebrow, Frame, SplitTitle } from '@/components/ds/primitives';
import { techLabs } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'DAMA Labs — Experimentos em produção',
  description: 'Produtos internos da DAMA Tech: Poker Pay e Fidelidade Digital.',
};

export default function LabsPage() {
  return (
    <SitePage current="/labs" divisao="tech">
      <section className="border-b border-ds-line">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
          <Reveal>
            <Eyebrow index="00">DAMA Tech · Labs</Eyebrow>
            <SplitTitle as="h1" size="display" top="DAMA Labs" bottom="experimentos em produção" className="mt-6" />
            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-ds-muted md:text-lg">
              Ideias que a gente põe pra rodar — produtos internos que podem virar o próximo projeto da sua empresa.
            </p>
          </Reveal>
        </div>
      </section>

      <SiteSection index="01" eyebrow="Em produção" top="Abertos para usar" bottom="direto no navegador">
        <div className="grid gap-2 md:grid-cols-2">
          {techLabs.map((l, i) => (
            <Link key={l.href} href={l.href} className="group">
              <Frame interactive className="flex h-full flex-col p-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="ds-annot tabular-nums transition-colors group-hover:text-ds-accent">_{String(i + 1).padStart(2, '0')}</span>
                  <span className="ds-annot flex items-center gap-1.5 uppercase">
                    <span className="size-1.5 rounded-full bg-ds-accent" aria-hidden /> no ar
                  </span>
                </div>
                <h2 className="mt-8 text-3xl font-medium tracking-tight text-ds-fg">{l.name}</h2>
                <p className="ds-annot mt-2">{l.tag}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ds-muted">{l.desc}</p>
                <span className="mt-8 inline-flex items-center gap-1.5 text-sm text-ds-fg transition-colors group-hover:text-ds-accent">
                  Abrir {l.name} <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
                </span>
              </Frame>
            </Link>
          ))}
        </div>
      </SiteSection>

      <SiteSection index="02" eyebrow="Em construção" top="O que vem por aí" bottom="quando estiver pronto, aparece aqui">
        <div className="grid gap-2 md:grid-cols-2">
          {[3, 4].map((n) => (
            <div key={n} className="flex min-h-40 flex-col justify-between border border-dashed border-ds-line p-6">
              <span className="ds-annot tabular-nums">_{String(n).padStart(2, '0')}</span>
              <span className="ds-annot uppercase">[ em breve ]</span>
            </div>
          ))}
        </div>
      </SiteSection>
    </SitePage>
  );
}
