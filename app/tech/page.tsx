"use client"

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { JetBrains_Mono } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const BG = 'oklch(8% 0.015 262)';
const BG_DARK = 'oklch(5% 0.02 262)';
const BORDER = 'oklch(22% 0.04 262)';
const TEXT = 'oklch(93% 0.006 58)';
const MUTED = 'oklch(50% 0.025 262)';
const COMMENT = 'oklch(40% 0.04 262)';

const services = [
  { num: '_01', name: 'Websites', desc: 'Sites institucionais, landing pages e e-commerces que convertem.' },
  { num: '_02', name: 'Sistemas Web', desc: 'Plataformas sob medida: CRMs, dashboards, portais e intranets.' },
  { num: '_03', name: 'Aplicativos', desc: 'Apps mobile e web — do MVP ao produto escalável.' },
  { num: '_04', name: 'Automações', desc: 'Fluxos automáticos que eliminam trabalho repetitivo.' },
  { num: '_05', name: 'Integrações', desc: 'APIs, webhooks e conexão entre ferramentas que não conversam.' },
  { num: '_06', name: 'Consultoria', desc: 'Revisão de arquitetura, stack e estratégia de produto.' },
];

const projects = [
  {
    tag: 'plataforma · beach tennis',
    brandName: 'Ranking BT',
    brandColor: '#1e56e0',
    logo: '/images/projects/rankingbt-logo.png',
    desc: 'Sistema completo de ranking para torneios de beach tennis — gestão de jogadores, partidas e pontuação em tempo real.',
    href: 'https://www.rankingbt.com.br/',
  },
  {
    tag: 'saúde · gestão',
    brandName: 'Clinup',
    brandColor: '#4BAB96',
    logo: '/images/projects/clinup-logo.svg',
    desc: 'Plataforma de gestão para clínicas de saúde — agendamento, prontuário e financeiro integrados.',
    href: 'https://clinup.damadigitalcriativa.com.br',
  },
  {
    tag: 'saas · varejo · estoque',
    brandName: 'PlayStock',
    brandColor: '#ea6c0a',
    logo: '/images/projects/playstock-logo.svg',
    desc: 'Plataforma SaaS multi-tenant para redes de varejo: estoque centralizado em tempo real, transferências entre lojas, catálogo com variantes e relatórios por período e unidade.',
    href: 'https://playstock.app',
  },
  {
    tag: 'site pessoal · apresentador',
    brandName: 'Maxwell Rodrigues',
    brandColor: '#C9A227',
    logo: '/images/projects/maxwell-logo.png',
    desc: 'Site pessoal do apresentador do PORTO 360 (TV Globo) e maior influenciador portuário do Brasil — identidade visual, seções de destaque, palestras e contato.',
    href: 'https://maxwellrodrigues.damadigitalcriativa.com.br',
  },
];

const heroProjects = [
  { name: 'ClinUp.', subtitle: 'Gestão para clínicas — agendamento, prontuário e financeiro em um só sistema.' },
  { name: 'RankingBT.com.br', subtitle: 'Plataforma de ranking e torneios de beach tennis com pontuação em tempo real.' },
  { name: 'PlayStock.app', subtitle: 'Estoque centralizado para redes de varejo — alertas, transferências e relatórios.' },
];

function TypewriterText({ texts, onIndexChange, typeSpeed = 40, deleteSpeed = 15, pauseMs = 5000 }: { texts: string[]; onIndexChange?: (i: number) => void; typeSpeed?: number; deleteSpeed?: number; pauseMs?: number }) {
  const [displayed, setDisplayed] = useState('');
  const ref = useRef({ index: 0, typing: true, chars: '', typeSpeed, deleteSpeed, pauseMs, texts, onIndexChange });

  ref.current.typeSpeed = typeSpeed;
  ref.current.deleteSpeed = deleteSpeed;
  ref.current.pauseMs = pauseMs;
  ref.current.texts = texts;
  ref.current.onIndexChange = onIndexChange;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      const s = ref.current;
      const target = s.texts[s.index];

      if (s.typing) {
        s.chars = target.slice(0, s.chars.length + 1);
        setDisplayed(s.chars);
        if (s.chars.length === target.length) {
          timeout = setTimeout(() => { s.typing = false; tick(); }, s.pauseMs);
        } else {
          const jitter = 40 + Math.random() * 110;
          timeout = setTimeout(tick, jitter);
        }
      } else {
        s.chars = s.chars.slice(0, -1);
        setDisplayed(s.chars);
        if (s.chars.length === 0) {
          const next = (s.index + 1) % s.texts.length;
          s.index = next;
          s.onIndexChange?.(next);
          timeout = setTimeout(() => { s.typing = true; tick(); }, 400);
        } else {
          timeout = setTimeout(tick, 50);
        }
      }
    }

    timeout = setTimeout(tick, ref.current.typeSpeed);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span>
      {displayed}
      <span
        style={{
          display: 'inline-block',
          width: '3px',
          height: '1em',
          backgroundColor: 'var(--color-tech)',
          marginLeft: '4px',
          verticalAlign: 'text-bottom',
          animation: 'blink 1s step-end infinite',
        }}
      />
    </span>
  );
}

function SubtitleTypewriter({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    function tick() {
      i++;
      setDisplayed(text.slice(0, i));
      if (i < text.length) timeout = setTimeout(tick, 10 + Math.random() * 15);
    }
    timeout = setTimeout(tick, 200);
    return () => clearTimeout(timeout);
  }, [text]);

  return <span>{displayed}</span>;
}

const terminalLines = [
  { type: 'prompt',  cmd: 'dama-tech init seu-projeto' },
  { type: 'output',  text: 'analisando requisitos...' },
  { type: 'output',  text: 'configurando stack...' },
  { type: 'output',  text: 'buildando solução...' },
  { type: 'success', text: '✓ pronto para lançar' },
];

const PROMPT = 'dama-tech ~ %';
const FONT_SIZE = '0.875rem';
const LINE_HEIGHT = 1.6;
const PAD_H = 48;
const PAD_V = 44;

type TerminalStep = 'animating' | 'name' | 'email' | 'phone' | 'message' | 'sending' | 'done' | 'error';

interface HistoryLine {
  prompt: string;
  answer: string;
}

const stepConfig: Record<string, { label: string; placeholder?: string; inputType?: string }> = {
  name:    { label: 'digite seu nome:' },
  email:   { label: 'agora seu e-mail:', inputType: 'email' },
  phone:   { label: 'seu celular:', placeholder: '13997434878' },
  message: { label: 'sua mensagem:' },
};

function TerminalCTA({ visible }: { visible: boolean }) {
  const [revealed, setRevealed]       = useState(0);
  const [step, setStep]               = useState<TerminalStep>('animating');
  const [history, setHistory]         = useState<HistoryLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [formData, setFormData]       = useState({ name: '', email: '', phone: '' });
  const [cols, setCols]               = useState(80);
  const [rows, setRows]               = useState(24);
  const [inputError, setInputError]   = useState('');

  const bodyRef    = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);

  // Mede cols × rows reais
  useEffect(() => {
    const body = bodyRef.current;
    const measure = measureRef.current;
    if (!body || !measure) return;
    const update = () => {
      const charW = measure.getBoundingClientRect().width;
      const charH = measure.getBoundingClientRect().height;
      if (!charW || !charH) return;
      setCols(Math.max(1, Math.floor((body.clientWidth - PAD_H) / charW)));
      setRows(Math.max(1, Math.floor((body.clientHeight - PAD_V) / charH)));
    };
    const ro = new ResizeObserver(update);
    ro.observe(body);
    update();
    return () => ro.disconnect();
  }, []);

  // Sequência de boot → formulário
  useEffect(() => {
    if (!visible) return;
    setRevealed(0);
    setStep('animating');
    setHistory([]);
    setCurrentInput('');
    terminalLines.forEach((_, i) => {
      setTimeout(() => setRevealed(i + 1), 500 + i * 700);
    });
    const totalDelay = 500 + terminalLines.length * 700 + 500;
    setTimeout(() => setStep('name'), totalDelay);
  }, [visible]);

  // Foca input quando step muda
  useEffect(() => {
    if (['name', 'email', 'phone', 'message'].includes(step)) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [step]);

  // Auto-scroll interno do terminal
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTop = body.scrollHeight;
  }, [history, step, revealed]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const value = currentInput.trim();

    if (step === 'name') {
      if (!value) return;
      setInputError('');
      setHistory(h => [...h, { prompt: stepConfig.name.label, answer: value }]);
      setFormData(f => ({ ...f, name: value }));
      setCurrentInput('');
      setStep('email');
    } else if (step === 'email') {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) { setInputError('✗ e-mail inválido. tente novamente.'); return; }
      setInputError('');
      setHistory(h => [...h, { prompt: stepConfig.email.label, answer: value }]);
      setFormData(f => ({ ...f, email: value }));
      setCurrentInput('');
      setStep('phone');
    } else if (step === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (value && (digits.length < 10 || digits.length > 11)) {
        setInputError('✗ celular inválido. informe 10 ou 11 dígitos.');
        return;
      }
      setInputError('');
      setHistory(h => [...h, { prompt: stepConfig.phone.label, answer: value || '—' }]);
      setFormData(f => ({ ...f, phone: value }));
      setCurrentInput('');
      setStep('message');
    } else if (step === 'message') {
      if (!value) return;
      setInputError('');
      setHistory(h => [...h, { prompt: stepConfig.message.label, answer: value }]);
      setCurrentInput('');
      setStep('sending');
      try {
        const res = await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, message: value }),
        });
        setStep(res.ok ? 'done' : 'error');
      } catch {
        setStep('error');
      }
    }
  };

  const isInputStep = ['name', 'email', 'phone', 'message'].includes(step);
  const currentConfig = stepConfig[step] ?? null;

  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>

      {/* ── Barra título macOS ── */}
      <div style={{
        backgroundColor: '#3C3C3C',
        padding: '11px 16px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        userSelect: 'none',
      }}>
        <div style={{ display: 'flex', gap: '8px', zIndex: 1 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF5F57', display: 'block', flexShrink: 0 }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FFBD2E', display: 'block', flexShrink: 0 }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28C840', display: 'block', flexShrink: 0 }} />
        </div>
        <p style={{
          position: 'absolute', left: 0, right: 0, textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.55)', pointerEvents: 'none',
        }}>
          📁 dama-tech — -zsh — {cols}×{rows}
        </p>
      </div>

      {/* ── Corpo ── */}
      <div
        ref={bodyRef}
        onClick={() => inputRef.current?.focus()}
        style={{
          backgroundColor: '#1C1C1C',
          padding: '20px 24px 24px',
          fontFamily: 'var(--font-mono)',
          fontSize: FONT_SIZE,
          lineHeight: LINE_HEIGHT,
          minHeight: '22rem',
          maxHeight: '28rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          position: 'relative',
          cursor: 'text',
        }}
      >
        {/* Span invisível para medir char */}
        <span ref={measureRef} aria-hidden="true" style={{
          position: 'absolute', visibility: 'hidden', whiteSpace: 'pre',
          fontFamily: 'var(--font-mono)', fontSize: FONT_SIZE, lineHeight: LINE_HEIGHT,
        }}>M</span>

        {/* Linhas de boot */}
        {terminalLines.map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={revealed > i ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.15 }}>
            {line.type === 'prompt' ? (
              <p style={{ color: '#F2F2F2' }}>
                <span style={{ color: '#6FCF97' }}>{PROMPT}</span>{' '}{line.cmd}
              </p>
            ) : line.type === 'success' ? (
              <p style={{ color: '#28C840' }}>{line.text}</p>
            ) : (
              <p style={{ color: 'rgba(242,242,242,0.4)' }}>{line.text}</p>
            )}
          </motion.div>
        ))}

        {/* Histórico de respostas */}
        {history.map((h, i) => (
          <div key={`h-${i}`}>
            <p style={{ color: '#F2F2F2' }}>
              <span style={{ color: '#6FCF97' }}>{PROMPT}</span>
              {' '}
              <span style={{ color: 'rgba(242,242,242,0.5)' }}>{h.prompt}</span>
              {' '}
              {h.answer}
            </p>
          </div>
        ))}

        {/* Input ativo */}
        {isInputStep && currentConfig && (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: '#6FCF97', whiteSpace: 'nowrap' }}>{PROMPT}</span>
            <span style={{ color: 'rgba(242,242,242,0.5)', whiteSpace: 'nowrap', margin: '0 0.4em' }}>
              {currentConfig.label}
            </span>
            <input
              ref={inputRef}
              type={currentConfig.inputType ?? 'text'}
              value={currentInput}
              onChange={e => {
                const val = step === 'phone'
                  ? e.target.value.replace(/\D/g, '')
                  : e.target.value;
                setCurrentInput(val);
                setInputError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder={currentConfig.placeholder ?? ''}
              autoComplete="off"
              spellCheck={false}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#F2F2F2',
                fontFamily: 'var(--font-mono)',
                fontSize: FONT_SIZE,
                caretColor: '#F2F2F2',
                flex: 1,
                minWidth: '4ch',
              }}
            />
          </div>
        )}

        {/* Erro de validação */}
        {inputError && (
          <p style={{ color: '#FF5F57' }}>{inputError}</p>
        )}

        {/* Enviando */}
        {step === 'sending' && (
          <p style={{ color: 'rgba(242,242,242,0.4)' }}>
            enviando<span style={{ animation: 'blink 1s step-end infinite' }}>...</span>
          </p>
        )}

        {/* Sucesso */}
        {step === 'done' && (
          <>
            <p style={{ color: '#28C840' }}>✓ mensagem enviada! entraremos em contato em breve.</p>
            <p style={{ color: '#F2F2F2' }}>
              <span style={{ color: '#6FCF97' }}>{PROMPT}</span>{' '}
              <span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
            </p>
          </>
        )}

        {/* Erro */}
        {step === 'error' && (
          <>
            <p style={{ color: '#FF5F57' }}>✗ erro ao enviar. tente novamente mais tarde.</p>
            <p style={{ color: '#F2F2F2' }}>
              <span style={{ color: '#6FCF97' }}>{PROMPT}</span>{' '}
              <span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
            </p>
          </>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default function DamaTechPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: '-8% 0px' });

  const projectsRef = useRef<HTMLDivElement>(null);
  const projectsInView = useInView(projectsRef, { once: true, amount: 0.1 });

  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: '-10% 0px' });

  return (
    <div className={jetbrains.variable}>
      <Header />

      {/* ── Seção 1: Hero ── */}
      <section
        style={{ position: 'relative', height: '100dvh', overflow: 'hidden', backgroundColor: BG }}
      >
        <style>{`
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  @keyframes card-glitch {
    0%   { transform:translate(0) skewX(0);           filter:brightness(1); clip-path:none; }
    8%   { transform:translate(-5px,0) skewX(-1.5deg);filter:brightness(1.8) hue-rotate(var(--glitch-hue,30deg)) saturate(2); clip-path:inset(0 0 75% 0); }
    16%  { transform:translate(5px,1px) skewX(1deg);  filter:brightness(0.4) blur(1.5px); clip-path:inset(45% 0 30% 0); }
    24%  { transform:translate(-3px,0);               filter:brightness(1.6) hue-rotate(calc(var(--glitch-hue,30deg) * -1)); clip-path:none; }
    32%  { transform:translate(3px,-1px) skewX(0.5deg);filter:brightness(0.6) blur(1px); clip-path:inset(70% 0 0 0); }
    42%  { transform:translate(-1px,0);               filter:brightness(1.3); clip-path:none; }
    55%  { transform:translate(0) skewX(0);           filter:brightness(1.05); }
    100% { transform:translate(0) skewX(0);           filter:brightness(1.05); }
  }
  .service-card.is-glitching { animation: card-glitch 1s steps(1); }

  .service-card { position:relative; overflow:hidden; }
  .service-card::before {
    content:''; position:absolute; inset:0; z-index:1; pointer-events:none;
    background:hsl(calc(var(--glitch-hue-deg,262) * 1deg), 80%, 60%); opacity:0;
  }
  .service-card.is-glitching::before { animation: card-flash 1s steps(1); }
  @keyframes card-flash {
    0%  { opacity:0; } 8%  { opacity:0.18; } 16% { opacity:0; }
    24% { opacity:0.12; } 32% { opacity:0; } 100%{ opacity:0; }
  }

  .service-card.is-glitching h3 { animation: text-glitch 1s steps(1); }
  @keyframes text-glitch {
    0%  { text-shadow:none; }
    8%  { text-shadow:-3px 0 hsl(calc((var(--glitch-hue-deg,262) + 120) * 1deg),90%,65%), 3px 0 hsl(calc((var(--glitch-hue-deg,262) - 120) * 1deg),90%,65%); }
    16% { text-shadow:none; }
    24% { text-shadow:2px 0 hsl(calc((var(--glitch-hue-deg,262) + 60) * 1deg),90%,65%), -2px 0 hsl(calc((var(--glitch-hue-deg,262) - 60) * 1deg),90%,65%); }
    42% { text-shadow:none; }
    100%{ text-shadow:none; }
  }

  .project-card { position:relative; }
  .project-border-rect {
    stroke-dasharray: 4000;
    stroke-dashoffset: 4000;
    transition: stroke-dashoffset 0.7s ease;
  }
  .project-card:hover .project-border-rect { stroke-dashoffset: 0; }
`}</style>

        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/tech-placeholder.mp4"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'oklch(8% 0.015 262 / 0.82)' }} />

        {/* Número decorativo */}
        <span
          className="absolute select-none pointer-events-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '18vw',
            color: 'var(--color-tech)',
            opacity: 0.04,
            bottom: '-2rem',
            right: 0,
            lineHeight: 1,
          }}
        >
          02
        </span>

        <div className="absolute inset-0 flex flex-col justify-center">
          <div className="container mx-auto px-6 lg:px-12">

            <p
              className="mb-6"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-tech)', fontSize: '0.75rem', letterSpacing: '0.08em' }}
            >
              {'> dama_tech'}
            </p>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(3rem, 8vw, 7.5rem)',
                color: 'oklch(97% 0.006 58)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              <TypewriterText
                texts={heroProjects.map(p => p.name)}
                onIndexChange={setActiveIndex}
              />
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                color: 'oklch(62% 0.015 55)',
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                marginTop: '1.5rem',
                minHeight: '1.8em',
              }}
            >
              <SubtitleTypewriter text={heroProjects[activeIndex].subtitle} />
            </p>

          </div>
        </div>
      </section>

      {/* ── Seção 2: Serviços ── */}
      <section
        className="py-section"
        style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}
        ref={servicesRef}
      >
        <div className="container mx-auto px-6 lg:px-12">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={servicesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-tech)', fontSize: '0.7rem', marginBottom: '1rem' }}>
              // o que a gente constrói
            </p>
            <h2
              className="text-3xl lg:text-4xl leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: TEXT }}
            >
              Cada entrega é um produto. Não só código.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px mt-12"
            style={{ backgroundColor: BORDER }}
            initial="hidden"
            animate={servicesInView ? 'visible' : 'hidden'}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
          >
            {services.map((s) => (
              <motion.div
                key={s.num}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                }}
              >
                <div
                  className="service-card flex flex-col gap-3 p-8 h-full"
                  style={{ backgroundColor: BG }}
                  onMouseEnter={(e) => {
                    const hue = Math.floor(Math.random() * 360);
                    e.currentTarget.style.setProperty('--glitch-hue', `${hue}deg`);
                    e.currentTarget.style.setProperty('--glitch-hue-deg', `${hue}`);
                    e.currentTarget.classList.add('is-glitching');
                  }}
                  onAnimationEnd={(e) => {
                    if (e.animationName === 'card-glitch') {
                      e.currentTarget.classList.remove('is-glitching');
                    }
                  }}
                >
                  {/* Número decorativo de fundo */}
                  <span
                    className="absolute -bottom-4 -right-2 select-none pointer-events-none"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 900,
                      fontSize: '7rem',
                      lineHeight: 1,
                      color: 'var(--color-tech)',
                      opacity: 0.04,
                    }}
                  >
                    {s.num.replace('_', '')}
                  </span>

                  {/* Número pequeno */}
                  <span
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-tech)', fontSize: '0.7rem', opacity: 0.6 }}
                  >
                    {s.num}
                  </span>

                  {/* Nome */}
                  <h3
                    className="text-xl lg:text-2xl leading-tight"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: TEXT }}
                  >
                    {s.name}
                  </h3>

                  {/* Descrição */}
                  <p
                    className="text-sm leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)', color: MUTED }}
                  >
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── Seção 3: Projetos ── */}
      <section
        className="py-section"
        style={{ backgroundColor: BG_DARK, borderTop: `1px solid ${BORDER}` }}
        ref={projectsRef}
      >
        <div className="container mx-auto px-6 lg:px-12">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={projectsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-tech)', fontSize: '0.7rem', marginBottom: '1rem' }}>
              // em produção
            </p>
            <h2
              className="text-3xl lg:text-4xl leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: TEXT }}
            >
              Produtos que a gente construiu.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12"
            initial="hidden"
            animate={projectsInView ? 'visible' : 'hidden'}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
          >
            {projects.map((p) => (
              <motion.div
                key={p.brandName}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
                }}
                className="project-card group flex flex-col gap-4 p-8"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <rect
                    className="project-border-rect"
                    x="0.5" y="0.5"
                    width="99" height="99"
                    fill="none"
                    stroke="var(--color-tech)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <p style={{ fontFamily: 'var(--font-mono)', color: COMMENT, fontSize: '0.65rem' }}>
                  {p.tag}
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    src={p.logo}
                    alt={p.brandName}
                    width={44}
                    height={44}
                    className="object-contain rounded-xl shrink-0"
                  />
                  <span
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontWeight: 600,
                      fontSize: '1.5rem',
                      color: TEXT,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {p.brandName}
                  </span>
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ fontFamily: 'var(--font-body)', color: MUTED }}>
                  {p.desc}
                </p>
                {p.href && (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-start text-sm"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-tech)', fontSize: '0.7rem' }}
                  >
                    Ver projeto →
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── Seção 4: DAMA Labs ── */}
      <section
        className="py-section"
        style={{ backgroundColor: BG_DARK, borderTop: `1px solid ${BORDER}` }}
      >
        <div className="container mx-auto px-6 lg:px-12">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-tech)', fontSize: '0.7rem', marginBottom: '1rem' }}>
              // experimentos em produção
            </p>
            <h2
              className="text-3xl lg:text-4xl leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: TEXT }}
            >
              DAMA Labs
            </h2>
            <p
              className="text-base mt-3 max-w-lg"
              style={{ fontFamily: 'var(--font-body)', color: MUTED }}
            >
              Ideias que a gente coloca pra rodar — produtos internos que podem virar o próximo projeto da sua empresa.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px mt-12" style={{ backgroundColor: BORDER }}>
            {[
              {
                num: '_01',
                name: 'Poker Pay',
                desc: 'Gerenciador de cash game e torneios de poker — fichas, entradas, reentradas e pagamentos em tempo real.',
                href: '/labs/poker-pay',
              },
              {
                num: '_02',
                name: 'Fidelidade Digital',
                desc: 'Crie cartões fidelidade digitais para qualquer negócio. Sem papel, sem app — funciona no navegador do cliente.',
                href: '/labs/fidelidade',
              },
            ].map((lab) => (
              <a
                key={lab.num}
                href={lab.href}
                className="group flex flex-col gap-3 p-8"
                style={{ backgroundColor: BG_DARK }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-tech)', fontSize: '0.7rem', opacity: 0.6 }}>
                  {lab.num}
                </span>
                <h3
                  className="text-xl lg:text-2xl leading-tight group-hover:opacity-70 transition-opacity duration-200"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: TEXT }}
                >
                  {lab.name}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ fontFamily: 'var(--font-body)', color: MUTED }}>
                  {lab.desc}
                </p>
                <span
                  className="text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-tech)', fontSize: '0.7rem' }}
                >
                  Abrir →
                </span>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* ── Seção 6: CTA ── */}
      <section
        className="py-section"
        style={{ backgroundColor: 'var(--color-tech)' }}
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
              <p style={{ fontFamily: 'var(--font-mono)', color: 'oklch(97% 0.006 58 / 0.6)', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                {'> pronto?'}
              </p>

              <h2
                className="text-4xl lg:text-5xl leading-tight mb-4"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'oklch(97% 0.006 58)' }}
              >
                Tem um projeto em mente?
              </h2>

              <p
                className="text-lg mb-10"
                style={{ fontFamily: 'var(--font-body)', color: 'oklch(97% 0.006 58 / 0.75)' }}
              >
                A gente transforma a ideia em produto. Sem enrolação.
              </p>

              <Link
                href="/#contato"
                className="inline-block text-sm font-medium px-8 py-3 transition-colors duration-200"
                style={{
                  fontFamily: 'var(--font-ui)',
                  border: '1px solid oklch(97% 0.006 58 / 0.8)',
                  color: 'oklch(97% 0.006 58)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'oklch(97% 0.006 58)';
                  e.currentTarget.style.color = 'var(--color-tech)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'oklch(97% 0.006 58)';
                }}
              >
                Entrar em contato
              </Link>
            </motion.div>

            {/* Direita — terminal */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={ctaInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            >
              <TerminalCTA visible={ctaInView} />
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
