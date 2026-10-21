'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { supabase, type Orcamento, type OrcamentoItem } from '@/lib/supabase';
import { Alert, ButtonLink, DivisionBadge } from '@/components/ds/primitives';
import { brl, QuoteTrack } from '@/components/ds/admin/display';
import { DataTable, type Column } from '@/components/ds/admin/table';
import { ScreenHeader, Chips } from '../_components/ui';
import { totaisOrcamento } from './_lib';

type Linha = Pick<Orcamento, 'id' | 'numero' | 'projeto_titulo' | 'divisao' | 'status' | 'tipo' | 'desconto' | 'updated_at' | 'versao'> & {
  cliente: { nome: string } | null;
  itens: Pick<OrcamentoItem, 'valor' | 'quantidade' | 'valor_mensal' | 'pacote'>[];
};

type Filtro = 'abertos' | 'rascunho' | 'aprovado' | 'fechados' | 'todos';

const ABERTOS: Orcamento['status'][] = ['rascunho', 'enviado', 'visualizado'];

function quando(data: string) {
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
}

export default function OrcamentosPage() {
  const router = useRouter();
  const [lista, setLista] = useState<Linha[] | null>(null);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('abertos');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    supabase
      .from('orcamentos')
      .select('id, numero, projeto_titulo, divisao, status, tipo, desconto, updated_at, versao, cliente:clientes(nome), itens:orcamento_itens(valor, quantidade, valor_mensal, pacote)')
      .order('updated_at', { ascending: false })
      .returns<Linha[]>()
      .then(({ data, error }) => {
        if (error) setErro(error.message);
        else setLista(data);
      });
  }, []);

  const todos = lista ?? [];
  const passa = (o: Linha, f: Filtro) =>
    f === 'todos' ||
    (f === 'abertos' && ABERTOS.includes(o.status)) ||
    (f === 'fechados' && (o.status === 'recusado' || o.status === 'expirado')) ||
    o.status === f;
  const q = busca.trim().toLowerCase();
  const filtrados = todos.filter(
    (o) => passa(o, filtro) && (!q || [o.numero, o.projeto_titulo, o.cliente?.nome].some((v) => v?.toLowerCase().includes(q))),
  );

  const colunas: Column<Linha>[] = [
    {
      key: 'titulo',
      header: 'Orçamento',
      sort: (o) => o.projeto_titulo,
      cell: (o) => (
        <span className="block min-w-0" data-divisao={o.divisao}>
          <span className="flex items-center gap-2">
            <span className="font-ds-mono text-[11px] text-ds-subtle">{o.numero}</span>
            {(o.versao ?? 1) > 1 && <span className="font-ds-mono text-[10px] text-ds-subtle">v{o.versao}</span>}
          </span>
          <span className="block truncate text-ds-fg">{o.projeto_titulo}</span>
          <span className="block truncate text-xs text-ds-muted">{o.cliente?.nome ?? 'sem cliente'}</span>
        </span>
      ),
    },
    { key: 'div', header: 'Divisão', hideBelow: 'lg', cell: (o) => <DivisionBadge divisao={o.divisao} /> },
    { key: 'status', header: 'Status', sort: (o) => o.status, cell: (o) => <QuoteTrack status={o.status} compact /> },
    {
      key: 'valor',
      header: 'Valor',
      align: 'right',
      sort: (o) => totaisOrcamento(o.itens, o.desconto).total,
      cell: (o) => {
        if (o.tipo === 'pacotes') return <span className="ds-annot">pacotes</span>;
        const t = totaisOrcamento(o.itens, o.desconto);
        return (
          <span className="block text-right font-ds-mono text-sm tabular-nums">
            {brl(t.total)}
            {t.mensal > 0 && <span className="block text-[11px] text-ds-subtle">+ {brl(t.mensal)}/mês</span>}
          </span>
        );
      },
    },
    {
      key: 'quando',
      header: 'Atualizado',
      align: 'right',
      hideBelow: 'xl',
      sort: (o) => o.updated_at,
      cell: (o) => <span className="font-ds-mono text-xs text-ds-subtle">{quando(o.updated_at)}</span>,
    },
  ];

  const conta = (f: Filtro) => todos.filter((o) => passa(o, f)).length;

  return (
    <>
      <ScreenHeader
        sub="gerador v2 · itens do catálogo"
        title="Orçamentos"
        actions={
          <ButtonLink size="sm" href="/painel/orcamentos/novo">
            <Plus className="size-4" strokeWidth={1.5} aria-hidden /> Novo orçamento
          </ButtonLink>
        }
      />
      <div className="p-4 md:p-6">
        {erro && (
          <div className="mb-4">
            <Alert tone="danger" title="Erro ao carregar orçamentos">
              {erro}
            </Alert>
          </div>
        )}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-subtle" strokeWidth={1.5} aria-hidden />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar número, título, cliente"
              aria-label="Buscar orçamento"
              className="h-8 w-full rounded-ds-xs border border-ds-line bg-ds-surface pl-8 pr-2 text-sm outline-none focus:border-ds-accent"
            />
          </div>
          <Chips
            value={filtro}
            onChange={setFiltro}
            options={[
              { id: 'abertos', label: 'Abertos', count: conta('abertos') },
              { id: 'aprovado', label: 'Aprovados', count: conta('aprovado') },
              { id: 'fechados', label: 'Recusados/expirados', count: conta('fechados') },
              { id: 'todos', label: 'Todos', count: todos.length },
            ]}
          />
        </div>
        <DataTable
          rows={filtrados}
          columns={colunas}
          getId={(o) => o.id}
          loading={lista === null && !erro}
          onSelect={(o) => router.push(`/painel/orcamentos/${o.id}`)}
          empty={<p className="border-y border-ds-line py-10 text-center text-sm text-ds-subtle">Nenhum orçamento neste filtro.</p>}
        />
      </div>
    </>
  );
}
