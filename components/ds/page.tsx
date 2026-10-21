import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import { MessageCircle, Instagram, Youtube } from 'lucide-react';
import { socialLinks } from '@/lib/constants';
import type { Divisao } from '@/lib/supabase';
import { cn, Eyebrow, SplitTitle, Frame } from './primitives';
import { SiteHeader, SiteFooter, WhatsAppButton } from './site';
import { Reveal } from './reveal';
import { Contato } from './contato';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

/** Página do site no Design System: fontes, tema escuro, header, footer e WhatsApp. */
export function SitePage({ current, divisao, children }: { current: string; divisao?: Divisao; children: ReactNode }) {
  return (
    <div
      className={`${geist.variable} ${geistMono.variable} ds min-h-dvh bg-ds-bg text-ds-fg`}
      data-theme="dark"
      data-divisao={divisao}
    >
      <SiteHeader current={current} sticky />
      <main>{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}

/** Seção com eyebrow numerado e título em duas linhas; revela ao entrar na tela. */
export function SiteSection({
  id,
  index,
  eyebrow,
  top,
  bottom,
  aside,
  className,
  children,
}: {
  id?: string;
  index: string;
  eyebrow: string;
  top: string;
  bottom?: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn('scroll-mt-16 border-b border-ds-line', className)}>
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
          <div>
            <Eyebrow index={index}>{eyebrow}</Eyebrow>
            <SplitTitle top={top} bottom={bottom} className="mt-5 max-w-3xl" />
          </div>
          {aside}
        </Reveal>
        <Reveal delay={0.08}>{children}</Reveal>
      </div>
    </section>
  );
}

const CANAIS = [
  { href: socialLinks.whatsapp, label: 'WhatsApp', valor: '(13) 99743-4878', icon: MessageCircle },
  { href: socialLinks.instagram, label: 'Instagram', valor: '@damadigital__', icon: Instagram },
  { href: socialLinks.youtube, label: 'YouTube', valor: '@damadigital', icon: Youtube },
];

/** Contato: canais + briefing com envio real. `divisao` já deixa a divisão escolhida no formulário. */
export function ContactSection({
  index,
  divisao,
  top = 'Conte o que você quer criar',
  bottom = 'a gente responde em até 1 dia útil',
}: {
  index: string;
  divisao?: Divisao;
  top?: string;
  bottom?: string;
}) {
  return (
    <section id="contato" className="scroll-mt-16 border-b border-ds-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1fr_1.15fr] lg:px-8">
        <Reveal>
          <Eyebrow index={index}>Contato</Eyebrow>
          <SplitTitle top={top} bottom={bottom} className="mt-5" />
          <ul className="mt-10 divide-y divide-ds-line border-y border-ds-line">
            {CANAIS.map(({ href, label, valor, icon: Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="group flex min-h-14 items-center gap-4 py-3">
                  <Icon className="size-4 shrink-0 text-ds-subtle transition-colors group-hover:text-ds-fg" strokeWidth={1.5} aria-hidden />
                  <span className="ds-annot w-20 shrink-0 uppercase">{label}</span>
                  <span className="min-w-0 truncate text-sm text-ds-muted transition-colors group-hover:text-ds-fg">{valor}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="ds-annot mt-6">SANTOS · SP · 23.96°S 46.33°W</p>
        </Reveal>
        <Reveal delay={0.08}>
          <Frame className="p-5 sm:p-8">
            <Contato divisao={divisao} />
          </Frame>
        </Reveal>
      </div>
    </section>
  );
}
