import { Hero } from '@/components/ds/site';
import { SitePage, SiteSection, ContactSection } from '@/components/ds/page';
import { Reveal } from '@/components/ds/reveal';
import { Stat } from '@/components/ds/primitives';
import { CapabilityGrid, PartnerStrip, TeamCard } from '@/components/ds/cards';
import { ProcessNodes } from '@/components/ds/diagram';
import { capabilities, members, partners, process } from '@/lib/site-data';
import { Divisoes } from './_home/Divisoes';

const STATS = [
  { value: '12+', label: 'anos de estrada', note: 'desde o primeiro estúdio' },
  { value: '40+', label: 'lançamentos', note: '15 artistas nas plataformas' },
  { value: '400+', label: 'atletas', note: 'no 6º Open SPFC' },
  { value: '03', label: 'torneios em 2026', note: 'SPFC · Pan-Americano · ASSESP' },
];

export default function Home() {
  return (
    <SitePage current="/">
      <Hero />

      <SiteSection id="divisoes" index="01" eyebrow="Divisões" top="Três frentes" bottom="um mesmo jeito de trabalhar">
        <Divisoes />
      </SiteSection>

      <SiteSection index="02" eyebrow="Capacidades" top="O que a gente faz" bottom="de ponta a ponta, dentro de casa">
        <CapabilityGrid items={capabilities} />
      </SiteSection>

      <section aria-label="Números" className="border-b border-ds-line">
        <Reveal className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-14 md:grid-cols-4 md:px-6 lg:px-8">
          {STATS.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </Reveal>
      </section>

      <SiteSection index="03" eyebrow="Processo" top="Do briefing à entrega" bottom="quatro etapas, sem surpresa">
        <ProcessNodes steps={process} />
      </SiteSection>

      <SiteSection index="04" eyebrow="Parceiros e clientes" top="Quem já trabalhou com a gente" bottom="clubes, marcas, escolas e federações">
        <PartnerStrip partners={partners} />
      </SiteSection>

      <SiteSection id="sobre" index="05" eyebrow="Fundadores" top="Daniel e Marcella" bottom="som, imagem e código">
        <div className="grid gap-12 md:grid-cols-2">
          {members.map((m, i) => (
            <TeamCard key={m.name} member={m} index={i} />
          ))}
        </div>
      </SiteSection>

      <ContactSection index="06" />
    </SitePage>
  );
}
