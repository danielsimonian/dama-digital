import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight, Check, MapPin, Disc3 } from 'lucide-react';
import type { Divisao } from '@/lib/supabase';
import { cn, Frame, DivisionBadge, StatusBadge, buttonClass } from './primitives';
import { LINE_ART, type LineArtKey } from './line-art';

/* ------------------------------------------------------------------ */
/* Grid de capacidades                                                 */
/* ------------------------------------------------------------------ */

export type Capability = { title: string; art: LineArtKey; divisao: Divisao };

export function CapabilityCard({ item, index }: { item: Capability; index: number }) {
  return (
    <Frame
      interactive
      divisao={item.divisao}
      className="group flex aspect-square flex-col justify-between p-4 sm:p-5"
    >
      <span className="ds-annot tabular-nums transition-colors group-hover:text-ds-accent">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="flex justify-center text-ds-muted transition-colors duration-300 group-hover:text-ds-fg">
        {LINE_ART[item.art]}
      </span>
      <span className="text-sm text-ds-fg">{item.title}</span>
    </Frame>
  );
}

export function CapabilityGrid({ items }: { items: Capability[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item, i) => (
        <CapabilityCard key={item.title} item={item} index={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Projeto (Tech)                                                      */
/* ------------------------------------------------------------------ */

export type Project = {
  name: string;
  tag: string;
  domain: string;
  desc: string;
  logo: string;
  href: string;
};

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      data-divisao="tech"
      className="group grid gap-6 border-t border-ds-line py-6 transition-colors sm:grid-cols-[3rem_1fr_auto] sm:items-center"
    >
      <span className="ds-annot tabular-nums">{String(index + 1).padStart(2, '0')}</span>
      <div className="flex items-center gap-5">
        <span className="relative flex size-16 shrink-0 items-center justify-center rounded-ds-sm border border-ds-line bg-ds-surface p-3 transition-colors group-hover:border-ds-accent">
          <Image src={project.logo} alt="" width={48} height={48} className="max-h-10 w-auto object-contain" />
        </span>
        <div className="min-w-0">
          <h3 className="text-xl font-medium tracking-tight text-ds-fg">{project.name}</h3>
          <p className="mt-1 line-clamp-2 max-w-[60ch] text-sm text-ds-muted">{project.desc}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-6 sm:justify-end">
        <span className="ds-annot text-right">
          {project.tag}
          <br />
          {project.domain}
        </span>
        <ArrowUpRight
          className="size-5 text-ds-subtle transition-[transform,color] duration-200 ease-ds-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ds-accent"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Torneio (Sports)                                                    */
/* ------------------------------------------------------------------ */

export type Tournament = {
  name: string;
  modalidade: string;
  dateShort: string;
  location: string;
  cover: string | null;
  logo: string | null;
  status: 'realizado' | 'proximo' | 'inscricoes';
  stats: { label: string; value: string }[];
  href: string;
};

export function TournamentCard({ t, featured }: { t: Tournament; featured?: boolean }) {
  return (
    <Link
      href={t.href}
      data-divisao="sports"
      className={cn(
        'group grid overflow-hidden border border-ds-line bg-ds-surface transition-colors hover:border-ds-line-strong',
        featured && 'md:grid-cols-[1.1fr_1fr]',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ds-surface-2">
        {t.cover ? (
          <Image
            src={t.cover}
            alt={t.name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover grayscale transition-[filter,transform] duration-500 ease-ds-out group-hover:scale-[1.02] group-hover:grayscale-0"
          />
        ) : (
          t.logo && (
            <div className="ds-grid-bg absolute inset-0 flex items-center justify-center">
              <Image src={t.logo} alt={t.name} width={120} height={120} className="max-h-24 w-auto rounded-ds-xs object-contain" />
            </div>
          )
        )}
        <span className="absolute left-3 top-3">
          <StatusBadge status={t.status} />
        </span>
        <span className="ds-annot absolute bottom-3 right-3 rounded-ds-xs bg-ds-bg/80 px-1.5 py-0.5 backdrop-blur">
          {t.dateShort}
        </span>
      </div>
      <div className="flex flex-col p-5 md:p-6">
        <p className="ds-annot uppercase text-ds-accent">{t.modalidade}</p>
        <h3 className="mt-2 text-2xl font-medium tracking-tight text-ds-fg">{t.name}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ds-muted">
          <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          {t.location}
        </p>
        <dl className="mt-auto grid grid-cols-4 gap-px border-t border-ds-line pt-4">
          {t.stats.map((s) => (
            <div key={s.label}>
              <dt className="ds-annot uppercase">{s.label}</dt>
              <dd className="mt-1 text-lg font-medium tabular-nums text-ds-fg">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Artista & lançamento (Studio)                                       */
/* ------------------------------------------------------------------ */

export type Artist = { name: string; genre: string; releases: number; image: string | null; latest: string };

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <article data-divisao="studio" className="group">
      <div className="relative aspect-[3/4] overflow-hidden border border-ds-line bg-ds-surface-2">
        {artist.image ? (
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
          />
        ) : (
          <div className="ds-grid-bg flex h-full items-center justify-center font-ds-mono text-3xl text-ds-subtle">
            {artist.name
              .split(' ')
              .slice(0, 2)
              .map((p) => p[0])
              .join('')}
          </div>
        )}
        <span className="ds-annot absolute bottom-2 left-2 right-2 truncate rounded-ds-xs bg-ds-bg/80 px-1.5 py-0.5 backdrop-blur">
          último · {artist.latest}
        </span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium tracking-tight text-ds-fg">{artist.name}</h3>
          <p className="text-sm text-ds-muted">{artist.genre}</p>
        </div>
        <span className="ds-annot shrink-0 pt-1 tabular-nums">
          <span className="text-ds-accent">{String(artist.releases).padStart(2, '0')}</span> lanç.
        </span>
      </div>
    </article>
  );
}

export type Release = { artist: string; title: string; year: number; type: string; cover: string | null; spotify: string | null };

export function ReleaseCard({ release }: { release: Release }) {
  const body = (
    <>
      <div className="relative aspect-square overflow-hidden border border-ds-line bg-ds-surface-2">
        {release.cover ? (
          <Image
            src={release.cover}
            alt={`Capa de ${release.title}`}
            fill
            sizes="(min-width: 1024px) 20vw, 45vw"
            className="object-cover transition-transform duration-500 ease-ds-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ds-subtle">
            <Disc3 className="size-10" strokeWidth={1} aria-hidden />
          </div>
        )}
        <span className="ds-annot absolute left-2 top-2 rounded-ds-xs bg-ds-bg/80 px-1.5 py-0.5 uppercase backdrop-blur">
          {release.type}
        </span>
      </div>
      <div className="mt-3">
        <p className="ds-annot">
          {release.artist} · {release.year}
        </p>
        <h3 className="mt-1 text-sm font-medium text-ds-fg">{release.title}</h3>
        {release.spotify ? (
          <span className="mt-2 inline-flex items-center gap-1 text-xs text-ds-muted transition-colors group-hover:text-ds-accent">
            Ouvir no Spotify <ArrowUpRight className="size-3" strokeWidth={1.5} aria-hidden />
          </span>
        ) : (
          <span className="mt-2 inline-block text-xs text-ds-subtle">Em breve nas plataformas</span>
        )}
      </div>
    </>
  );
  return release.spotify ? (
    <a href={release.spotify} target="_blank" rel="noopener noreferrer" data-divisao="studio" className="group block">
      {body}
    </a>
  ) : (
    <div data-divisao="studio" className="group">
      {body}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Serviço                                                             */
/* ------------------------------------------------------------------ */

export type Service = {
  divisao: Divisao;
  name: string;
  desc: string;
  from: string;
  unit: string;
  items: string[];
  highlight?: boolean;
};

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Frame
      divisao={service.divisao}
      className={cn(
        'flex flex-col p-6',
        service.highlight ? 'bg-ds-surface [--ds-corner:var(--ds-accent)]' : 'border border-transparent',
      )}
    >
      <div className="flex items-center justify-between">
        <DivisionBadge divisao={service.divisao} />
        {service.highlight && <span className="ds-annot uppercase text-ds-accent">Mais pedido</span>}
      </div>
      <h3 className="mt-6 text-xl font-medium tracking-tight">{service.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ds-muted">{service.desc}</p>
      <div className="mt-6">
        <p className="ds-annot">a partir de</p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="whitespace-nowrap text-3xl font-medium tabular-nums tracking-tight">{service.from}</span>
          <span className="ds-annot">/{service.unit}</span>
        </p>
      </div>
      <ul className="mt-6 space-y-2 border-t border-ds-line pt-5">
        {service.items.map((it) => (
          <li key={it} className="flex gap-2.5 text-sm text-ds-muted">
            <Check className="mt-0.5 size-4 shrink-0 text-ds-accent" strokeWidth={1.5} aria-hidden />
            {it}
          </li>
        ))}
      </ul>
      <Link
        href="#contato"
        className={buttonClass({ variant: service.highlight ? 'primary' : 'secondary', className: 'mt-8 w-full' })}
      >
        Pedir orçamento
      </Link>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Equipe                                                              */
/* ------------------------------------------------------------------ */

export type Member = { name: string; role: string; bio: string; photo: string; coord: string };

export function TeamCard({ member, index }: { member: Member; index: number }) {
  return (
    <article className="grid gap-5 sm:grid-cols-[10rem_1fr]">
      <div className="relative aspect-[4/5] overflow-hidden border border-ds-line bg-ds-surface-2">
        <Image src={member.photo} alt={member.name} fill sizes="160px" className="object-cover object-top grayscale" />
        <span className="ds-annot absolute bottom-2 left-2">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="flex flex-col">
        <p className="ds-annot uppercase">{member.role}</p>
        <h3 className="mt-2 text-2xl font-medium tracking-tight">{member.name}</h3>
        <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-ds-muted">{member.bio}</p>
        <p className="ds-annot mt-auto pt-4">{member.coord}</p>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Parceiros                                                           */
/* ------------------------------------------------------------------ */

export type Partner = { name: string; logo: string };

function PartnerLogo({ p }: { p: Partner }) {
  return (
    <span className="group flex h-24 w-40 shrink-0 items-center justify-center border-r border-ds-line px-5" title={p.name}>
      <Image
        src={p.logo}
        alt={p.name}
        width={96}
        height={48}
        className="max-h-12 w-auto rounded-ds-xs object-contain opacity-60 grayscale transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0"
      />
    </span>
  );
}

export function PartnerStrip({ partners, variant = 'marquee' }: { partners: Partner[]; variant?: 'marquee' | 'grid' }) {
  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 border-l border-t border-ds-line sm:grid-cols-3 lg:grid-cols-5">
        {partners.map((p) => (
          <span key={p.name} className="group flex h-28 items-center justify-center border-b border-r border-ds-line p-4" title={p.name}>
            <Image
              src={p.logo}
              alt={p.name}
              width={96}
              height={48}
              className="max-h-12 w-auto rounded-ds-xs object-contain opacity-60 grayscale transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0"
            />
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="group/m relative overflow-hidden border-y border-ds-line [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-[ds-marquee_40s_linear_infinite] group-hover/m:[animation-play-state:paused]">
        {[...partners, ...partners].map((p, i) => (
          <PartnerLogo key={`${p.name}-${i}`} p={p} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Estados                                                             */
/* ------------------------------------------------------------------ */

export function EmptyState({
  title,
  desc,
  action,
  art = 'branding',
}: {
  title: string;
  desc: string;
  action?: ReactNode;
  art?: LineArtKey;
}) {
  return (
    <Frame className="flex flex-col items-center px-6 py-12 text-center">
      <span className="text-ds-subtle">{LINE_ART[art]}</span>
      <h3 className="mt-6 text-lg font-medium tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-ds-muted">{desc}</p>
      {action && <div className="mt-6">{action}</div>}
    </Frame>
  );
}

export function NotFoundBlock() {
  return (
    <div className="ds-grid-bg relative flex min-h-96 flex-col items-center justify-center overflow-hidden border border-ds-line px-6 py-16 text-center">
      <svg viewBox="0 0 200 120" className="w-64 text-ds-line-strong" fill="none" stroke="currentColor" aria-hidden>
        <circle cx="70" cy="60" r="44" strokeDasharray="2 4" />
        <circle cx="130" cy="60" r="44" />
        <path d="M100 4v112M10 60h180" strokeDasharray="1 4" />
        <circle cx="100" cy="60" r="3" className="fill-ds-accent stroke-none" />
      </svg>
      <p className="ds-annot mt-6">ERRO 404 · coordenada fora do mapa</p>
      <h3 className="mt-3 text-3xl font-medium tracking-tight">Essa página saiu do enquadramento</h3>
      <p className="mt-3 max-w-sm text-sm text-ds-muted">
        O link pode ter mudado. Volte para a home ou fale com a gente pelo WhatsApp.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClass()}>
          Voltar para a home
        </Link>
        <Link href="#contato" className={buttonClass({ variant: 'bracket' })}>
          Falar com a DAMA
        </Link>
      </div>
    </div>
  );
}

