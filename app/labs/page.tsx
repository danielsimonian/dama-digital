"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';
import { JetBrains_Mono } from 'next/font/google';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const BG      = 'oklch(8% 0.015 262)';
const BG_DARK = 'oklch(5% 0.02 262)';
const BORDER  = 'oklch(22% 0.04 262)';
const TEXT    = 'oklch(93% 0.006 58)';
const MUTED   = 'oklch(50% 0.025 262)';
const COMMENT = 'oklch(40% 0.04 262)';
const TECH    = 'var(--color-tech)';

const produtos = [
  {
    num: '_01',
    name: 'Poker Pay',
    tag: 'cash game · torneios · ranking',
    desc: 'Gerenciador completo de cash game e torneios de poker — fichas, entradas, reentradas e pagamentos em tempo real.',
    href: '/labs/poker-pay',
  },
  {
    num: '_02',
    name: 'Fidelidade Digital',
    tag: 'fidelidade · QR code · negócios',
    desc: 'Cartão fidelidade digital para qualquer negócio. Sem papel, sem app, direto no celular do cliente via QR Code.',
    href: '/labs/fidelidade',
  },
];

export default function LabsPage() {
  return (
    <div className={jetbrains.variable} style={{ backgroundColor: BG_DARK, color: TEXT, minHeight: '100vh' }}>
      <Header />

      {/* ── Hero ── */}
      <section style={{ backgroundColor: BG_DARK, borderBottom: `1px solid ${BORDER}`, paddingTop: '10rem', paddingBottom: '6rem' }}>
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            className="flex flex-col items-start gap-6 max-w-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {/* label mono */}
            <p style={{ fontFamily: 'var(--font-mono)', color: TECH, fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              // experimentos em produção
            </p>

            {/* Título com frasco */}
            <h1
              className="flex items-end gap-4 leading-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(3rem, 8vw, 5.5rem)', color: TEXT }}
            >
              DAMA Labs

              {/* Flask icon */}
              <span
                className="inline-flex items-center justify-center"
                style={{
                  width: '0.82em',
                  height: '0.82em',
                  flexShrink: 0,
                  transform: 'translateY(-0.1em)',
                  filter: 'drop-shadow(-12px 0px 16px oklch(62% 0.22 262 / 0.6))',
                }}
              >
                <svg viewBox="0 0 28 33" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <clipPath id="flask-clip-hero">
                      <path d="M 10 3 L 18 3 L 18 11 L 23 26 Q 24 32 14 32 Q 4 32 5 26 L 10 11 Z" />
                    </clipPath>
                  </defs>

                  {/* Líquido */}
                  <rect x="0" y="16" width="28" height="18" fill="var(--color-tech)" fillOpacity={0.28} clipPath="url(#flask-clip-hero)" />

                  {/* Bolinhas na superfície */}
                  <g clipPath="url(#flask-clip-hero)">
                    {[
                      { cx: 11,   r: 0.55, delay: 0,    dur: 2.4 },
                      { cx: 13,   r: 0.75, delay: 0.4,  dur: 3.0 },
                      { cx: 14.5, r: 0.45, delay: 0.9,  dur: 2.1 },
                      { cx: 16,   r: 0.65, delay: 0.2,  dur: 2.7 },
                      { cx: 17.5, r: 0.5,  delay: 1.3,  dur: 2.3 },
                    ].map((b, i) => (
                      <motion.circle
                        key={`surf-hero-${i}`}
                        cx={b.cx} r={b.r}
                        fill="none" stroke="var(--color-tech)" strokeWidth={0.5}
                        animate={{ cy: [17.5, 15.5, 16.5, 15, 16, 17.5], opacity: [0, 0.6, 0.6, 0.6, 0.6, 0] }}
                        transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    ))}
                  </g>

                  {/* Borbulhas internas */}
                  <g clipPath="url(#flask-clip-hero)">
                    {[
                      { cx: 10, cy: 30, r: 0.6, delay: 0,    dur: 1.3 },
                      { cx: 14, cy: 29, r: 0.4, delay: 0.45, dur: 1.0 },
                      { cx: 18, cy: 31, r: 0.7, delay: 0.9,  dur: 1.5 },
                      { cx: 12, cy: 27, r: 0.5, delay: 1.3,  dur: 1.1 },
                      { cx: 16, cy: 28, r: 0.35,delay: 0.65, dur: 0.95 },
                    ].map((b, i) => (
                      <motion.circle
                        key={`inner-hero-${i}`}
                        cx={b.cx} r={b.r}
                        fill="none" stroke="var(--color-tech)" strokeWidth={0.5}
                        animate={{ cy: [b.cy, 17, 17, b.cy], opacity: [0, 0.65, 0, 0] }}
                        transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeOut', times: [0, 0.78, 0.92, 1] }}
                      />
                    ))}
                  </g>

                  {/* Bolhas que sobem e estouram */}
                  {[
                    { cx: 12, delay: 0,    r: 0.8 },
                    { cx: 14, delay: 0.85, r: 1.5 },
                    { cx: 16, delay: 1.7,  r: 1.1 },
                  ].map((b, i) => (
                    <motion.circle
                      key={`rise-hero-${i}`}
                      cx={b.cx} r={b.r}
                      stroke="var(--color-tech)" strokeWidth={0.7} fill="none"
                      animate={{
                        cy:      [16,   -18,   -18,  -18,   -18,   16],
                        r:       [b.r,  b.r,   b.r,  b.r,     8,  b.r],
                        opacity: [0.9,  0.9,     0,  0.55,    0,    0],
                      }}
                      transition={{ duration: 2.8, delay: b.delay, repeat: Infinity, ease: 'easeOut', times: [0, 0.60, 0.68, 0.69, 0.84, 1] }}
                    />
                  ))}

                  {/* Contorno */}
                  <path
                    d="M 10 3 L 18 3 L 18 11 L 23 26 Q 24 32 14 32 Q 4 32 5 26 L 10 11 Z"
                    stroke="var(--color-tech)" strokeWidth={0.9} strokeLinejoin="round"
                  />
                </svg>
              </span>
            </h1>

            <p style={{ fontFamily: 'var(--font-body)', color: MUTED, fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '38rem' }}>
              Ideias que a gente coloca pra rodar — produtos internos que podem virar o próximo projeto da sua empresa.
            </p>

            <p style={{ fontFamily: 'var(--font-mono)', color: COMMENT, fontSize: '0.72rem' }}>
              {'// acesso livre — sem login'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Produtos ── */}
      <section style={{ backgroundColor: BG }}>
        <div className="container mx-auto px-6 lg:px-12 py-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: 'var(--font-mono)', color: TECH, fontSize: '0.7rem', marginBottom: '2.5rem' }}
          >
            // em produção
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ backgroundColor: BORDER }}>
            {produtos.map((p, i) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: EASE }}
              >
                <Link href={p.href} className="group block h-full" style={{ backgroundColor: BG }}>
                  <div className="p-8 lg:p-10 h-full flex flex-col gap-5 transition-colors duration-300" style={{ borderTop: `2px solid transparent` }}>

                    {/* num + tag */}
                    <div className="flex items-center justify-between">
                      <span style={{ fontFamily: 'var(--font-mono)', color: TECH, fontSize: '0.72rem' }}>
                        {p.num}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: COMMENT, fontSize: '0.65rem' }}>
                        {p.tag}
                      </span>
                    </div>

                    {/* nome */}
                    <h2
                      className="group-hover:text-[var(--color-tech)] transition-colors duration-300"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: TEXT }}
                    >
                      {p.name}
                    </h2>

                    {/* descrição */}
                    <p style={{ fontFamily: 'var(--font-body)', color: MUTED, lineHeight: 1.65, fontSize: '0.95rem', flexGrow: 1 }}>
                      {p.desc}
                    </p>

                    {/* CTA */}
                    <div
                      className="flex items-center gap-2 group-hover:gap-3 transition-all duration-300"
                      style={{ fontFamily: 'var(--font-mono)', color: TECH, fontSize: '0.78rem' }}
                    >
                      abrir app
                      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Em construção ── */}
      <section style={{ backgroundColor: BG_DARK, borderTop: `1px solid ${BORDER}` }}>
        <div className="container mx-auto px-6 lg:px-12 py-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: 'var(--font-mono)', color: COMMENT, fontSize: '0.7rem', marginBottom: '2.5rem' }}
          >
            // em construção
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ backgroundColor: BORDER }}>
            {['_03', '_04', '_05'].map((num, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8"
                style={{ backgroundColor: BG_DARK }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', color: COMMENT, fontSize: '0.72rem', display: 'block', marginBottom: '1rem' }}>
                  {num}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: BORDER }}>
                  [redacted]
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Voltar ── */}
      <section style={{ backgroundColor: BG_DARK, borderTop: `1px solid ${BORDER}`, paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="container mx-auto px-6 lg:px-12">
          <Link
            href="/tech"
            className="inline-flex items-center gap-2 transition-colors duration-300"
            style={{ fontFamily: 'var(--font-mono)', color: COMMENT, fontSize: '0.75rem' }}
          >
            <span style={{ color: TECH }}>←</span> voltar para DAMA Tech
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
