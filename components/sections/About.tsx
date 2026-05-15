"use client"

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const founders = [
  {
    prefix: 'Da',
    suffix: 'niel Simonian',
    role: 'CEO & Produtor Musical',
    bio: 'Produtor musical e desenvolvedor full-stack. Une tecnologia e criatividade há mais de dez anos — do código à mixagem, das telas às produções ao vivo.',
    photo: '/images/daniel.png',
  },
  {
    prefix: 'Ma',
    suffix: 'rcella Lima',
    role: 'CEO & Filmmaker',
    bio: 'Diretora criativa e produtora de eventos especializada em storytelling visual. Transforma conceitos em narrativas que emocionam e geram resultado.',
    photo: '/images/marcella.png',
  },
];

const stats = [
  { value: '20+',  label: 'anos de produção' },
  { value: '3',    label: 'divisões criativas' },
  { value: '100+', label: 'projetos entregues' },
];

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <section id="sobre" className="py-section bg-background border-t border-border scroll-mt-8">
      <div className="container mx-auto px-6 lg:px-12" ref={ref}>

        {/* Grid principal: texto esquerda · fotos direita */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Esquerda — eyebrow + headline + descrição + stats */}
          <motion.div
            className="flex flex-col gap-8"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div>
              <p className="font-ui text-xs tracking-editorial uppercase text-foreground-muted mb-4">
                Sobre nós
              </p>
              <h2
                className="font-display font-black leading-tight tracking-headline text-foreground"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', maxWidth: '22ch' }}
              >
                Uma produtora construída por quem vive o que faz.
              </h2>
            </div>

            <p className="font-body text-base lg:text-lg text-foreground-muted leading-relaxed" style={{ maxWidth: '52ch' }}>
              Mais de dez anos no audiovisual, no esporte e na música — não como espectadores, mas como produtores. A DAMA nasceu da necessidade de reunir tudo que fazemos bem sob um mesmo teto.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <span className="font-display font-black text-3xl lg:text-4xl text-foreground">
                    {s.value}
                  </span>
                  <span className="font-ui text-[10px] uppercase tracking-editorial text-foreground-muted leading-tight">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Direita — retratos editoriais */}
          <motion.div
            className="grid grid-cols-2 gap-4 lg:gap-5"
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
          >
            {founders.map((founder) => (
              <motion.div
                key={founder.prefix}
                className="flex flex-col gap-3"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
                }}
              >
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: '3/4', background: 'oklch(12% 0.005 0)' }}
                >
                  <Image
                    src={founder.photo}
                    alt={founder.prefix + founder.suffix}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="font-display font-bold text-sm lg:text-base text-foreground">
                    {founder.prefix}{founder.suffix}
                  </p>
                  <p className="font-ui text-[10px] tracking-editorial uppercase text-foreground-muted">
                    {founder.role}
                  </p>
                  <p className="font-body text-xs text-foreground-muted leading-relaxed mt-1.5">
                    {founder.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
