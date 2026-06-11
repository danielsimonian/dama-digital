import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, ExternalLink, Play } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getEventBySlug, sportsEvents, type SportsEvent } from '@/lib/sports-events';

const SPORTS  = 'var(--color-sports)';
const BG_DARK = 'oklch(10% 0.008 50)';

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
  return sportsEvents.map(e => ({ slug: e.slug }));
}

// ── Embed helper ─────────────────────────────────────────────
function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const igMatch = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  if (igMatch) return `https://www.instagram.com/p/${igMatch[1]}/embed`;
  return null;
}

// ── Stat ─────────────────────────────────────────────────────
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="font-display font-black leading-none"
        style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: SPORTS }}
      >
        {value}
      </span>
      <span className="font-ui text-xs tracking-widest uppercase" style={{ color: 'oklch(55% 0.02 48)' }}>
        {label}
      </span>
    </div>
  );
}

// ── Gallery ──────────────────────────────────────────────────
function Gallery({ images, eventName }: { images: string[]; eventName: string }) {
  if (images.length === 0) return null;
  return (
    <section>
      <h2 className="font-display font-black text-2xl md:text-3xl mb-6" style={{ color: 'oklch(97% 0.009 52)' }}>
        Galeria
      </h2>
      <div
        className={`grid gap-2 ${
          images.length === 1
            ? 'grid-cols-1 max-w-2xl'
            : images.length === 2
            ? 'grid-cols-2'
            : 'grid-cols-2 md:grid-cols-3'
        }`}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="relative aspect-square overflow-hidden rounded-xl"
            style={{ backgroundColor: 'oklch(15% 0.01 50)' }}
          >
            <Image
              src={src}
              alt={`${eventName} — foto ${i + 1}`}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Reels ────────────────────────────────────────────────────
function Reels({ reels }: { reels: SportsEvent['reels'] }) {
  if (reels.length === 0) return null;
  return (
    <section>
      <h2 className="font-display font-black text-2xl md:text-3xl mb-6" style={{ color: 'oklch(97% 0.009 52)' }}>
        Highlights & Reels
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reels.map((reel, i) => {
          const embedUrl = getEmbedUrl(reel.url);
          return (
            <div key={i} className="w-full max-w-xs mx-auto sm:max-w-none">
              {embedUrl ? (
                <div>
                  <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: '177.78%' }}>
                    <iframe
                      src={embedUrl}
                      title={reel.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  {reel.title && (
                    <p className="font-ui text-sm mt-3" style={{ color: 'oklch(55% 0.02 48)' }}>
                      {reel.title}
                    </p>
                  )}
                </div>
              ) : (
                <a
                  href={reel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 rounded-2xl transition-opacity duration-200 hover:opacity-80"
                  style={{ backgroundColor: 'oklch(15% 0.01 50)' }}
                >
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `color-mix(in oklch, ${SPORTS} 15%, transparent)` }}
                  >
                    <Play size={18} style={{ color: SPORTS }} />
                  </div>
                  <span className="font-ui text-sm font-medium flex-1" style={{ color: 'oklch(88% 0.01 50)' }}>
                    {reel.title || 'Ver vídeo'}
                  </span>
                  <ExternalLink size={14} className="flex-shrink-0" style={{ color: 'oklch(45% 0.02 48)' }} />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Sponsors ─────────────────────────────────────────────────
function Sponsors({ sponsors }: { sponsors: SportsEvent['sponsors'] }) {
  if (sponsors.length === 0) return null;
  return (
    <section>
      <h2 className="font-display font-black text-2xl md:text-3xl mb-6" style={{ color: 'oklch(97% 0.009 52)' }}>
        Parceiros & patrocinadores
      </h2>
      <div className="flex flex-wrap gap-6">
        {sponsors.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl"
            style={{ backgroundColor: 'oklch(15% 0.01 50)' }}
          >
            <div className="relative w-16 h-16 overflow-hidden rounded-full bg-white">
              <Image src={s.logo} alt={s.name} fill className="object-contain p-1.5" />
            </div>
            <span className="font-ui text-xs font-medium" style={{ color: 'oklch(55% 0.02 48)' }}>
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default async function TorneioPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const hasMedia = event.gallery.length > 0 || event.reels.length > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG_DARK }}>
      <Header logoSrc="/images/dama-sports-logo.png" logoAlt="DAMA Sports" />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Banner de fundo */}
        {event.banner && (
          <>
            <div className="absolute inset-0">
              <Image src={event.banner} alt={event.name} fill className="object-cover" priority />
            </div>
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to bottom, ${BG_DARK}d0 0%, ${BG_DARK}f0 50%, ${BG_DARK} 100%)` }}
            />
          </>
        )}

        <div className="relative max-w-5xl mx-auto px-6 md:px-10">
          <Link
            href="/sports"
            className="inline-flex items-center gap-2 font-ui text-sm mb-10 transition-opacity duration-200 hover:opacity-60"
            style={{ color: SPORTS }}
          >
            <ArrowLeft size={15} />
            DAMA Sports
          </Link>

          {/* Tag REALIZADO */}
          <div className="mb-5">
            <span
              className="inline-block font-ui text-xs font-bold tracking-widest px-3 py-1 rounded-full"
              style={{ backgroundColor: `color-mix(in oklch, ${SPORTS} 15%, transparent)`, color: SPORTS }}
            >
              {event.tag}
            </span>
          </div>

          {/* Nome */}
          <div className="flex items-start gap-5 mb-6">
            {event.logo && (
              <div className="relative w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-full bg-white flex-shrink-0 mt-1">
                <Image src={event.logo} alt={`Logo ${event.name}`} fill className="object-contain p-1" />
              </div>
            )}
            <div>
              <h1
                className="font-display font-black leading-none tracking-tight"
                style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', color: 'oklch(97% 0.009 52)' }}
              >
                {event.name}
              </h1>
              <p className="font-display text-lg md:text-xl mt-1" style={{ color: SPORTS }}>
                {event.subtitle} · {event.year}
              </p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-5">
            <span className="flex items-center gap-2 font-ui text-sm" style={{ color: 'oklch(65% 0.02 48)' }}>
              <Calendar size={14} style={{ color: SPORTS }} />
              {event.date}
            </span>
            <span className="flex items-center gap-2 font-ui text-sm" style={{ color: 'oklch(65% 0.02 48)' }}>
              <MapPin size={14} style={{ color: SPORTS }} />
              {event.location}
            </span>
          </div>
        </div>
      </section>

      {/* ── Conteúdo ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 pb-28 flex flex-col gap-20">

        {/* Descrição + stats */}
        <section className="grid md:grid-cols-[1fr_auto] gap-12 items-start">
          <div className="flex flex-col gap-6">
            <p className="font-body text-lg leading-relaxed" style={{ color: 'oklch(72% 0.015 48)' }}>
              {event.description}
            </p>
            {event.link && (
              <a
                href={event.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-ui text-sm font-medium transition-opacity duration-200 hover:opacity-70"
                style={{ color: SPORTS }}
              >
                {event.link.label}
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          <div
            className="grid gap-px flex-shrink-0"
            style={{
              gridTemplateColumns: `repeat(${Math.min(event.stats.length, 2)}, 1fr)`,
              backgroundColor: 'oklch(20% 0.01 50)',
              minWidth: '240px',
            }}
          >
            {event.stats.map((s, i) => (
              <div key={i} className="px-6 py-5" style={{ backgroundColor: 'oklch(13% 0.01 50)' }}>
                <Stat label={s.label} value={s.value} />
              </div>
            ))}
          </div>
        </section>

        {/* Placeholder quando sem media */}
        {!hasMedia && (
          <div
            className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-20 text-center"
            style={{ borderColor: 'oklch(22% 0.012 50)' }}
          >
            <p className="font-display font-bold text-xl mb-2" style={{ color: 'oklch(40% 0.02 48)' }}>
              Material do evento em breve
            </p>
            <p className="font-ui text-sm" style={{ color: 'oklch(35% 0.015 48)' }}>
              Fotos, vídeos e reels serão adicionados aqui.
            </p>
          </div>
        )}

        {/* Gallery */}
        <Gallery images={event.gallery} eventName={event.name} />

        {/* Reels */}
        <Reels reels={event.reels} />

        {/* Sponsors */}
        <Sponsors sponsors={event.sponsors} />

        {/* Voltar */}
        <div className="pt-6 border-t" style={{ borderColor: 'oklch(18% 0.01 50)' }}>
          <Link
            href="/sports"
            className="inline-flex items-center gap-2 font-ui text-sm font-medium transition-opacity duration-200 hover:opacity-70"
            style={{ color: SPORTS }}
          >
            <ArrowLeft size={15} />
            Todos os torneios
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
