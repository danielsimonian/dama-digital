"use client"

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const BG     = 'oklch(7% 0.012 148)'
const BG_ALT = 'oklch(5% 0.015 148)'
const BORDER = 'oklch(20% 0.04 148)'
const TEXT   = 'oklch(93% 0.008 88)'
const MUTED  = 'oklch(50% 0.03 85)'
const ACCENT = 'oklch(60% 0.17 148)'

const TYPE_LABEL: Record<string, string> = {
  Single: 'Single',
  EP: 'EP',
  CD: 'Álbum',
}

const artists = [
  {
    name: 'Fernando Silveyra',
    lastRelease: 'Confiança',
    year: 2026,
    type: 'CD',
    cover: '/images/studio/fernando-silveyra-confianca.jpg',
    initials: 'FS',
  },
  {
    name: 'SAID',
    lastRelease: 'I Miss You',
    year: 2023,
    type: 'Single',
    cover: null,
    initials: 'SA',
  },
  {
    name: 'Raffa Pereira',
    lastRelease: 'Canto pra Guerreira',
    year: 2022,
    type: 'Single',
    cover: null,
    initials: 'RP',
  },
  {
    name: 'André Simonian',
    lastRelease: 'Lança, Vol. 01',
    year: 2022,
    type: 'EP',
    cover: null,
    initials: 'AS',
  },
  {
    name: 'Karina Cyrillo',
    lastRelease: 'Te Quis',
    year: 2022,
    type: 'Single',
    cover: null,
    initials: 'KC',
  },
  {
    name: 'Caio Jack',
    lastRelease: 'Alto Mar',
    year: 2022,
    type: 'Single',
    cover: null,
    initials: 'CJ',
  },
  {
    name: 'Lopes.Inc',
    lastRelease: 'Uma Despedida Espanhola',
    year: 2021,
    type: 'Single',
    cover: null,
    initials: 'LI',
  },
  {
    name: 'Caio Simonian',
    lastRelease: 'Voz, violão e vassoura',
    year: 2021,
    type: 'CD',
    cover: null,
    initials: 'CS',
  },
  {
    name: 'Intemporal',
    lastRelease: 'Anseio',
    year: 2020,
    type: 'Single',
    cover: null,
    initials: 'IN',
  },
  {
    name: 'Marcella Lima',
    lastRelease: 'Temporal',
    year: 2020,
    type: 'Single',
    cover: null,
    initials: 'ML',
  },
  {
    name: 'Marcos Alves',
    lastRelease: 'Amanhecerá',
    year: 2016,
    type: 'CD',
    cover: null,
    initials: 'MA',
  },
  {
    name: 'Kayoko Yamabe',
    lastRelease: 'Lembrança do Brasil',
    year: 2012,
    type: 'CD',
    cover: null,
    initials: 'KY',
  },
]

function ArtistCover({ artist }: { artist: typeof artists[0] }) {
  if (artist.cover) {
    return (
      <div className="relative w-full aspect-square overflow-hidden" style={{ backgroundColor: BG_ALT }}>
        <Image
          src={artist.cover}
          alt={`${artist.lastRelease} — ${artist.name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          unoptimized
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `${ACCENT}18` }}
        />
      </div>
    )
  }

  return (
    <div
      className="w-full aspect-square flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: BG_ALT, border: `1px solid ${BORDER}` }}
    >
      <span
        className="select-none"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          color: ACCENT,
          opacity: 0.3,
          letterSpacing: '-0.04em',
        }}
      >
        {artist.initials}
      </span>
      <span
        className="absolute bottom-0 right-0 select-none pointer-events-none"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: '8rem',
          lineHeight: 0.85,
          color: ACCENT,
          opacity: 0.04,
        }}
      >
        {artist.initials}
      </span>
    </div>
  )
}

function ArtistCard({ artist, index }: { artist: typeof artists[0]; index: number }) {
  return (
    <motion.div
      className="group flex flex-col"
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: EASE, delay: index * 0.06 },
        },
      }}
    >
      <ArtistCover artist={artist} />

      <div
        className="flex flex-col gap-1 p-4"
        style={{ backgroundColor: BG_ALT, borderTop: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3
            className="font-display font-black text-base leading-tight truncate"
            style={{ color: TEXT }}
          >
            {artist.name}
          </h3>
          <span
            className="font-ui text-[10px] tracking-widest uppercase shrink-0"
            style={{ color: ACCENT, opacity: 0.7 }}
          >
            {artist.year}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="font-body text-xs truncate"
            style={{ color: MUTED }}
          >
            {artist.lastRelease}
          </span>
          <span
            className="font-ui text-[9px] tracking-widest uppercase px-1.5 py-0.5 shrink-0"
            style={{
              color: ACCENT,
              border: `1px solid ${ACCENT}40`,
              borderRadius: '0.1rem',
            }}
          >
            {TYPE_LABEL[artist.type] ?? artist.type}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function ArtistasPage() {
  const gridRef = useRef<HTMLDivElement>(null)
  const gridInView = useInView(gridRef, { once: true, margin: '-5% 0px' })

  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-5% 0px' })

  return (
    <>
      <Header />

      <main style={{ backgroundColor: BG, minHeight: '100dvh' }}>

        {/* Hero header */}
        <section
          className="pt-32 pb-16"
          style={{ borderBottom: `1px solid ${BORDER}` }}
          ref={headerRef}
        >
          <div className="container mx-auto px-6 lg:px-12">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 mb-8 transition-opacity hover:opacity-70"
                style={{ fontFamily: 'var(--font-ui)', color: ACCENT, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                ← DAMA Studio
              </Link>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div>
                  <p
                    className="mb-3"
                    style={{ fontFamily: 'var(--font-ui)', color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
                  >
                    Portfólio
                  </p>
                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 900,
                      fontSize: 'clamp(2.5rem, 7vw, 6rem)',
                      color: TEXT,
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    Artistas
                  </h1>
                </div>

                <p
                  className="max-w-sm text-base leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)', color: MUTED }}
                >
                  {artists.length} artistas produzidos ao longo de mais de uma década de estúdio.
                </p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Grid */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div
              ref={gridRef}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px"
              style={{ backgroundColor: BORDER }}
              initial="hidden"
              animate={gridInView ? 'visible' : 'hidden'}
              variants={{ hidden: {}, visible: {} }}
            >
              {artists.map((artist, i) => (
                <ArtistCard key={artist.name} artist={artist} index={i} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="py-16"
          style={{ borderTop: `1px solid ${BORDER}` }}
        >
          <div className="container mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
            <p style={{ fontFamily: 'var(--font-body)', color: MUTED, maxWidth: '36ch' }}>
              Quer fazer parte desse portfólio? Agende uma sessão de gravação.
            </p>
            <Link
              href="/#contato"
              className="inline-block text-sm font-medium px-8 py-3 transition-colors duration-200 shrink-0"
              style={{
                fontFamily: 'var(--font-ui)',
                border: `1px solid ${ACCENT}80`,
                color: ACCENT,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = ACCENT
                e.currentTarget.style.color = BG
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = ACCENT
              }}
            >
              Entrar em contato
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
