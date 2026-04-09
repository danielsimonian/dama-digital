"use client"

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const founders = [
  {
    name: 'Daniel Simonian',
    role: 'CEO & Produtor Musical',
    bio: 'Produtor musical e desenvolvedor. Une tecnologia e criatividade há mais de dez anos — do código à mixagem.',
    photo: '/images/daniel.png',
  },
  {
    name: 'Marcella Lima',
    role: 'CEO & Filmmaker',
    bio: 'Diretora criativa especializada em storytelling visual. Transforma conceitos em narrativas que emocionam e geram resultado.',
    photo: '/images/marcella.png',
  },
];

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <section
      id="sobre"
      className="lg:min-h-screen flex flex-col py-12 lg:py-16 bg-background border-t border-border scroll-mt-8"
    >
      <div className="container mx-auto px-6 lg:px-12 flex-1 flex flex-col" ref={ref}>

        {/* Título + subtítulo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <h2 className="font-display font-black text-2xl lg:text-3xl text-foreground leading-tight tracking-headline">
            Uma produtora construída por quem vive o que faz.
          </h2>

          <p className="font-body text-sm lg:text-base text-foreground-muted mt-4 leading-relaxed">
            Mais de dez anos no audiovisual, no esporte e na música — não como espectadores,
            mas como produtores.
          </p>
        </motion.div>

        {/* Fundadores */}
        <motion.div
          className="grid grid-cols-2 gap-4 lg:gap-8 mt-10 border-t border-border pt-8 flex-1"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}
        >
          {founders.map((founder) => (
            <motion.div
              key={founder.name}
              className="flex flex-col"
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
              }}
            >
              <div className="relative aspect-square w-32 lg:w-44 overflow-hidden rounded-full mb-4 ring-1 ring-border">
                <Image
                  src={founder.photo}
                  alt={founder.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 128px, 176px"
                />
              </div>

              <p className="font-display font-bold text-base lg:text-lg text-foreground">
                {founder.name}
              </p>
              <p className="font-ui text-xs tracking-editorial uppercase text-foreground-muted mt-0.5 mb-2">
                {founder.role}
              </p>
              <p className="font-body text-xs lg:text-sm text-foreground-muted leading-relaxed">
                {founder.bio}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
