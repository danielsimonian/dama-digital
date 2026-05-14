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

const SP = 'https://open.spotify.com/album/'

const artists = [
  // 2026
  { name: 'Fernando Silveyra',  lastRelease: 'Confiança',                               year: 2026, type: 'CD',     cover: '/images/studio/fernando-silveyra-confianca.jpg',                 initials: 'FS', spotify: `${SP}67dv685dARviuHRS8K5jVF` },
  { name: 'Fábio Zulli',        lastRelease: 'Nico Manezinho',                           year: 2026, type: 'Single', cover: '/images/studio/fabio-zulli-nico-manezinho.jpg',                   initials: 'FZ', spotify: `${SP}7Ly3VKT8LgL0TULQpIfvO5` },
  { name: 'SAID',               lastRelease: 'Find Love',                                year: 2026, type: 'Single', cover: '/images/studio/said-find-love.jpg',                               initials: 'SA', spotify: `${SP}2Fmk8IR5DvSVZhWEXdKrnU` },
  { name: 'Antonio Eduardo',    lastRelease: 'MRB — Revisitando Guerra Peixe',           year: 2026, type: 'CD',     cover: '/images/studio/antonio-eduardo-revisitando-guerra-peixe.jpg',     initials: 'AE', spotify: `${SP}73qBHEp5bTTe6f3QvKvFVe` },
  { name: 'Antonio Eduardo',    lastRelease: 'MRB — Miniaturas Secretas de Harry Crowl', year: 2026, type: 'EP',     cover: '/images/studio/antonio-eduardo-miniaturas-secretas.jpg',           initials: 'AE', spotify: `${SP}64zyVmjoOZq6tZbbWUh3Kj` },
  { name: 'Antonio Eduardo',    lastRelease: 'MRB — Compositores Baianos',               year: 2026, type: 'Single', cover: '/images/studio/antonio-eduardo-compositores-baianos.jpg',         initials: 'AE', spotify: `${SP}7577b5w14KGTojPpKKuJW8` },
  // 2025
  { name: 'André Simonian',     lastRelease: 'Manifesto',                                year: 2025, type: 'Single', cover: '/images/studio/andre-simonian-manifesto.jpg',                     initials: 'AS', spotify: `${SP}1MzPmMFTOFKqG0Hk13zpJ0` },
  { name: 'André Simonian',     lastRelease: 'Nosso Grande Alento',                      year: 2025, type: 'Single', cover: '/images/studio/andre-simonian-nosso-grande-alento.jpg',           initials: 'AS', spotify: `${SP}5k98tQ1r7mN09SCkj7w8Rz` },
  { name: 'SAID',               lastRelease: 'Tik Tok',                                  year: 2025, type: 'Single', cover: '/images/studio/said-tik-tok.jpg',                                 initials: 'SA', spotify: `${SP}0PsMhzZxCD95ucZ1LVIi5m` },
  { name: 'SAID',               lastRelease: 'Vontade Louca',                            year: 2025, type: 'Single', cover: '/images/studio/said-vontade-louca.jpg',                           initials: 'SA', spotify: `${SP}6ak4VamDvkhS1ABem0Guxj` },
  // 2024
  { name: 'José Simonian',      lastRelease: 'Houve as Nossas Canções',                  year: 2024, type: 'CD',     cover: '/images/studio/jose-simonian-houve-as-nossas-cancoes.jpg',        initials: 'JS', spotify: `${SP}02d1YLgTKflDku4qvTZ9px` },
  { name: 'André Simonian',     lastRelease: 'Notícias do Brasil',                       year: 2024, type: 'Single', cover: '/images/studio/andre-simonian-noticias-do-brasil.jpg',            initials: 'AS', spotify: `${SP}6VOpqlnhDgiQVG96v724nA` },
  { name: 'SAID',               lastRelease: 'My Head',                                  year: 2024, type: 'Single', cover: '/images/studio/said-my-head.jpg',                                 initials: 'SA', spotify: `${SP}2ZiCJ3KFbqNHeK9JzWKXIQ` },
  { name: 'SAID',               lastRelease: 'Impact',                                   year: 2024, type: 'EP',     cover: '/images/studio/said-impact.jpg',                                  initials: 'SA', spotify: `${SP}2FiObNM2Ofmi8iJAMb0vQy` },
  // 2023
  { name: 'SAID',               lastRelease: 'I Miss You',                               year: 2023, type: 'Single', cover: '/images/studio/said-i-miss-you.jpg',                             initials: 'SA', spotify: `${SP}59E6uGIkrEsmcHJBgrNEZD` },
  { name: 'Fábio Zulli',        lastRelease: 'Cantando Poeminhas',                       year: 2023, type: 'CD',     cover: '/images/studio/fabio-zulli-cantando-poeminhas.jpg',               initials: 'FZ', spotify: `${SP}4cTFV6okjccoHws49DWqjm` },
  // 2022
  { name: 'Raffa Pereira',      lastRelease: 'Canto pra Guerreira',                      year: 2022, type: 'Single', cover: '/images/studio/raffa-pereira-canto-pra-guerreira.jpg',           initials: 'RP', spotify: `${SP}29jva9tHQt3oEN16jj1S7c` },
  { name: 'André Simonian',     lastRelease: 'Davi',                                     year: 2022, type: 'Single', cover: '/images/studio/andre-simonian-davi.jpg',                         initials: 'AS', spotify: `${SP}70zO6tf122ISeDYj5qTuXy` },
  { name: 'André Simonian',     lastRelease: 'Lança, Vol. 01',                           year: 2022, type: 'EP',     cover: '/images/studio/andre-simonian-lanca-vol-01.jpg',                 initials: 'AS', spotify: `${SP}4ow20X22JNmtQ79eguZEBi` },
  { name: 'André Simonian',     lastRelease: 'Porta Aberta',                             year: 2022, type: 'Single', cover: '/images/studio/andre-simonian-porta-aberta.jpg',                 initials: 'AS', spotify: `${SP}4NhrlydeGdVofo2oZImRAl` },
  { name: 'SAID',               lastRelease: 'Le Petit',                                 year: 2022, type: 'Single', cover: '/images/studio/said-le-petit.jpg',                               initials: 'SA', spotify: `${SP}05rHHXhl6P9L3TyCbzEfsK` },
  { name: 'SAID',               lastRelease: 'Pode Falar',                               year: 2022, type: 'Single', cover: '/images/studio/said-pode-falar.jpg',                             initials: 'SA', spotify: `${SP}7ugyDTQKie5NdqmrVfhjK6` },
  { name: 'Karina Cyrillo',     lastRelease: 'Te Quis',                                  year: 2022, type: 'Single', cover: '/images/studio/karina-cyrillo-te-quis.jpg',                      initials: 'KC', spotify: `${SP}3WzDvd9SCgBkM07JAqTp3Z` },
  { name: 'Caio Jack',          lastRelease: 'Alto Mar',                                 year: 2022, type: 'Single', cover: '/images/studio/caio-jack-alto-mar.jpg',                    initials: 'CJ', spotify: `${SP}5dO6YvY2Jn4zOVgp69kKoI` },
  { name: 'Caio Jack',          lastRelease: 'Dia de Sol',                               year: 2022, type: 'Single', cover: '/images/studio/caio-jack-dia-de-sol.jpg',                         initials: 'CJ', spotify: `${SP}5ydCucHC5INf5CDd3rGFTc` },
  // 2021
  { name: 'Karina Cyrillo',     lastRelease: 'Ella',                                     year: 2021, type: 'Single', cover: '/images/studio/karina-cyrillo-ella.jpg',                         initials: 'KC', spotify: `${SP}1zPhcya15SVrFsHtu1bPa0` },
  { name: 'Karina Cyrillo',     lastRelease: 'Passarinho',                               year: 2021, type: 'Single', cover: '/images/studio/karina-cyrillo-passarinho.jpg',                   initials: 'KC', spotify: `${SP}6KUFOCJy12OvFKYIFnfE3k` },
  { name: 'Raffa Pereira',      lastRelease: 'Ai Amor',                                  year: 2021, type: 'Single', cover: '/images/studio/raffa-pereira-ai-amor.jpg',                       initials: 'RP', spotify: `${SP}4j8hnS5S74opp7vfPtHlNA` },
  { name: 'Raffa Pereira',      lastRelease: 'Liberdade Dança',                          year: 2021, type: 'Single', cover: '/images/studio/raffa-pereira-liberdade-danca.jpg',               initials: 'RP', spotify: `${SP}4UDoKOwmykXxaWZ0a1t9Bk` },
  { name: 'Lopes.Inc',          lastRelease: 'Amor de Carnaval',                         year: 2021, type: 'Single', cover: '/images/studio/lopes-inc-amor-de-carnaval.jpg',             initials: 'LI', spotify: `${SP}4X0DyS8vgnj4UNfpgSguoR` },
  { name: 'Caio Simonian',      lastRelease: 'Voz, violão e vassoura',                   year: 2021, type: 'CD',     cover: '/images/studio/caio-simonian-voz-violao-e-vassoura.jpg',         initials: 'CS', spotify: `${SP}36wB8Ss6R8cOjKvIEvgYv6` },
  // 2020
  { name: 'Karina Cyrillo',     lastRelease: 'Cicatrizes',                               year: 2020, type: 'Single', cover: '/images/studio/karina-cyrillo-cicatrizes.jpg',                   initials: 'KC', spotify: `${SP}4kWeggaKmaDk3EgYICk1iL` },
  { name: 'Karina Cyrillo',     lastRelease: 'Acústicas',                                year: 2020, type: 'EP',     cover: '/images/studio/karina-cyrillo-acusticas.jpg',                    initials: 'KC', spotify: `${SP}5Wj422coBpJpNVZzjatY4l` },
  { name: 'Intemporal',         lastRelease: 'Anseio',                                   year: 2020, type: 'Single', cover: '/images/studio/intemporal-anseio.jpg',                        initials: 'IN', spotify: `${SP}4bEMPiBcCmD6GlrI5NmZhc` },
  { name: 'Intemporal',         lastRelease: 'Espelho',                                  year: 2020, type: 'Single', cover: '/images/studio/intemporal-espelho.jpg',                             initials: 'IN', spotify: `${SP}6wiL2pjHPkdaJzn2r8jSxL` },
  { name: 'Intemporal',         lastRelease: 'Não Dá Mais',                              year: 2020, type: 'Single', cover: '/images/studio/intemporal-nao-da-mais.jpg',                         initials: 'IN', spotify: `${SP}45VqKZ1MQ6uFQ0dBLw0ryA` },
  { name: 'Daniel Simonian & Marcella Lima', lastRelease: 'Temporal (Acústico)',         year: 2020, type: 'Single', cover: '/images/studio/daniel-marcella-temporal-acustico.jpg',            initials: 'DM', spotify: `${SP}4y0hnnmdJbGh8JKqjCzt3B` },
  // 2016
  { name: 'Marcos Alves',       lastRelease: 'Amanhecerá',                               year: 2016, type: 'CD',     cover: '/images/studio/marcos-alves-amanhacera.jpg',                     initials: 'MA', spotify: `${SP}0LxOuQHgwSduQyHYj1AAdS` },
  // 2015
  { name: 'Fernando Silveyra',  lastRelease: 'Labaredas',                               year: 2015, type: 'CD',     cover: '/images/studio/fernando-silveyra-labaredas.jpg',                 initials: 'FS', spotify: `${SP}7G5RewztShPZLZnH1mifjR` },
  // 2012
  { name: 'Kayoko Yamabe',      lastRelease: 'Lembrança do Brasil',                      year: 2012, type: 'CD',     cover: null,                                                             initials: 'KY', spotify: null },
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
  const card = (
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

  if (artist.spotify) {
    return (
      <a href={artist.spotify} target="_blank" rel="noopener noreferrer" className="block">
        {card}
      </a>
    )
  }

  return card
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
                  Mais de {artists.length} lançamentos produzidos ao longo de mais de uma década de estúdio.
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
                <ArtistCard key={`${artist.name}-${artist.lastRelease}`} artist={artist} index={i} />
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
