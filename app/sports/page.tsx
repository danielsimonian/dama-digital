import Link from 'next/link';
import { ChevronRight, ClipboardList, Flag, Volume2, Clapperboard, Trophy, Building2 } from 'lucide-react';
import { SitePage, SiteSection, ContactSection } from '@/components/ds/page';
import { Reveal } from '@/components/ds/reveal';
import { buttonClass, Eyebrow, Frame, SplitTitle } from '@/components/ds/primitives';
import { PartnerStrip, TournamentCard } from '@/components/ds/cards';
import { historico } from '@/lib/sports-events';
import { sportsPartners, sportsServices, tournaments } from '@/lib/site-data';

const ICONES = [ClipboardList, Flag, Volume2, Clapperboard, Trophy, Building2];

const proximos = tournaments.filter((t) => t.status !== 'realizado');
const realizados = tournaments.filter((t) => t.status === 'realizado');
// o mais próximo (ou o último realizado) em destaque; o resto em grade
const [destaque, ...demais] = [...proximos, ...realizados];

export default function DamaSportsPage() {
  return (
    <SitePage current="/sports" divisao="sports">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-ds-line">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          <Reveal>
            <Eyebrow index="00">DAMA Sports · Beach Tennis</Eyebrow>
            <SplitTitle
              as="h1"
              top="Torneios de ponta a ponta"
              bottom="do chaveamento à premiação"
              className="mt-6 lg:text-[clamp(2.75rem,1.5rem+2.4vw,4rem)]"
            />
            <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-ds-muted md:text-lg">
              Estrutura, arbitragem, som, transmissão e cobertura. O último foi o 6º Open SPFC: 400+ atletas no CT do São Paulo FC.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="#contato" className={buttonClass({ size: 'lg' })}>
                Realizar um torneio
              </Link>
              <Link href="#torneios" className={buttonClass({ variant: 'bracket' })}>
                Ver os torneios
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <figure>
              <div className="ds-corners relative aspect-video overflow-hidden bg-ds-surface-2 p-1 [--ds-corner-size:16px] [--ds-corner:var(--ds-accent)]">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Bastidores dos torneios DAMA Sports"
                  className="h-full w-full object-cover"
                  src="/videos/sports-hero.mp4"
                />
              </div>
              <figcaption className="ds-annot mt-3 flex justify-between gap-4">
                <span>REEL · DAMA SPORTS</span>
                <span>SPFC · PAN-AMERICANO · ASSESP</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── Torneios ── */}
      <SiteSection id="torneios" index="01" eyebrow="Torneios" top={proximos.length ? 'Próximos e realizados' : 'Torneios realizados'} bottom="cada um com página, fotos e números">
        <div className="space-y-4">
          {destaque && <TournamentCard t={destaque} featured />}
          <div className="grid gap-4 md:grid-cols-2">
            {demais.map((t) => (
              <TournamentCard key={t.href} t={t} />
            ))}
          </div>
        </div>

        <details className="group mt-8 border-y border-ds-line">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 text-sm text-ds-fg [&::-webkit-details-marker]:hidden">
            <ChevronRight className="size-4 text-ds-subtle transition-transform duration-200 group-open:rotate-90" strokeWidth={1.5} aria-hidden />
            Histórico de torneios
            <span className="ds-annot ml-auto">{historico.length} edições · 2023–2025</span>
          </summary>
          <ul className="divide-y divide-ds-line border-t border-ds-line">
            {historico.map((h) => (
              <li key={h.name} className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3">
                <span>
                  <span className="block text-sm text-ds-fg">{h.name}</span>
                  <span className="ds-annot">{h.location}</span>
                </span>
                <span className="text-right">
                  <span className="ds-annot block">{h.date}</span>
                  <span className="ds-annot text-ds-accent">{h.categorias} categorias</span>
                </span>
              </li>
            ))}
          </ul>
        </details>
      </SiteSection>

      {/* ── Serviços ── */}
      <SiteSection index="02" eyebrow="O que a gente entrega" top="Tudo que um torneio precisa" bottom="para acontecer e ser lembrado">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sportsServices.map((s, i) => {
            const Icone = ICONES[i];
            return (
              <Frame key={s.name} interactive className="group flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="ds-annot tabular-nums transition-colors group-hover:text-ds-accent">{String(i + 1).padStart(2, '0')}</span>
                  <Icone className="size-5 text-ds-subtle transition-colors group-hover:text-ds-accent" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="mt-8 text-lg font-medium tracking-tight text-ds-fg">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ds-muted">{s.desc}</p>
              </Frame>
            );
          })}
        </div>
      </SiteSection>

      {/* ── Parceiros ── */}
      <SiteSection index="03" eyebrow="Parceiros" top="Eventos e marcas" bottom="que passaram pela nossa produção">
        <PartnerStrip partners={sportsPartners} variant="grid" />
      </SiteSection>

      <ContactSection index="04" divisao="sports" top="Quer realizar o próximo torneio?" bottom="manda a ideia, a gente cuida do resto" />
    </SitePage>
  );
}
