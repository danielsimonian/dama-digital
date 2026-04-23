"use client"

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { clients } from '@/lib/constants';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export default function Portfolio() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <section id="portfolio" className="lg:min-h-screen flex flex-col py-12 lg:py-16 bg-background border-t border-border scroll-mt-8">
      <div className="container mx-auto px-6 lg:px-12 flex-1 flex flex-col" ref={ref}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <p className="font-ui text-xs tracking-editorial text-foreground-muted uppercase mb-4">
            Quem já confiou
          </p>
          <h2 className="font-display font-black text-2xl lg:text-3xl text-foreground leading-tight tracking-headline">
            Marcas que acreditam no que a gente faz.
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 md:grid-cols-5 gap-6 md:gap-14 lg:gap-20 items-center flex-1 mt-10 content-start w-fit mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {clients.map((client) => (
            <motion.div
              key={client.name}
              variants={itemVariants}
              className="group flex items-center justify-center"
            >
              <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 shrink-0 rounded-full border border-border bg-accent-subtle flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={client.logo}
                  alt={client.name}
                  fill
                  className="object-cover transition-opacity duration-300 opacity-80 group-hover:opacity-100"
                  sizes="(max-width: 768px) 20vw, 10vw"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
