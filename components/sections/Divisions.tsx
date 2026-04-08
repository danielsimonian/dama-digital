"use client"

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const divisions = [
  {
    number: '01',
    name: 'DAMA Sports',
    anchor: 'Do sorteio ao pódio, a gente cuida.',
    description:
      'Produção completa de eventos de beach tennis: arbitragem, locação de som, troféus, filmagem e fotografia.',
    href: '/sports',
    cardBg: 'bg-sports-subtle',
    ruleBg: 'bg-sports',
    numberColor: 'text-sports/25 group-hover:text-sports/50',
    accentHover: 'group-hover:text-sports',
    borderHover: 'group-hover:border-sports/50',
  },
  {
    number: '02',
    name: 'DAMA Tech',
    anchor: 'Software que cabe no seu dia a dia.',
    description:
      'Websites, sistemas sob medida e aplicativos — do conceito ao lançamento.',
    href: '/tech',
    cardBg: 'bg-tech-subtle',
    ruleBg: 'bg-tech',
    numberColor: 'text-tech/25 group-hover:text-tech/50',
    accentHover: 'group-hover:text-tech',
    borderHover: 'group-hover:border-tech/50',
  },
  {
    number: '03',
    name: 'DAMA Studio',
    anchor: 'Sua música soa do jeito que merece.',
    description:
      'Aulas de violão e guitarra, gravação, mixagem, masterização e distribuição digital.',
    href: '/studio',
    cardBg: 'bg-studio-subtle',
    ruleBg: 'bg-studio',
    numberColor: 'text-studio/25 group-hover:text-studio/50',
    accentHover: 'group-hover:text-studio',
    borderHover: 'group-hover:border-studio/50',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

export default function Divisions() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <section id="divisoes" className="py-section bg-background">
      <div className="container mx-auto px-6 lg:px-12" ref={ref}>

        {/* Eyebrow */}
        <motion.p
          className="font-ui text-xs tracking-editorial text-foreground-muted uppercase mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
        >
          Nossas Divisões
        </motion.p>

        {/* Grid de cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {divisions.map((div) => (
            <motion.div key={div.number} variants={cardVariants} className="flex">
              <Link href={div.href} className="group flex w-full focus-visible:outline-none">
                <div
                  className={`
                    relative flex flex-col w-full min-h-[22rem] lg:min-h-[28rem]
                    p-8 lg:p-10 overflow-hidden
                    border border-white/8 transition-colors duration-300
                    ${div.cardBg} ${div.borderHover}
                  `}
                >
                  {/* Régua de acento — topo do card */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${div.ruleBg}`} />

                  {/* Número decorativo — canto superior direito */}
                  <span
                    className={`
                      absolute top-5 right-7 select-none pointer-events-none
                      font-display font-black leading-none
                      text-7xl lg:text-8xl
                      transition-colors duration-300
                      ${div.numberColor}
                    `}
                    aria-hidden="true"
                  >
                    {div.number}
                  </span>

                  {/* Conteúdo */}
                  <div className="relative z-10 flex flex-col flex-1 pt-2">
                    <h2
                      className={`
                        font-display font-black text-2xl lg:text-3xl
                        text-foreground leading-tight
                        transition-colors duration-300
                        ${div.accentHover}
                      `}
                    >
                      {div.name}
                    </h2>

                    <p className="font-body italic text-lg text-foreground-muted mt-3 leading-snug">
                      {div.anchor}
                    </p>

                    <p className="font-ui text-sm text-foreground-subtle mt-4 leading-relaxed max-w-[22ch]">
                      {div.description}
                    </p>
                  </div>

                  {/* Rodapé */}
                  <div className="relative z-10 border-t border-border pt-5 mt-8">
                    <span
                      className={`
                        inline-flex items-center gap-2
                        font-ui text-sm text-foreground-muted
                        transition-colors duration-200
                        ${div.accentHover}
                      `}
                    >
                      Conheça
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
