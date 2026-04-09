"use client"

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { JetBrains_Mono } from 'next/font/google';

const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const TECH_SERVICES = ['_01 Websites', '_02 Sistemas Web', '_03 Aplicativos', '_04 Automações'];

const divisions = [
  {
    number: '01',
    name: 'DAMA Sports',
    anchor: 'Do sorteio ao pódio, a gente cuida.',
    description:
      'Produção completa de eventos de beach tennis: arbitragem, locação de som, troféus, filmagem e fotografia.',
    href: '/sports',
    textColor: 'text-sports',
    borderColor: 'border-sports',
    panelBg: 'bg-sports-subtle',
    dotBg: 'bg-sports',
  },
  {
    number: '02',
    name: 'DAMA Tech',
    anchor: 'Software que cabe no seu dia a dia.',
    description:
      'Websites, sistemas sob medida e aplicativos — do conceito ao lançamento.',
    href: '/tech',
    textColor: 'text-tech',
    borderColor: 'border-tech',
    panelBg: 'bg-tech-subtle',
    dotBg: 'bg-tech',
  },
  {
    number: '03',
    name: 'DAMA Studio',
    anchor: 'Sua música soa do jeito que merece.',
    description:
      'Aulas de violão e guitarra, gravação, mixagem, masterização e distribuição digital.',
    href: '/studio',
    textColor: 'text-studio',
    borderColor: 'border-studio',
    panelBg: 'bg-studio-subtle',
    dotBg: 'bg-studio',
  },
];

export default function Divisions() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' });
  const [active, setActive] = useState(0);
  const [techGlitch, setTechGlitch] = useState(false);

  const current = divisions[active];

  return (
    <section id="divisoes" className="py-section bg-background" ref={ref}>
      {/* Glitch keyframes */}
      <style>{`
        @keyframes div-text-glitch {
          0%   { text-shadow: none; transform: translate(0) skewX(0); }
          8%   { text-shadow: -3px 0 oklch(62% 0.22 382), 3px 0 oklch(62% 0.22 142); transform: translate(-3px,0) skewX(-1deg); }
          16%  { text-shadow: none; transform: translate(3px,1px) skewX(0.5deg); }
          24%  { text-shadow: 2px 0 oklch(62% 0.22 322), -2px 0 oklch(62% 0.22 202); transform: translate(-2px,0); }
          42%  { text-shadow: none; transform: translate(0); }
          100% { text-shadow: none; transform: translate(0) skewX(0); }
        }
        .tech-glitch { animation: div-text-glitch 0.65s steps(1) forwards; }
      `}</style>

      <div className="container mx-auto px-6 lg:px-12">

        {/* Eyebrow */}
        <motion.p
          className="font-ui text-xs tracking-editorial text-foreground-muted uppercase mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
        >
          Nossas Divisões
        </motion.p>

        {/* Layout spotlight */}
        <motion.div
          className="flex flex-col lg:flex-row gap-8 lg:gap-0 lg:min-h-[480px]"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        >

          {/* Coluna esquerda — lista de divisões */}
          <div className="lg:w-[38%] flex flex-col border-t border-border lg:border-r lg:border-b-0 lg:pr-12">
            {divisions.map((div, i) => {
              const isTech = i === 1;

              return (
                <button
                  key={div.number}
                  onMouseEnter={() => {
                    setActive(i);
                    if (isTech && !techGlitch) setTechGlitch(true);
                  }}
                  onClick={() => setActive(i)}
                  className={`
                    group w-full text-left flex items-center gap-5
                    py-6 border-b border-border
                    transition-colors duration-200
                  `}
                >
                  {/* Indicador ativo */}
                  <span
                    className={`
                      flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-300
                      ${active === i ? `${div.dotBg} scale-125` : 'bg-border'}
                    `}
                  />

                  {/* Número */}
                  <span
                    className={`
                      flex-shrink-0 font-ui text-xs tracking-editorial
                      transition-colors duration-200
                      ${active === i ? div.textColor : 'text-foreground-subtle'}
                    `}
                  >
                    {div.number}
                  </span>

                  {/* Nome */}
                  <span
                    onAnimationEnd={() => setTechGlitch(false)}
                    className={`
                      font-display font-black leading-tight whitespace-nowrap
                      text-xl lg:text-2xl xl:text-3xl
                      transition-colors duration-200
                      ${active === i ? 'text-foreground' : 'text-foreground-muted'}
                      ${isTech && techGlitch ? 'tech-glitch' : ''}
                    `}
                  >
                    {div.name}
                  </span>

                  {/* Seta (quando ativo) */}
                  <span
                    className={`
                      ml-auto font-ui text-lg
                      transition-all duration-300
                      ${active === i ? `${div.textColor} opacity-100 translate-x-0` : 'opacity-0 -translate-x-2'}
                    `}
                  >
                    →
                  </span>
                </button>
              );
            })}
          </div>

          {/* Painel direito */}
          <div className="lg:w-[62%] relative overflow-hidden lg:pl-12 lg:py-2">
            <AnimatePresence mode="wait">

              {/* Painel TECH */}
              {active === 1 ? (
                <motion.div
                  key="tech"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className={`${mono.variable} h-full flex flex-col`}
                  style={{
                    background: 'oklch(8% 0.015 262)',
                    border: '1px solid oklch(22% 0.04 262)',
                    borderRadius: '0.25rem',
                    padding: '2rem 2.5rem',
                  }}
                >
                  {/* Número decorativo */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 right-6 font-display font-black leading-none select-none pointer-events-none text-[12rem] lg:text-[18rem] text-tech opacity-[0.04]"
                  >
                    02
                  </span>

                  <div className="relative z-10 flex flex-col gap-5 h-full justify-center">

                    {/* Prompt */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs" style={{ color: 'oklch(62% 0.22 262)', fontFamily: 'var(--font-mono)' }}>
                        ~
                      </span>
                      <span className="font-mono text-sm font-bold" style={{ color: 'oklch(62% 0.22 262)', fontFamily: 'var(--font-mono)' }}>
                        &gt; dama_tech
                      </span>
                      <span
                        className="inline-block w-2 h-4 ml-0.5"
                        style={{ background: 'oklch(62% 0.22 262)', animation: 'blink 1s step-end infinite' }}
                      />
                    </div>

                    {/* Comentário / anchor */}
                    <p
                      className="font-mono text-sm lg:text-base leading-relaxed"
                      style={{ color: 'oklch(45% 0.04 262)', fontFamily: 'var(--font-mono)' }}
                    >
                      {'// '}
                      <span style={{ color: 'oklch(70% 0.03 262)' }}>
                        Software que cabe no seu dia a dia.
                      </span>
                    </p>

                    {/* Separador */}
                    <div style={{ borderTop: '1px solid oklch(22% 0.04 262)' }} />

                    {/* Serviços */}
                    <div className="flex flex-col gap-2">
                      <span
                        className="font-mono text-xs mb-1"
                        style={{ color: 'oklch(38% 0.04 262)', fontFamily: 'var(--font-mono)' }}
                      >
                        {'// o que a gente constrói'}
                      </span>
                      {TECH_SERVICES.map((s) => (
                        <span
                          key={s}
                          className="font-mono text-sm"
                          style={{ color: 'oklch(75% 0.015 262)', fontFamily: 'var(--font-mono)' }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href="/tech"
                      className="inline-flex items-center gap-2 font-mono text-sm font-medium group/cta w-fit mt-2"
                      style={{ color: 'oklch(62% 0.22 262)', fontFamily: 'var(--font-mono)' }}
                    >
                      <span className="transition-transform duration-300 group-hover/cta:translate-x-1">→</span>
                      Conheça a DAMA Tech
                    </Link>
                  </div>
                </motion.div>

              ) : (

                /* Painel padrão (Sports / Studio) */
                <motion.div
                  key={current.number}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="h-full flex flex-col"
                >
                  {/* Número decorativo de fundo */}
                  <span
                    aria-hidden="true"
                    className={`
                      absolute top-0 right-0
                      font-display font-black leading-none select-none pointer-events-none
                      text-[10rem] lg:text-[16rem]
                      ${current.textColor} opacity-[0.06]
                    `}
                  >
                    {current.number}
                  </span>

                  <div className="relative z-10 flex flex-col gap-6 lg:gap-8 h-full justify-center">
                    <span className={`font-ui text-xs tracking-editorial uppercase ${current.textColor}`}>
                      Divisão {current.number}
                    </span>

                    <h2 className="font-display font-black text-4xl lg:text-5xl xl:text-6xl text-foreground leading-none tracking-headline">
                      {current.name}
                    </h2>

                    <p className="font-body italic text-foreground-muted text-lg lg:text-xl leading-snug max-w-[32ch]">
                      {current.anchor}
                    </p>

                    <div className={`border-t pt-6 ${current.borderColor} border-opacity-30`}>
                      <p className="font-ui text-sm text-foreground-subtle leading-relaxed max-w-[42ch]">
                        {current.description}
                      </p>
                    </div>

                    <Link
                      href={current.href}
                      className={`inline-flex items-center gap-2 font-ui text-sm font-medium ${current.textColor} group/cta w-fit`}
                    >
                      Conheça a {current.name}
                      <span className="transition-transform duration-300 group-hover/cta:translate-x-1.5">→</span>
                    </Link>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
