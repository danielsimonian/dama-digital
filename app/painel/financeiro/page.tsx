'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { supabase, type Cliente, type Divisao, type Lancamento } from '@/lib/supabase';
import { Alert, Button, DivisionBadge, DIVISAO_LABEL } from '@/components/ds/primitives';
import { brl, KpiTile, LancamentoStatusLabel } from '@/components/ds/admin/display';
import { MonthlyBars } from '@/components/ds/admin/finance-chart';
import { DataTable, type Column } from '@/components/ds/admin/table';
import { ScreenHeader, Panel, Chips } from '../_components/ui';
import { PagarModal, statusVisual } from '../_components/Lancamentos';
import { dataCurta, hojeISO } from '../_lib';
import { LancamentoModal, ORIGEM_LABEL } from './_components/LancamentoModal';

type Linha = Lancamento & { cliente: { nome: string } | null };
type Filtro = 'mes' | 'atrasados' | 'pendentes' | 'pagos';

const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MES_NOME = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "YYYY-MM" de uma data "YYYY-MM-DD" */
const chave = (data: string | null) => data?.slice(0, 7) ?? '';
const chaveDe = (ano: number, mes: number) => `${ano}-${String(mes + 1).padStart(2, '0')}`;

function somarMes(ano: number, mes: number, n: number) {
  const d = new Date(ano, mes + n, 1);
  return { ano: d.getFullYear(), mes: d.getMonth() };
}

export default function FinanceiroPage() {
  const hoje = new Date();
  const [ref, setRef] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() });
  const [lista, setLista] = useState<Linha[] | null>(null);
  const [clientes, setClientes] = useState<Pick<Cliente, 'id' | 'nome'>[]>([]);
  const [erro, setErro] = useState('');
  const [versao, setVersao] = useState(0);
  const [filtro, setFiltro] = useState<Filtro>('mes');
  const [busca, setBusca] = useState('');
  const [pagar, setPagar] = useState<Lancamento | null>(null);
  const [editar, setEditar] = useState<Lancamento | 'novo' | null>(null);

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome')
      .order('nome')
      .then(({ data }) => setClientes(data ?? []));
  }, []);

  useEffect(() => {
    supabase
      .from('lancamentos')
      .select('*, cliente:clientes(nome)')
      .neq('status', 'cancelado')
      .order('vencimento')
      .returns<Linha[]>()
      .then(({ data, error }) => {
        if (error) setErro(error.message);
        else setLista(data ?? []);
      });
  }, [versao]);

  const todos = lista ?? [];
  const hojeStr = hojeISO();
  const em30 = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 30);
  const em30Str = `${em30.getFullYear()}-${String(em30.getMonth() + 1).padStart(2, '0')}-${String(em30.getDate()).padStart(2, '0')}`;
  const k = chaveDe(ref.ano, ref.mes);

  const pagos = todos.filter((l) => l.status === 'pago');
  const pendentes = todos.filter((l) => l.status === 'pendente');
  const atrasados = pendentes.filter((l) => l.vencimento < hojeStr);
  const soma = (ls: Lancamento[]) => ls.reduce((s, l) => s + Number(l.valor), 0);

  const recebidoMes = pagos.filter((l) => chave(l.pago_em) === k);
  const aReceberMes = pendentes.filter((l) => chave(l.vencimento) === k);
  const proximos = pendentes.filter((l) => l.vencimento >= hojeStr && l.vencimento <= em30Str);

  // 6 meses até o selecionado + 1 à frente
  const meses = Array.from({ length: 8 }, (_, i) => somarMes(ref.ano, ref.mes, i - 6)).map(({ ano, mes }) => {
    const kk = chaveDe(ano, mes);
    return {
      mes: MES[mes],
      ano,
      recebido: soma(pagos.filter((l) => chave(l.pago_em) === kk)),
      aReceber: soma(pendentes.filter((l) => chave(l.vencimento) === kk)),
    };
  });

  const porDivisao = (['studio', 'tech', 'sports'] as Divisao[]).map((d) => ({ d, v: soma(recebidoMes.filter((l) => l.divisao === d)) }));
  const totalMes = soma(recebidoMes);

  const doFiltro: Record<Filtro, Linha[]> = {
    mes: todos.filter((l) => chave(l.vencimento) === k || chave(l.pago_em) === k),
    atrasados,
    pendentes,
    pagos: pagos.filter((l) => chave(l.pago_em) === k),
  };
  const q = busca.trim().toLowerCase();
  const filtrados = doFiltro[filtro].filter((l) => !q || [l.descricao, l.cliente?.nome].some((v) => v?.toLowerCase().includes(q)));

  const colunas: Column<Linha>[] = [
    {
      key: 'venc',
      header: 'Venc.',
      width: '5rem',
      sort: (l) => l.vencimento,
      cell: (l) => <span className="font-ds-mono text-xs tabular-nums text-ds-muted">{dataCurta(l.vencimento)}</span>,
    },
    {
      key: 'desc',
      header: 'Descrição',
      cell: (l) => (
        <span className="block min-w-0">
          <span className="block truncate text-ds-fg">{l.cliente?.nome ?? '—'}</span>
          <span className="block truncate text-xs text-ds-muted">{l.descricao}</span>
        </span>
      ),
    },
    { key: 'origem', header: 'Origem', hideBelow: 'xl', cell: (l) => <span className="ds-annot uppercase">{ORIGEM_LABEL[l.origem]}</span> },
    { key: 'div', header: 'Divisão', hideBelow: 'lg', cell: (l) => <DivisionBadge divisao={l.divisao} /> },
    { key: 'status', header: 'Status', sort: (l) => statusVisual(l), cell: (l) => <LancamentoStatusLabel status={statusVisual(l)} /> },
    {
      key: 'valor',
      header: 'Valor',
      align: 'right',
      sort: (l) => Number(l.valor),
      cell: (l) => <span className="font-ds-mono text-sm tabular-nums">{brl(Number(l.valor), Number(l.valor) % 1 !== 0)}</span>,
    },
    {
      key: 'acao',
      header: '',
      align: 'right',
      width: '8rem',
      cell: (l) =>
        l.status === 'pago' ? (
          <span className="ds-annot">
            {l.forma ?? 'pago'} · {l.pago_em && dataCurta(l.pago_em)}
          </span>
        ) : (
          <Button
            size="sm"
            variant={statusVisual(l) === 'atrasado' ? 'primary' : 'secondary'}
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

  const ehMesAtual = ref.ano === hoje.getFullYear() && ref.mes === hoje.getMonth();

  return (
    <>
      <ScreenHeader
        sub="todas as divisões"
        title={`Financeiro · ${MES_NOME[ref.mes]}${ref.ano !== hoje.getFullYear() ? ` ${ref.ano}` : ''}`}
        actions={
          <>
            <Button size="icon" variant="ghost" aria-label="Mês anterior" className="size-9" onClick={() => setRef(somarMes(ref.ano, ref.mes, -1))}>
              <ChevronLeft className="size-4" strokeWidth={1.5} />
            </Button>
            <Button size="sm" variant="secondary" disabled={ehMesAtual} onClick={() => setRef({ ano: hoje.getFullYear(), mes: hoje.getMonth() })}>
              Este mês
            </Button>
            <Button size="icon" variant="ghost" aria-label="Próximo mês" className="size-9" onClick={() => setRef(somarMes(ref.ano, ref.mes, 1))}>
              <ChevronRight className="size-4" strokeWidth={1.5} />
            </Button>
            <Button size="sm" onClick={() => setEditar('novo')}>
              <Plus className="size-4" strokeWidth={1.5} aria-hidden /> Lançamento
            </Button>
          </>
        }
      />
      <div className="space-y-4 p-4 md:p-6">
        {erro && (
          <Alert tone="danger" title="Erro ao carregar o financeiro">
            {erro}
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          <KpiTile label={`Recebido · ${MES[ref.mes]}`} value={brl(totalMes)} note={`${recebidoMes.length} lançamento${recebidoMes.length === 1 ? '' : 's'}`} />
          <KpiTile label={`A receber · ${MES[ref.mes]}`} value={brl(soma(aReceberMes))} note={`${aReceberMes.length} pendente${aReceberMes.length === 1 ? '' : 's'}`} />
          <KpiTile
            label="Em atraso"
            value={brl(soma(atrasados))}
            tone={atrasados.length ? 'danger' : undefined}
            note={atrasados.length ? `${atrasados.length} lançamento${atrasados.length === 1 ? '' : 's'}` : 'tudo em dia'}
          />
          <KpiTile label="Próximos 30 dias" value={brl(soma(proximos))} note={`${proximos.length} a vencer`} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Panel title="Recebido × a receber">
            <MonthlyBars data={meses} current={MES[ref.mes]} />
          </Panel>
          <Panel title={`Recebido por divisão · ${MES[ref.mes]}`}>
            {totalMes === 0 ? (
              <p className="py-6 text-center text-sm text-ds-subtle">Nada recebido neste mês.</p>
            ) : (
              <ul className="space-y-4">
                {porDivisao.map((r) => (
                  <li key={r.d} data-divisao={r.d}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-ds-fg">{DIVISAO_LABEL[r.d].replace('DAMA ', '')}</span>
                      <span className="font-ds-mono text-sm tabular-nums">{brl(r.v)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-ds-surface-3">
                      <div className="h-full rounded-r-[2px] bg-ds-accent" style={{ width: `${(r.v / totalMes) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-subtle" strokeWidth={1.5} aria-hidden />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar pessoa ou descrição"
                aria-label="Buscar lançamento"
                className="h-8 w-full rounded-ds-xs border border-ds-line bg-ds-surface pl-8 pr-2 text-sm outline-none focus:border-ds-accent"
              />
            </div>
            <Chips
              value={filtro}
              onChange={setFiltro}
              options={[
                { id: 'mes', label: `Do mês`, count: doFiltro.mes.length },
                { id: 'atrasados', label: 'Atrasados', count: atrasados.length },
                { id: 'pendentes', label: 'Todos pendentes', count: pendentes.length },
                { id: 'pagos', label: `Pagos em ${MES[ref.mes]}`, count: doFiltro.pagos.length },
              ]}
            />
          </div>
          <DataTable
            rows={filtrados}
            columns={colunas}
            getId={(l) => l.id}
            dense
            loading={lista === null && !erro}
            onSelect={(l) => setEditar(l)}
            empty={
              <p className="border-y border-ds-line py-10 text-center text-sm text-ds-subtle">
                {filtro === 'atrasados' ? 'Nada em atraso. Bom mês.' : 'Nenhum lançamento neste filtro.'}
              </p>
            }
          />
        </div>
      </div>

      <PagarModal
        key={pagar?.id ?? 'nenhum'}
        lancamento={pagar}
        onClose={() => setPagar(null)}
        onPago={() => {
          setPagar(null);
          setVersao((v) => v + 1);
        }}
      />
      {editar && (
        <LancamentoModal
          key={editar === 'novo' ? 'novo' : editar.id}
          lancamento={editar}
          clientes={clientes}
          onClose={() => setEditar(null)}
          onSalvo={() => {
            setEditar(null);
            setVersao((v) => v + 1);
          }}
        />
      )}
    </>
  );
}
