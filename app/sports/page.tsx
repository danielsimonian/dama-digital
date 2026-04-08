"use client"

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const services = [
  { number: '01', name: 'Arbitragem', description: 'Árbitros certificados para torneios de beach tennis de qualquer porte.' },
  { number: '02', name: 'Locação de Som', description: 'Sistema de áudio profissional com operador incluso.' },
  { number: '03', name: 'Troféus & Medalhas', description: 'Produção personalizada com identidade visual do evento.' },
  { number: '04', name: 'Fotografia', description: 'Cobertura fotográfica profissional do início ao fim.' },
  { number: '05', name: 'Filmagem & Drone', description: 'Vídeo cinematográfico e imagens aéreas do evento.' },
  { number: '06', name: 'Estrutura Completa', description: 'Treliças, pódio, staff e tudo que o evento precisa.' },
];

const clients = [
  { name: 'ASSESP', logo: '/images/clients/assesp.jpeg' },
  { name: 'RONYMOTORS', logo: '/images/clients/rony.png' },
  { name: 'SPFC', logo: '/images/clients/spfc.png' },
  { name: 'TOMBEACH', logo: '/images/clients/tombeach.png' },
  { name: 'OPENSP', logo: '/images/clients/opensp.webp' },
  { name: 'HYDRA', logo: '/images/clients/hydra.png' },
  { name: 'GENIAL', logo: '/images/clients/genial.png' },
];

export default function DamaSportsPage() {
  const manifestoRef = useRef<HTMLDivElement>(null);
  const manifestoInView = useInView(manifestoRef, { once: true, margin: '-8% 0px' });

  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: '-8% 0px' });

  const clientsRef = useRef<HTMLDivElement>(null);
  const clientsInView = useInView(clientsRef, { once: true, margin: '-8% 0px' });

  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: '-10% 0px' });

  return (
    <>
      <Header />

      {/* ── Seção 1: Hero com vídeo ── */}
      <section style={{ position: 'relative', height: '100dvh', overflow: 'hidden' }}>
        {/* TODO: substituir pelo vídeo real dos torneios da DAMA Sports */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/sports-placeholder.mp4"
        />

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'oklch(10% 0.008 50 / 0.55)' }}
        />

        {/* Conteúdo */}
        <div className="absolute inset-0 flex flex-col justify-end pb-16 lg:pb-24">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div
              className="flex flex-col gap-0"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
            >
              <motion.p
                className="font-ui text-xs tracking-editorial uppercase mb-4"
                style={{ color: 'var(--color-sports)' }}
                variants={{ hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } } }}
              >
                DAMA Sports
              </motion.p>

              <motion.h1
                className="font-display font-black leading-none tracking-headline"
                style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)', color: 'oklch(97% 0.006 58)' }}
                variants={{ hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } } }}
              >
                Do sorteio ao pódio.
              </motion.h1>

              <motion.p
                className="font-body text-lg mt-6 max-w-2xl"
                style={{ color: 'oklch(93% 0.006 58 / 0.75)' }}
                variants={{ hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } } }}
              >
                Produção completa de eventos de beach tennis.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Seção 2: Número de impacto + manifesto ── */}
      <section
        className="py-section"
        style={{ backgroundColor: 'oklch(97% 0.006 58)', color: 'oklch(10% 0.008 50)' }}
        ref={manifestoRef}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-20 items-center">

            {/* Número */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={manifestoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <p
                className="font-display font-black leading-none"
                style={{ fontSize: 'clamp(6rem, 15vw, 14rem)', color: 'var(--color-sports)' }}
              >
                10+
              </p>
              <p
                className="font-ui text-xs tracking-editorial uppercase mt-2"
                style={{ color: 'oklch(50% 0.01 58)' }}
              >
                anos de produção
              </p>
            </motion.div>

            {/* Texto */}
            <motion.div
              className="flex flex-col gap-6"
              initial={{ opacity: 0, x: 40 }}
              animate={manifestoInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            >
              <h2
                className="font-display font-black text-3xl lg:text-4xl leading-tight"
                style={{ color: 'oklch(10% 0.008 50)' }}
              >
                Cada torneio é uma produção. Nós cuidamos de cada detalhe.
              </h2>
              <p
                className="font-body text-base leading-relaxed max-w-lg"
                style={{ color: 'oklch(40% 0.01 58)' }}
              >
                Da arbitragem à cobertura audiovisual, entregamos a estrutura completa para que o evento aconteça — e seja lembrado.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Seção 3: Serviços (fundo sports sólido) ── */}
      <section
        className="py-section"
        style={{ backgroundColor: 'var(--color-sports)', color: 'oklch(97% 0.006 58)' }}
        ref={servicesRef}
      >
        <div className="container mx-auto px-6 lg:px-12">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={servicesInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p
              className="font-ui text-xs tracking-editorial uppercase mb-4"
              style={{ opacity: 0.7 }}
            >
              O que a gente faz
            </p>
            <h2 className="font-display font-black text-3xl lg:text-4xl leading-tight tracking-headline">
              Estrutura completa. Do início ao fim.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px mt-12"
            style={{ backgroundColor: 'oklch(97% 0.006 58 / 0.15)' }}
            initial="hidden"
            animate={servicesInView ? 'visible' : 'hidden'}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {services.map((service) => (
              <motion.div
                key={service.number}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
                }}
                className="flex flex-col gap-3"
                style={{ padding: '2rem', backgroundColor: 'var(--color-sports)' }}
              >
                <span
                  className="font-ui text-xs tracking-editorial"
                  style={{ opacity: 0.6 }}
                >
                  {service.number}
                </span>
                <h3 className="font-display font-bold text-xl">
                  {service.name}
                </h3>
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{ opacity: 0.75 }}
                >
                  {service.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── Seção 4: Clientes (fundo claro) ── */}
      <section
        className="py-section"
        style={{ backgroundColor: 'oklch(97% 0.006 58)', color: 'oklch(10% 0.008 50)' }}
        ref={clientsRef}
      >
        <div className="container mx-auto px-6 lg:px-12">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={clientsInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p
              className="font-ui text-xs tracking-editorial uppercase mb-4"
              style={{ color: 'oklch(50% 0.01 58)' }}
            >
              Quem já confiou
            </p>
            <h2
              className="font-display font-black text-2xl lg:text-3xl leading-tight tracking-headline"
              style={{ color: 'oklch(10% 0.008 50)' }}
            >
              Eventos e marcas que passaram pela nossa produção.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-14 lg:gap-20 mt-10 w-fit mx-auto"
            initial="hidden"
            animate={clientsInView ? 'visible' : 'hidden'}
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
                  className="relative w-28 h-28 lg:w-36 lg:h-36 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105"
                  style={{ border: '1px solid oklch(80% 0.01 58)', backgroundColor: 'oklch(90% 0.01 58)' }}
                >
                  <Image
                    src={client.logo}
                    alt={client.name}
                    fill
                    className="object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    sizes="(max-width: 768px) 20vw, 10vw"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── Seção 5: CTA (fundo escuro) ── */}
      <section
        className="py-section"
        style={{ backgroundColor: 'oklch(10% 0.008 50)', color: 'oklch(93% 0.006 58)' }}
        ref={ctaRef}
      >
        <div className="container mx-auto px-6 lg:px-12">

          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, x: -40 }}
            animate={ctaInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2
              className="font-display font-black text-4xl lg:text-5xl leading-tight tracking-headline mb-4"
              style={{ color: 'oklch(93% 0.006 58)' }}
            >
              Pronto para o próximo evento?
            </h2>

            <p
              className="font-body text-lg mb-10"
              style={{ color: 'oklch(65% 0.01 58)' }}
            >
              Manda a ideia — a gente cuida do resto.
            </p>

            <Link
              href="/#contato"
              className="inline-block font-ui text-sm font-medium px-8 py-3 transition-colors duration-200"
              style={{
                border: '1px solid oklch(93% 0.006 58)',
                color: 'oklch(93% 0.006 58)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-sports)';
                e.currentTarget.style.borderColor = 'var(--color-sports)';
                e.currentTarget.style.color = 'oklch(97% 0.006 58)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'oklch(93% 0.006 58)';
                e.currentTarget.style.color = 'oklch(93% 0.006 58)';
              }}
            >
              Entrar em contato
            </Link>
          </motion.div>

        </div>
      </section>

      <Footer />
    </>
  );
}
