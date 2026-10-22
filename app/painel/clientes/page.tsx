'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, UserPlus, MessageCircle, Pencil, FileText, ArrowUpRight } from 'lucide-react';
import { supabase, type Cliente, type Lancamento, type Orcamento, type Papel } from '@/lib/supabase';
import { Button, ButtonLink, Avatar, Alert, DivisionBadge } from '@/components/ds/primitives';
import { Drawer } from '@/components/ds/interactive';
import { PapelBadge } from '@/components/ds/admin/display';
import { DataTable, type Column } from '@/components/ds/admin/table';
import { ScreenHeader, Chips } from '../_components/ui';
import { ListaLancamentos } from '../_components/Lancamentos';
import { AulasDaPessoa } from './_components/Aulas';
import { PortalAcesso } from './_components/Portal';
import { ConteudoDaPessoa } from './_components/Conteudo';
import { ClienteModal } from './_components/ClienteModal';
import { formatarDesde, ORC_STATUS, RESP_FOTO, RESP_LABEL, STATUS_LABEL } from './_lib';
import { whatsappUrl } from '../_lib';

type OrcResumo = Pick<Orcamento, 'id' | 'numero' | 'projeto_titulo' | 'status' | 'divisao' | 'data_emissao'>;

/* ------------------------------------------------------------------ */
/* Ficha                                                               */
/* ------------------------------------------------------------------ */

function Ficha({ p, onEditar, onMudou }: { p: Cliente; onEditar: () => void; onMudou: () => void }) {
  const [carregados, setCarregados] = useState<{ id: string; orcs: OrcResumo[]; lancs: Lancamento[] } | null>(null);
  const [versao, setVersao] = useState(0);
  const atual = carregados?.id === p.id ? carregados : null;
  const orcs = atual?.orcs ?? null;

  useEffect(() => {
    Promise.all([
      supabase
        .from('orcamentos')
        .select('id, numero, projeto_titulo, status, divisao, data_emissao')
        .eq('cliente_id', p.id)
        .order('data_emissao', { ascending: false }),
      supabase.from('lancamentos').select('*').eq('cliente_id', p.id).order('vencimento'),
    ]).then(([o, l]) => setCarregados({ id: p.id, orcs: o.data ?? [], lancs: (l.data as Lancamento[] | null) ?? [] }));
  }, [p.id, versao]);

  const wa = p.telefone ? whatsappUrl(p.telefone) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Avatar name={p.nome} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-medium tracking-tight">{p.nome}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {(p.papeis ?? []).map((r) => (
              <PapelBadge key={r} papel={r} />
            ))}
            {p.status && p.status !== 'ativo' && <span className="ds-annot uppercase">{STATUS_LABEL[p.status]}</span>}
            {p.instrumento && <span className="ds-annot">· {p.instrumento}</span>}
          </div>
        </div>
      </div>

      <ButtonLink href={`/painel/clientes/${p.id}`} variant="secondary" size="sm" className="h-10 w-full">
        Abrir página do cliente <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
      </ButtonLink>

      <div className="grid grid-cols-2 gap-2">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-ds-sm border border-ds-line text-sm text-ds-fg hover:bg-ds-surface"
          >
            <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> WhatsApp
          </a>
        ) : (
          <span className="inline-flex h-10 items-center justify-center rounded-ds-sm border border-dashed border-ds-line text-xs text-ds-subtle">sem WhatsApp</span>
        )}
        <Button variant="secondary" size="sm" className="h-10" onClick={onEditar}>
          <Pencil className="size-4" strokeWidth={1.5} aria-hidden /> Editar
        </Button>
      </div>

      <dl className="divide-y divide-ds-line border-y border-ds-line text-sm">
        {[
          ['WhatsApp', p.telefone],
          ['E-mail', p.email],
          ['Empresa', p.empresa],
          ['CPF/CNPJ', p.documento],
          ['Responsável', p.responsavel ? RESP_LABEL[p.responsavel].split(' ')[0] : null],
          ['Desde', formatarDesde(p.created_at)],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 py-2">
              <dt className="ds-annot uppercase">{k}</dt>
              <dd className="min-w-0 truncate text-right text-ds-fg">{v}</dd>
            </div>
          ))}
      </dl>

      {p.notas && (
        <div>
          <p className="ds-annot mb-2 uppercase">Notas</p>
          <p className="whitespace-pre-line text-sm text-ds-muted">{p.notas}</p>
        </div>
      )}

      {(p.papeis ?? []).includes('aluno') && <AulasDaPessoa clienteId={p.id} instrumento={p.instrumento} onMudou={() => setVersao((v) => v + 1)} />}

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="ds-annot uppercase">Orçamentos</p>
          <Link href={`/painel/orcamentos/novo?cliente=${p.id}`} className="ds-annot hover:text-ds-fg">
            + novo orçamento
          </Link>
        </div>
        {orcs === null ? (
          <p className="ds-annot">carregando…</p>
        ) : orcs.length === 0 ? (
          <p className="text-sm text-ds-subtle">Nenhum orçamento ainda.</p>
        ) : (
          <ul className="divide-y divide-ds-line border-y border-ds-line">
            {orcs.map((o) => (
              <li key={o.id} data-divisao={o.divisao}>
                <Link href={`/painel/orcamentos/${o.id}`} className="flex items-center gap-3 py-2.5 hover:bg-ds-surface">
                  <FileText className="size-4 shrink-0 text-ds-subtle" strokeWidth={1.5} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ds-fg">{o.projeto_titulo}</span>
                    <span className="ds-annot">
                      #{o.numero} · {ORC_STATUS[o.status]}
                    </span>
                  </span>
                  <DivisionBadge divisao={o.divisao} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="ds-annot mb-2 uppercase">Financeiro</p>
        {atual ? (
          <ListaLancamentos lancamentos={atual.lancs} onMudou={() => setVersao((v) => v + 1)} vazio="Nenhum lançamento ainda." />
        ) : (
          <p className="ds-annot">carregando…</p>
        )}
      </div>

      {((p.papeis ?? []).includes('aluno') || p.conteudo_visivel) && <ConteudoDaPessoa clienteId={p.id} />}

      <PortalAcesso p={p} onMudou={onMudou} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tela                                                                */
/* ------------------------------------------------------------------ */

function ClientesTela() {
  const router = useRouter();
  const params = useSearchParams();
  const [pessoas, setPessoas] = useState<Cliente[] | null>(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<'todos' | Papel | 'sem'>('todos');
  const [sel, setSel] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [editar, setEditar] = useState<Cliente | 'novo' | null>(null);
  const [versao, setVersao] = useState(0);
  const [pedido, setPedido] = useState('');

  useEffect(() => {
    supabase
      .from('clientes')
      .select('*')
      .order('nome')
      .then(({ data, error }) => {
        if (error) setErro(error.message);
        else setPessoas(data);
      });
  }, [versao]);

  // ?novo=1 e ?id= vêm da paleta de comandos
  const queryUrl = params.toString();
  if (queryUrl !== pedido) {
    setPedido(queryUrl);
    const id = params.get('id');
    if (params.get('novo') === '1') setEditar('novo');
    else if (id) {
      setSel(id);
      if (typeof window !== 'undefined' && window.innerWidth < 1280) setDrawer(true);
    }
  }
  useEffect(() => {
    if (queryUrl) router.replace('/painel/clientes');
  }, [queryUrl, router]);

  const lista = pessoas ?? [];
  const filtradas = lista.filter((p) => {
    const papeis = p.papeis ?? [];
    const okPapel = filtro === 'todos' || (filtro === 'sem' ? papeis.length === 0 : papeis.includes(filtro));
    const q = busca.trim().toLowerCase();
    const okBusca = !q || [p.nome, p.empresa, p.email, p.telefone].some((v) => v?.toLowerCase().includes(q));
    return okPapel && okBusca;
  });
  const atual = lista.find((p) => p.id === sel) ?? filtradas[0] ?? null;

  const conta = (f: Papel) => lista.filter((p) => (p.papeis ?? []).includes(f)).length;
  const semPapel = lista.filter((p) => !(p.papeis ?? []).length).length;

  const colunas: Column<Cliente>[] = [
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
              {p.status && p.status !== 'ativo' && <span className="ds-annot uppercase">{STATUS_LABEL[p.status]}</span>}
            </span>
            <span className="mt-0.5 flex gap-1">
              {(p.papeis ?? []).map((r) => (
                <PapelBadge key={r} papel={r} />
              ))}
              {p.empresa && <span className="truncate text-xs text-ds-muted">{p.empresa}</span>}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'contato',
      header: 'Contato',
      hideBelow: 'lg',
      cell: (p) => <span className="font-ds-mono text-xs text-ds-muted">{p.telefone || p.email || '—'}</span>,
    },
    {
      key: 'resp',
      header: 'Resp.',
      hideBelow: 'xl',
      cell: (p) => (p.responsavel ? <Avatar name={RESP_LABEL[p.responsavel]} src={RESP_FOTO[p.responsavel]} size="sm" /> : <span className="ds-annot">—</span>),
    },
    {
      key: 'desde',
      header: 'Desde',
      align: 'right',
      sort: (p) => p.created_at,
      cell: (p) => <span className="font-ds-mono text-xs text-ds-subtle">{formatarDesde(p.created_at)}</span>,
    },
  ];

  return (
    <>
      <ScreenHeader
        sub="pessoas e empresas · um cadastro por cliente"
        title="Clientes"
        actions={
          <Button size="sm" onClick={() => setEditar('novo')}>
            <UserPlus className="size-4" strokeWidth={1.5} aria-hidden /> Cadastrar
          </Button>
        }
      />
      <div className="grid xl:grid-cols-[1fr_22rem]">
        <div className="min-w-0 p-4 md:p-6">
          {erro && (
            <div className="mb-4">
              <Alert tone="danger" title="Erro ao carregar clientes">
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
                placeholder="Buscar nome, empresa, contato"
                aria-label="Buscar cliente"
                className="h-8 w-full rounded-ds-xs border border-ds-line bg-ds-surface pl-8 pr-2 text-sm outline-none focus:border-ds-accent"
              />
            </div>
            <Chips
              value={filtro}
              onChange={setFiltro}
              options={[
                { id: 'todos', label: 'Todos', count: lista.length },
                { id: 'aluno', label: 'Alunos', count: conta('aluno') },
                { id: 'estudio', label: 'Estúdio', count: conta('estudio') },
                { id: 'tech', label: 'Tech', count: conta('tech') },
                { id: 'sports', label: 'Sports', count: conta('sports') },
                ...(semPapel ? [{ id: 'sem' as const, label: 'Sem papel', count: semPapel }] : []),
              ]}
            />
          </div>
          <DataTable
            rows={filtradas}
            columns={colunas}
            getId={(p) => p.id}
            selectedId={atual?.id}
            loading={pessoas === null && !erro}
            onSelect={(p) => {
              setSel(p.id);
              if (window.innerWidth < 1280) setDrawer(true);
            }}
            empty={
              <p className="border-y border-ds-line py-10 text-center text-sm text-ds-subtle">
                {busca ? `Nenhum cliente com “${busca}”.` : 'Nenhum cliente ainda.'} Cadastre pelo botão acima ou pelo ⌘K.
              </p>
            }
          />
        </div>
        <aside className="hidden border-l border-ds-line p-5 xl:block">
          {atual ? <Ficha p={atual} onEditar={() => setEditar(atual)} onMudou={() => setVersao((v) => v + 1)} /> : <p className="text-sm text-ds-subtle">Selecione um cliente.</p>}
        </aside>
      </div>

      <Drawer open={drawer && !!atual} onClose={() => setDrawer(false)} title={atual?.nome ?? ''}>
        {atual && (
          <Ficha
            p={atual}
            onMudou={() => setVersao((v) => v + 1)}
            onEditar={() => {
              setDrawer(false);
              setEditar(atual);
            }}
          />
        )}
      </Drawer>

      {editar && (
        <ClienteModal
          key={editar === 'novo' ? 'novo' : editar.id}
          cliente={editar}
          onClose={() => setEditar(null)}
          onSalvo={(id) => {
            setSel(id);
            setEditar(null);
            setVersao((v) => v + 1);
          }}
        />
      )}
    </>
  );
}

export default function ClientesPage() {
  return (
    <Suspense>
      <ClientesTela />
    </Suspense>
  );
}
