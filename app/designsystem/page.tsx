import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Camera,
  Download,
  MapPin,
  Mic2,
  Play,
  Search,
  Trophy,
  Upload,
  Users,
  Mail,
} from 'lucide-react';
import {
  cn,
  Button,
  ButtonLink,
  UnderlineLink,
  ArrowLink,
  DivisionBadge,
  StatusBadge,
  Avatar,
  AvatarGroup,
  Divider,
  Annotation,
  Eyebrow,
  SplitTitle,
  Frame,
  Alert,
  Skeleton,
  Tooltip,
  Breadcrumbs,
  Stat,
  Kbd,
} from '@/components/ds/primitives';
import { TextField, TextArea, SelectField, Checkbox, Radio, Switch } from '@/components/ds/fields';
import { Accordion, Tabs, Pagination, FilterChips } from '@/components/ds/interactive';
import { LINE_ART, type LineArtKey } from '@/components/ds/line-art';
import { ProcessNodes } from '@/components/ds/diagram';
import {
  CapabilityGrid,
  ProjectCard,
  TournamentCard,
  ArtistCard,
  ReleaseCard,
  ServiceCard,
  TeamCard,
  PartnerStrip,
  EmptyState,
  NotFoundBlock,
} from '@/components/ds/cards';
import { Gallery, VideoFrame } from '@/components/ds/media';
import { SiteHeader, Hero, SiteFooter, WhatsAppButton } from '@/components/ds/site';
import { Shell, type NavGroup } from './_components/Shell';
import { Section, Specimen, StateLabel } from './_components/Catalog';
import {
  LoadingButtonDemo,
  DropdownDemo,
  ToastDemo,
  ModalDemo,
  DrawerDemo,
  ContactDemo,
  MotionDemo,
  IconButtonDemo,
} from './_components/Demos';
import {
  capabilities,
  projects,
  tournaments,
  gallery,
  artists,
  releases,
  services,
  members,
  partners,
  process,
} from '@/lib/site-data';

/* ------------------------------------------------------------------ */
/* Índice                                                              */
/* ------------------------------------------------------------------ */

const GROUPS: NavGroup[] = [
  {
    title: 'Fundamentos',
    items: [
      { id: 'cores', index: '01', label: 'Cores' },
      { id: 'tipografia', index: '02', label: 'Tipografia' },
      { id: 'grid', index: '03', label: 'Grid e espaço' },
      { id: 'linhas', index: '04', label: 'Linhas, raios, elevação' },
      { id: 'iconografia', index: '05', label: 'Ícones e traço' },
      { id: 'movimento', index: '06', label: 'Movimento' },
    ],
  },
  {
    title: 'Componentes básicos',
    items: [
      { id: 'botoes', index: '07', label: 'Botões e links' },
      { id: 'campos', index: '08', label: 'Campos' },
      { id: 'selecao', index: '09', label: 'Seleção' },
      { id: 'badges', index: '10', label: 'Badges e avatares' },
      { id: 'sobreposicao', index: '11', label: 'Tooltip, menu, FAQ' },
      { id: 'feedback', index: '12', label: 'Feedback' },
      { id: 'navegacao', index: '13', label: 'Navegação' },
      { id: 'estrutura', index: '14', label: 'Divisores e cotas' },
    ],
  },
  {
    title: 'Componentes DAMA',
    items: [
      { id: 'header', index: '15', label: 'Header' },
      { id: 'hero', index: '16', label: 'Hero + diagrama' },
      { id: 'capacidades', index: '17', label: 'Capacidades' },
      { id: 'projetos', index: '18', label: 'Projetos · Tech' },
      { id: 'torneios', index: '19', label: 'Torneios · Sports' },
      { id: 'midia', index: '20', label: 'Galeria e reel' },
      { id: 'studio', index: '21', label: 'Artistas · Studio' },
      { id: 'parceiros', index: '22', label: 'Parceiros' },
      { id: 'processo', index: '23', label: 'Processo' },
      { id: 'servicos', index: '24', label: 'Serviços' },
      { id: 'equipe', index: '25', label: 'Equipe' },
      { id: 'contato', index: '26', label: 'Briefing' },
      { id: 'footer', index: '27', label: 'Footer' },
      { id: 'estados', index: '28', label: 'Vazio, skeleton, 404' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Peças da página de catálogo                                         */
/* ------------------------------------------------------------------ */

function Swatch({ v, name, note, ring }: { v: string; name: string; note: string; ring?: boolean }) {
  return (
    <div>
      <div
        className={cn('h-20 border', ring ? 'border-ds-line-strong' : 'border-ds-line')}
        style={{ background: `var(${v})` }}
      />
      <p className="mt-2 font-ds-mono text-[11px] text-ds-fg">{name}</p>
      <p className="ds-annot">{note}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function DesignSystemPage() {
  return (
    <Shell groups={GROUPS}>
      {/* Abertura */}
      <section className="ds-grid-bg relative overflow-hidden px-4 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24 lg:px-12">
        <Eyebrow index="00">Manual de campo · out 2026</Eyebrow>
        <SplitTitle as="h1" size="display" top="Design System" bottom="DAMA Digital" className="mt-6" />
        <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-ds-muted md:text-lg">
          Uma linguagem técnica e editorial para as três frentes da DAMA. Base monocromática, linhas finas como estrutura e
          cor só onde importa: o acento de cada divisão.
        </p>
        <div className="mt-10 grid gap-px border border-ds-line bg-ds-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['01', 'Linha é estrutura', 'Hairlines de 1px, grids de construção e cotas no lugar de sombras e caixas.'],
            ['02', 'Cor é exceção', 'Base neutra. Tech, Sports e Studio trocam só o acento, nunca a estrutura.'],
            ['03', 'Mono anota', 'Números, datas e rótulos técnicos em Geist Mono. O resto em Geist.'],
            ['04', 'Conteúdo real', 'Torneios, artistas e projetos de verdade. Nada de placeholder genérico.'],
          ].map(([n, t, d]) => (
            <div key={n} className="bg-ds-bg p-5">
              <p className="ds-annot text-ds-accent">{n}</p>
              <p className="mt-3 font-medium text-ds-fg">{t}</p>
              <p className="mt-1 text-sm text-ds-muted">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
          <Annotation>28 componentes</Annotation>
          <Annotation>2 temas · 4 acentos</Annotation>
          <Annotation>Next.js · Tailwind 4 · Framer Motion</Annotation>
        </div>
      </section>

      {/* ============================ FUNDAMENTOS ============================ */}

      <Section
        id="cores"
        index="01"
        title="Cores"
        desc="Superfícies em camadas muito próximas, texto em três níveis e um acento por divisão. Troque o tema e o acento no topo da página para ver todos os tokens reagirem."
      >
        <div className="space-y-10">
          <div>
            <StateLabel>Superfícies</StateLabel>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Swatch v="--ds-bg" name="ds-bg" note="fundo da página" ring />
              <Swatch v="--ds-surface" name="ds-surface" note="cards, campos" />
              <Swatch v="--ds-surface-2" name="ds-surface-2" note="menus, hover" />
              <Swatch v="--ds-surface-3" name="ds-surface-3" note="selecionado" />
            </div>
          </div>
          <div>
            <StateLabel>Texto e linhas</StateLabel>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <Swatch v="--ds-fg" name="ds-fg" note="títulos, corpo" />
              <Swatch v="--ds-muted" name="ds-muted" note="corpo secundário" />
              <Swatch v="--ds-subtle" name="ds-subtle" note="anotações" />
              <Swatch v="--ds-line" name="ds-line" note="hairline padrão" />
              <Swatch v="--ds-line-strong" name="ds-line-strong" note="cantos, hover" />
            </div>
          </div>
          <div>
            <StateLabel>Acentos de divisão</StateLabel>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Swatch v="--ds-fg" name="neutro" note="home institucional" />
              <Swatch v="--ds-tech" name="ds-tech" note="índigo · DAMA Tech" />
              <Swatch v="--ds-sports" name="ds-sports" note="tijolo · DAMA Sports" />
              <Swatch v="--ds-studio" name="ds-studio" note="musgo · DAMA Studio" />
            </div>
            <div className="mt-4">
              <Alert tone="info" title="Quando usar cor">
                Um ponto, uma linha ativa, um número, um estado selecionado. Nunca fundo de seção inteira, nunca gradiente, nunca
                dois acentos na mesma tela.
              </Alert>
            </div>
          </div>
          <div>
            <StateLabel>Feedback</StateLabel>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Swatch v="--ds-success" name="ds-success" note="confirmado, enviado" />
              <Swatch v="--ds-warning" name="ds-warning" note="rascunho, atenção" />
              <Swatch v="--ds-danger" name="ds-danger" note="erro, destrutivo" />
              <Swatch v="--ds-info" name="ds-info" note="próximo, informativo" />
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="tipografia"
        index="02"
        title="Tipografia"
        desc="Geist para tudo que se lê; Geist Mono para tudo que se mede. Títulos com tracking negativo e a segunda linha em cinza."
      >
        <div className="divide-y divide-ds-line border-y border-ds-line">
          {[
            { token: 'text-ds-hero', spec: 'clamp 52→136 · 500 · -0.035em', cls: 'text-ds-hero font-medium tracking-tight', sample: 'DAMA' },
            { token: 'text-ds-display', spec: 'clamp 44→88 · 500', cls: 'text-ds-display font-medium tracking-tight', sample: 'Três frentes' },
            { token: 'text-ds-title', spec: 'clamp 36→56 · 500', cls: 'text-ds-title font-medium tracking-tight', sample: '6º Open SPFC' },
            { token: 'text-2xl', spec: '24 · 500', cls: 'text-2xl font-medium tracking-tight', sample: 'Cobertura de torneio completa' },
            { token: 'text-base', spec: '16 · 400 · 1.625', cls: 'text-base text-ds-muted max-w-[60ch]', sample: 'Estrutura completa, transmissão e reels no mesmo dia. 400+ atletas em três dias no CT do São Paulo FC.' },
            { token: 'text-sm', spec: '14 · 400', cls: 'text-sm text-ds-muted', sample: 'Rótulos de interface, navegação e botões.' },
            { token: 'ds-annot', spec: 'mono 11 · +0.04em', cls: 'ds-annot', sample: 'r 155 · 270° · 29–31 MAI 2026 · 23.96°S 46.33°W' },
            { token: 'font-ds-mono', spec: 'mono 14 · tabular', cls: 'font-ds-mono text-sm tabular-nums', sample: 'R$ 18.640,00 · 400+ · 19 categorias' },
          ].map((t) => (
            <div key={t.token} className="grid gap-3 py-6 md:grid-cols-[11rem_1fr] md:items-baseline">
              <div>
                <p className="font-ds-mono text-[11px] text-ds-fg">{t.token}</p>
                <p className="ds-annot">{t.spec}</p>
              </div>
              <p className={cn('min-w-0 break-words', t.cls)}>{t.sample}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Specimen label="Título em duas linhas" note="SplitTitle">
            <SplitTitle top="Agência criativa" bottom="com mais de uma saída" />
          </Specimen>
          <Specimen label="Eyebrow" note="índice + rótulo">
            <Eyebrow index="03">DAMA Sports · torneios</Eyebrow>
            <p className="mt-4 text-sm text-ds-muted">Abre seções. Número no acento, rótulo em mono.</p>
          </Specimen>
        </div>
      </Section>

      <Section
        id="grid"
        index="03"
        title="Grid e espaço"
        desc="12 colunas, container de 1280px, margens de 16/24/32px. As linhas de construção podem ficar visíveis como elemento gráfico (ds-grid-bg)."
      >
        <Specimen label="Grid de 12 colunas" note="gap 8 · margem 16 → 32" bodyClass="p-0">
          <div className="grid grid-cols-12 gap-2 p-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex h-24 items-end justify-center bg-ds-accent-soft pb-2">
                <span className="ds-annot">{i + 1}</span>
              </div>
            ))}
          </div>
        </Specimen>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Specimen label="Escala de espaço" note="múltiplos de 4">
            <div className="space-y-2">
              {[4, 8, 12, 16, 24, 32, 48, 64, 96].map((s) => (
                <div key={s} className="flex items-center gap-4">
                  <span className="ds-annot w-8 text-right tabular-nums">{s}</span>
                  <span className="h-2 bg-ds-accent" style={{ width: s * 2 }} />
                </div>
              ))}
            </div>
          </Specimen>
          <Specimen label="ds-grid-bg" note="linhas de construção" bodyClass="p-0">
            <div className="ds-grid-bg relative h-full min-h-60">
              <span className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ds-line-strong" />
              <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ds-accent" />
              <span className="ds-annot absolute bottom-3 right-3">col 12 · linha 96px</span>
            </div>
          </Specimen>
        </div>
      </Section>

      <Section
        id="linhas"
        index="04"
        title="Linhas, raios e elevação"
        desc="Raios quase retos. Profundidade vem de contraste entre superfícies e de hairlines — sombra só em menus e toasts que flutuam."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Specimen label="Hairline sólida" note="ds-line">
            <div className="h-16 border border-ds-line" />
          </Specimen>
          <Specimen label="Cantos marcados" note="ds-corners">
            <Frame className="h-16" />
          </Specimen>
          <Specimen label="Tracejada" note="ds-dashed">
            <div className="flex h-16 items-center">
              <span className="ds-dashed h-px w-full" />
            </div>
          </Specimen>
          <Specimen label="Cota" note="Annotation">
            <div className="flex h-16 items-center">
              <Annotation length={40}>r 155</Annotation>
            </div>
          </Specimen>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Specimen label="Raios" note="2 · 4 · 6 · full">
            <div className="flex flex-wrap items-end gap-4">
              {[
                ['rounded-ds-xs', '2px'],
                ['rounded-ds-sm', '4px'],
                ['rounded-ds-md', '6px'],
                ['rounded-full', 'full'],
              ].map(([c, l]) => (
                <div key={c} className="text-center">
                  <div className={cn('size-16 border border-ds-line-strong bg-ds-surface', c)} />
                  <p className="ds-annot mt-2">{l}</p>
                </div>
              ))}
            </div>
          </Specimen>
          <Specimen label="Elevação por superfície" note="bg → surface-3">
            <div className="flex h-full items-end gap-0">
              {['bg-ds-bg', 'bg-ds-surface', 'bg-ds-surface-2', 'bg-ds-surface-3'].map((c, i) => (
                <div key={c} className={cn('flex-1 border border-ds-line p-2', c)} style={{ height: 40 + i * 20 }}>
                  <span className="ds-annot">{i}</span>
                </div>
              ))}
            </div>
          </Specimen>
        </div>
      </Section>

      <Section
        id="iconografia"
        index="05"
        title="Ícones e traço"
        desc="Ícones de interface: Lucide com stroke 1.5, sempre. Ilustrações próprias em traço de 1px, monocromáticas, mesma espessura das hairlines."
      >
        <Specimen label="Ícones de interface" note="lucide · 1.5 · 16/20px">
          <div className="flex flex-wrap gap-2">
            {[ArrowRight, ArrowUpRight, Search, Calendar, MapPin, Trophy, Camera, Mic2, Play, Users, Upload, Download, Mail].map(
              (Icon, i) => (
                <span key={i} className="inline-flex size-11 items-center justify-center border border-ds-line text-ds-muted">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                </span>
              ),
            )}
          </div>
        </Specimen>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(Object.keys(LINE_ART) as LineArtKey[]).map((k) => (
            <Frame key={k} className="flex flex-col items-center gap-3 p-5 text-ds-muted">
              {LINE_ART[k]}
              <span className="ds-annot">{k}</span>
            </Frame>
          ))}
        </div>
      </Section>

      <Section
        id="movimento"
        index="06"
        title="Movimento"
        desc="Sem bounce, sem ease-in. Linhas que se desenham, peças que se montam, conteúdo que revela. Tudo cai para opacidade simples com movimento reduzido."
      >
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Specimen label="Curvas" note="tokens --ease-ds-*">
            <MotionDemo />
          </Specimen>
          <Specimen label="Durações" note="exit ≈ 60% do enter">
            <dl className="divide-y divide-ds-line text-sm">
              {[
                ['Press (:active)', '160ms'],
                ['Tooltip', '150ms · delay 300'],
                ['Dropdown', '180ms'],
                ['Modal', '250ms'],
                ['Drawer', '400ms'],
                ['Desenho de linha', '1.4s · 1x'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-ds-muted">{k}</dt>
                  <dd className="font-ds-mono text-xs tabular-nums text-ds-fg">{v}</dd>
                </div>
              ))}
            </dl>
          </Specimen>
        </div>
      </Section>

      {/* ============================ BÁSICOS ============================ */}

      <Section id="botoes" index="07" title="Botões e links" desc="Sólido para a ação principal, colchetes em mono para a ação editorial. Todo botão encolhe 3% ao pressionar.">
        <div className="space-y-4">
          <Specimen label="Variantes" note="primary · secondary · ghost · bracket · danger">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Começar um projeto</Button>
              <Button variant="secondary">Ver portfólio</Button>
              <Button variant="ghost">Cancelar</Button>
              <Button variant="bracket">Solicitar orçamento</Button>
              <Button variant="danger">Excluir torneio</Button>
            </div>
          </Specimen>
          <div className="grid gap-4 md:grid-cols-2">
            <Specimen label="Estados" note="padrão · foco · desabilitado · carregando">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary">Padrão</Button>
                <Button variant="secondary" className="outline-2 outline-offset-2 outline-ds-accent">
                  Foco
                </Button>
                <Button disabled>Desabilitado</Button>
                <LoadingButtonDemo />
              </div>
            </Specimen>
            <Specimen label="Tamanhos e ícone" note="sm · md · lg · icon">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Pequeno</Button>
                <Button>Médio</Button>
                <Button size="lg">
                  Grande <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
                </Button>
                <IconButtonDemo />
              </div>
            </Specimen>
          </div>
          <Specimen label="Por divisão" note="divisao='tech' | 'sports' | 'studio'">
            <div className="flex flex-wrap items-center gap-3">
              <Button divisao="tech">Pedir orçamento Tech</Button>
              <Button divisao="sports">Inscrever dupla</Button>
              <Button divisao="studio">Agendar sessão</Button>
              <ButtonLink href="#contato" variant="bracket" divisao="sports">
                Ver torneios
              </ButtonLink>
            </div>
          </Specimen>
          <Specimen label="Links" note="sublinhado animado · seta">
            <div className="flex flex-wrap items-center gap-8 text-sm">
              <UnderlineLink href="#">Conheça os fundadores</UnderlineLink>
              <ArrowLink href="#">rankingbt.com.br</ArrowLink>
            </div>
          </Specimen>
        </div>
      </Section>

      <Section id="campos" index="08" title="Campos" desc="Rótulo sempre visível acima. Erro abaixo, com ícone e texto — nunca só cor. Validação ao sair do campo.">
        <div className="grid gap-4 md:grid-cols-2">
          <Specimen label="Texto" note="padrão · dica">
            <div className="space-y-5">
              <TextField label="Nome da empresa" placeholder="ASSESP Gonzaga" />
              <TextField label="Busca" placeholder="Buscar torneio ou artista" leading={<Search className="size-4" strokeWidth={1.5} />} hint="Atalho: / em qualquer página" />
            </div>
          </Specimen>
          <Specimen label="Estados" note="erro · desabilitado">
            <div className="space-y-5">
              <TextField label="E-mail" type="email" defaultValue="marcella@damadigital" error="Confira o e-mail — falta o domínio." />
              <TextField label="CNPJ" disabled defaultValue="Preenchido pela DAMA" />
            </div>
          </Specimen>
          <Specimen label="Select" note="nativo, estilizado">
            <SelectField
              label="Categoria"
              defaultValue="mista-b"
              options={[
                { value: 'mista-b', label: 'Dupla Mista B' },
                { value: 'masc-c', label: 'Masculina C' },
                { value: 'fem-iniciante', label: 'Feminina Iniciante' },
                { value: '50mais', label: '50+' },
              ]}
            />
          </Specimen>
          <Specimen label="Área de texto" note="opcional">
            <TextArea label="Observações" optional placeholder="Restrições de horário, necessidades da dupla…" />
          </Specimen>
        </div>
      </Section>

      <Section id="selecao" index="09" title="Seleção" desc="Checkbox, radio e switch com área de toque de 44px. O acento marca o estado ligado.">
        <div className="grid gap-4 md:grid-cols-3">
          <Specimen label="Checkbox">
            <Checkbox label="Transmissão ao vivo" description="YouTube + telão no local" defaultChecked />
            <Checkbox label="Fotografia" />
            <Checkbox label="Arbitragem" disabled />
          </Specimen>
          <Specimen label="Radio">
            <Radio name="plano" label="Cobertura básica" description="Foto + 1 reel" />
            <Radio name="plano" label="Cobertura completa" description="Foto, vídeo e transmissão" defaultChecked />
            <Radio name="plano" label="Sob medida" disabled />
          </Specimen>
          <Specimen label="Switch">
            <Switch label="Inscrições abertas" defaultChecked />
            <Switch label="Mostrar no site" />
            <Switch label="Pagamento via Pix" disabled />
          </Specimen>
        </div>
      </Section>

      <Section id="badges" index="10" title="Badges, chips e avatares">
        <div className="grid gap-4 md:grid-cols-2">
          <Specimen label="Badges" note="divisão · status">
            <div className="flex flex-wrap gap-2">
              <DivisionBadge divisao="tech" />
              <DivisionBadge divisao="sports" />
              <DivisionBadge divisao="studio" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge status="realizado" />
              <StatusBadge status="proximo" />
              <StatusBadge status="inscricoes" />
              <StatusBadge status="rascunho" />
              <StatusBadge status="erro" />
            </div>
          </Specimen>
          <Specimen label="Chips de filtro" note="seleção única · múltipla">
            <FilterChips options={['Todos', 'Beach Tennis', 'Música', 'Sites']} />
            <div className="mt-4">
              <FilterChips multiple options={['2026', '2025', '2024']} />
            </div>
          </Specimen>
          <Specimen label="Avatar" note="foto · iniciais · tamanhos">
            <div className="flex items-center gap-3">
              <Avatar name="Marcella Lima" src="/images/marcella.png" size="lg" />
              <Avatar name="Daniel Simonian" src="/images/daniel.png" />
              <Avatar name="Fernando Silveyra" size="sm" />
            </div>
          </Specimen>
          <Specimen label="Grupo de avatares" note="max 4 · +N">
            <AvatarGroup
              people={[
                { name: 'Marcella Lima', src: '/images/marcella.png' },
                { name: 'Daniel Simonian', src: '/images/daniel.png' },
                { name: 'Karina Cyrillo' },
                { name: 'Raffa Pereira' },
                { name: 'Caio Jack' },
                { name: 'Fábio Zulli' },
                { name: 'SAID' },
              ]}
            />
          </Specimen>
        </div>
      </Section>

      <Section id="sobreposicao" index="11" title="Tooltip, menu e accordion">
        <div className="grid gap-4 md:grid-cols-2">
          <Specimen label="Tooltip" note="hover · foco">
            <div className="flex flex-wrap items-center gap-3 pt-6">
              <Tooltip label="Copiar link do torneio">
                <Button size="icon" variant="secondary" aria-label="Copiar link do torneio">
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </Button>
              </Tooltip>
              <Tooltip label="Atalho: /">
                <Button variant="ghost">
                  <Search className="size-4" strokeWidth={1.5} aria-hidden /> Buscar <Kbd>/</Kbd>
                </Button>
              </Tooltip>
            </div>
          </Specimen>
          <Specimen label="Menu dropdown" note="Esc fecha · clique fora fecha">
            <DropdownDemo />
          </Specimen>
        </div>
        <div className="mt-4">
          <Specimen label="Accordion · FAQ" note="um aberto por vez">
            <Accordion
              items={[
                {
                  q: 'A DAMA organiza o torneio inteiro ou só faz a cobertura?',
                  a: 'Os dois. No 6º Open SPFC montamos estrutura, inscrições, arbitragem e a cobertura de foto e vídeo. Também dá para contratar só a cobertura.',
                },
                {
                  q: 'Quanto tempo leva para lançar um single?',
                  a: 'Da pré-produção à faixa nas plataformas, de 4 a 8 semanas. A distribuição pede pelo menos 15 dias antes da data de lançamento.',
                },
                {
                  q: 'Vocês mantêm o site depois de publicado?',
                  a: 'Sim. Todo projeto Tech tem 30 dias de suporte incluído e planos mensais de manutenção depois disso.',
                },
              ]}
            />
          </Specimen>
        </div>
      </Section>

      <Section id="feedback" index="12" title="Feedback" desc="Alertas inline perto do problema, toasts para confirmações, modal para decisões e drawer para detalhes sem sair da página.">
        <div className="grid gap-4 md:grid-cols-2">
          <Alert tone="info" title="Inscrições abrem em 3 dias">
            Seletiva Pan-Americano IFBT · 23 e 24 de maio.
          </Alert>
          <Alert tone="success" title="Galeria publicada">
            A galeria do 6º Open SPFC já está no ar.
          </Alert>
          <Alert tone="warning" title="Orçamento expira amanhã" action={<Button size="sm" variant="secondary">Renovar por 15 dias</Button>}>
            A proposta “Open Verão 2027” vence em 21/10.
          </Alert>
          <Alert tone="danger" title="Pagamento não confirmado">
            O Pix da dupla Ramos/Okada ainda não caiu. Reenvie o QR Code ou confirme manualmente.
          </Alert>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Specimen label="Toast" note="aria-live · 4s">
            <ToastDemo />
          </Specimen>
          <Specimen label="Modal" note="Esc · clique fora">
            <ModalDemo />
          </Specimen>
          <Specimen label="Drawer" note="lateral · mobile full">
            <DrawerDemo />
          </Specimen>
        </div>
      </Section>

      <Section id="navegacao" index="13" title="Navegação">
        <div className="space-y-4">
          <Specimen label="Tabs · linha" note="setas ← → navegam">
            <Tabs
              tabs={[
                { id: 'galeria', label: 'Galeria', count: 6, content: <p className="text-sm text-ds-muted">Fotos do torneio em grid assimétrico.</p> },
                { id: 'reels', label: 'Reels', count: 1, content: <p className="text-sm text-ds-muted">Vídeos curtos do dia.</p> },
                { id: 'parceiros', label: 'Parceiros', count: 9, content: <p className="text-sm text-ds-muted">Patrocinadores do evento.</p> },
              ]}
            />
          </Specimen>
          <div className="grid gap-4 md:grid-cols-2">
            <Specimen label="Tabs · segmentado">
              <Tabs
                variant="segmented"
                tabs={[
                  { id: 'mensal', label: 'Mensal', content: <p className="text-sm text-ds-muted">Planos de manutenção.</p> },
                  { id: 'projeto', label: 'Por projeto', content: <p className="text-sm text-ds-muted">Preço fechado.</p> },
                ]}
              />
            </Specimen>
            <Specimen label="Breadcrumbs e paginação">
              <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Sports', href: '/sports' }, { label: '6º Open SPFC' }]} />
              <div className="mt-6">
                <Pagination total={12} initial={4} />
              </div>
            </Specimen>
          </div>
        </div>
      </Section>

      <Section id="estrutura" index="14" title="Divisores e cotas" desc="Peças de desenho técnico que organizam a página sem caixas.">
        <Specimen label="Divider" note="simples · rótulo · marca de centro">
          <div className="space-y-8">
            <Divider />
            <Divider label="Torneios 2026" />
            <Divider mark />
          </div>
        </Specimen>
        <div className="mt-4">
          <Specimen label="Annotation" note="cota com linha-guia">
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              <Annotation>270°</Annotation>
              <Annotation length={72}>CT São Paulo FC · 7 quadras</Annotation>
              <Annotation side="left" length={32}>
                r 155
              </Annotation>
            </div>
          </Specimen>
        </div>
      </Section>

      {/* ============================ DAMA ============================ */}

      <Section id="header" index="15" title="Header" desc="Logo, divisões com ponto de acento, indicador da página atual e CTA em colchetes. No mobile, menu em tela cheia com grid de construção.">
        <div className="overflow-hidden border border-ds-line">
          <SiteHeader current="/sports" />
          <div className="ds-grid-bg h-24" />
        </div>
      </Section>

      <Section id="hero" index="16" title="Hero + diagrama das divisões" desc="Passe o mouse nos círculos (ou foque a legenda): a divisão acende e o texto muda. As linhas se desenham uma vez ao entrar na tela.">
        <div className="overflow-hidden border border-ds-line">
          <Hero />
        </div>
      </Section>

      <Section id="capacidades" index="17" title="Capacidades" desc="Cards numerados com cantos marcados e ilustração em traço. O acento da divisão aparece só no hover.">
        <CapabilityGrid items={capabilities} />
      </Section>

      <Section id="projetos" index="18" title="Projetos · Tech" desc="Lista editorial em vez de cards: linha, número, logo, descrição e destino.">
        <div className="border-b border-ds-line">
          {projects.map((p, i) => (
            <ProjectCard key={p.name} project={p} index={i} />
          ))}
        </div>
      </Section>

      <Section id="torneios" index="19" title="Torneios · Sports" desc="Foto em P&B que ganha cor no hover, status, data em mono e stats em linha.">
        <div className="space-y-4">
          {tournaments[0] && <TournamentCard t={tournaments[0]} featured />}
          <div className="grid gap-4 md:grid-cols-2">
            {tournaments.slice(1).map((t) => (
              <TournamentCard key={t.name} t={t} />
            ))}
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          <Stat value="400+" label="atletas" note="6º Open SPFC" />
          <Stat value="19" label="categorias" />
          <Stat value="3" label="torneios em 2026" />
          <Stat value="7" label="quadras" note="CT São Paulo FC" />
        </div>
      </Section>

      <Section id="midia" index="20" title="Galeria e reel" desc="Grid assimétrico com lightbox (setas e Esc) e player com moldura de cantos.">
        <Gallery items={gallery} caption="6º Open SPFC" />
        <div className="mt-8 max-w-3xl">
          <VideoFrame
            src="/videos/events/6o-open-spfc/reel.mp4"
            poster="/images/events/6o-open-spfc/foto3.jpg"
            title="6º Open SPFC — reel oficial"
            meta="29–31 MAI 2026 · 1080p"
          />
        </div>
      </Section>

      <Section id="studio" index="21" title="Artistas e lançamentos · Studio" desc="Artista com último lançamento; capa com link para o Spotify ou estado sem link.">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {artists.map((a) => (
            <ArtistCard key={a.name} artist={a} />
          ))}
        </div>
        <Divider label="Últimos lançamentos" className="my-10" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {releases.map((r) => (
            <ReleaseCard key={r.title} release={r} />
          ))}
        </div>
      </Section>

      <Section id="parceiros" index="22" title="Parceiros e clientes" desc="Logos em P&B; a cor original aparece no hover. Marquee pausa com o mouse.">
        <PartnerStrip partners={partners} />
        <div className="mt-6">
          <PartnerStrip partners={partners} variant="grid" />
        </div>
      </Section>

      <Section id="processo" index="23" title="Processo" desc="Nós ligados por linha. Passe o mouse ou use Tab para avançar.">
        <ProcessNodes steps={process} />
      </Section>

      <Section id="servicos" index="24" title="Serviços" desc="Valores ilustrativos para o catálogo — cada card herda o acento da própria divisão.">
        <div className="grid gap-4 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.name} service={s} />
          ))}
        </div>
      </Section>

      <Section id="equipe" index="25" title="Equipe">
        <div className="grid gap-10 md:grid-cols-2">
          {members.map((m, i) => (
            <TeamCard key={m.name} member={m} index={i} />
          ))}
        </div>
      </Section>

      <Section id="contato" index="26" title="Briefing e WhatsApp" desc="Três etapas, validação ao sair do campo, foco no primeiro erro, estados de envio, sucesso e falha (envio simulado).">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Frame className="p-5 md:p-8">
            <ContactDemo />
          </Frame>
          <div className="space-y-6">
            <Specimen label="WhatsApp flutuante" note="fixo · canto inferior">
              <WhatsAppButton floating={false} />
            </Specimen>
            <Specimen label="Contato direto">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="ds-annot uppercase">WhatsApp</dt>
                  <dd className="font-ds-mono tabular-nums">(13) 99743-4878</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="ds-annot uppercase">Instagram</dt>
                  <dd className="font-ds-mono">@damadigital__</dd>
                </div>
              </dl>
            </Specimen>
          </div>
        </div>
      </Section>

      <Section id="footer" index="27" title="Footer" desc="Mapa de links, redes, logo que encolhe no celular e coordenada técnica.">
        <div className="overflow-hidden border border-ds-line">
          <SiteFooter />
        </div>
      </Section>

      <Section id="estados" index="28" title="Vazio, skeleton e 404" desc="Os mesmos traços geométricos dão personalidade aos estados de exceção.">
        <div className="grid gap-4 md:grid-cols-2">
          <EmptyState
            art="torneios"
            title="Nenhum torneio com inscrições abertas"
            desc="O próximo calendário sai em novembro. Receba o aviso no WhatsApp quando abrir."
            action={<Button variant="secondary">Avisar no WhatsApp</Button>}
          />
          <Specimen label="Skeleton" note="mesmo tamanho do conteúdo final">
            <div className="flex gap-4">
              <Skeleton className="size-16 shrink-0" />
              <div className="flex-1 space-y-2.5 pt-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <Skeleton className="aspect-square" />
              <Skeleton className="aspect-square" />
              <Skeleton className="aspect-square" />
            </div>
          </Specimen>
        </div>
        <div className="mt-4">
          <NotFoundBlock />
        </div>
      </Section>

      <footer className="border-t border-ds-line px-4 py-10 md:px-8 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="ds-annot">DAMA DIGITAL · DESIGN SYSTEM v2.0 · OUT 2026</p>
          <p className="ds-annot">Tokens em styles/dama-ds.css · componentes em components/ds/</p>
        </div>
      </footer>
    </Shell>
  );
}
