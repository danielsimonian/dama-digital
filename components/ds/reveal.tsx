'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Revela o bloco uma vez ao entrar na tela; com movimento reduzido, só aparece. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(16px)' }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
