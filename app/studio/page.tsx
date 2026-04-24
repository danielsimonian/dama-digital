"use client"

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const BG     = 'oklch(7% 0.012 148)';
const BG_ALT = 'oklch(5% 0.015 148)';
const BORDER = 'oklch(20% 0.04 148)';
const TEXT   = 'oklch(93% 0.008 88)';
const MUTED  = 'oklch(50% 0.03 85)';
const ACCENT = 'oklch(60% 0.17 148)';

const heroArtists = [
  { name: 'Raffa Pereira',    genre: 'MPB & Jazz' },
  { name: 'SAID',             genre: 'Pop Music' },
  { name: 'Karina Cyrillo',   genre: 'Pop' },
  { name: 'André Simonian',   genre: 'Jazz / Instrumental' },
  { name: 'Fernando Silveyra',genre: 'MPB' },
];

const ultimoLancamento = {
  name: 'Fernando Silveyra',
  release: 'Confiança',
  year: 2026,
  mes: 'Abril',
  type: 'CD',
  cover: '/images/studio/fernando-silveyra-confianca.jpg',
  initials: 'FS',
};

const portfolioPreview = [
  { name: 'Raffa Pereira',    release: 'Canto pra Guerreira', year: 2022, cover: null, initials: 'RP' },
  { name: 'Karina Cyrillo',   release: 'Te Quis',             year: 2022, cover: null, initials: 'KC' },
  { name: 'André Simonian',   release: 'Lança, Vol. 01',      year: 2022, cover: null, initials: 'AS' },
  { name: 'Fernando Silveyra',release: 'Labaredas',           year: 2016, cover: null, initials: 'FS' },
];

const producaoInclui = [
  'Gravação em estúdio tratado acusticamente',
  'Edição e comping de takes',
  'Arranjo e direção musical',
  'Mixagem',
  'Masterização em padrão de mercado',
  'Distribuição digital (150+ plataformas)',
  'Registro de ISRC',
];

const aulasOpcoes = [
  { instrumento: 'Violão', desc: 'Do básico ao avançado — acordes, técnica, harmonia e repertório.' },
  { instrumento: 'Guitarra', desc: 'Rock, blues, jazz e além — técnica, improv e sonoridade.' },
  { instrumento: 'Produção Musical', desc: 'DAW, arranjo, gravação e lançamento — do zero ao release.' },
];

const PULSE_DURATION = 4000;

function PulsingText({ texts, onIndexChange }: { texts: string[]; onIndexChange?: (i: number) => void }) {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = (index + 1) % texts.length;
      setIndex(next);
      setAnimKey((k) => k + 1);
      onIndexChange?.(next);
    }, PULSE_DURATION);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <motion.span
      key={animKey}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{
        opacity: [0, 1,    1,    1,    1,    1,    0   ],
        scale:   [0.88, 1.06, 1, 1.04, 1, 1.015, 0.94 ],
      }}
      transition={{
        duration: PULSE_DURATION / 1000,
        times: [0, 0.08, 0.22, 0.42, 0.58, 0.82, 1],
        ease: 'easeInOut',
      }}
    >
      {texts[index]}
    </motion.span>
  );
}

function GenreFade({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 350);
    return () => clearTimeout(t);
  }, [text]);
  return (
    <motion.span animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.4 }}>
      {text}
    </motion.span>
  );
}

export default function DamaStudioPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const producaoRef     = useRef<HTMLDivElement>(null);
  const lancamentosRef  = useRef<HTMLDivElement>(null);
  const portfolioRef    = useRef<HTMLDivElement>(null);
  const aulasRef        = useRef<HTMLDivElement>(null);
  const distRef         = useRef<HTMLDivElement>(null);
  const ctaRef          = useRef<HTMLDivElement>(null);

  const producaoInView     = useInView(producaoRef,    { once: true, margin: '-8% 0px' });
  const lancamentosInView  = useInView(lancamentosRef, { once: true, margin: '-8% 0px' });
  const portfolioInView    = useInView(portfolioRef,   { once: true, margin: '-8% 0px' });
  const aulasInView        = useInView(aulasRef,       { once: true, margin: '-8% 0px' });
  const distInView         = useInView(distRef,        { once: true, margin: '-8% 0px' });
  const ctaInView          = useInView(ctaRef,         { once: true, margin: '-10% 0px' });

  return (
    <>
      <Header />

      {/* ── 1. Hero ── */}
      <section style={{ position: 'relative', height: '100dvh', overflow: 'hidden', backgroundColor: BG }}>
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/studio-placeholder.mp4"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'oklch(7% 0.012 148 / 0.82)' }} />

        <span
          className="absolute select-none pointer-events-none"
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: '20vw', color: ACCENT, opacity: 0.03,
            bottom: '-2rem', right: 0, lineHeight: 1,
          }}
        >03</span>

        <div className="absolute inset-0 flex flex-col justify-center">
          <div className="container mx-auto px-6 lg:px-12">
            <p className="mb-4" style={{ fontFamily: 'var(--font-ui)', color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              DAMA Studio — Artistas que passaram pelo estúdio
            </p>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(3rem, 8vw, 7.5rem)',
              color: TEXT, lineHeight: 1, letterSpacing: '-0.03em', minHeight: '1.1em',
            }}>
              <PulsingText texts={heroArtists.map(a => a.name)} onIndexChange={setActiveIndex} />
            </h1>

            <p style={{
              fontFamily: 'var(--font-body)', color: ACCENT,
              fontSize: 'clamp(0.9rem, 1.8vw, 1.15rem)',
              marginTop: '0.75rem', minHeight: '1.8em', letterSpacing: '0.04em',
            }}>
              <GenreFade text={heroArtists[activeIndex].genre} />
            </p>

            <div className="mt-12 flex items-center gap-8">
              <Link
                href="#producao"
                style={{ fontFamily: 'var(--font-ui)', color: TEXT, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.5 }}
                className="transition-opacity hover:opacity-100"
              >
                ↓ Conheça o estúdio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Produção Fonográfica ── */}
      <section
        id="producao"
        className="py-section"
        style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}
        ref={producaoRef}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-start">

            {/* Coluna esquerda */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={producaoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <p style={{ fontFamily: 'var(--font-ui)', color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Carro-chefe
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: TEXT, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
                Produção<br />Fonográfica
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', color: MUTED, fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '38ch', marginBottom: '2.5rem' }}>
                Do conceito ao lançamento — cuidamos de cada etapa da sua música, do microfone à playlist do Spotify.
              </p>

              {/* Stats */}
              <div className="flex gap-10">
                {[
                  { n: '12+', label: 'artistas' },
                  { n: '50+', label: 'lançamentos' },
                  { n: '5+',  label: 'anos' },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: ACCENT, lineHeight: 1 }}>
                      {s.n}
                    </p>
                    <p style={{ fontFamily: 'var(--font-ui)', color: MUTED, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Coluna direita — o que inclui */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={producaoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="flex flex-col"
              style={{ borderLeft: `1px solid ${BORDER}`, paddingLeft: '2.5rem' }}
            >
              <p style={{ fontFamily: 'var(--font-ui)', color: MUTED, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                O que está incluso
              </p>
              <div className="flex flex-col">
                {producaoInclui.map((item, i) => (
                  <motion.div
                    key={item}
                    className="flex items-center gap-4 py-4"
                    style={{ borderBottom: `1px solid ${BORDER}` }}
                    initial={{ opacity: 0, x: 16 }}
                    animate={producaoInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.07, ease: EASE }}
                  >
                    <span style={{ fontFamily: 'var(--font-ui)', color: ACCENT, fontSize: '0.6rem', opacity: 0.5, minWidth: '1.5rem' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', color: TEXT, fontSize: '0.95rem' }}>
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>

              <Link
                href="/#contato"
                className="inline-flex items-center gap-2 mt-8 group/cta w-fit text-sm"
                style={{ fontFamily: 'var(--font-ui)', color: ACCENT }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                <span className="transition-transform duration-300 group-hover/cta:translate-x-1">→</span>
                Falar sobre meu projeto
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 3. Último Lançamento ── */}
      <section
        style={{ backgroundColor: BG_ALT, borderTop: `1px solid ${BORDER}` }}
        ref={lancamentosRef}
      >
        <div className="container mx-auto px-6 lg:px-12">

          {/* Label fora do grid */}
          <motion.p
            className="py-6"
            style={{
              fontFamily: 'var(--font-ui)', color: ACCENT,
              fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase',
              borderBottom: `1px solid ${BORDER}`,
            }}
            initial={{ opacity: 0 }}
            animate={lancamentosInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
          >
            ● Último lançamento
          </motion.p>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-0" style={{ borderBottom: `1px solid ${BORDER}` }}>

            {/* Capa */}
            <motion.div
              className="relative overflow-hidden"
              style={{ width: 'clamp(200px, 30vw, 420px)', aspectRatio: '1 / 1', flexShrink: 0, backgroundColor: BG }}
              initial={{ opacity: 0, x: -32 }}
              animate={lancamentosInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE }}
            >
              {ultimoLancamento.cover ? (
                <Image
                  src={ultimoLancamento.cover}
                  alt={`${ultimoLancamento.release} — ${ultimoLancamento.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center relative">
                  <span
                    className="select-none"
                    style={{
                      fontFamily: 'var(--font-display)', fontWeight: 900,
                      fontSize: 'clamp(4rem, 10vw, 8rem)',
                      color: ACCENT, opacity: 0.15, letterSpacing: '-0.04em',
                    }}
                  >
                    {ultimoLancamento.initials}
                  </span>
                  <span
                    className="absolute bottom-0 right-0 select-none pointer-events-none"
                    style={{
                      fontFamily: 'var(--font-display)', fontWeight: 900,
                      fontSize: '14rem', lineHeight: 0.85,
                      color: ACCENT, opacity: 0.04,
                    }}
                  >
                    {ultimoLancamento.initials}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              className="flex flex-col justify-center gap-6 p-10 lg:p-16"
              style={{ borderLeft: `1px solid ${BORDER}` }}
              initial={{ opacity: 0, x: 32 }}
              animate={lancamentosInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            >
              <div className="flex items-center gap-3">
                <span
                  style={{
                    fontFamily: 'var(--font-ui)', fontSize: '0.65rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: ACCENT, border: `1px solid ${ACCENT}50`,
                    padding: '0.25rem 0.6rem',
                  }}
                >
                  {ultimoLancamento.type}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', color: MUTED, fontSize: '0.7rem', letterSpacing: '0.06em' }}>
                  {ultimoLancamento.mes} {ultimoLancamento.year}
                </span>
              </div>

              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)', fontWeight: 900,
                    fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                    color: TEXT, lineHeight: 1, letterSpacing: '-0.03em',
                    marginBottom: '0.5rem',
                  }}
                >
                  {ultimoLancamento.release}
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', color: ACCENT, fontSize: '1.1rem', letterSpacing: '0.04em' }}>
                  {ultimoLancamento.name}
                </p>
              </div>

              <Link
                href="/studio/artistas"
                className="inline-flex items-center gap-2 mt-2 group/link w-fit text-sm"
                style={{ fontFamily: 'var(--font-ui)', color: MUTED }}
                onMouseEnter={e => { e.currentTarget.style.color = ACCENT }}
                onMouseLeave={e => { e.currentTarget.style.color = MUTED }}
              >
                Ver todos os lançamentos
                <span className="transition-transform duration-300 group-hover/link:translate-x-1">→</span>
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 4. Portfólio Preview ── */}
      <section
        className="py-section"
        style={{ backgroundColor: BG_ALT, borderTop: `1px solid ${BORDER}` }}
        ref={portfolioRef}
      >
        <div className="container mx-auto px-6 lg:px-12">

          <motion.div
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={portfolioInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Portfólio
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: TEXT, lineHeight: 1, letterSpacing: '-0.03em' }}>
                Quem já gravou aqui.
              </h2>
            </div>
            <Link
              href="/studio/artistas"
              className="inline-flex items-center gap-2 shrink-0 group/link"
              style={{ fontFamily: 'var(--font-ui)', color: ACCENT, fontSize: '0.8rem', letterSpacing: '0.04em' }}
            >
              Ver todos os 12 artistas
              <span className="transition-transform duration-300 group-hover/link:translate-x-1">→</span>
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-px"
            style={{ backgroundColor: BORDER }}
            initial="hidden"
            animate={portfolioInView ? 'visible' : 'hidden'}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
          >
            {portfolioPreview.map((artist) => (
              <motion.div
                key={artist.name}
                className="group flex flex-col"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
                }}
              >
                <div className="relative w-full aspect-square overflow-hidden flex items-center justify-center" style={{ backgroundColor: BG }}>
                  {artist.cover ? (
                    <>
                      <Image
                        src={artist.cover}
                        alt={`${artist.release} — ${artist.name}`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                      />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `${ACCENT}18` }} />
                    </>
                  ) : (
                    <>
                      <span className="select-none" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: ACCENT, opacity: 0.25, letterSpacing: '-0.04em' }}>
                        {artist.initials}
                      </span>
                      <span className="absolute bottom-0 right-0 select-none pointer-events-none" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '9rem', lineHeight: 0.85, color: ACCENT, opacity: 0.04 }}>
                        {artist.initials}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 p-4" style={{ backgroundColor: BG_ALT, borderTop: `1px solid ${BORDER}` }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1rem', color: TEXT, lineHeight: 1.2 }}>
                    {artist.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: MUTED }}>
                    {artist.release} · {artist.year}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── 4. Aulas ── */}
      <section
        className="py-section"
        style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}
        ref={aulasRef}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-16 items-start">

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={aulasInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <p style={{ fontFamily: 'var(--font-ui)', color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Ensino
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: TEXT, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
                Aprenda na fonte.
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', color: MUTED, lineHeight: 1.7, maxWidth: '36ch', marginBottom: '2rem' }}>
                Aulas individuais com quem produz música de verdade. Do iniciante que nunca tocou ao músico que quer virar produtor.
              </p>
              <Link
                href="/#contato"
                className="inline-flex items-center gap-2 group/cta text-sm"
                style={{ fontFamily: 'var(--font-ui)', color: ACCENT }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                <span className="transition-transform duration-300 group-hover/cta:translate-x-1">→</span>
                Agendar aula experimental
              </Link>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 gap-px"
              style={{ backgroundColor: BORDER }}
              initial="hidden"
              animate={aulasInView ? 'visible' : 'hidden'}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
            >
              {aulasOpcoes.map((a, i) => (
                <motion.div
                  key={a.instrumento}
                  className="relative overflow-hidden flex flex-col gap-3 p-8"
                  style={{ backgroundColor: BG }}
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
                  }}
                >
                  <span
                    className="absolute -bottom-2 -right-1 select-none pointer-events-none"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '5rem', lineHeight: 1, color: ACCENT, opacity: 0.04 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: TEXT, lineHeight: 1 }}>
                    {a.instrumento}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', color: MUTED, fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '40ch' }}>
                    {a.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 5. Distribuição & Burocrática ── */}
      <section
        className="py-section"
        style={{ backgroundColor: BG_ALT, borderTop: `1px solid ${BORDER}` }}
        ref={distRef}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={distInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <p style={{ fontFamily: 'var(--font-ui)', color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Distribuição & Registro
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: TEXT, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
                A parte burocrática do seu som.
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', color: MUTED, lineHeight: 1.7, maxWidth: '36ch' }}>
                Registro de ISRC, distribuição para mais de 150 plataformas e toda a parte administrativa que você não quer ter que aprender.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-px"
              style={{ backgroundColor: BORDER }}
              initial="hidden"
              animate={distInView ? 'visible' : 'hidden'}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
            >
              {[
                { titulo: 'ISRC', desc: 'Código internacional para identificação de cada faixa.' },
                { titulo: '150+', desc: 'Plataformas de distribuição — Spotify, Apple Music, Deezer e mais.' },
                { titulo: 'UPC / EAN', desc: 'Código de barras do álbum para distribuição física e digital.' },
              ].map(item => (
                <motion.div
                  key={item.titulo}
                  className="flex flex-col gap-3 p-8"
                  style={{ backgroundColor: BG_ALT }}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.8rem', color: ACCENT, lineHeight: 1 }}>
                    {item.titulo}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', color: MUTED, fontSize: '0.85rem', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 6. CTA ── */}
      <section
        className="py-section"
        style={{ backgroundColor: ACCENT }}
        ref={ctaRef}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p style={{ fontFamily: 'var(--font-ui)', color: 'oklch(97% 0.008 88 / 0.65)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              Próximo passo
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: 'oklch(97% 0.008 88)', lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '3rem' }}>
              Por onde você começa?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ backgroundColor: 'oklch(97% 0.008 88 / 0.15)' }}>
              {[
                { label: 'Gravar', desc: 'Tem um projeto musical e quer produzir com qualidade.', cta: 'Falar sobre gravação' },
                { label: 'Aprender', desc: 'Quer começar do zero ou evoluir no instrumento ou na produção.', cta: 'Agendar aula experimental' },
                { label: 'Lançar', desc: 'Já tem a música gravada e quer distribuir e registrar.', cta: 'Falar sobre distribuição' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href="/#contato"
                  className="group flex flex-col gap-4 p-8 transition-colors duration-200"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'oklch(97% 0.008 88 / 0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: 'oklch(97% 0.008 88)', lineHeight: 1 }}>
                    {item.label}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', color: 'oklch(97% 0.008 88 / 0.7)', fontSize: '0.9rem', lineHeight: 1.6, flexGrow: 1 }}>
                    {item.desc}
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm transition-gap duration-200"
                    style={{ fontFamily: 'var(--font-ui)', color: 'oklch(97% 0.008 88)', fontSize: '0.8rem' }}
                  >
                    {item.cta}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              ))}
            </div>

          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
