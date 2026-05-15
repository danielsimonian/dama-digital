"use client"

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { clients } from '@/lib/constants';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Portfolio() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <section id="portfolio" className="py-section bg-background border-t border-border scroll-mt-8">
      <div className="container mx-auto px-6 lg:px-12" ref={ref}>

        <motion.div
          className="mb-10"
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
          className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6 md:gap-10 lg:gap-12"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {clients.map((client) => (
            <motion.div
              key={client.name}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
              }}
              className="group flex items-center justify-center"
            >
              <div
                className="w-full aspect-square shrink-0 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                style={{ border: '1px solid oklch(80% 0.01 58)', backgroundColor: 'oklch(90% 0.01 58)' }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    fill
                    className="object-contain transition-opacity duration-300 opacity-85 group-hover:opacity-100"
                    sizes="(max-width: 768px) 30vw, 15vw"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
