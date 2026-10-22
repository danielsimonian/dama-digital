'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, MessageCircle, Instagram, Youtube, ArrowUpRight } from 'lucide-react';
import type { Divisao } from '@/lib/supabase';
import { cn, buttonClass, Eyebrow, SplitTitle, DIVISAO_LABEL } from './primitives';
import { DivisionDiagram } from './diagram';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function DamaLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo.png"
      alt="DAMA Digital"
      width={408}
      height={284}
      className={cn('h-8 w-auto [[data-theme=light]_&]:invert', className)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

const NAV: { href: string; label: string; divisao?: Divisao }[] = [
  { href: '/tech', label: 'Tech', divisao: 'tech' },
  { href: '/sports', label: 'Sports', divisao: 'sports' },
  { href: '/studio', label: 'Studio', divisao: 'studio' },
  { href: '/#sobre', label: 'Sobre' },
];

export function SiteHeader({ current, sticky = false }: { current?: string; sticky?: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'z-40 border-b border-ds-line bg-ds-bg/85 backdrop-blur-md',
          sticky && 'sticky top-0',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 md:px-6 lg:px-8">
          <Link href="/" aria-label="DAMA Digital — início" className="shrink-0">
            <DamaLogo />
          </Link>

          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => {
                const on = current === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-divisao={item.divisao}
                      aria-current={on ? 'page' : undefined}
                      className={cn(
                        'group relative inline-flex h-10 items-center gap-2 px-3 text-sm transition-colors',
                        on ? 'text-ds-fg' : 'text-ds-muted hover:text-ds-fg',
                      )}
                    >
                      {item.divisao && (
                        <span
                          className={cn(
                            'size-1.5 rounded-full bg-ds-accent transition-opacity',
                            on ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                          )}
                          aria-hidden
                        />
                      )}
                      {item.label}
                      {on && <span className="absolute inset-x-3 -bottom-[13px] h-px bg-ds-accent" aria-hidden />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="#contato" className={buttonClass({ variant: 'bracket', className: 'hidden sm:inline-flex' })}>
              Solicitar orçamento
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={open}
              className="-mr-2 inline-flex size-11 items-center justify-center text-ds-fg md:hidden"
            >
              <Menu className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* fora do <header>: o backdrop-blur prenderia o overlay fixo dentro dele */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="ds-grid-bg fixed inset-0 z-[100] flex flex-col bg-ds-bg md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <div className="flex h-16 items-center justify-between border-b border-ds-line px-4">
              <DamaLogo />
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="-mr-2 inline-flex size-11 items-center justify-center"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <nav aria-label="Principal" className="flex-1 px-4 pt-8">
              <ul>
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, transform: 'translateY(12px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0px)' }}
                    transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.05 + i * 0.05 }}
                    className="border-b border-ds-line"
                  >
                    <Link
                      href={item.href}
                      data-divisao={item.divisao}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-4 py-5"
                    >
                      <span className="ds-annot w-6">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-4xl font-medium tracking-tight">{item.label}</span>
                      {item.divisao && <span className="ml-auto size-2 self-center rounded-full bg-ds-accent" aria-hidden />}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-ds-line p-4">
              <Link href="#contato" onClick={() => setOpen(false)} className={buttonClass({ size: 'lg', className: 'w-full' })}>
                Solicitar orçamento
              </Link>
              <p className="ds-annot mt-4 text-center">SANTOS · SP · 23.96°S 46.33°W</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Hero editorial                                                      */
/* ------------------------------------------------------------------ */

const HERO_COPY: Record<Divisao, string> = {
  tech: 'Sites, sistemas e produtos digitais feitos sob medida — do RankingBT ao PlayStock.',
  sports: 'Torneios de ponta a ponta: estrutura, transmissão e cobertura. 400+ atletas no 6º Open SPFC.',
  studio: 'Produção musical, mixagem, master e distribuição. 15 artistas, mais de 40 lançamentos.',
};

export function Hero() {
  const [active, setActive] = useState<Divisao | null>(null);
  return (
    <section className="relative overflow-hidden border-b border-ds-line">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <div>
          <Eyebrow index="00">Agência criativa · 12+ anos</Eyebrow>
          <SplitTitle as="h1" top="DAMA Digital" bottom="Um estúdio de três frentes" className="mt-6 lg:text-[clamp(2.75rem,1.5rem+2.4vw,4rem)]" />
          <div className="mt-6 min-h-[3.5rem] max-w-[46ch]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={active ?? 'base'}
                data-divisao={active ?? undefined}
                initial={{ opacity: 0, transform: 'translateY(6px)' }}
                animate={{ opacity: 1, transform: 'translateY(0px)' }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="text-base leading-relaxed text-ds-muted md:text-lg"
              >
                {active ? (
                  <>
                    <span className="text-ds-accent">{DIVISAO_LABEL[active]}.</span> {HERO_COPY[active]}
                  </>
                ) : (
                  'Tecnologia, esporte e música sob o mesmo teto. Criatividade com mais de uma saída.'
                )}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="#contato" className={buttonClass({ size: 'lg' })}>
              Começar um projeto
            </Link>
            <Link href="#divisoes" className={buttonClass({ variant: 'bracket' })}>
              Ver as divisões
            </Link>
          </div>
        </div>
        <DivisionDiagram active={active} onActiveChange={setActive} className="mx-auto max-w-md lg:max-w-none" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

const FOOTER_COLS = [
  { title: 'Divisões', links: [['DAMA Tech', '/tech'], ['DAMA Sports', '/sports'], ['DAMA Studio', '/studio'], ['Artistas', '/studio/artistas']] },
  { title: 'Torneios', links: [['6º Open SPFC', '/sports/6o-open-spfc'], ['Seletiva Pan-Americano', '/sports/seletiva-pan-americano'], ['Open Santos ASSESP', '/sports/open-santos-assesp']] },
  { title: 'Labs', links: [['Todos os Labs', '/labs'], ['Poker Pay', '/labs/poker-pay'], ['Fidelidade Digital', '/labs/fidelidade']] },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-ds-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:grid-cols-[1.2fr_2fr] md:px-6 lg:px-8">
        <div>
          <DamaLogo className="h-10 w-36 object-contain object-left md:h-12 md:w-auto" />
          <p className="mt-4 max-w-xs text-sm text-ds-muted">
            Agência criativa de Daniel Simonian e Marcella Lima. Tecnologia, esporte e música.
          </p>
          <div className="mt-6 flex gap-2">
            {[
              { href: 'https://www.instagram.com/damadigital__/', label: 'Instagram', icon: Instagram },
              { href: 'https://www.youtube.com/@damadigital', label: 'YouTube', icon: Youtube },
              { href: 'https://wa.me/5513997434878', label: 'WhatsApp', icon: MessageCircle },
            ].map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="ds-press inline-flex size-11 items-center justify-center border border-ds-line text-ds-muted transition-colors hover:border-ds-line-strong hover:text-ds-fg"
              >
                <Icon className="size-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="ds-annot uppercase">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-ds-muted transition-colors hover:text-ds-fg">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-ds-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 md:px-6 lg:px-8">
          <p className="ds-annot">© 2026 DAMA Digital</p>
          <p className="ds-annot">SANTOS · SP · 23.96°S 46.33°W</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* WhatsApp flutuante                                                  */
/* ------------------------------------------------------------------ */

export function WhatsAppButton({ floating = true }: { floating?: boolean }) {
  return (
    <a
      href="https://wa.me/5513997434878"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'ds-press group z-40 inline-flex h-12 items-center gap-2 rounded-full border border-ds-line-strong bg-ds-surface-2 pl-4 pr-5 text-sm text-ds-fg shadow-[0_12px_32px_-12px_oklch(0%_0_0/0.6)] transition-colors hover:border-ds-success',
        floating && 'fixed bottom-4 right-4',
      )}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-ds-success opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-ds-success" />
      </span>
      WhatsApp
      <ArrowUpRight className="size-4 text-ds-subtle transition-colors group-hover:text-ds-fg" strokeWidth={1.5} aria-hidden />
    </a>
  );
}
