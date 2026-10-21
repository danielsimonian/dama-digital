'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  LayoutGrid,
  Users,
  CalendarDays,
  Wallet,
  FileText,
  Tags,
  Plus,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleAlert,
  Send,
  Eye,
  Music2,
  Mic2,
  Receipt,
  UserPlus,
  Search,
} from 'lucide-react';
import { cn, Button, Avatar, Alert, DivisionBadge } from '@/components/ds/primitives';
import { Drawer, Modal, useToast } from '@/components/ds/interactive';
import { SelectField } from '@/components/ds/fields';
import { AdminSidebar, CommandPalette, UserSwitch, type Command } from '@/components/ds/admin/shell';
import {
  brl,
  KpiTile,
  PapelBadge,
  LancamentoStatusLabel,
  QuoteTrack,
  HoursMeter,
  PlanSummary,
  AttendanceStrip,
  PresencaMark,
  Timeline,
  PRESENCA_LABEL,
} from '@/components/ds/admin/display';
import { DataTable, type Column } from '@/components/ds/admin/table';
import { WeekCalendar, AttendanceControl, formatHora } from '@/components/ds/admin/agenda';
import { MonthlyBars } from '@/components/ds/admin/finance-chart';
import { QuoteBuilder } from '@/components/ds/admin/quote-builder';
import type { Pessoa, Evento, Lancamento, Papel, Presenca, LancamentoStatus } from '@/components/ds/admin/types';
import { pessoas, eventos as eventosIniciais, lancamentos as lancIniciais, meses, orcamentos, catalogo, quoteLines } from '../_data';

type Screen = 'inicio' | 'pessoas' | 'agenda' | 'financeiro' | 'orcamentos' | 'catalogo';

const USERS = [
  { id: 'daniel', nome: 'Daniel Simonian', foto: '/images/daniel.png' },
  { id: 'marcella', nome: 'Marcella Lima', foto: '/images/marcella.png' },
];
const DATAS = [19, 20, 21, 22, 23, 24, 25];
const HOJE = 1;
const AGORA = 15.6;
// recebimentos de outubro que não aparecem na lista resumida do protótipo
const OUTROS_RECEBIDOS_OUT = 6690;
const NOMES = Object.fromEntries(pessoas.map((p) => [p.id, p.nome]));
const DIA_LABEL = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

/* ------------------------------------------------------------------ */
/* Peças de layout do protótipo                                        */
/* ------------------------------------------------------------------ */

function ScreenHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ds-line px-4 py-5 md:px-6">
      <div>
        {sub && <p className="ds-annot uppercase">{sub}</p>}
        <h3 className="mt-1 text-2xl font-medium tracking-tight">{title}</h3>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

function Panel({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('min-w-0 border border-ds-line', className)}>
      <header className="flex items-center justify-between gap-3 border-b border-ds-line px-4 py-2.5">
        <h4 className="font-ds-mono text-[11px] uppercase tracking-wider text-ds-muted">{title}</h4>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Chips<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string; count?: number }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors',
            value === o.id ? 'border-ds-fg bg-ds-fg text-ds-bg' : 'border-ds-line text-ds-muted hover:border-ds-line-strong hover:text-ds-fg',
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="font-ds-mono tabular-nums opacity-70">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ficha da pessoa                                                     */
/* ------------------------------------------------------------------ */

function PessoaDetail({ p, lancamentos, onPay, onSchedule, onQuote }: { p: Pessoa; lancamentos: Lancamento[]; onPay: (l: Lancamento) => void; onSchedule: () => void; onQuote: () => void }) {
  const meus = lancamentos.filter((l) => l.pessoaId === p.id);
  const aberto = meus.find((l) => l.status === 'atrasado' || l.status === 'pendente');
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Avatar name={p.nome} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-medium tracking-tight">{p.nome}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {p.papeis.map((r) => (
              <PapelBadge key={r} papel={r} />
            ))}
            {p.instrumento && <span className="ds-annot">· {p.instrumento}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-ds-sm border border-ds-line text-sm text-ds-fg hover:bg-ds-surface"
        >
          <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> WhatsApp
        </a>
        {p.papeis.some((r) => r === 'aluno' || r === 'estudio') ? (
          <Button variant="secondary" size="sm" className="h-10" onClick={onSchedule}>
            <CalendarDays className="size-4" strokeWidth={1.5} aria-hidden /> Agendar
          </Button>
        ) : (
          <Button variant="secondary" size="sm" className="h-10" onClick={onQuote}>
            <FileText className="size-4" strokeWidth={1.5} aria-hidden /> Orçamento
          </Button>
        )}
      </div>

      {aberto && (
        <Alert
          tone={aberto.status === 'atrasado' ? 'danger' : 'warning'}
          title={`${aberto.status === 'atrasado' ? 'Em atraso' : 'Vence'} · ${brl(aberto.valor)}`}
          action={
            <Button size="sm" onClick={() => onPay(aberto)}>
              <Receipt className="size-4" strokeWidth={1.5} aria-hidden /> Registrar pagamento
            </Button>
          }
        >
          {aberto.descricao} · venc. {aberto.vencimento}
        </Alert>
      )}

      {p.plano && (
        <div>
          <p className="ds-annot mb-2 uppercase">Plano · {p.plano.horario}</p>
          <PlanSummary plano={p.plano} />
        </div>
      )}
      {p.frequencia && p.plano && (
        <div>
          <p className="ds-annot mb-2 uppercase">Frequência · outubro</p>
          <AttendanceStrip items={p.frequencia} meta={p.plano.aulasMes} />
        </div>
      )}
      {p.pacote && (
        <div>
          <p className="ds-annot mb-2 uppercase">Pacote de estúdio</p>
          <HoursMeter pacote={p.pacote} />
        </div>
      )}

      <div>
        <p className="ds-annot mb-3 uppercase">Atividade</p>
        <Timeline
          items={[
            ...(p.proximo ? [{ when: p.proximo, title: 'Próximo encontro', icon: <CalendarDays />, tone: 'accent' as const }] : []),
            ...meus.slice(0, 3).map((l) => ({
              when: l.status === 'pago' ? `pago ${l.pagoEm} · ${l.forma}` : `vence ${l.vencimento}`,
              title: l.descricao,
              desc: brl(l.valor),
              icon: l.status === 'pago' ? <CircleCheck /> : <CircleAlert />,
              tone: l.status === 'pago' ? ('success' as const) : l.status === 'atrasado' ? ('danger' as const) : undefined,
            })),
            { when: `desde ${p.desde}`, title: 'Cadastro criado', desc: `${p.email} · ${p.whatsapp}`, icon: <UserPlus /> },
          ]}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Protótipo                                                           */
/* ------------------------------------------------------------------ */

export function AdminPrototype() {
  const toast = useToast();
  const [screen, setScreen] = useState<Screen>('inicio');
  const [user, setUser] = useState('daniel');
  const [palette, setPalette] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>(eventosIniciais);
  const [lancs, setLancs] = useState<Lancamento[]>(lancIniciais);
  const [pessoaSel, setPessoaSel] = useState<string>('livia');
  const [pessoaDrawer, setPessoaDrawer] = useState(false);
  const [filtroPapel, setFiltroPapel] = useState<'todos' | Papel>('todos');
  const [busca, setBusca] = useState('');
  const [eventoSel, setEventoSel] = useState<string | null>('e4');
  const [filtroLanc, setFiltroLanc] = useState<'todos' | LancamentoStatus>('todos');
  const [pagar, setPagar] = useState<Lancamento | null>(null);
  const [forma, setForma] = useState<NonNullable<Lancamento['forma']>>('Pix');
  const [orcSel, setOrcSel] = useState('0429');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const atrasados = lancs.filter((l) => l.status === 'atrasado');
  const aReceber = lancs.filter((l) => l.status === 'pendente' || l.status === 'previsto').reduce((s, l) => s + l.valor, 0);
  const recebidoOut = lancs.filter((l) => l.status === 'pago').reduce((s, l) => s + l.valor, 0) + OUTROS_RECEBIDOS_OUT;
  const techOut = 580;
  const recorrente = pessoas.reduce((s, p) => s + (p.status === 'ativo' && p.plano ? p.plano.valor : 0), 0) + 290;
  const aulasSemana = eventos.filter((e) => e.tipo === 'aula').length;
  const horasEstudio = eventos.filter((e) => e.tipo === 'sessao').reduce((s, e) => s + (e.fim - e.inicio), 0);

  const nav = [
    { id: 'inicio', label: 'Início', icon: <LayoutGrid /> },
    { id: 'pessoas', label: 'Pessoas', icon: <Users />, count: pessoas.length },
    { id: 'agenda', label: 'Agenda', icon: <CalendarDays />, count: eventos.length },
    { id: 'financeiro', label: 'Financeiro', icon: <Wallet />, alert: atrasados.length > 0 },
    { id: 'orcamentos', label: 'Orçamentos', icon: <FileText />, count: orcamentos.filter((o) => o.status !== 'aprovado').length },
    { id: 'catalogo', label: 'Catálogo', icon: <Tags />, count: catalogo.length },
  ];

  const go = (s: Screen) => setScreen(s);
  const abrirPessoa = (id: string) => {
    setPessoaSel(id);
    setScreen('pessoas');
    if (window.innerWidth < 1280) setPessoaDrawer(true);
  };

  const commands: Command[] = [
    { id: 'n-aluno', group: 'Criar', label: 'Novo aluno', hint: 'N A', icon: <UserPlus />, run: () => toast({ tone: 'info', title: 'Novo aluno', description: 'Formulário rápido abriria aqui.' }) },
    { id: 'n-orc', group: 'Criar', label: 'Novo orçamento', hint: 'N O', icon: <FileText />, run: () => go('orcamentos') },
    { id: 'n-pag', group: 'Criar', label: 'Registrar pagamento', hint: 'N P', icon: <Receipt />, run: () => go('financeiro') },
    ...nav.map((n) => ({ id: `go-${n.id}`, group: 'Ir para', label: n.label, hint: `G ${n.label[0]}`, icon: n.icon, run: () => go(n.id as Screen) })),
    ...pessoas.map((p) => ({ id: `p-${p.id}`, group: 'Pessoas', label: p.nome, hint: p.papeis.join(' · '), icon: <Users />, run: () => abrirPessoa(p.id) })),
  ];

  const marcarPresenca = (id: string, presenca: Presenca) => {
    setEventos((es) => es.map((e) => (e.id === id ? { ...e, presenca } : e)));
    const ev = eventos.find((e) => e.id === id);
    if (ev && presenca !== 'agendada') {
      toast({
        tone: presenca === 'falta' ? 'danger' : 'success',
        title: `${PRESENCA_LABEL[presenca]} · ${NOMES[ev.pessoaId]}`,
        description:
          ev.tipo === 'sessao' && presenca === 'realizada'
            ? `${(ev.fim - ev.inicio).toLocaleString('pt-BR')} h descontadas do pacote.`
            : presenca === 'falta'
              ? 'Sugestão de reposição enviada para a agenda.'
              : undefined,
      });
    }
  };

  const confirmarPagamento = () => {
    if (!pagar) return;
    setLancs((ls) => ls.map((l) => (l.id === pagar.id ? { ...l, status: 'pago', forma, pagoEm: '20/10' } : l)));
    toast({ tone: 'success', title: `${brl(pagar.valor)} recebido`, description: `${NOMES[pagar.pessoaId]} · ${forma}` });
    setPagar(null);
  };

  /* ------------------------------ telas ------------------------------ */

  const pessoasFiltradas = pessoas.filter(
    (p) => (filtroPapel === 'todos' || p.papeis.includes(filtroPapel)) && (!busca || p.nome.toLowerCase().includes(busca.toLowerCase())),
  );
  const pessoaAtual = pessoas.find((p) => p.id === pessoaSel) ?? pessoas[0];

  const colPessoas: Column<Pessoa>[] = [
    {
      key: 'nome',
      header: 'Nome',
      sort: (p) => p.nome,
      cell: (p) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <Avatar name={p.nome} size="sm" />
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate text-ds-fg">{p.nome}</span>
              {p.status !== 'ativo' && <span className="ds-annot uppercase">{p.status}</span>}
            </span>
            <span className="mt-0.5 flex gap-1">
              {p.papeis.map((r) => (
                <PapelBadge key={r} papel={r} />
              ))}
            </span>
          </span>
        </span>
      ),
    },
    { key: 'proximo', header: 'Próximo', cell: (p) => <span className="font-ds-mono text-xs text-ds-muted">{p.proximo ?? '—'}</span>, hideBelow: 'lg' },
    {
      key: 'resp',
      header: 'Resp.',
      cell: (p) => <Avatar name={p.responsavel === 'daniel' ? 'Daniel Simonian' : 'Marcella Lima'} src={p.responsavel === 'daniel' ? '/images/daniel.png' : '/images/marcella.png'} size="sm" />,
      hideBelow: 'xl',
    },
    {
      key: 'receber',
      header: 'A receber',
      align: 'right',
      sort: (p) => p.aReceber,
      cell: (p) =>
        p.aReceber ? (
          <span className={cn('font-ds-mono text-xs tabular-nums', p.atrasado ? 'text-ds-danger' : 'text-ds-fg')}>
            {p.atrasado && '● '}
            {brl(p.aReceber)}
          </span>
        ) : (
          <span className="font-ds-mono text-xs text-ds-subtle">em dia</span>
        ),
    },
  ];

  const lancFiltrados = lancs.filter((l) => filtroLanc === 'todos' || l.status === filtroLanc);
  const colLanc: Column<Lancamento>[] = [
    { key: 'venc', header: 'Venc.', sort: (l) => l.vencimento.split('/').reverse().join(''), cell: (l) => <span className="font-ds-mono text-xs tabular-nums text-ds-muted">{l.vencimento}</span>, width: '5rem' },
    {
      key: 'desc',
      header: 'Descrição',
      cell: (l) => (
        <span className="block min-w-0">
          <span className="block truncate text-ds-fg">{NOMES[l.pessoaId]}</span>
          <span className="block truncate text-xs text-ds-muted">{l.descricao}</span>
        </span>
      ),
    },
    { key: 'origem', header: 'Origem', cell: (l) => <span className="ds-annot uppercase">{l.origem}</span>, hideBelow: 'xl' },
    { key: 'div', header: 'Divisão', cell: (l) => <DivisionBadge divisao={l.divisao} />, hideBelow: 'lg' },
    { key: 'status', header: 'Status', sort: (l) => l.status, cell: (l) => <LancamentoStatusLabel status={l.status} /> },
    { key: 'valor', header: 'Valor', align: 'right', sort: (l) => l.valor, cell: (l) => <span className="font-ds-mono text-sm tabular-nums">{brl(l.valor)}</span> },
    {
      key: 'acao',
      header: '',
      align: 'right',
      width: '7.5rem',
      cell: (l) =>
        l.status === 'pago' ? (
          <span className="ds-annot">{l.forma} · {l.pagoEm}</span>
        ) : (
          <Button
            size="sm"
            variant={l.status === 'atrasado' ? 'primary' : 'secondary'}
            onClick={(e) => {
              e.stopPropagation();
              setPagar(l);
            }}
          >
            Marcar pago
          </Button>
        ),
    },
  ];

  const eventoAtual = eventos.find((e) => e.id === eventoSel) ?? null;
  const orcAtual = orcamentos.find((o) => o.numero === orcSel) ?? orcamentos[0];

  const telas: Record<Screen, ReactNode> = {
    inicio: (
      <>
        <ScreenHeader
          sub={`ter, 20 out · semana 43`}
          title={`Boa tarde, ${user === 'daniel' ? 'Daniel' : 'Marcella'}`}
          actions={
            <Button size="sm" onClick={() => setPalette(true)}>
              <Plus className="size-4" strokeWidth={1.5} aria-hidden /> Novo
            </Button>
          }
        />
        <div className="space-y-4 p-4 md:p-6">
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            <KpiTile label="Recebido · out" value={brl(recebidoOut)} note="até hoje" spark={meses.slice(0, 6).map((m) => m.recebido)} />
            <KpiTile label="A receber" value={brl(aReceber)} note="próximos 30 dias" />
            <KpiTile label="Em atraso" value={brl(atrasados.reduce((s, l) => s + l.valor, 0))} note={`${atrasados.length} lançamento${atrasados.length === 1 ? '' : 's'}`} tone={atrasados.length ? 'danger' : undefined} />
            <KpiTile label="Semana" value={`${aulasSemana} aulas`} note={`+ ${horasEstudio} h de estúdio`} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
            <Panel
              title="Hoje · ter 20"
              action={
                <button onClick={() => go('agenda')} className="ds-annot hover:text-ds-fg">
                  agenda →
                </button>
              }
            >
              <ul className="-my-2 divide-y divide-ds-line" data-divisao="studio">
                {eventos
                  .filter((e) => e.dia === HOJE)
                  .map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center gap-3 py-3">
                      <span className="w-12 font-ds-mono text-xs tabular-nums text-ds-muted">{formatHora(e.inicio)}</span>
                      <span className={cn('h-8 w-0.5', e.tipo === 'aula' ? 'bg-ds-accent' : 'bg-ds-accent/40')} />
                      <button onClick={() => abrirPessoa(e.pessoaId)} className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-sm text-ds-fg hover:underline">{NOMES[e.pessoaId]}</span>
                        <span className="block truncate text-xs text-ds-muted">
                          {e.tipo === 'aula' ? 'Aula' : 'Sessão'} · {e.titulo} · {e.sala}
                        </span>
                      </button>
                      {e.presenca === 'agendada' ? (
                        <span className="flex gap-1">
                          <Button size="sm" variant="secondary" onClick={() => marcarPresenca(e.id, 'realizada')}>
                            Realizada
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => marcarPresenca(e.id, 'falta')}>
                            Falta
                          </Button>
                        </span>
                      ) : (
                        <button onClick={() => marcarPresenca(e.id, 'agendada')} className="inline-flex items-center gap-2 text-xs text-ds-muted" aria-label="Desfazer">
                          <PresencaMark presenca={e.presenca} /> {PRESENCA_LABEL[e.presenca]}
                        </button>
                      )}
                    </li>
                  ))}
              </ul>
            </Panel>

            <Panel title="Precisa de atenção">
              <ul className="-my-2 divide-y divide-ds-line text-sm">
                {atrasados.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-3">
                    <span className="size-2 shrink-0 rounded-full bg-ds-danger" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-ds-fg">{NOMES[l.pessoaId]} · mensalidade em atraso</span>
                      <span className="ds-annot">venceu {l.vencimento} · {brl(l.valor)}</span>
                    </span>
                    <Button size="sm" variant="secondary" onClick={() => setPagar(l)}>
                      Receber
                    </Button>
                  </li>
                ))}
                <li className="flex items-center gap-3 py-3">
                  <span className="size-2 shrink-0 rounded-full border border-ds-warning" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ds-fg">#0429 visualizado 3× sem resposta</span>
                    <span className="ds-annot">Arena Litoral BT · {brl(18640)}</span>
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => toast({ tone: 'success', title: 'Lembrete enviado', description: 'WhatsApp para Arena Litoral BT.' })}>
                    Lembrar
                  </Button>
                </li>
                <li className="flex items-center gap-3 py-3">
                  <span className="size-2 shrink-0 rounded-full border border-dashed border-ds-info" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ds-fg">Lívia · reposição a confirmar</span>
                    <span className="ds-annot">sáb 24 · 11:00</span>
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => go('agenda')}>
                    Ver
                  </Button>
                </li>
              </ul>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Pacotes de estúdio">
              <div className="space-y-5">
                {pessoas
                  .filter((p) => p.pacote)
                  .map((p) => (
                    <div key={p.id}>
                      <button onClick={() => abrirPessoa(p.id)} className="mb-2 text-sm text-ds-fg hover:underline">
                        {p.nome}
                      </button>
                      <HoursMeter pacote={p.pacote!} compact />
                    </div>
                  ))}
              </div>
            </Panel>
            <Panel
              title="Orçamentos abertos"
              action={
                <button onClick={() => go('orcamentos')} className="ds-annot hover:text-ds-fg">
                  todos →
                </button>
              }
            >
              <ul className="-my-2 divide-y divide-ds-line">
                {orcamentos
                  .filter((o) => o.status !== 'aprovado')
                  .map((o) => (
                    <li key={o.numero}>
                      <button
                        onClick={() => {
                          setOrcSel(o.numero);
                          go('orcamentos');
                        }}
                        className="flex w-full items-center gap-3 py-3 text-left"
                      >
                        <span className="font-ds-mono text-xs text-ds-subtle">#{o.numero}</span>
                        <span className="min-w-0 flex-1 truncate text-sm text-ds-fg">{o.titulo}</span>
                        <QuoteTrack status={o.status} compact />
                      </button>
                    </li>
                  ))}
              </ul>
            </Panel>
          </div>
        </div>
      </>
    ),

    pessoas: (
      <>
        <ScreenHeader
          sub="alunos e clientes"
          title="Pessoas"
          actions={
            <Button size="sm" onClick={() => toast({ tone: 'info', title: 'Novo cadastro', description: 'Nome e WhatsApp bastam; o resto pode vir depois.' })}>
              <UserPlus className="size-4" strokeWidth={1.5} aria-hidden /> Cadastrar
            </Button>
          }
        />
        <div className="grid xl:grid-cols-[1fr_22rem]">
          <div className="min-w-0 p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-56">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-subtle" strokeWidth={1.5} aria-hidden />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar nome"
                  aria-label="Buscar pessoa"
                  className="h-8 w-full rounded-ds-xs border border-ds-line bg-ds-surface pl-8 pr-2 text-sm outline-none focus:border-ds-accent"
                />
              </div>
              <Chips
                value={filtroPapel}
                onChange={setFiltroPapel}
                options={[
                  { id: 'todos', label: 'Todos', count: pessoas.length },
                  { id: 'aluno', label: 'Alunos', count: pessoas.filter((p) => p.papeis.includes('aluno')).length },
                  { id: 'estudio', label: 'Estúdio', count: pessoas.filter((p) => p.papeis.includes('estudio')).length },
                  { id: 'tech', label: 'Tech', count: pessoas.filter((p) => p.papeis.includes('tech')).length },
                  { id: 'sports', label: 'Sports', count: pessoas.filter((p) => p.papeis.includes('sports')).length },
                ]}
              />
            </div>
            <DataTable
              rows={pessoasFiltradas}
              columns={colPessoas}
              getId={(p) => p.id}
              selectedId={pessoaSel}
              onSelect={(p) => {
                setPessoaSel(p.id);
                if (window.innerWidth < 1280) setPessoaDrawer(true);
              }}
              empty={<p className="border-y border-ds-line py-10 text-center text-sm text-ds-subtle">Ninguém com “{busca}”. Cadastre em 10 segundos pelo ⌘K.</p>}
            />
          </div>
          <aside className="hidden border-l border-ds-line p-5 xl:block">
            <PessoaDetail p={pessoaAtual} lancamentos={lancs} onPay={setPagar} onSchedule={() => go('agenda')} onQuote={() => go('orcamentos')} />
          </aside>
        </div>
      </>
    ),

    agenda: (
      <>
        <ScreenHeader
          sub="aulas e sessões · DAMA Studio"
          title="19 – 25 out"
          actions={
            <>
              <Button size="icon" variant="ghost" aria-label="Semana anterior" className="size-9">
                <ChevronLeft className="size-4" strokeWidth={1.5} />
              </Button>
              <Button size="sm" variant="secondary">
                Hoje
              </Button>
              <Button size="icon" variant="ghost" aria-label="Próxima semana" className="size-9">
                <ChevronRight className="size-4" strokeWidth={1.5} />
              </Button>
              <Button size="sm" onClick={() => toast({ tone: 'info', title: 'Agendar', description: 'Escolha pessoa, horário e se repete toda semana.' })}>
                <Plus className="size-4" strokeWidth={1.5} aria-hidden /> Agendar
              </Button>
            </>
          }
        />
        <div className="grid 2xl:grid-cols-[1fr_20rem]">
          <div className="min-w-0 p-4 md:p-6">
            <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2" data-divisao="studio">
              <span className="inline-flex items-center gap-2 text-xs text-ds-muted">
                <span className="h-3 w-3 border-l-2 border-ds-accent bg-ds-surface-2" /> Aula
              </span>
              <span className="inline-flex items-center gap-2 text-xs text-ds-muted">
                <span className="h-3 w-3 bg-ds-accent-soft ring-1 ring-inset ring-ds-accent/40" /> Sessão de estúdio
              </span>
              <span className="inline-flex items-center gap-2 text-xs text-ds-muted">
                <span className="h-px w-4 bg-ds-danger" /> Agora
              </span>
            </div>
            <WeekCalendar eventos={eventos} nomes={NOMES} datas={DATAS} hoje={HOJE} agora={AGORA} selectedId={eventoSel} onSelect={(e) => setEventoSel(e.id)} />
          </div>
          <aside className="border-t border-ds-line p-5 2xl:border-l 2xl:border-t-0">
            {eventoAtual ? (
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-1" data-divisao="studio">
                <div>
                  <p className="ds-annot uppercase">
                    {eventoAtual.tipo === 'aula' ? 'Aula' : 'Sessão de estúdio'} · {DIA_LABEL[eventoAtual.dia]} {DATAS[eventoAtual.dia]}
                  </p>
                  <p className="mt-1 text-xl font-medium tracking-tight">{eventoAtual.titulo}</p>
                  <p className="mt-1 font-ds-mono text-sm tabular-nums text-ds-muted">
                    {formatHora(eventoAtual.inicio)} – {formatHora(eventoAtual.fim)} · {eventoAtual.sala}
                  </p>
                </div>
                <button onClick={() => abrirPessoa(eventoAtual.pessoaId)} className="flex w-full items-center gap-3 border border-ds-line p-3 text-left hover:bg-ds-surface">
                  <Avatar name={NOMES[eventoAtual.pessoaId]} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm">{NOMES[eventoAtual.pessoaId]}</span>
                  <ChevronRight className="size-4 text-ds-subtle" strokeWidth={1.5} aria-hidden />
                </button>
                <div>
                  <p className="ds-annot mb-2 uppercase">Presença</p>
                  <AttendanceControl value={eventoAtual.presenca} onChange={(p) => marcarPresenca(eventoAtual.id, p)} />
                </div>
                {(() => {
                  const p = pessoas.find((x) => x.id === eventoAtual.pessoaId);
                  if (eventoAtual.tipo === 'sessao' && p?.pacote) return <HoursMeter pacote={p.pacote} />;
                  if (eventoAtual.tipo === 'sessao')
                    return (
                      <p className="ds-annot">
                        avulsa · {brl(180 * (eventoAtual.fim - eventoAtual.inicio))} vira lançamento ao marcar realizada
                      </p>
                    );
                  if (p?.frequencia && p.plano) return <AttendanceStrip items={p.frequencia} meta={p.plano.aulasMes} />;
                  return null;
                })()}
              </div>
            ) : (
              <p className="text-sm text-ds-subtle">Selecione uma aula ou sessão.</p>
            )}
          </aside>
        </div>
      </>
    ),

    financeiro: (
      <>
        <ScreenHeader
          sub="todas as divisões · out 2026"
          title="Financeiro"
          actions={
            <Button size="sm" onClick={() => toast({ tone: 'info', title: 'Lançamento avulso', description: 'Descrição, pessoa, valor e vencimento.' })}>
              <Plus className="size-4" strokeWidth={1.5} aria-hidden /> Lançamento
            </Button>
          }
        />
        <div className="space-y-4 p-4 md:p-6">
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            <KpiTile label="Recebido · out" value={brl(recebidoOut)} note={`${Math.round((recebidoOut / (recebidoOut + 3140)) * 100)}% do previsto no mês`} />
            <KpiTile label="A receber" value={brl(aReceber)} note={`${lancs.filter((l) => l.status === 'pendente' || l.status === 'previsto').length} lançamentos`} />
            <KpiTile label="Em atraso" value={brl(atrasados.reduce((s, l) => s + l.valor, 0))} tone={atrasados.length ? 'danger' : undefined} note={atrasados.length ? NOMES[atrasados[0].pessoaId] : 'tudo em dia'} />
            <KpiTile label="Recorrente · mês" value={brl(recorrente)} note="planos + manutenção" />
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Panel title="Recebido × a receber">
              <MonthlyBars data={meses} current="out" />
            </Panel>
            <Panel title="Por divisão · out">
              <ul className="space-y-4">
                {[
                  { d: 'studio' as const, v: recebidoOut - techOut, n: 'Aulas, sessões e pacotes' },
                  { d: 'tech' as const, v: techOut, n: 'Manutenção e projetos' },
                  { d: 'sports' as const, v: 0, n: 'Sem torneio no mês' },
                ].map((r) => (
                  <li key={r.d} data-divisao={r.d}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-ds-fg">{r.d === 'studio' ? 'Studio' : r.d === 'tech' ? 'Tech' : 'Sports'}</span>
                      <span className="font-ds-mono text-sm tabular-nums">{brl(r.v)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-ds-surface-3">
                      <div className="h-full rounded-r-[2px] bg-ds-accent" style={{ width: `${(r.v / recebidoOut) * 100}%` }} />
                    </div>
                    <p className="ds-annot mt-1">{r.n}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <Chips
                value={filtroLanc}
                onChange={setFiltroLanc}
                options={[
                  { id: 'todos', label: 'Todos', count: lancs.length },
                  { id: 'atrasado', label: 'Atrasados', count: lancs.filter((l) => l.status === 'atrasado').length },
                  { id: 'pendente', label: 'Pendentes', count: lancs.filter((l) => l.status === 'pendente').length },
                  { id: 'previsto', label: 'Previstos', count: lancs.filter((l) => l.status === 'previsto').length },
                  { id: 'pago', label: 'Pagos', count: lancs.filter((l) => l.status === 'pago').length },
                ]}
              />
            </div>
            <DataTable
              rows={lancFiltrados}
              columns={colLanc}
              getId={(l) => l.id}
              dense
              empty={
                <p className="border-y border-ds-line py-10 text-center text-sm text-ds-subtle">
                  {filtroLanc === 'atrasado' ? 'Nada em atraso. Bom mês.' : 'Nenhum lançamento neste filtro.'}
                </p>
              }
            />
          </div>
        </div>
      </>
    ),

    orcamentos: (
      <>
        <ScreenHeader
          sub="gerador v2 · itens do catálogo"
          title="Orçamentos"
          actions={
            <Button size="sm" onClick={() => setOrcSel('0432')}>
              <Plus className="size-4" strokeWidth={1.5} aria-hidden /> Novo orçamento
            </Button>
          }
        />
        <div className="border-b border-ds-line">
          <ul className="flex overflow-x-auto">
            {orcamentos.map((o) => (
              <li key={o.numero} className="min-w-56 flex-1 border-r border-ds-line last:border-r-0">
                <button
                  onClick={() => setOrcSel(o.numero)}
                  aria-pressed={o.numero === orcSel}
                  data-divisao={o.divisao}
                  className={cn('block w-full px-4 py-3 text-left transition-colors', o.numero === orcSel ? 'bg-ds-surface-2 shadow-[inset_0_-2px_0_var(--ds-accent)]' : 'hover:bg-ds-surface')}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-ds-mono text-xs text-ds-subtle">#{o.numero} · v{o.versao}</span>
                    <span className="ds-annot">{o.atualizado}</span>
                  </span>
                  <span className="mt-1 block truncate text-sm text-ds-fg">{o.titulo}</span>
                  <span className="mt-2 flex items-center justify-between gap-2">
                    <QuoteTrack status={o.status} compact />
                    <span className="font-ds-mono text-xs tabular-nums text-ds-muted">{brl(o.valor)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 md:p-6">
          {orcAtual.status === 'visualizado' && (
            <div className="mb-6">
              <Alert tone="info" title="Visualizado 3× · último acesso 18 out, 21:14">
                O cliente abriu a proposta pelo celular. Bom momento para um lembrete no WhatsApp.
              </Alert>
            </div>
          )}
          <QuoteBuilder
            key={orcAtual.numero}
            catalogo={catalogo}
            clientes={pessoas.map((p) => ({ id: p.id, nome: p.nome }))}
            inicial={{
              numero: orcAtual.numero,
              titulo: orcAtual.titulo,
              clienteId: orcAtual.pessoaId,
              divisao: orcAtual.divisao,
              status: orcAtual.status,
              versao: orcAtual.versao,
              ...quoteLines[orcAtual.numero],
            }}
            onSend={(msg) => toast({ tone: 'success', title: msg, description: 'Link público: damadigitalcriativa.com.br/orcamento/…' })}
          />
        </div>
      </>
    ),

    catalogo: (
      <>
        <ScreenHeader
          sub="preços base que alimentam os orçamentos"
          title="Catálogo"
          actions={
            <Button size="sm" onClick={() => toast({ tone: 'info', title: 'Novo item', description: 'Nome, divisão, unidade e preço base.' })}>
              <Plus className="size-4" strokeWidth={1.5} aria-hidden /> Item
            </Button>
          }
        />
        <div className="space-y-8 p-4 md:p-6">
          {(['studio', 'tech', 'sports'] as const).map((d) => (
            <div key={d} data-divisao={d}>
              <div className="mb-2 flex items-center gap-3">
                <DivisionBadge divisao={d} />
                <span className="h-px flex-1 bg-ds-line" />
              </div>
              <ul className="divide-y divide-ds-line border-b border-ds-line">
                {catalogo
                  .filter((c) => c.divisao === d)
                  .map((c) => (
                    <li key={c.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[1.5rem_1fr_1fr_auto]">
                      <span className="hidden text-ds-subtle sm:block [&_svg]:size-4">{d === 'studio' ? (c.unidade === 'hora' || c.unidade === 'pacote' ? <Mic2 /> : <Music2 />) : d === 'tech' ? <FileText /> : <Eye />}</span>
                      <span className="text-sm text-ds-fg">{c.nome}</span>
                      <span className="col-start-1 row-start-2 text-xs text-ds-muted sm:col-start-auto sm:row-start-auto">{c.descricao}</span>
                      <span className="row-span-2 text-right font-ds-mono text-sm tabular-nums sm:row-span-1">
                        {brl(c.valor)}
                        <span className="text-ds-subtle">/{c.unidade}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </>
    ),
  };

  return (
    <div className="overflow-hidden border border-ds-line bg-ds-bg">
      {/* barra mobile */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-ds-line p-2 lg:hidden">
        {nav.map((n) => (
          <button
            key={n.id}
            onClick={() => go(n.id as Screen)}
            aria-current={screen === n.id ? 'page' : undefined}
            className={cn('inline-flex h-9 shrink-0 items-center gap-1.5 rounded-ds-xs px-2.5 text-sm [&_svg]:size-4', screen === n.id ? 'bg-ds-surface-2 text-ds-fg' : 'text-ds-muted')}
          >
            {n.icon}
            {n.label}
          </button>
        ))}
      </div>
      <div className="grid lg:h-[860px] lg:grid-cols-[14rem_1fr]">
        <aside className="hidden border-r border-ds-line bg-ds-surface/50 lg:block">
          <AdminSidebar
            items={nav}
            active={screen}
            onChange={(id) => go(id as Screen)}
            onSearch={() => setPalette(true)}
            footer={<UserSwitch users={USERS} active={user} onChange={setUser} />}
          />
        </aside>
        <div className="min-w-0 lg:overflow-y-auto">{telas[screen]}</div>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />

      <Drawer open={pessoaDrawer && screen === 'pessoas'} onClose={() => setPessoaDrawer(false)} title={pessoaAtual.nome}>
        <PessoaDetail
          p={pessoaAtual}
          lancamentos={lancs}
          onPay={(l) => {
            setPessoaDrawer(false);
            setPagar(l);
          }}
          onSchedule={() => go('agenda')}
          onQuote={() => go('orcamentos')}
        />
      </Drawer>

      <Modal
        open={!!pagar}
        onClose={() => setPagar(null)}
        index={pagar ? `${NOMES[pagar.pessoaId]} · venc. ${pagar.vencimento}` : undefined}
        title={pagar ? `Registrar ${brl(pagar.valor)}` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPagar(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarPagamento}>
              <Send className="size-4" strokeWidth={1.5} aria-hidden /> Confirmar recebimento
            </Button>
          </>
        }
      >
        <p className="mb-4">{pagar?.descricao}</p>
        <SelectField
          label="Forma de pagamento"
          value={forma}
          onChange={(e) => setForma(e.target.value as NonNullable<Lancamento['forma']>)}
          options={['Pix', 'Cartão', 'Dinheiro', 'Boleto'].map((f) => ({ value: f, label: f }))}
        />
        <p className="ds-annot mt-3">data do recebimento: hoje, 20/10 · editável depois</p>
      </Modal>
    </div>
  );
}

