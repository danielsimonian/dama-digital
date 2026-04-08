"use client"

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const BG     = 'oklch(7% 0.012 148)';
const BG_ALT = 'oklch(5% 0.015 148)';
const BORDER = 'oklch(20% 0.04 148)';
const TEXT   = 'oklch(93% 0.008 88)';
const MUTED  = 'oklch(50% 0.03 85)';

const studioArtists = [
  { name: 'Fernando Silveyra', genre: 'MPB' },
  { name: 'Fábio Zulli',       genre: 'Músicas Infantis' },
  { name: 'Raffa Pereira',     genre: 'MPB & Jazz' },
  { name: 'SAID',              genre: 'Pop Music' },
];

const services = [
  { num: '01', name: 'Aulas de Música',     desc: 'Violão e guitarra para todos os níveis, do iniciante ao avançado.' },
  { num: '02', name: 'Gravação',            desc: 'Estúdio profissional com tratamento acústico e equipamentos de alto padrão.' },
  { num: '03', name: 'Mixagem',             desc: 'Equilíbrio e espacialidade para cada elemento da sua música.' },
  { num: '04', name: 'Masterização',        desc: 'Finalização em padrão de mercado, pronta para qualquer plataforma.' },
  { num: '05', name: 'Distribuição Digital',desc: 'Spotify, Apple Music, Deezer e mais de 150 plataformas.' },
  { num: '06', name: 'Produção Musical',    desc: 'Do conceito ao lançamento — arranjo, identidade e direção sonora.' },
];

const PULSE_DURATION = 4500;

function PulsingText({
  texts,
  onIndexChange,
}: {
  texts: string[];
  onIndexChange?: (i: number) => void;
}) {
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
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <motion.span
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {text}
    </motion.span>
  );
}

export default function DamaStudioPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const manifestoRef = useRef<HTMLDivElement>(null);
  const manifestoInView = useInView(manifestoRef, { once: true, margin: '-8% 0px' });

  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: '-8% 0px' });

  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: '-10% 0px' });

  return (
    <>
      <Header />

      {/* ── Seção 1: Hero ── */}
      <section
        style={{ position: 'relative', height: '100dvh', overflow: 'hidden', backgroundColor: BG }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/studio-placeholder.mp4"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'oklch(7% 0.012 148 / 0.78)' }} />

        {/* Número decorativo */}
        <span
          className="absolute select-none pointer-events-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '18vw',
            color: 'var(--color-studio)',
            opacity: 0.04,
            bottom: '-2rem',
            right: 0,
            lineHeight: 1,
          }}
        >
          03
        </span>

        <div className="absolute inset-0 flex flex-col justify-center">
          <div className="container mx-auto px-6 lg:px-12">

            <p
              className="mb-6"
              style={{
                fontFamily: 'var(--font-ui)',
                color: 'var(--color-studio)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              DAMA Studio
            </p>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(3rem, 8vw, 7.5rem)',
                color: TEXT,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                minHeight: '1.1em',
              }}
            >
              <PulsingText
                texts={studioArtists.map((a) => a.name)}
                onIndexChange={setActiveIndex}
              />
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--color-studio)',
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                marginTop: '1rem',
                minHeight: '1.8em',
                letterSpacing: '0.04em',
              }}
            >
              <GenreFade text={studioArtists[activeIndex].genre} />
            </p>

          </div>
        </div>
      </section>

      {/* ── Seção 2: Número de impacto + manifesto ── */}
      <section
        className="py-section"
        style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}
        ref={manifestoRef}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-center">

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={manifestoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 'clamp(5rem, 12vw, 11rem)',
                  color: 'var(--color-studio)',
                  lineHeight: 1,
                }}
              >
                5+
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', color: MUTED, fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.5rem' }}>
                anos de estúdio
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col gap-6"
              initial={{ opacity: 0, x: 40 }}
              animate={manifestoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            >
              <h2
                className="text-3xl lg:text-4xl leading-tight"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: TEXT }}
              >
                Cada música tem uma história. A gente ajuda a contar a sua.
              </h2>
              <p
                className="text-base leading-relaxed max-w-lg"
                style={{ fontFamily: 'var(--font-body)', color: MUTED }}
              >
                Do aprendizado à produção profissional, oferecemos o ambiente e a expertise para que sua música chegue onde merece — nas plataformas, nos palcos, nas pessoas.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Seção 3: Serviços ── */}
      <section
        className="py-section"
        style={{ backgroundColor: BG_ALT, borderTop: `1px solid ${BORDER}` }}
        ref={servicesRef}
      >
        <div className="container mx-auto px-6 lg:px-12">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={servicesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-studio)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              O que a gente faz
            </p>
            <h2
              className="text-3xl lg:text-4xl leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: TEXT }}
            >
              Do ensino ao lançamento.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px mt-12"
            style={{ backgroundColor: BORDER }}
            initial="hidden"
            animate={servicesInView ? 'visible' : 'hidden'}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
          >
            {services.map((s) => (
              <motion.div
                key={s.num}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                }}
                className="relative overflow-hidden flex flex-col gap-3 p-8"
                style={{ backgroundColor: BG_ALT }}
              >
                {/* Número decorativo */}
                <span
                  className="absolute -bottom-3 -right-1 select-none pointer-events-none"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: '6rem',
                    lineHeight: 1,
                    color: 'var(--color-studio)',
                    opacity: 0.04,
                  }}
                >
                  {s.num}
                </span>

                <span style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-studio)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>
                  {s.num}
                </span>
                <h3
                  className="text-xl lg:text-2xl leading-tight"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: TEXT }}
                >
                  {s.name}
                </h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)', color: MUTED }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── Seção 4: CTA ── */}
      <section
        className="py-section"
        style={{ backgroundColor: 'var(--color-studio)' }}
        ref={ctaRef}
      >
        <div className="container mx-auto px-6 lg:px-12">

          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, x: -40 }}
            animate={ctaInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p style={{ fontFamily: 'var(--font-ui)', color: 'oklch(97% 0.008 88)', opacity: 0.7, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              Próximo passo
            </p>

            <h2
              className="text-4xl lg:text-5xl leading-tight mb-4"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'oklch(97% 0.008 88)' }}
            >
              Pronto para gravar?
            </h2>

            <p
              className="text-lg mb-10"
              style={{ fontFamily: 'var(--font-body)', color: 'oklch(97% 0.008 88 / 0.75)' }}
            >
              Agende sua aula experimental ou sessão de gravação.
            </p>

            <Link
              href="/#contato"
              className="inline-block text-sm font-medium px-8 py-3 transition-colors duration-200"
              style={{
                fontFamily: 'var(--font-ui)',
                border: '1px solid rgba(255,255,255,0.8)',
                color: 'oklch(97% 0.008 88)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'oklch(97% 0.008 88)';
                e.currentTarget.style.color = 'var(--color-studio)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'oklch(97% 0.008 88)';
              }}
            >
              Entrar em contato
            </Link>
          </motion.div>

        </div>
      </section>

      <Footer />
    </>
  );
}
