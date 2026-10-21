import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Calendar, MapPin, Play } from 'lucide-react';
import { getEventBySlug, sportsEvents, type SportsEvent } from '@/lib/sports-events';
import { tournaments } from '@/lib/site-data';
import { SitePage, SiteSection, ContactSection } from '@/components/ds/page';
import { Reveal } from '@/components/ds/reveal';
import { ArrowLink, Eyebrow, SplitTitle, Stat, StatusBadge } from '@/components/ds/primitives';
import { EmptyState, PartnerStrip, TournamentCard } from '@/components/ds/cards';
import { Gallery } from '@/components/ds/media';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: 'Torneio não encontrado' };
  return {
    title: `${event.name} ${event.year} — DAMA Sports`,
    description: event.description,
  };
}

export function generateStaticParams() {
  return sportsEvents.map((e) => ({ slug: e.slug }));
}

function isLocalVideo(url: string): boolean {
  return url.startsWith('/') && /\.(mp4|webm|mov)$/i.test(url);
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function Reel({ reel }: { reel: SportsEvent['reels'][number] }) {
  const yt = getYouTubeEmbedUrl(reel.url);
  if (isLocalVideo(reel.url) || yt) {
    return (
      <figure>
        <div className="ds-corners relative aspect-[9/16] overflow-hidden bg-ds-surface-2 p-1 [--ds-corner-size:16px] [--ds-corner:var(--ds-accent)]">
          {yt ? (
            <iframe
              src={yt}
              title={reel.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <video src={reel.url} autoPlay muted loop playsInline controls preload="metadata" className="h-full w-full bg-black object-cover" />
          )}
        </div>
        {reel.title && <figcaption className="ds-annot mt-2 uppercase">reel · {reel.title}</figcaption>}
      </figure>
    );
  }
  return (
    <a
      href={reel.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-14 items-center gap-3 border border-ds-line px-4 text-sm text-ds-fg transition-colors hover:border-ds-accent"
    >
      <Play className="size-4 text-ds-accent" strokeWidth={1.5} aria-hidden />
      {reel.title || 'Ver vídeo'}
    </a>
  );
}

export default async function TorneioPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const card = tournaments.find((t) => t.href === `/sports/${event.slug}`);
  const outros = tournaments.filter((t) => t.href !== `/sports/${event.slug}`);
  const fotos = event.gallery.map((g, i) => ({ src: g.src, portrait: g.portrait, alt: `${event.name} · foto ${i + 1}` }));
  const temMidia = event.reels.length > 0 || fotos.length > 0;
  // numeração das seções conforme o que existe
  const n = (i: number) => String(i).padStart(2, '0');
  const iOutros = event.sponsors.length ? 3 : 2;
  const iContato = outros.length ? iOutros + 1 : iOutros;

  return (
    <SitePage current="/sports" divisao="sports">
      {/* ── Hero ── */}
      <section className="border-b border-ds-line">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
          <Link href="/sports" className="ds-annot inline-flex min-h-11 items-center gap-2 uppercase hover:text-ds-fg">
            <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden /> DAMA Sports
          </Link>
          <Reveal className="mt-6 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                {card && <StatusBadge status={card.status} />}
                <Eyebrow>{event.subtitle} · {event.year}</Eyebrow>
              </div>
              <div className="mt-6 flex items-start gap-5">
                {event.logo && (
                  <span className="relative mt-1 size-16 shrink-0 overflow-hidden rounded-full border border-ds-line bg-[oklch(100%_0_0)] md:size-20">
                    <Image src={event.logo} alt={`Logo ${event.name}`} fill sizes="80px" className="scale-[1.25] object-contain" />
                  </span>
                )}
                <SplitTitle as="h1" size="display" top={event.name} bottom={event.location.split(' · ')[0]} />
              </div>
              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ds-muted">
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Data</dt>
                  <Calendar className="size-4 text-ds-accent" strokeWidth={1.5} aria-hidden />
                  <dd>{event.date}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Local</dt>
                  <MapPin className="size-4 text-ds-accent" strokeWidth={1.5} aria-hidden />
                  <dd>{event.location}</dd>
                </div>
              </dl>
            </div>
            <div>
              <p className="max-w-[52ch] text-base leading-relaxed text-ds-muted md:text-lg">{event.description}</p>
              {event.link && (
                <a href={event.link.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm text-ds-fg hover:text-ds-accent">
                  {event.link.label} <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
                </a>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.08} className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {event.stats.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Fotos e reels ── */}
      <SiteSection index="01" eyebrow="Cobertura" top="Fotos e reels" bottom="direto das quadras">
        {temMidia ? (
          <div className={event.reels.length ? 'grid gap-6 md:grid-cols-[minmax(0,18rem)_1fr]' : undefined}>
            {event.reels.length > 0 && (
              <div className="space-y-4">
                {event.reels.map((r) => (
                  <Reel key={r.url} reel={r} />
                ))}
              </div>
            )}
            {fotos.length > 0 && <Gallery items={fotos} caption={`${event.name} · ${event.date}`} />}
          </div>
        ) : (
          <EmptyState art="fotografia" title="Material do evento em breve" desc="Fotos, vídeos e reels deste torneio entram aqui assim que a edição terminar." />
        )}
      </SiteSection>

      {/* ── Patrocinadores ── */}
      {event.sponsors.length > 0 && (
        <SiteSection index="02" eyebrow="Parceiros" top="Quem fez acontecer" bottom="patrocinadores e apoiadores">
          <PartnerStrip partners={event.sponsors.map((s) => ({ name: s.name, logo: s.logo }))} variant="grid" />
        </SiteSection>
      )}

      {/* ── Outros torneios ── */}
      {outros.length > 0 && (
        <SiteSection
          index={n(iOutros)}
          eyebrow="Outros torneios"
          top="Mais da DAMA Sports"
          aside={<ArrowLink href="/sports">Todos os torneios</ArrowLink>}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {outros.slice(0, 2).map((t) => (
              <TournamentCard key={t.href} t={t} />
            ))}
          </div>
        </SiteSection>
      )}

      <ContactSection index={n(iContato)} divisao="sports" top="Quer um torneio assim?" bottom="manda a ideia, a gente cuida do resto" />
    </SitePage>
  );
}
