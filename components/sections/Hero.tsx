"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const WORDS = [
  { pronoun: 'Seu', text: 'evento',  color: 'oklch(65% 0.21 33)' },
  { pronoun: 'Seu', text: 'sistema', color: 'oklch(62% 0.22 262)' },
  { pronoun: 'Sua', text: 'música',  color: 'oklch(60% 0.17 148)' },
];

const DIVISIONS = [
  { name: 'DAMA Sports', href: '/sports', color: 'oklch(65% 0.21 33)' },
  { name: 'DAMA Tech',   href: '/tech',   color: 'oklch(62% 0.22 262)' },
  { name: 'DAMA Studio', href: '/studio', color: 'oklch(60% 0.17 148)' },
];

const STATS = [
  { value: '20+', label: 'anos de produção' },
  { value: '3',   label: 'divisões criativas' },
  { value: '100+', label: 'projetos entregues' },
];

export default function Hero() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const pause = setTimeout(() => {
      setVisible(false);
      const next = setTimeout(() => {
        setIdx(i => (i + 1) % WORDS.length);
        setVisible(true);
      }, 380);
      return () => clearTimeout(next);
    }, 3000);
    return () => clearTimeout(pause);
  }, [idx]);

  const word = WORDS[idx];

  return (
    <section
      id="inicio"
      className="relative w-full overflow-hidden"
      style={{ height: '100dvh', background: 'oklch(5% 0.01 0)' }}
    >
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.35 }}
        src="/videos/hero-placeholder.mp4"
      />

      {/* Overlays */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, oklch(4% 0.01 0) 0%, transparent 55%, oklch(4% 0.01 0) 100%)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '12rem', background: 'linear-gradient(to top, oklch(4% 0.01 0), transparent)' }}
      />

      <div className="relative z-10 h-full flex flex-col container mx-auto px-6 lg:px-12 pt-24">

        {/* Centro */}
        <div className="flex-1 flex flex-col justify-center gap-6 lg:gap-8">

          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            className="font-ui text-xs tracking-editorial uppercase"
            style={{ color: 'oklch(45% 0.01 0)' }}
          >
            Agência Criativa · Santos, SP
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            className="font-display font-black leading-[0.9] tracking-headline"
            style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)', color: '#fff' }}
          >
            {word.pronoun}{' '}
            <span style={{ color: visible ? word.color : 'transparent', transition: 'color 0.32s ease' }}>
              {word.text}
            </span>
            <br />
            merece mais.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
            className="font-body text-base lg:text-lg leading-relaxed"
            style={{ color: 'oklch(55% 0.01 0)', maxWidth: '44ch' }}
          >
            Produção de eventos esportivos, desenvolvimento de software e produção musical — tudo sob o mesmo teto.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-2 lg:gap-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.65 }}
          >
            {DIVISIONS.map((div) => (
              <Link
                key={div.name}
                href={div.href}
                className="font-ui text-sm px-4 lg:px-5 py-2.5 border transition-transform duration-200 active:scale-[0.97]"
                style={{
                  borderColor: `${div.color.replace(')', ' / 0.28)')}`,
                  color: div.color,
                  background: `${div.color.replace(')', ' / 0.08)')}`,
                }}
              >
                {div.name} →
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 0.9 }}
          className="pb-8 lg:pb-10 flex items-center gap-8 lg:gap-14 border-t pt-5"
          style={{ borderColor: 'oklch(18% 0.01 0)' }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5">
              <span className="font-display font-black text-xl lg:text-2xl" style={{ color: '#fff' }}>
                {s.value}
              </span>
              <span
                className="font-ui text-[10px] uppercase tracking-editorial"
                style={{ color: 'oklch(38% 0.01 0)' }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
