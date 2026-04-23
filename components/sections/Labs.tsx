"use client"

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const labs = [
  {
    number: '01',
    name: 'Poker Pay',
    tagline: 'Cash game sem papel, sem confusão.',
    description:
      'Gerenciador de cash game e torneios de poker — controle de fichas, entradas, reentradas e pagamentos em tempo real.',
    href: '/labs/poker-pay',
    status: 'Em uso',
  },
  {
    number: '02',
    name: 'Fidelidade Digital',
    tagline: 'Cartão fidelidade no celular do cliente.',
    description:
      'Crie e gerencie programas de fidelidade digitais para qualquer negócio. Sem papel, sem app — funciona direto no navegador.',
    href: '/labs/fidelidade',
    status: 'Em uso',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export default function Labs() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <section id="labs" className="py-section bg-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-12" ref={ref}>

        {/* Cabeçalho */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div>
            <p className="font-ui text-xs tracking-editorial text-foreground-muted uppercase mb-3">
              DAMA Labs
            </p>
            <h2 className="font-display font-black text-2xl lg:text-3xl text-foreground leading-tight tracking-headline">
              Ideias que a gente coloca pra rodar.
            </h2>
          </div>

          <Link
            href="/labs"
            className="shrink-0 font-ui text-xs tracking-editorial text-foreground-muted uppercase hover:text-foreground transition-colors duration-200 self-start sm:self-auto"
          >
            Ver todos →
          </Link>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {labs.map((lab) => (
            <motion.div key={lab.number} variants={cardVariants} className="flex">
              <Link href={lab.href} className="group flex w-full focus-visible:outline-none">
                <div className="relative flex flex-col w-full min-h-[18rem] lg:min-h-[22rem] p-8 lg:p-10 overflow-hidden border border-border hover:border-border-strong transition-colors duration-300 bg-accent-subtle">

                  {/* Traço de acento no topo */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-foreground-subtle group-hover:bg-foreground transition-colors duration-300" />

                  {/* Badge de status */}
                  <span className="self-start font-ui text-2xs tracking-editorial uppercase px-2 py-1 border border-border text-foreground-subtle mb-6">
                    {lab.status}
                  </span>

                  {/* Número decorativo */}
                  <span
                    className="absolute top-5 right-7 select-none pointer-events-none font-display font-black leading-none text-7xl lg:text-8xl text-foreground/5 group-hover:text-foreground/10 transition-colors duration-300"
                    aria-hidden="true"
                  >
                    {lab.number}
                  </span>

                  {/* Conteúdo */}
                  <div className="relative z-10 flex flex-col flex-1">
                    <h3 className="font-display font-black text-2xl lg:text-3xl text-foreground leading-tight group-hover:text-accent transition-colors duration-300">
                      {lab.name}
                    </h3>

                    <p className="font-body italic text-base text-foreground-muted mt-2 leading-snug">
                      {lab.tagline}
                    </p>

                    <p className="font-ui text-sm text-foreground-subtle mt-4 leading-relaxed max-w-[28ch]">
                      {lab.description}
                    </p>
                  </div>

                  {/* Rodapé */}
                  <div className="relative z-10 border-t border-border pt-5 mt-8">
                    <span className="inline-flex items-center gap-2 font-ui text-sm text-foreground-muted group-hover:text-foreground transition-colors duration-200">
                      Abrir
                      <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
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
