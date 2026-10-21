import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { SitePage, SiteSection, ContactSection } from '@/components/ds/page';
import { Reveal } from '@/components/ds/reveal';
import { ArrowLink, buttonClass, Eyebrow, Frame, SplitTitle, Stat } from '@/components/ds/primitives';
import { ReleaseCard } from '@/components/ds/cards';
import { LINE_ART } from '@/components/ds/line-art';
import { studioArtists, studioAulas, studioCaminhos, studioDistribuicao, studioIncludes, studioReleases } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'DAMA Studio — Produção musical, aulas e distribuição',
  description: 'Gravação, arranjo, mixagem, master e distribuição em 150+ plataformas. Aulas de violão, guitarra e produção musical.',
};

const ultimo = studioReleases[0];
const AULA_ART = ['aulas', 'musica', 'mixagem'] as const;

export default function DamaStudioPage() {
  return (
    <SitePage current="/studio" divisao="studio">
      {/* ── Hero: título + último lançamento ── */}
      <section className="border-b border-ds-line">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1.2fr_1fr] lg:px-8">
          <Reveal>
            <Eyebrow index="00">DAMA Studio · Santos</Eyebrow>
            <SplitTitle
              as="h1"
              top="Produção musical"
              bottom="do microfone à playlist"
              className="mt-6 lg:text-[clamp(2.75rem,1.5rem+2.4vw,4rem)]"
            />
            <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-ds-muted md:text-lg">
              Gravação, arranjo, mixagem, master e distribuição. {studioArtists.length} artistas e mais de 40 lançamentos em 12 anos de estúdio.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="#contato" className={buttonClass({ size: 'lg' })}>
                Falar sobre meu projeto
              </Link>
              <Link href="/studio/artistas" className={buttonClass({ variant: 'bracket' })}>
                Ver lançamentos
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <figure className="mx-auto max-w-sm lg:max-w-none">
              <p className="ds-annot mb-3 uppercase">
                <span className="text-ds-accent">●</span> Último lançamento
              </p>
              <a
                href={ultimo.spotify ?? '/studio/artistas'}
                target={ultimo.spotify ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="ds-corners relative aspect-square overflow-hidden bg-ds-surface-2 p-1 [--ds-corner-size:16px] [--ds-corner:var(--ds-accent)]">
                  {ultimo.cover && (
                    <div className="relative h-full w-full overflow-hidden">
                      <Image
                        src={ultimo.cover}
                        alt={`Capa de ${ultimo.title}`}
                        fill
                        priority
                        sizes="(min-width: 1024px) 40vw, 90vw"
                        className="object-cover transition-transform duration-500 ease-ds-out group-hover:scale-[1.02]"
                      />
                    </div>
                  )}
                </div>
                <figcaption className="mt-4 flex items-end justify-between gap-4">
                  <span className="min-w-0">
                    <span className="ds-annot block uppercase">
                      {ultimo.type} · {ultimo.year}
                    </span>
                    <span className="mt-1 block truncate text-2xl font-medium tracking-tight text-ds-fg">{ultimo.title}</span>
                    <span className="block text-sm text-ds-muted">{ultimo.artist}</span>
                  </span>
                  {ultimo.spotify && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm text-ds-muted transition-colors group-hover:text-ds-accent">
                      Ouvir no Spotify <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
                    </span>
                  )}
                </figcaption>
              </a>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── Produção ── */}
      <SiteSection id="producao" index="01" eyebrow="Carro-chefe" top="Produção fonográfica" bottom="cada etapa da sua música, dentro de casa">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid grid-cols-3 gap-6 self-start">
            <Stat value={String(studioArtists.length)} label="artistas" />
            <Stat value="40+" label="lançamentos" />
            <Stat value="12+" label="anos" />
          </div>
          <div>
            <p className="ds-annot mb-3 uppercase">O que está incluso</p>
            <ol className="divide-y divide-ds-line border-y border-ds-line">
              {studioIncludes.map((item, i) => (
                <li key={item} className="flex items-center gap-4 py-3">
                  <span className="ds-annot w-6 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1 text-sm text-ds-fg">{item}</span>
                  <Check className="size-4 text-ds-accent" strokeWidth={1.5} aria-hidden />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SiteSection>

      {/* ── Lançamentos ── */}
      <SiteSection
        index="02"
        eyebrow="Portfólio"
        top="Lançamentos recentes"
        bottom="quem já gravou aqui"
        aside={<ArrowLink href="/studio/artistas">Ver todos os {studioReleases.length}</ArrowLink>}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
          {studioReleases.slice(1, 5).map((r) => (
            <ReleaseCard key={`${r.artist}-${r.title}`} release={r} />
          ))}
        </div>
      </SiteSection>

      {/* ── Artistas ── */}
      <SiteSection index="03" eyebrow="Artistas" top={`${studioArtists.length} artistas`} bottom="do pop ao clássico">
        <ul className="grid border-t border-ds-line sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-8">
          {studioArtists.map((a, i) => (
            <li key={a.name} className="flex items-baseline gap-4 border-b border-ds-line py-3">
              <span className="ds-annot w-6 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-ds-fg">{a.name}</span>
              <span className="ds-annot shrink-0 text-right">{a.genre}</span>
            </li>
          ))}
        </ul>
      </SiteSection>

      {/* ── Aulas ── */}
      <SiteSection
        id="aulas"
        index="04"
        eyebrow="Ensino"
        top="Aprenda na fonte"
        bottom="aulas individuais com quem produz"
        aside={
          <Link href="#contato" className={buttonClass({ variant: 'secondary' })}>
            Agendar aula experimental
          </Link>
        }
      >
        <div className="grid gap-2 md:grid-cols-3">
          {studioAulas.map((a, i) => (
            <Frame key={a.name} interactive className="group flex flex-col p-6">
              <div className="flex items-start justify-between">
                <span className="ds-annot tabular-nums transition-colors group-hover:text-ds-accent">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-ds-subtle transition-colors group-hover:text-ds-accent">{LINE_ART[AULA_ART[i]]}</span>
              </div>
              <h3 className="mt-6 text-xl font-medium tracking-tight text-ds-fg">{a.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ds-muted">{a.desc}</p>
            </Frame>
          ))}
        </div>
        <p className="mt-6 max-w-[60ch] text-sm text-ds-muted">
          Do iniciante que nunca tocou ao músico que quer virar produtor. Horário fixo toda semana.
        </p>
      </SiteSection>

      {/* ── Distribuição ── */}
      <SiteSection index="05" eyebrow="Distribuição e registro" top="A parte burocrática do seu som" bottom="a gente resolve">
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-3">
          {studioDistribuicao.map((d) => (
            <Stat key={d.value} value={d.value} label={d.label} note={d.note} />
          ))}
        </div>
      </SiteSection>

      {/* ── Por onde começar ── */}
      <SiteSection index="06" eyebrow="Próximo passo" top="Por onde você começa?">
        <div className="grid gap-2 md:grid-cols-3">
          {studioCaminhos.map((c, i) => (
            <Link key={c.name} href="#contato" className="group">
              <Frame interactive className="flex h-full flex-col p-6">
                <span className="ds-annot tabular-nums transition-colors group-hover:text-ds-accent">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 text-2xl font-medium tracking-tight text-ds-fg">{c.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ds-muted">{c.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-ds-fg transition-colors group-hover:text-ds-accent">
                  {c.cta} <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
                </span>
              </Frame>
            </Link>
          ))}
        </div>
      </SiteSection>

      <ContactSection index="07" divisao="studio" top="Conte sobre a sua música" bottom="a gente responde em até 1 dia útil" />
    </SitePage>
  );
}
