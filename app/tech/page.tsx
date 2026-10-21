import Link from 'next/link';
import { ArrowUpRight, Compass, Globe, LayoutDashboard, Plug, Smartphone, Workflow } from 'lucide-react';
import { SitePage, SiteSection, ContactSection } from '@/components/ds/page';
import { Reveal } from '@/components/ds/reveal';
import { buttonClass, Eyebrow, Frame, SplitTitle } from '@/components/ds/primitives';
import { ProjectCard } from '@/components/ds/cards';
import { ProcessNodes } from '@/components/ds/diagram';
import { process, projects, techLabs, techServices } from '@/lib/site-data';

const ICONES = [Globe, LayoutDashboard, Smartphone, Workflow, Plug, Compass];

export default function DamaTechPage() {
  return (
    <SitePage current="/tech" divisao="tech">
      {/* ── Hero: título + painel dos projetos no ar ── */}
      <section className="border-b border-ds-line">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:px-8">
          <Reveal>
            <Eyebrow index="00">DAMA Tech · Software sob medida</Eyebrow>
            <SplitTitle
              as="h1"
              top="Sites, sistemas e produtos"
              bottom="do rascunho ao ar"
              className="mt-6 lg:text-[clamp(2.75rem,1.5rem+2.4vw,4rem)]"
            />
            <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-ds-muted md:text-lg">
              Cada entrega é um produto, não só código. Do MVP ao sistema que roda o dia a dia da sua empresa.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="#contato" className={buttonClass({ size: 'lg' })}>
                Começar um projeto
              </Link>
              <Link href="#projetos" className={buttonClass({ variant: 'bracket' })}>
                Ver projetos
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Frame className="bg-ds-surface p-5 font-ds-mono text-sm sm:p-6 [--ds-corner:var(--ds-accent)]">
              <p className="ds-annot flex items-center justify-between">
                <span>dama-tech ~ % deploy --status</span>
                <span className="text-ds-accent">{String(projects.length).padStart(2, '0')} no ar</span>
              </p>
              <ul className="mt-4 divide-y divide-ds-line border-y border-ds-line">
                {projects.map((p) => (
                  <li key={p.domain}>
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="group flex min-h-12 items-center gap-3 py-2.5">
                      <span className="size-1.5 shrink-0 rounded-full bg-ds-accent" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-ds-fg group-hover:underline">{p.domain}</span>
                      <span className="hidden shrink-0 text-xs text-ds-subtle sm:inline">{p.tag}</span>
                      <ArrowUpRight className="size-4 shrink-0 text-ds-subtle transition-colors group-hover:text-ds-accent" strokeWidth={1.5} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </Frame>
          </Reveal>
        </div>
      </section>

      {/* ── Serviços ── */}
      <SiteSection index="01" eyebrow="O que a gente faz" top="Cada entrega é um produto" bottom="não só código">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {techServices.map((s, i) => {
            const Icone = ICONES[i];
            return (
              <Frame key={s.name} interactive className="group flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="ds-annot tabular-nums transition-colors group-hover:text-ds-accent">_{String(i + 1).padStart(2, '0')}</span>
                  <Icone className="size-5 text-ds-subtle transition-colors group-hover:text-ds-accent" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="mt-8 text-lg font-medium tracking-tight text-ds-fg">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ds-muted">{s.desc}</p>
              </Frame>
            );
          })}
        </div>
      </SiteSection>

      {/* ── Projetos ── */}
      <SiteSection id="projetos" index="02" eyebrow="Projetos" top="Produtos que a gente construiu" bottom="e que estão no ar hoje">
        <div className="border-b border-ds-line">
          {projects.map((p, i) => (
            <ProjectCard key={p.name} project={p} index={i} />
          ))}
        </div>
      </SiteSection>

      {/* ── Processo ── */}
      <SiteSection index="03" eyebrow="Processo" top="Do briefing ao deploy" bottom="com prévias toda semana">
        <ProcessNodes steps={process} divisao="tech" />
      </SiteSection>

      {/* ── Labs ── */}
      <SiteSection index="04" eyebrow="DAMA Labs" top="Ideias que a gente põe pra rodar" bottom="produtos internos, abertos para testar">
        <div className="grid gap-2 md:grid-cols-2">
          {techLabs.map((l, i) => (
            <Link key={l.href} href={l.href} className="group">
              <Frame interactive className="flex h-full flex-col p-6">
                <span className="ds-annot tabular-nums transition-colors group-hover:text-ds-accent">_{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 text-2xl font-medium tracking-tight text-ds-fg">{l.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ds-muted">{l.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-ds-fg transition-colors group-hover:text-ds-accent">
                  Abrir <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
                </span>
              </Frame>
            </Link>
          ))}
        </div>
      </SiteSection>

      <ContactSection index="05" divisao="tech" top="Tem um sistema na cabeça?" bottom="conta pra gente o que precisa rodar" />
    </SitePage>
  );
}
