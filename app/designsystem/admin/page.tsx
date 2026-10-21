import type { Metadata } from 'next';
import { CalendarDays, CircleCheck, CircleAlert, FileText, Send, Eye, Download, PlayCircle, BookOpen } from 'lucide-react';
import { Eyebrow, SplitTitle, Annotation, Frame, Kbd } from '@/components/ds/primitives';
import {
  KpiTile,
  HoursMeter,
  PlanSummary,
  AttendanceStrip,
  PresencaMark,
  LancamentoStatusLabel,
  QuoteTrack,
  PapelBadge,
  Timeline,
  brl,
} from '@/components/ds/admin/display';
import { MonthlyBars } from '@/components/ds/admin/finance-chart';
import { QuoteBuilder } from '@/components/ds/admin/quote-builder';
import { Shell, type NavGroup } from '../_components/Shell';
import { Section, Specimen } from '../_components/Catalog';
import { AdminPrototype } from './_components/Prototype';
import { SidebarDemo, PaletteDemo, TableDemo, WeekDemo, AttendanceDemo } from './_components/AdminDemos';
import { meses, catalogo, pessoas, quoteLines } from './_data';

export const metadata: Metadata = {
  title: 'Design System · Admin — DAMA Digital',
};

const GROUPS: NavGroup[] = [
  {
    title: 'Ideia',
    items: [{ id: 'prototipo', index: 'A0', label: 'Protótipo navegável' }],
  },
  {
    title: 'Componentes de admin',
    items: [
      { id: 'navegacao-admin', index: 'A1', label: 'Sidebar e ⌘K' },
      { id: 'indicadores', index: 'A2', label: 'Indicadores' },
      { id: 'tabela', index: 'A3', label: 'Tabela de dados' },
      { id: 'agenda', index: 'A4', label: 'Agenda e presença' },
      { id: 'planos', index: 'A5', label: 'Planos e pacotes' },
      { id: 'financeiro', index: 'A6', label: 'Financeiro' },
      { id: 'orcamento', index: 'A7', label: 'Gerador de orçamento' },
      { id: 'atividade', index: 'A8', label: 'Linha do tempo' },
    ],
  },
  {
    title: 'Do outro lado',
    items: [{ id: 'portal', index: 'A9', label: 'Portal do aluno' }],
  },
];

const livia = pessoas.find((p) => p.id === 'livia')!;
const julia = pessoas.find((p) => p.id === 'julia')!;
const mare = pessoas.find((p) => p.id === 'mare')!;

export default function AdminDesignSystemPage() {
  return (
    <Shell groups={GROUPS} section="admin" defaultTheme="light">
      {/* Abertura */}
      <section className="ds-grid-bg relative overflow-hidden px-4 pb-14 pt-16 md:px-8 md:pb-20 md:pt-20 lg:px-12">
        <Eyebrow index="A">Admin · out 2026 · rascunho para aprovação</Eyebrow>
        <SplitTitle as="h1" size="display" top="Admin DAMA" bottom="O escritório inteiro" className="mt-6" />
        <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-ds-muted md:text-lg">
          Pessoas, agenda de aulas e estúdio, orçamentos e financeiro no mesmo lugar, para Daniel e Marcella. Mesma linguagem do
          site, em tema claro e mais denso, porque é ferramenta de todo dia.
        </p>
        <div className="mt-10 grid gap-px border border-ds-line bg-ds-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['01', 'Uma ficha por pessoa', 'Aluno, cliente de estúdio ou de projeto: o mesmo cadastro, com papéis.'],
            ['02', 'Tudo vira lançamento', 'Mensalidade, sessão, pacote ou orçamento aprovado caem no financeiro sozinhos.'],
            ['03', 'Presença em um toque', 'Marcar aula realizada ou falta direto do início, sem abrir nada.'],
            ['04', 'Teclado primeiro', '⌘K busca qualquer pessoa, tela ou ação. O mouse é opcional.'],
          ].map(([n, t, d]) => (
            <div key={n} className="bg-ds-bg p-5">
              <p className="ds-annot text-ds-accent">{n}</p>
              <p className="mt-3 font-medium text-ds-fg">{t}</p>
              <p className="mt-1 text-sm text-ds-muted">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
          <Annotation>6 telas · dados fictícios</Annotation>
          <Annotation>nada aqui grava no banco</Annotation>
          <Annotation>
            <span className="inline-flex items-center gap-1">
              experimente <Kbd>⌘K</Kbd>
            </span>
          </Annotation>
        </div>
      </section>

      <Section
        id="prototipo"
        index="A0"
        title="Protótipo navegável"
        desc="Clique pelas telas: marque presença no Início, abra uma pessoa, registre um pagamento no Financeiro, monte um orçamento puxando itens do catálogo. Tudo funciona com dados simulados."
      >
        <div className="-mx-4 md:-ml-[7rem] md:mr-0">
          <AdminPrototype />
        </div>
      </Section>

      <Section id="navegacao-admin" index="A1" title="Sidebar e paleta de comandos" desc="Navegação numerada como o site, contadores em mono, ponto vermelho quando há pendência. A paleta abre sem animação — é ação de teclado.">
        <div className="grid gap-4 md:grid-cols-[15rem_1fr]">
          <SidebarDemo />
          <div className="space-y-4">
            <Specimen label="CommandPalette" note="↑↓ · ↵ · esc">
              <PaletteDemo />
              <p className="mt-4 text-sm text-ds-muted">
                Grupos: <span className="text-ds-fg">Criar</span>, <span className="text-ds-fg">Ir para</span> e{' '}
                <span className="text-ds-fg">Pessoas</span>. Atalhos de duas letras (N A = novo aluno) aparecem ao lado.
              </p>
            </Specimen>
            <Specimen label="PapelBadge" note="aluno · estúdio · tech · sports">
              <div className="flex flex-wrap gap-2">
                <PapelBadge papel="aluno" />
                <PapelBadge papel="estudio" />
                <PapelBadge papel="tech" />
                <PapelBadge papel="sports" />
              </div>
            </Specimen>
          </div>
        </div>
      </Section>

      <Section id="indicadores" index="A2" title="Indicadores" desc="Cantos marcados, valor em destaque, variação com seta e cor de status — e sparkline só quando a tendência importa.">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <KpiTile label="Recebido · out" value={brl(9870)} note="até hoje" spark={meses.slice(0, 6).map((m) => m.recebido)} />
          <KpiTile label="Recebido · set" value={brl(14380)} delta={{ value: '+15,8%', up: true, good: true }} note="vs ago" />
          <KpiTile label="Em atraso" value={brl(380)} note="1 lançamento" tone="danger" />
          <KpiTile label="Semana" value="7 aulas" note="+ 8 h de estúdio" />
        </div>
      </Section>

      <Section id="tabela" index="A3" title="Tabela de dados" desc="Densa, com cabeçalho fixo, ordenação por coluna e linha selecionada marcada no acento. Abaixo de 768px vira lista de cards.">
        <div className="space-y-4">
          <Specimen label="DataTable" note="clique no cabeçalho para ordenar" bodyClass="p-0 md:p-0">
            <TableDemo />
          </Specimen>
          <div className="grid gap-4 md:grid-cols-2">
            <Specimen label="Carregando" note="skeleton com a forma da linha" bodyClass="p-0 md:p-0">
              <TableDemo state="loading" />
            </Specimen>
            <Specimen label="Vazio" note="diz o que fazer em seguida" bodyClass="p-0 md:p-0">
              <TableDemo state="empty" />
            </Specimen>
          </div>
        </div>
      </Section>

      <Section id="agenda" index="A4" title="Agenda e presença" desc="Aula tem filete à esquerda; sessão de estúdio é bloco preenchido. Presença usa forma e cor juntas — dá para ler mesmo sem distinguir as cores.">
        <div className="space-y-4">
          <Specimen label="WeekCalendar" note="no celular vira lista por dia" bodyClass="p-0 md:p-4">
            <WeekDemo />
          </Specimen>
          <div className="grid gap-4 lg:grid-cols-2">
            <Specimen label="AttendanceControl" note="um toque; tocar de novo desfaz">
              <AttendanceDemo />
            </Specimen>
            <Specimen label="AttendanceStrip" note="frequência do mês">
              <AttendanceStrip items={livia.frequencia!} meta={4} legend />
            </Specimen>
          </div>
          <Specimen label="PresencaMark" note="estados">
            <div className="flex flex-wrap gap-6">
              {(['agendada', 'realizada', 'falta', 'justificada', 'reposicao'] as const).map((p) => (
                <span key={p} className="inline-flex items-center gap-2 text-sm text-ds-muted">
                  <PresencaMark presenca={p} />
                  {p === 'reposicao' ? 'reposição' : p}
                </span>
              ))}
            </div>
          </Specimen>
        </div>
      </Section>

      <Section id="planos" index="A5" title="Planos e pacotes" desc="Aluno tem plano mensal; cliente de estúdio pode ter pacote de horas. O medidor conta hora a hora e avisa quando está acabando.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Specimen label="PlanSummary" note="plano do aluno">
            <PlanSummary plano={livia.plano!} />
          </Specimen>
          <Specimen label="HoursMeter" note="normal · quase no fim">
            <div className="space-y-6">
              <HoursMeter pacote={mare.pacote!} />
              <HoursMeter pacote={{ ...julia.pacote!, usadas: 8.5 }} />
            </div>
          </Specimen>
        </div>
      </Section>

      <Section id="financeiro" index="A6" title="Financeiro" desc="O gráfico usa uma cor só: o que falta receber aparece com textura, não com outra cor. Status sempre com ponto + texto.">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Specimen label="MonthlyBars" note="passe o mouse nas barras">
            <MonthlyBars data={meses} current="out" />
          </Specimen>
          <Specimen label="LancamentoStatus" note="pago · pendente · atrasado · previsto">
            <ul className="divide-y divide-ds-line text-sm">
              {(
                [
                  ['pago', 'Mensalidade out · Piano', 690],
                  ['pendente', 'Sessão 21/10 · 2h', 360],
                  ['atrasado', 'Mensalidade out · Bateria', 380],
                  ['previsto', 'Pacote 20h · parcela 2/2', 1400],
                ] as const
              ).map(([s, d, v]) => (
                <li key={s} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-ds-fg">{d}</span>
                    <LancamentoStatusLabel status={s} />
                  </span>
                  <span className="font-ds-mono tabular-nums">{brl(v)}</span>
                </li>
              ))}
            </ul>
          </Specimen>
        </div>
      </Section>

      <Section id="orcamento" index="A7" title="Gerador de orçamento" desc="Itens vêm do catálogo da divisão (digite e ↵), valor e quantidade editáveis, entrada + parcelas e o resumo do que vira lançamento ao aprovar.">
        <div className="space-y-4">
          <Specimen label="QuoteTrack" note="completo · compacto">
            <div className="grid gap-6 md:grid-cols-2">
              <QuoteTrack status="visualizado" />
              <div className="flex flex-col gap-2">
                {(['rascunho', 'enviado', 'visualizado', 'aprovado', 'recusado'] as const).map((s) => (
                  <QuoteTrack key={s} status={s} compact />
                ))}
              </div>
            </div>
          </Specimen>
          <Specimen label="QuoteBuilder" note="EP · DAMA Studio">
            <QuoteBuilder
              catalogo={catalogo}
              clientes={pessoas.map((p) => ({ id: p.id, nome: p.nome }))}
              inicial={{ numero: '0431', titulo: 'EP "Maré Cheia" · 4 faixas', clienteId: 'julia', divisao: 'studio', status: 'rascunho', versao: 1, ...quoteLines['0431'] }}
            />
          </Specimen>
        </div>
      </Section>

      <Section id="atividade" index="A8" title="Linha do tempo" desc="Tudo o que aconteceu com uma pessoa, em ordem: aulas, pagamentos, orçamentos.">
        <Specimen label="Timeline" note="ficha de Júlia Navarro">
          <div className="max-w-md">
            <Timeline
              items={[
                { when: 'sex 23 · 15:00', title: 'Sessão agendada · Mix do EP', icon: <CalendarDays />, tone: 'accent' },
                { when: 'ontem, 18:42', title: 'Orçamento #0431 aprovado', desc: 'EP "Maré Cheia" · R$ 3.960 · gerou 2 lançamentos', icon: <CircleCheck />, tone: 'success' },
                { when: '18 out', title: 'Orçamento visualizado', desc: 'pelo celular · 2 acessos', icon: <Eye /> },
                { when: '17 out', title: 'Orçamento enviado · v2', icon: <Send /> },
                { when: '05 out · Pix', title: 'Mensalidade out · Canto', desc: brl(420), icon: <CircleCheck />, tone: 'success' },
                { when: '28 set', title: 'Falta justificada · aula de canto', icon: <CircleAlert /> },
              ]}
            />
          </div>
        </Specimen>
      </Section>

      <Section id="portal" index="A9" title="Portal do aluno" desc="O que a Lívia vê no celular: próxima aula, frequência, materiais do curso e mensalidades. Mesmo sistema, login próprio (Supabase Auth).">
        <div className="flex justify-center md:justify-start">
          <Frame className="w-full max-w-[24rem] p-2 [--ds-corner-size:18px]">
            <div className="overflow-hidden border border-ds-line bg-ds-bg" data-divisao="studio">
              <div className="flex items-center justify-between border-b border-ds-line px-4 py-3">
                <span className="ds-annot uppercase">DAMA Studio · aluno</span>
                <span className="size-7 rounded-full border border-ds-line bg-ds-surface-2 text-center font-ds-mono text-[11px] leading-7 text-ds-muted">LP</span>
              </div>
              <div className="space-y-6 p-4">
                <div>
                  <p className="text-2xl font-medium tracking-tight">Olá, Lívia</p>
                  <p className="text-sm text-ds-muted">Violão · com Daniel</p>
                </div>
                <div className="ds-corners bg-ds-accent-soft p-4 [--ds-corner:var(--ds-accent)]">
                  <p className="ds-annot uppercase text-ds-accent">Próxima aula</p>
                  <p className="mt-2 text-lg font-medium">Hoje, 19:00</p>
                  <p className="text-sm text-ds-muted">Sala 1 · 50 min</p>
                  <p className="ds-annot mt-3">reposição marcada · sáb 24, 11:00</p>
                </div>
                <div>
                  <p className="ds-annot mb-2 uppercase">Frequência · outubro</p>
                  <AttendanceStrip items={livia.frequencia!} meta={4} />
                </div>
                <div>
                  <p className="ds-annot mb-2 uppercase">Materiais · módulo 3</p>
                  <ul className="divide-y divide-ds-line border-y border-ds-line text-sm">
                    {[
                      { icon: <PlayCircle />, t: 'Acordes com pestana', m: 'vídeo · 8 min' },
                      { icon: <Download />, t: 'Cifra — Wave (Tom Jobim)', m: 'pdf' },
                      { icon: <BookOpen />, t: 'Exercício: troca F → Bb', m: 'para quinta' },
                    ].map((x) => (
                      <li key={x.t} className="flex items-center gap-3 py-3">
                        <span className="text-ds-accent [&_svg]:size-4">{x.icon}</span>
                        <span className="min-w-0 flex-1 truncate">{x.t}</span>
                        <span className="ds-annot shrink-0">{x.m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="ds-annot mb-2 uppercase">Mensalidades</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center justify-between">
                      <span>
                        Outubro <LancamentoStatusLabel status="pago" />
                      </span>
                      <span className="font-ds-mono tabular-nums">{brl(380)}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>
                        Novembro <LancamentoStatusLabel status="previsto" />
                      </span>
                      <span className="font-ds-mono tabular-nums">{brl(380)}</span>
                    </li>
                  </ul>
                  <p className="ds-annot mt-3 flex items-center gap-1.5">
                    <FileText className="size-3" strokeWidth={1.5} aria-hidden /> chave Pix e recibos ficam aqui
                  </p>
                </div>
              </div>
            </div>
          </Frame>
        </div>
      </Section>

      <footer className="border-t border-ds-line px-4 py-10 md:px-8 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="ds-annot">DAMA DIGITAL · DESIGN SYSTEM v2.1 · ADMIN · OUT 2026</p>
          <p className="ds-annot">componentes em components/ds/admin/ · dados fictícios</p>
        </div>
      </footer>
    </Shell>
  );
}
