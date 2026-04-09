"use client"

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const divisions = [
  {
    number: '01',
    name: 'DAMA Sports',
    anchor: 'Do sorteio ao pódio.',
    description:
      'Produção completa de eventos de beach tennis: arbitragem, som, troféus, filmagem e fotografia.',
    href: '/sports',
    barHover: 'group-hover:bg-sports',
    nameHover: 'group-hover:text-sports',
    borderHover: 'group-hover:border-sports/40',
  },
  {
    number: '02',
    name: 'DAMA Tech',
    anchor: 'Software que cabe no seu dia a dia.',
    description:
      'Websites, sistemas sob medida e aplicativos — do conceito ao lançamento.',
    href: '/tech',
    barHover: 'group-hover:bg-tech',
    nameHover: 'group-hover:text-tech',
    borderHover: 'group-hover:border-tech/40',
  },
  {
    number: '03',
    name: 'DAMA Studio',
    anchor: 'Sua música soa do jeito que merece.',
    description:
      'Aulas, gravação, mixagem, masterização e distribuição digital.',
    href: '/studio',
    barHover: 'group-hover:bg-studio',
    nameHover: 'group-hover:text-studio',
    borderHover: 'group-hover:border-studio/40',
  },
];

export default function Divisions() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' });

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

        {/* Linhas */}
        <div className="border-t border-border">
          {divisions.map((div, i) => (
            <motion.div
              key={div.number}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.12 }}
            >
              <Link
                href={div.href}
                className={`
                  group flex items-stretch gap-6 lg:gap-10
                  border-b border-border transition-colors duration-300
                  ${div.borderHover}
                  py-7 lg:py-9
                `}
              >
                {/* Barra de acento vertical */}
                <div className="flex-shrink-0 flex items-stretch">
                  <div
                    className={`
                      w-0.5 rounded-full transition-all duration-500
                      bg-border ${div.barHover}
                      opacity-60 group-hover:opacity-100
                    `}
                  />
                </div>

                {/* Número */}
                <span className="flex-shrink-0 font-ui text-xs text-foreground-subtle tracking-editorial self-center w-6">
                  {div.number}
                </span>

                {/* Nome + anchor */}
                <div className="flex-1 min-w-0">
                  <h2
                    className={`
                      font-display font-black leading-none tracking-headline
                      text-3xl sm:text-4xl lg:text-5xl xl:text-6xl
                      text-foreground transition-colors duration-300
                      ${div.nameHover}
                    `}
                  >
                    {div.name}
                  </h2>
                  <p className="font-body italic text-foreground-muted text-sm lg:text-base mt-2 leading-snug">
                    {div.anchor}
                  </p>
                </div>

                {/* Descrição + seta — desktop */}
                <div className="hidden lg:flex flex-col justify-center flex-shrink-0 max-w-[22rem] text-right gap-4">
                  <p className="font-ui text-sm text-foreground-subtle leading-relaxed">
                    {div.description}
                  </p>
                  <span
                    className={`
                      inline-flex items-center justify-end gap-2
                      font-ui text-sm text-foreground-muted
                      transition-colors duration-200
                      ${div.nameHover}
                    `}
                  >
                    Conheça
                    <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
