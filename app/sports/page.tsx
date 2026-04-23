"use client"

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ClipboardList, Flag, Volume2, Clapperboard, Trophy, Building2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ── Split-flap scoreboard ─────────────────────────────────────
// ── Letras caindo como bolas com bounce ───────────────────────
const events = [
  { title: 'Open Santos ASSESP',             subtitle: 'Santos, SP' },
  { title: 'Open SPFC de Beach Tennis',      subtitle: 'São Paulo, SP' },
  { title: 'Open DAMA Tom Beach',             subtitle: 'Guarujá, SP' },
  { title: 'Open São Paulo de Beach Tennis', subtitle: 'São Paulo, SP' },
];

function useBallDropCycle() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const pause = setTimeout(() => {
      setVisible(false);
      const next = setTimeout(() => {
        setIndex(i => (i + 1) % events.length);
        setVisible(true);
      }, 500);
      return () => clearTimeout(next);
    }, 4000);
    return () => clearTimeout(pause);
  }, [index]);

  return { index, visible };
}

function BallDropTitle({ index, visible }: { index: number; visible: boolean }) {
  const { title } = events[index];
  const words = title.split(' ');
  let letterCount = 0;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.span
          key={index}
          className="flex flex-wrap"
          style={{ gap: '0.28em' }}
          aria-label={title}
        >
          {words.map((word, wi) => (
            <span key={wi} style={{ display: 'inline-flex' }}>
              {word.split('').map((ch) => {
                const delay = letterCount++ * 0.045;
                return (
                  <motion.span
                    key={`${wi}-${ch}-${delay}`}
                    style={{ display: 'inline-block' }}
                    initial={{ y: '-130%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-60%', opacity: 0, transition: { duration: 0.18, ease: [0.55, 0, 1, 0.45] } }}
                    transition={{ delay, type: 'spring', stiffness: 420, damping: 13, mass: 0.75 }}
                  >
                    {ch}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function BallDropSubtitle({ index, visible }: { index: number; visible: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.p
          key={index}
          className="font-body"
          style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.1rem)', color: 'oklch(75% 0.015 52)', margin: 0 }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
          transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
        >
          {events[index].subtitle}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const SPORTS   = 'var(--color-sports)';
const BG_DARK  = 'oklch(10% 0.008 50)';
const BG_LIGHT = 'oklch(97% 0.009 52)';
const FG_DARK  = 'oklch(10% 0.015 45)';

// ── Dados de eventos ──────────────────────────────────────────
const pastEvents = [
  {
    id: 'open-santos-assesp',
    name: 'Open Santos ASSESP',
    subtitle: 'Beach Tennis',
    date: '11 e 12 de abril de 2026',
    location: 'Point do Gonzaga · Santos, SP',
    banner: '/images/events/openassesp.jpg',
    link: { url: 'https://www.rankingbt.com.br/torneios/open-santos-assesp-de-beach-tennis-2026-04-11', label: 'Ver no RankingBT' },
    stats: [
      { label: 'atletas', value: '250+' },
      { label: 'inscrições', value: '300+' },
      { label: 'categorias', value: '14' },
      { label: 'quadras', value: '13' },
    ],
    description: 'Maior torneio de beach tennis da Baixada Santista. Dois dias de competição, cobertura audiovisual completa, arbitragem profissional e estrutura montada do zero pela DAMA Sports.',
    logo: '/images/clients/assesp.jpeg',
    tag: 'REALIZADO',
  },
];

const historico = [
  { name: 'Open Santos ASSESP 2025', date: 'Abril de 2025', location: 'Santos, SP', categorias: 12 },
  { name: 'Open Tom Beach 2025',     date: 'Agosto de 2025', location: 'Guarujá, SP', categorias: 8 },
  { name: 'Open Santos ASSESP 2024', date: 'Abril de 2024', location: 'Santos, SP', categorias: 10 },
  { name: 'Open Tom Beach 2024',     date: 'Agosto de 2024', location: 'Guarujá, SP', categorias: 8 },
  { name: 'Open Santos ASSESP 2023', date: 'Abril de 2023', location: 'Santos, SP', categorias: 8 },
];

const upcomingEvents = [
  {
    id: 'open-spfc',
    name: 'Open SPFC',
    subtitle: 'Beach Tennis',
    date: '29, 30 e 31 de maio de 2026',
    location: 'CT do São Paulo FC · São Paulo, SP',
    stats: [
      { label: 'atletas previstos', value: '400+' },
      { label: 'inscrições previstas', value: '500+' },
      { label: 'categorias', value: '19' },
      { label: 'quadras', value: '7' },
    ],
    description: 'O maior torneio de beach tennis já realizado no CT do São Paulo Futebol Clube. Estrutura completa, parceria com um dos maiores clubes do Brasil.',
    logo: '/images/clients/spfc.png',
    tag: 'EM BREVE',
    link: { url: 'https://letzplay.me/damasports/tourneys/56324', label: 'Inscreva-se no LetzPlay' },
  },
  {
    id: 'open-guaruja',
    name: 'Open DAMA Tom Beach',
    subtitle: 'Beach Tennis',
    date: '6 e 7 de junho de 2026',
    location: 'Tom Beach · Guarujá, SP',
    stats: [
      { label: 'atletas previstos', value: '150+' },
      { label: 'inscrições previstas', value: '200+' },
      { label: 'categorias', value: '10' },
      { label: 'quadras', value: '4' },
    ],
    description: 'Torneio à beira-mar com vista para o Atlântico. Ambiente praiano, competição de alto nível e produção completa no coração do litoral paulista.',
    logo: null,
    tag: 'EM BREVE',
    link: { url: 'https://letzplay.me/damasports', label: 'Ver perfil no LetzPlay' },
  },
];

const services = [
  { number: '01', icon: ClipboardList, name: 'Gestão do Torneio', description: 'Chaveamento, inscrições via LetzPlay e RankingBT, controle de categorias e resultados do início ao fim.' },
  { number: '02', icon: Flag,          name: 'Arbitragem',        description: 'Árbitros certificados para torneios de qualquer porte, garantindo fair play em todas as quadras.' },
  { number: '03', icon: Volume2,       name: 'Locação de Som',    description: 'Sistema de áudio profissional com operador incluso — da abertura à premiação.' },
  { number: '04', icon: Clapperboard,  name: 'Cobertura Audiovisual', description: 'Fotografia profissional, filmagem cinematográfica e imagens aéreas com drone.' },
  { number: '05', icon: Trophy,        name: 'Troféus & Medalhas', description: 'Produção personalizada com a identidade visual do evento, do pódio ao maior atleta.' },
  { number: '06', icon: Building2,     name: 'Estrutura Completa', description: 'Quadras, treliças, pódio, staff e tudo que o evento precisa para acontecer com excelência.' },
];

const clients = [
  { name: 'ASSESP',    logo: '/images/clients/assesp.jpeg' },
  { name: 'RONYMOTORS',logo: '/images/clients/rony.png' },
  { name: 'SPFC',      logo: '/images/clients/spfc.png' },
  { name: 'TOMBEACH',  logo: '/images/clients/tombeach.png' },
  { name: 'OPENSP',    logo: '/images/clients/opensp.webp' },
  { name: 'HYDRA',     logo: '/images/clients/hydra.png' },
  { name: 'GENIAL',    logo: '/images/clients/genial.png' },
];

// ── Histórico de torneios ─────────────────────────────────────
function HistoricoDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 font-ui text-sm font-medium transition-colors duration-200"
        style={{ color: open ? SPORTS : 'oklch(45% 0.025 48)' }}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          style={{ display: 'inline-block', lineHeight: 1 }}
        >
          ›
        </motion.span>
        Histórico de torneios
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="mt-4 flex flex-col gap-px"
              style={{ backgroundColor: 'oklch(80% 0.02 45 / 0.12)' }}
            >
              {historico.map((ev, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto] items-center gap-6 px-6 py-4"
                  style={{ backgroundColor: BG_LIGHT }}
                >
                  <div>
                    <p
                      className="font-display font-bold text-base leading-tight"
                      style={{ color: FG_DARK }}
                    >
                      {ev.name}
                    </p>
                    <p className="font-ui text-xs mt-0.5" style={{ color: 'oklch(55% 0.02 48)' }}>
                      {ev.location}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-ui text-xs" style={{ color: 'oklch(50% 0.025 48)' }}>{ev.date}</p>
                    <p className="font-ui text-xs mt-0.5" style={{ color: SPORTS }}>{ev.categorias} categorias</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Componente: card de evento passado ───────────────────────
function PastEventCard({ event, inView }: { event: typeof pastEvents[0]; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: EASE }}
      className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-px"
      style={{ backgroundColor: 'oklch(80% 0.02 45 / 0.15)' }}
    >
      {/* Coluna esquerda — banner */}
      {event.banner && (
        <div className="relative min-h-[420px] lg:min-h-0" style={{ backgroundColor: BG_LIGHT }}>
          <Image
            src={event.banner}
            alt={`Banner ${event.name}`}
            fill
            className="object-contain object-center"
            sizes="320px"
            priority
          />
        </div>
      )}

      {/* Coluna direita — info + stats */}
      <div
        className="flex flex-col gap-px"
        style={{ backgroundColor: 'oklch(80% 0.02 45 / 0.15)' }}
      >
        {/* Info */}
        <div
          className="flex flex-col gap-6 p-8 lg:p-12"
          style={{ backgroundColor: BG_LIGHT, color: FG_DARK }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-ui text-xs tracking-editorial uppercase mb-2" style={{ color: SPORTS }}>
                {event.subtitle}
              </p>
              <h3
                className="font-display font-black leading-none tracking-tight"
                style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: FG_DARK }}
              >
                {event.name}
              </h3>
            </div>
            <span
              className="font-ui text-2xs font-semibold tracking-widest uppercase px-2 py-1 rounded-sm flex-shrink-0"
              style={{ backgroundColor: 'oklch(90% 0.03 50)', color: 'oklch(45% 0.03 48)' }}
            >
              {event.tag}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <p className="font-ui text-sm" style={{ color: 'oklch(45% 0.025 48)' }}>{event.date}</p>
            <p className="font-ui text-sm" style={{ color: 'oklch(55% 0.02 48)' }}>{event.location}</p>
          </div>

          <p className="font-body text-sm leading-relaxed" style={{ color: 'oklch(38% 0.015 48)' }}>
            {event.description}
          </p>

          {event.link && (
            <a
              href={event.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-ui text-xs font-medium tracking-wide self-start transition-colors duration-200"
              style={{ color: SPORTS, textDecoration: 'underline', textUnderlineOffset: '4px' }}
            >
              {event.link.label} ↗
            </a>
          )}
        </div>

        {/* Stats */}
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${event.stats.length}, 1fr)`,
            backgroundColor: 'oklch(80% 0.02 45 / 0.15)',
          }}
        >
          {event.stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col justify-end gap-1 p-6 lg:p-8"
              style={{ backgroundColor: BG_LIGHT }}
            >
              <p
                className="font-display font-black leading-none"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: SPORTS }}
              >
                {stat.value}
              </p>
              <p className="font-ui text-xs tracking-editorial uppercase" style={{ color: 'oklch(55% 0.025 48)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Componente: card de próximo evento ───────────────────────
function UpcomingEventCard({ event, index, inView }: { event: typeof upcomingEvents[0]; index: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.12, ease: EASE }}
      className="flex flex-col gap-0 cursor-default"
      style={{
        border: `1px solid ${hovered ? SPORTS : 'oklch(28% 0.012 50)'}`,
        transition: 'border-color 0.25s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Topo: tag + data */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          borderBottom: `1px solid ${hovered ? SPORTS : 'oklch(28% 0.012 50)'}`,
          backgroundColor: hovered ? 'oklch(18% 0.05 33)' : 'transparent',
          transition: 'background-color 0.25s ease, border-color 0.25s ease',
        }}
      >
        <span
          className="font-ui text-2xs font-semibold tracking-widest uppercase"
          style={{ color: SPORTS }}
        >
          {event.tag}
        </span>
        <span
          className="font-ui text-xs"
          style={{ color: 'oklch(55% 0.015 50)' }}
        >
          {event.date}
        </span>
      </div>

      {/* Corpo */}
      <div className="flex flex-col gap-6 p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-ui text-xs tracking-editorial uppercase mb-1" style={{ color: 'oklch(55% 0.015 50)' }}>
              {event.subtitle}
            </p>
            <h3
              className="font-display font-black leading-none tracking-tight"
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                color: hovered ? SPORTS : 'oklch(93% 0.006 58)',
                transition: 'color 0.25s ease',
              }}
            >
              {event.name}
            </h3>
          </div>

          {event.logo && (
            <div
              className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 opacity-60"
              style={{ border: '1px solid oklch(30% 0.012 50)' }}
            >
              <Image
                src={event.logo}
                alt={event.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          )}
        </div>

        <p className="font-ui text-sm" style={{ color: 'oklch(55% 0.015 50)' }}>
          {event.location}
        </p>

        <p className="font-body text-sm leading-relaxed" style={{ color: 'oklch(62% 0.015 55)' }}>
          {event.description}
        </p>

        {event.link && (
          <a
            href={event.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-ui text-xs font-medium tracking-wide self-start transition-opacity duration-200 hover:opacity-70"
            style={{ color: SPORTS, textDecoration: 'underline', textUnderlineOffset: '4px' }}
          >
            {event.link.label} ↗
          </a>
        )}

        {/* Stats em linha */}
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${event.stats.length}, 1fr)`,
            backgroundColor: 'oklch(28% 0.012 50)',
          }}
        >
          {event.stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col gap-0.5 p-4"
              style={{ backgroundColor: BG_DARK }}
            >
              <p
                className="font-display font-black leading-none"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: SPORTS }}
              >
                {stat.value}
              </p>
              <p className="font-ui text-2xs tracking-editorial uppercase" style={{ color: 'oklch(45% 0.012 50)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Ficha de Inscrição interativa ────────────────────────────
type FichaStep = 'name' | 'email' | 'phone' | 'message' | 'sending' | 'done' | 'error';

const fichaFields: { key: FichaStep; label: string; sublabel: string; inputType?: string }[] = [
  { key: 'name',    label: 'NOME',    sublabel: 'Organizador ou nome do evento' },
  { key: 'email',   label: 'E-MAIL',  sublabel: 'Para entrarmos em contato',     inputType: 'email' },
  { key: 'phone',   label: 'CELULAR', sublabel: 'WhatsApp de preferência' },
  { key: 'message', label: 'EVENTO',  sublabel: 'Conte sobre o torneio' },
];

function FichaInscricao({ visible }: { visible: boolean }) {
  const [step, setStep]           = useState<FichaStep>('name');
  const [values, setValues]       = useState<Record<string, string>>({});
  const [currentInput, setInput]  = useState('');
  const [inputError, setError]    = useState('');
  const inputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!visible) return;
    setStep('name'); setValues({}); setInput(''); setError('');
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [step, visible]);

  const stepIndex = fichaFields.findIndex(f => f.key === step);
  const isFormStep = stepIndex !== -1;

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const value = currentInput.trim();

    if (step === 'name') {
      if (!value) return;
      setValues(v => ({ ...v, name: value })); setInput(''); setError(''); setStep('email');
    } else if (step === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setError('E-mail inválido, tente novamente'); return; }
      setValues(v => ({ ...v, email: value })); setInput(''); setError(''); setStep('phone');
    } else if (step === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (value && (digits.length < 10 || digits.length > 11)) { setError('Celular inválido, informe 10 ou 11 dígitos'); return; }
      setValues(v => ({ ...v, phone: value || '—' })); setInput(''); setError(''); setStep('message');
    } else if (step === 'message') {
      if (!value) return;
      setValues(v => ({ ...v, message: value })); setInput(''); setStep('sending');
      try {
        const res = await fetch('/api/send', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: values.name, email: values.email, phone: values.phone, message: value }),
        });
        setStep(res.ok ? 'done' : 'error');
      } catch { setStep('error'); }
    }
  };

  const CREAM = '#FDFAF5';
  const DARK  = '#1A0F00';
  const MID   = '#6B5C4A';

  return (
    <div style={{
      backgroundColor: CREAM,
      borderRadius: '4px',
      overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
      fontFamily: 'var(--font-ui)',
    }}>

      {/* ── Cabeçalho da ficha ── */}
      <div style={{ backgroundColor: DARK, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.2em', color: SPORTS, textTransform: 'uppercase', marginBottom: '2px' }}>
            DAMA Sports
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1rem', color: CREAM, letterSpacing: '0.05em' }}>
            FICHA DE CONTATO
          </p>
        </div>
        {/* Barra de progresso */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
            {isFormStep ? `${stepIndex + 1} de ${fichaFields.length}` : step === 'done' ? 'enviado' : ''}
          </p>
          <div style={{ display: 'flex', gap: '4px' }}>
            {fichaFields.map((_, i) => (
              <div key={i} style={{
                width: '20px', height: '3px', borderRadius: '2px',
                backgroundColor: i < (isFormStep ? stepIndex : fichaFields.length)
                  ? SPORTS
                  : 'rgba(255,255,255,0.15)',
                transition: 'background-color 0.3s ease',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Corpo da ficha ── */}
      <div style={{ padding: '8px 0' }}>

        {/* Campos preenchidos */}
        {fichaFields.map((field, i) => {
          const filled = values[field.key];
          const isActive = step === field.key;
          const isPending = !filled && !isActive && step !== 'done' && step !== 'sending' && step !== 'error';

          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: isPending ? 0.25 : 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
              style={{
                padding: '14px 24px',
                borderBottom: i < fichaFields.length - 1 ? `1px solid ${filled ? 'rgba(26,15,0,0.08)' : 'rgba(26,15,0,0.06)'}` : 'none',
                position: 'relative',
              }}
            >
              {/* Label */}
              <p style={{
                fontSize: '0.6rem',
                letterSpacing: '0.18em',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: filled ? SPORTS : isActive ? DARK : MID,
                marginBottom: '4px',
                transition: 'color 0.2s ease',
              }}>
                {field.label}
              </p>

              {/* Valor preenchido */}
              {filled && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: DARK }}>{filled}</p>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                    style={{ fontSize: '1rem', color: SPORTS }}
                  >
                    ✓
                  </motion.span>
                </div>
              )}

              {/* Campo ativo */}
              {isActive && (
                <div>
                  <p style={{ fontSize: '0.72rem', color: MID, marginBottom: '6px' }}>{field.sublabel}</p>
                  <div style={{ display: 'flex', alignItems: 'center', borderBottom: `2px solid ${SPORTS}`, paddingBottom: '4px' }}>
                    <input
                      ref={inputRef}
                      type={field.inputType ?? 'text'}
                      value={currentInput}
                      onChange={e => {
                        const val = step === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value;
                        setInput(val); setError('');
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Digite e pressione Enter"
                      autoComplete="off"
                      spellCheck={false}
                      style={{
                        flex: 1, background: 'transparent', border: 'none', outline: 'none',
                        fontSize: '1rem', fontWeight: 600, color: DARK, caretColor: SPORTS,
                        fontFamily: 'var(--font-ui)',
                      }}
                    />
                    <span style={{ fontSize: '0.7rem', color: MID, whiteSpace: 'nowrap', marginLeft: '8px' }}>↵ enter</span>
                  </div>
                  {inputError && (
                    <p style={{ fontSize: '0.72rem', color: '#C0392B', marginTop: '4px' }}>{inputError}</p>
                  )}
                </div>
              )}

              {/* Campo pendente */}
              {isPending && (
                <div style={{ height: '2px', backgroundColor: 'rgba(26,15,0,0.1)', borderRadius: '1px', marginTop: '4px' }} />
              )}
            </motion.div>
          );
        })}

        {/* Estados finais */}
        {step === 'sending' && (
          <div style={{ padding: '20px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: MID }}>Enviando inscrição<span style={{ animation: 'blink 1s step-end infinite' }}>...</span></p>
          </div>
        )}
        {step === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '24px', textAlign: 'center', backgroundColor: 'oklch(65% 0.21 33 / 0.06)' }}
          >
            <p style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🏆</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.85rem', color: SPORTS, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Recebemos sua mensagem!
            </p>
            <p style={{ fontSize: '0.8rem', color: MID, marginTop: '4px' }}>Entraremos em contato em breve.</p>
          </motion.div>
        )}
        {step === 'error' && (
          <div style={{ padding: '20px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: '#C0392B' }}>Erro ao enviar. Tente novamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────
export default function DamaSportsPage() {
  const { index: eventIndex, visible: eventVisible } = useBallDropCycle();
  const heroRef       = useRef<HTMLDivElement>(null);
  const pastRef       = useRef<HTMLDivElement>(null);
  const upcomingRef   = useRef<HTMLDivElement>(null);
  const servicesRef   = useRef<HTMLDivElement>(null);
  const clientsRef    = useRef<HTMLDivElement>(null);
  const ctaRef        = useRef<HTMLDivElement>(null);

  const pastInView     = useInView(pastRef,     { once: true, margin: '-6% 0px' });
  const upcomingInView = useInView(upcomingRef,  { once: true, margin: '-6% 0px' });
  const servicesInView = useInView(servicesRef,  { once: true, margin: '-8% 0px' });
  const clientsInView  = useInView(clientsRef,   { once: true, margin: '-8% 0px' });
  const ctaInView      = useInView(ctaRef,       { once: true, margin: '-10% 0px' });

  return (
    <>
      <Header />

      {/* ── Hero com vídeo ── */}
      <section ref={heroRef} style={{ position: 'relative', height: '100dvh', overflow: 'hidden' }}>
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/sports-hero.mp4"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'oklch(10% 0.008 50 / 0.55)' }} />

        <div className="absolute inset-0 flex flex-col justify-end pb-16 lg:pb-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex flex-col gap-0">
              <p
                className="font-ui text-xs tracking-editorial uppercase mb-4"
                style={{ color: SPORTS }}
              >
                DAMA Sports — Beach Tennis
              </p>

              <h1
                className="font-display font-black leading-none tracking-headline"
                style={{ fontSize: 'clamp(3rem, 8.5vw, 8rem)', color: 'oklch(97% 0.006 58)', minHeight: '1.05em' }}
              >
                <BallDropTitle index={eventIndex} visible={eventVisible} />
              </h1>
              <BallDropSubtitle index={eventIndex} visible={eventVisible} />

            </div>
          </div>
        </div>
      </section>

      {/* ── Eventos realizados ── */}
      <section ref={pastRef} className="py-section" style={{ backgroundColor: BG_LIGHT }}>
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            className="flex items-baseline gap-4 mb-12"
            initial={{ opacity: 0, x: -30 }}
            animate={pastInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2
              className="font-display font-black leading-none tracking-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: FG_DARK }}
            >
              Já aconteceu
            </h2>
            <span
              className="font-ui text-xs tracking-editorial uppercase"
              style={{ color: SPORTS }}
            >
              — eventos realizados
            </span>
          </motion.div>

          <div className="flex flex-col gap-px">
            {pastEvents.map((event) => (
              <PastEventCard key={event.id} event={event} inView={pastInView} />
            ))}
          </div>

          <HistoricoDropdown />
        </div>
      </section>

      {/* ── Próximos eventos ── */}
      <section ref={upcomingRef} className="py-section" style={{ backgroundColor: BG_DARK }}>
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            className="flex items-baseline gap-4 mb-12"
            initial={{ opacity: 0, x: -30 }}
            animate={upcomingInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2
              className="font-display font-black leading-none tracking-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'oklch(93% 0.006 58)' }}
            >
              Próximos Torneios
            </h2>
            <span
              className="font-ui text-xs tracking-editorial uppercase"
              style={{ color: SPORTS }}
            >
              — próximos torneios
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingEvents.map((event, i) => (
              <UpcomingEventCard key={event.id} event={event} index={i} inView={upcomingInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Serviços ── */}
      <section
        className="py-section"
        style={{ backgroundColor: BG_LIGHT, color: FG_DARK }}
        ref={servicesRef}
      >
        <div className="container mx-auto px-6 lg:px-12">

          {/* Cabeçalho */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-end mb-12">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={servicesInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <p className="font-ui text-xs tracking-editorial uppercase mb-3" style={{ color: SPORTS }}>
                O que a gente oferece
              </p>
              <h2 className="font-display font-black leading-tight tracking-headline max-w-2xl" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: FG_DARK }}>
                Tudo que um torneio de beach tennis precisa para acontecer — e ser lembrado.
              </h2>
            </motion.div>

          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ backgroundColor: 'oklch(80% 0.02 45 / 0.12)' }}
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
                whileHover="hovered"
                className="flex flex-col gap-4 p-8 relative overflow-hidden cursor-default"
                style={{ backgroundColor: BG_LIGHT }}
              >
                {/* Linha de quadra que varre no hover */}
                <motion.div
                  variants={{ hovered: { scaleX: 1 }, initial: { scaleX: 0 } }}
                  initial="initial"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    backgroundColor: SPORTS,
                    transformOrigin: 'left',
                  }}
                  transition={{ duration: 0.3, ease: EASE }}
                />

                {/* Ícone com bounce no hover */}
                <motion.div
                  variants={{
                    hovered: { y: -6, scale: 1.2 },
                    initial: { y: 0, scale: 1 },
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <service.icon size={22} style={{ color: SPORTS }} />
                </motion.div>

                <motion.h3
                  className="font-display font-bold text-xl"
                  variants={{ hovered: { x: 4 }, initial: { x: 0 } }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  {service.name}
                </motion.h3>

                <p className="font-body text-sm leading-relaxed" style={{ color: 'oklch(40% 0.02 48)' }}>
                  {service.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Parceiros ── */}
      <section
        className="py-section"
        style={{ backgroundColor: BG_LIGHT, color: FG_DARK }}
        ref={clientsRef}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={clientsInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="font-ui text-xs tracking-editorial uppercase mb-4" style={{ color: 'oklch(50% 0.01 58)' }}>
              Quem já confiou
            </p>
            <h2 className="font-display font-black text-2xl lg:text-3xl leading-tight tracking-headline" style={{ color: FG_DARK }}>
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
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 20vw, 10vw"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-section"
        style={{ backgroundColor: SPORTS }}
        ref={ctaRef}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Esquerda — texto */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={ctaInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <p className="font-ui text-xs tracking-editorial uppercase mb-6" style={{ color: 'oklch(97% 0.006 58 / 0.6)' }}>
                próximo torneio
              </p>

              <h2
                className="font-display font-black text-4xl lg:text-5xl leading-tight tracking-headline mb-4"
                style={{ color: 'oklch(97% 0.006 58)' }}
              >
                Quer realizar o próximo grande torneio?
              </h2>

              <p className="font-body text-lg mb-10" style={{ color: 'oklch(97% 0.006 58 / 0.75)' }}>
                Manda a ideia — a gente cuida do resto.
              </p>

              <Link
                href="/#contato"
                className="inline-block font-ui text-sm font-medium px-8 py-3 transition-colors duration-200"
                style={{ border: '1px solid oklch(97% 0.006 58 / 0.8)', color: 'oklch(97% 0.006 58)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'oklch(97% 0.006 58)';
                  e.currentTarget.style.color = SPORTS;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'oklch(97% 0.006 58)';
                }}
              >
                Entrar em contato
              </Link>
            </motion.div>

            {/* Direita — scoreboard interativo */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={ctaInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            >
              <FichaInscricao visible={ctaInView} />
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
