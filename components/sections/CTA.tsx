"use client"

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-section bg-background border-t border-border" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12">

        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <h2 className="font-display font-black text-4xl lg:text-5xl text-foreground leading-tight tracking-headline mb-4">
            Pronto para criar algo junto?
          </h2>

          <p className="font-body text-lg text-foreground-muted mb-10">
            Conta pra gente o que você tem em mente.
          </p>

          <button
            onClick={() => scrollToSection('contato')}
            className="font-ui text-sm font-medium px-8 py-3 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors duration-200"
          >
            Entrar em contato
          </button>
        </motion.div>

      </div>
    </section>
  );
}
