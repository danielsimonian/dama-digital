import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, ExternalLink, Play, Users, Building2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getEventBySlug, sportsEvents, type SportsEvent } from '@/lib/sports-events';

const SPORTS  = 'var(--color-sports)';
const BG_DARK = 'oklch(10% 0.008 50)';

// ── Metadata ──────────────────────────────────────────────────
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

// ── Embed helper ──────────────────────────────────────────────
function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Instagram Reels
  const igMatch = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  if (igMatch) return `https://www.instagram.com/p/${igMatch[1]}/embed`;
  return null;
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center p-6 rounded-2xl"
      style={{ backgroundColor: 'oklch(14% 0.01 50)' }}
    >
      <span
        className="font-display font-black text-4xl leading-none tracking-tight"
        style={{ color: SPORTS }}
      >
        {value}
      </span>
      <span className="font-ui text-sm mt-1" style={{ color: 'oklch(65% 0.02 48)' }}>
        {label}
      </span>
    </div>
  );
}

// ── Gallery grid ──────────────────────────────────────────────
function Gallery({ images, eventName }: { images: string[]; eventName: string }) {
  if (images.length === 0) return null;

  return (
    <section>
      <h2
        className="font-display font-black text-3xl md:text-4xl mb-8"
        style={{ color: 'oklch(97% 0.009 52)' }}
      >
        Galeria de fotos
      </h2>
      <div
        className={`grid gap-2 ${
          images.length === 1
            ? 'grid-cols-1'
            : images.length === 2
            ? 'grid-cols-2'
            : images.length <= 4
            ? 'grid-cols-2 md:grid-cols-4'
            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="relative aspect-square overflow-hidden rounded-xl"
            style={{ backgroundColor: 'oklch(14% 0.01 50)' }}
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

// ── Reels section ─────────────────────────────────────────────
function Reels({ reels }: { reels: SportsEvent['reels'] }) {
  if (reels.length === 0) return null;

  return (
    <section>
      <h2
        className="font-display font-black text-3xl md:text-4xl mb-8"
        style={{ color: 'oklch(97% 0.009 52)' }}
      >
        Highlights
      </h2>
      <div className={`grid gap-6 ${reels.length === 1 ? 'grid-cols-1 max-w-3xl' : 'grid-cols-1 md:grid-cols-2'}`}>
        {reels.map((reel, i) => {
          const embedUrl = getEmbedUrl(reel.url);
          return (
            <div key={i}>
              {embedUrl ? (
                <div>
                  <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={embedUrl}
                      title={reel.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  {reel.title && (
                    <p className="font-ui text-sm mt-3" style={{ color: 'oklch(65% 0.02 48)' }}>
                      {reel.title}
                    </p>
                  )}
                </div>
              ) : (
                <a
                  href={reel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 rounded-2xl transition-colors duration-200 hover:opacity-80"
                  style={{ backgroundColor: 'oklch(14% 0.01 50)' }}
                >
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `${SPORTS}22` }}
                  >
                    <Play size={20} style={{ color: SPORTS }} />
                  </div>
                  <span className="font-ui text-sm font-medium" style={{ color: 'oklch(90% 0.01 50)' }}>
                    {reel.title || 'Ver vídeo'}
                  </span>
                  <ExternalLink size={14} className="ml-auto flex-shrink-0" style={{ color: 'oklch(55% 0.02 48)' }} />
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
      <h2
        className="font-display font-black text-3xl md:text-4xl mb-8"
        style={{ color: 'oklch(97% 0.009 52)' }}
      >
        Patrocinadores & parceiros
      </h2>
      <div className="flex flex-wrap gap-6">
        {sponsors.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl"
            style={{ backgroundColor: 'oklch(14% 0.01 50)' }}
          >
            <div className="relative w-16 h-16 overflow-hidden rounded-full bg-white flex items-center justify-center">
              <Image
                src={s.logo}
                alt={s.name}
                fill
                className="object-contain p-1"
              />
            </div>
            <span className="font-ui text-xs font-medium" style={{ color: 'oklch(65% 0.02 48)' }}>
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default async function TorneioPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const hasMedia = event.gallery.length > 0 || event.reels.length > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG_DARK }}>
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {event.banner && (
          <>
            <div className="absolute inset-0">
              <Image
                src={event.banner}
                alt={event.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, ${BG_DARK}cc 0%, ${BG_DARK}ee 60%, ${BG_DARK} 100%)`,
              }}
            />
          </>
        )}

        <div className="relative max-w-6xl mx-auto px-6 md:px-10">
          {/* Back link */}
          <Link
            href="/sports"
            className="inline-flex items-center gap-2 font-ui text-sm mb-10 transition-colors duration-200 hover:opacity-70"
            style={{ color: SPORTS }}
          >
            <ArrowLeft size={16} />
            DAMA Sports
          </Link>

          {/* Tag */}
          <div className="mb-4">
            <span
              className="inline-block font-ui text-xs font-bold tracking-widest px-3 py-1 rounded-full"
              style={{ backgroundColor: `${SPORTS}22`, color: SPORTS }}
            >
              {event.tag}
            </span>
          </div>

          {/* Title */}
          <div className="flex items-start gap-5">
            {event.logo && (
              <div
                className="relative w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-full bg-white flex-shrink-0 mt-1"
              >
                <Image
                  src={event.logo}
                  alt={`Logo ${event.name}`}
                  fill
                  className="object-contain p-1"
                />
              </div>
            )}
            <div>
              <h1
                className="font-display font-black text-4xl md:text-6xl lg:text-7xl leading-none tracking-tight"
                style={{ color: 'oklch(97% 0.009 52)' }}
              >
                {event.name}
              </h1>
              <p className="font-display text-xl md:text-2xl mt-1" style={{ color: SPORTS }}>
                {event.subtitle}
              </p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2 font-ui text-sm" style={{ color: 'oklch(75% 0.02 48)' }}>
              <Calendar size={15} style={{ color: SPORTS }} />
              {event.date}
            </div>
            <div className="flex items-center gap-2 font-ui text-sm" style={{ color: 'oklch(75% 0.02 48)' }}>
              <MapPin size={15} style={{ color: SPORTS }} />
              {event.location}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-24 flex flex-col gap-20">

        {/* Stats + description */}
        <section className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p
              className="font-body text-lg leading-relaxed"
              style={{ color: 'oklch(75% 0.015 48)' }}
            >
              {event.description}
            </p>
            {event.link && (
              <a
                href={event.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 font-ui text-sm font-medium transition-opacity duration-200 hover:opacity-70"
                style={{ color: SPORTS }}
              >
                {event.link.label}
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <div className={`grid grid-cols-2 gap-3`}>
            {event.stats.map((s, i) => (
              <StatCard key={i} label={s.label} value={s.value} />
            ))}
          </div>
        </section>

        {/* Empty state when no media yet */}
        {!hasMedia && (
          <section
            className="rounded-3xl border-2 border-dashed p-16 text-center"
            style={{ borderColor: 'oklch(25% 0.015 48)' }}
          >
            <p className="font-display font-bold text-2xl mb-3" style={{ color: 'oklch(50% 0.02 48)' }}>
              Material em breve
            </p>
            <p className="font-ui text-sm" style={{ color: 'oklch(45% 0.02 48)' }}>
              Fotos e vídeos do evento serão adicionados aqui.
            </p>
          </section>
        )}

        {/* Gallery */}
        <Gallery images={event.gallery} eventName={event.name} />

        {/* Reels */}
        <Reels reels={event.reels} />

        {/* Sponsors */}
        <Sponsors sponsors={event.sponsors} />

        {/* Back CTA */}
        <div className="pt-4 border-t" style={{ borderColor: 'oklch(20% 0.01 50)' }}>
          <Link
            href="/sports"
            className="inline-flex items-center gap-2 font-ui text-sm font-medium transition-opacity duration-200 hover:opacity-70"
            style={{ color: SPORTS }}
          >
            <ArrowLeft size={16} />
            Ver todos os torneios
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
