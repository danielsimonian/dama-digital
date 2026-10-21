import { Geist, Geist_Mono } from 'next/font/google';
import { MessageCircle, Instagram, Youtube } from 'lucide-react';
import { SiteHeader, Hero, SiteFooter, WhatsAppButton } from '@/components/ds/site';
import { Eyebrow, SplitTitle, Stat, Frame } from '@/components/ds/primitives';
import { CapabilityGrid, PartnerStrip, TeamCard } from '@/components/ds/cards';
import { ProcessNodes } from '@/components/ds/diagram';
import { capabilities, members, partners, process } from '@/lib/site-data';
import { socialLinks } from '@/lib/constants';
import { Divisoes } from './_home/Divisoes';
import { Contato } from './_home/Contato';
import { Reveal } from './_home/Reveal';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

const STATS = [
  { value: '12+', label: 'anos de estrada', note: 'desde o primeiro estúdio' },
  { value: '40+', label: 'lançamentos', note: '15 artistas nas plataformas' },
  { value: '400+', label: 'atletas', note: 'no 6º Open SPFC' },
  { value: '03', label: 'torneios em 2026', note: 'SPFC · Pan-Americano · ASSESP' },
];

function Secao({
  id,
  index,
  eyebrow,
  top,
  bottom,
  children,
  aside,
}: {
  id?: string;
  index: string;
  eyebrow: string;
  top: string;
  bottom: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-16 border-b border-ds-line">
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

export default function Home() {
  return (
    <div className={`${geist.variable} ${geistMono.variable} ds min-h-dvh bg-ds-bg text-ds-fg`} data-theme="dark">
      <SiteHeader current="/" sticky />
      <main>
        <Hero />

        <Secao id="divisoes" index="01" eyebrow="Divisões" top="Três frentes" bottom="um mesmo jeito de trabalhar">
          <Divisoes />
        </Secao>

        <Secao index="02" eyebrow="Capacidades" top="O que a gente faz" bottom="de ponta a ponta, dentro de casa">
          <CapabilityGrid items={capabilities} />
        </Secao>

        <section aria-label="Números" className="border-b border-ds-line">
          <Reveal className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-14 md:grid-cols-4 md:px-6 lg:px-8">
            {STATS.map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </Reveal>
        </section>

        <Secao index="03" eyebrow="Processo" top="Do briefing à entrega" bottom="quatro etapas, sem surpresa">
          <ProcessNodes steps={process} />
        </Secao>

        <Secao index="04" eyebrow="Parceiros e clientes" top="Quem já trabalhou com a gente" bottom="clubes, marcas, escolas e federações">
          <PartnerStrip partners={partners} />
        </Secao>

        <Secao id="sobre" index="05" eyebrow="Fundadores" top="Daniel e Marcella" bottom="som, imagem e código">
          <div className="grid gap-12 md:grid-cols-2">
            {members.map((m, i) => (
              <TeamCard key={m.name} member={m} index={i} />
            ))}
          </div>
        </Secao>

        <section id="contato" className="scroll-mt-16 border-b border-ds-line">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1fr_1.15fr] lg:px-8">
            <Reveal>
              <Eyebrow index="06">Contato</Eyebrow>
              <SplitTitle top="Conte o que você quer criar" bottom="a gente responde em até 1 dia útil" className="mt-5" />
              <ul className="mt-10 divide-y divide-ds-line border-y border-ds-line">
                {[
                  { href: socialLinks.whatsapp, label: 'WhatsApp', valor: '(13) 99743-4878', icon: MessageCircle },
                  { href: socialLinks.instagram, label: 'Instagram', valor: '@damadigital__', icon: Instagram },
                  { href: socialLinks.youtube, label: 'YouTube', valor: '@damadigital', icon: Youtube },
                ].map(({ href, label, valor, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-14 items-center gap-4 py-3"
                    >
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
                <Contato />
              </Frame>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
