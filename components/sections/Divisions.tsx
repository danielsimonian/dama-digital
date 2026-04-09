"use client"

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

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

  const current = divisions[active];

  return (
    <section id="divisoes" className="py-section bg-background" ref={ref}>
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
            {divisions.map((div, i) => (
              <button
                key={div.number}
                onMouseEnter={() => setActive(i)}
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
                  className={`
                    font-display font-black leading-tight whitespace-nowrap
                    text-xl lg:text-2xl xl:text-3xl
                    transition-colors duration-200
                    ${active === i ? 'text-foreground' : 'text-foreground-muted'}
                  `}
                >
                  {div.name}
                </span>

                {/* Seta (desktop, quando ativo) */}
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
            ))}
          </div>

          {/* Painel direito — detalhes da divisão ativa */}
          <div className="lg:w-[62%] relative overflow-hidden lg:pl-12 lg:py-2">
            <AnimatePresence mode="wait">
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

                {/* Conteúdo */}
                <div className="relative z-10 flex flex-col gap-6 lg:gap-8 h-full justify-center">

                  {/* Eyebrow da divisão */}
                  <span className={`font-ui text-xs tracking-editorial uppercase ${current.textColor}`}>
                    Divisão {current.number}
                  </span>

                  {/* Nome grande */}
                  <h2 className="font-display font-black text-4xl lg:text-5xl xl:text-6xl text-foreground leading-none tracking-headline">
                    {current.name}
                  </h2>

                  {/* Anchor */}
                  <p className="font-body italic text-foreground-muted text-lg lg:text-xl leading-snug max-w-[32ch]">
                    {current.anchor}
                  </p>

                  {/* Separador + Descrição */}
                  <div className={`border-t pt-6 ${current.borderColor} border-opacity-30`}>
                    <p className="font-ui text-sm text-foreground-subtle leading-relaxed max-w-[42ch]">
                      {current.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <Link
                    href={current.href}
                    className={`
                      inline-flex items-center gap-2
                      font-ui text-sm font-medium
                      ${current.textColor}
                      transition-gap duration-200
                      group/cta w-fit
                    `}
                  >
                    Conheça a {current.name}
                    <span className="transition-transform duration-300 group-hover/cta:translate-x-1.5">→</span>
                  </Link>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
