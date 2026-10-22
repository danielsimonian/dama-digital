'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileText, MessageCircle, Pencil, Plus } from 'lucide-react';
import { supabase, type Cliente, type Divisao, type EventoAgenda, type Lancamento, type Orcamento, type OrcamentoItem } from '@/lib/supabase';
import { Alert, Avatar, Breadcrumbs, Button, ButtonLink, DivisionBadge, Skeleton } from '@/components/ds/primitives';
import { brl, KpiTile, PapelBadge, PresencaMark, QuoteTrack } from '@/components/ds/admin/display';
import { Chips, Panel } from '../../_components/ui';
import { ListaLancamentos, statusVisual } from '../../_components/Lancamentos';
import { LancamentoModal } from '../../financeiro/_components/LancamentoModal';
import { totaisOrcamento } from '../../orcamentos/_lib';
import { dataCurta, whatsappUrl } from '../../_lib';
import { AulasDaPessoa } from '../_components/Aulas';
import { ConteudoDaPessoa } from '../_components/Conteudo';
import { PortalAcesso } from '../_components/Portal';
import { ClienteModal } from '../_components/ClienteModal';
import { formatarDesde, ORC_STATUS, RESP_LABEL, STATUS_LABEL } from '../_lib';

type Orc = Pick<Orcamento, 'id' | 'numero' | 'projeto_titulo' | 'status' | 'divisao' | 'data_emissao' | 'desconto'> & {
  itens: Pick<OrcamentoItem, 'valor' | 'quantidade' | 'valor_mensal'>[];
};
type Evento = Pick<EventoAgenda, 'id' | 'tipo' | 'titulo' | 'inicio' | 'presenca'>;
type Dados = { cliente: Cliente; orcs: Orc[]; lancs: Lancamento[]; eventos: Evento[] };
type Filtro = 'todos' | 'pendente' | 'atrasado' | 'pago';

const DIVISOES: Divisao[] = ['studio', 'tech', 'sports'];

const soma = (ls: Lancamento[]) => ls.reduce((s, l) => s + Number(l.valor), 0);

export default function ClientePage() {
  const { id } = useParams<{ id: string }>();
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState('');
  const [versao, setVersao] = useState(0);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [editar, setEditar] = useState(false);
  const [novoLanc, setNovoLanc] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('clientes').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('orcamentos')
        .select('id, numero, projeto_titulo, status, divisao, data_emissao, desconto, itens:orcamento_itens(valor, quantidade, valor_mensal)')
        .eq('cliente_id', id)
        .order('data_emissao', { ascending: false }),
      supabase.from('lancamentos').select('*').eq('cliente_id', id).order('vencimento', { ascending: false }),
      supabase
        .from('eventos_agenda')
        .select('id, tipo, titulo, inicio, presenca')
        .eq('cliente_id', id)
        .eq('cancelado', false)
        .lt('inicio', new Date().toISOString())
        .order('inicio', { ascending: false })
        .limit(12),
    ]).then(([c, o, l, e]) => {
      const falha = c.error ?? o.error ?? l.error ?? e.error;
      if (falha) setErro(falha.message);
      else if (!c.data) setErro('Cliente não encontrado.');
      else
        setDados({
          cliente: c.data as Cliente,
          orcs: (o.data as Orc[] | null) ?? [],
          lancs: (l.data as Lancamento[] | null) ?? [],
          eventos: (e.data as Evento[] | null) ?? [],
        });
    });
  }, [id, versao]);

  const recarregar = () => setVersao((v) => v + 1);

  if (erro)
    return (
      <div className="space-y-4 p-4 md:p-6">
        <Breadcrumbs items={[{ label: 'Clientes', href: '/painel/clientes' }, { label: 'Cliente' }]} />
        <Alert tone="danger" title="Não foi possível abrir">
          {erro}
        </Alert>
      </div>
    );

  if (!dados)
    return (
      <div className="space-y-4 p-4 md:p-6">
        <Skeleton className="h-16 w-72" />
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );

  const { cliente: p, orcs, lancs, eventos } = dados;
  const validos = lancs.filter((l) => l.status !== 'cancelado');
  const pagos = validos.filter((l) => l.status === 'pago');
  const pendentes = validos.filter((l) => statusVisual(l) === 'pendente');
  const atrasados = validos.filter((l) => statusVisual(l) === 'atrasado');
  const aprovados = orcs.filter((o) => o.status === 'aprovado');
  const totalAprovado = aprovados.reduce((s, o) => s + totaisOrcamento(o.itens, o.desconto).total, 0);

  const porDivisao = DIVISOES.map((d) => {
    const ls = validos.filter((l) => l.divisao === d);
    return { divisao: d, recebido: soma(ls.filter((l) => l.status === 'pago')), aberto: soma(ls.filter((l) => l.status === 'pendente')) };
  }).filter((d) => d.recebido || d.aberto);
  const maiorDivisao = Math.max(1, ...porDivisao.map((d) => d.recebido + d.aberto));

  const lista = filtro === 'todos' ? validos : validos.filter((l) => statusVisual(l) === filtro);
  const wa = p.telefone ? whatsappUrl(p.telefone) : null;
  const papeis = p.papeis ?? [];

  return (
    <>
      <div className="border-b border-ds-line px-4 py-5 md:px-6">
        <Breadcrumbs items={[{ label: 'Clientes', href: '/painel/clientes' }, { label: p.nome }]} />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar name={p.nome} size="lg" />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-medium tracking-tight">{p.nome}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {papeis.map((r) => (
                  <PapelBadge key={r} papel={r} />
                ))}
                {p.status && p.status !== 'ativo' && <span className="ds-annot uppercase">{STATUS_LABEL[p.status]}</span>}
                {p.empresa && <span className="text-xs text-ds-muted">{p.empresa}</span>}
                <span className="ds-annot">· desde {formatarDesde(p.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-2 rounded-ds-sm border border-ds-line px-3 text-sm text-ds-fg hover:bg-ds-surface"
              >
                <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> WhatsApp
              </a>
            )}
            <Button variant="secondary" size="sm" onClick={() => setEditar(true)}>
              <Pencil className="size-4" strokeWidth={1.5} aria-hidden /> Editar
            </Button>
            <ButtonLink size="sm" href={`/painel/orcamentos/novo?cliente=${p.id}`}>
              <Plus className="size-4" strokeWidth={1.5} aria-hidden /> Orçamento
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          <KpiTile label="Recebido" value={brl(soma(pagos))} note={`${pagos.length} pagamento${pagos.length === 1 ? '' : 's'}`} />
          <KpiTile label="A receber" value={brl(soma(pendentes))} note={pendentes.length ? `${pendentes.length} em aberto` : 'nada pendente'} />
          <KpiTile
            label="Em atraso"
            value={brl(soma(atrasados))}
            note={atrasados.length ? `${atrasados.length} vencido${atrasados.length === 1 ? '' : 's'}` : 'em dia'}
            tone={atrasados.length ? 'danger' : undefined}
          />
          <KpiTile
            label="Orçamentos aprovados"
            value={brl(totalAprovado)}
            note={`${aprovados.length} de ${orcs.length} orçamento${orcs.length === 1 ? '' : 's'}`}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
          <div className="min-w-0 space-y-4">
            <Panel
              title="Financeiro"
              action={
                <button onClick={() => setNovoLanc(true)} className="ds-annot hover:text-ds-fg">
                  + lançamento
                </button>
              }
            >
              <div className="mb-4">
                <Chips
                  value={filtro}
                  onChange={setFiltro}
                  options={[
                    { id: 'todos', label: 'Todos', count: validos.length },
                    { id: 'pendente', label: 'A receber', count: pendentes.length },
                    { id: 'atrasado', label: 'Atrasados', count: atrasados.length },
                    { id: 'pago', label: 'Pagos', count: pagos.length },
                  ]}
                />
              </div>
              <ListaLancamentos lancamentos={lista} onMudou={recarregar} vazio={filtro === 'todos' ? 'Nenhum lançamento ainda.' : 'Nada neste filtro.'} />
            </Panel>

            <Panel
              title="Orçamentos"
              action={
                <Link href={`/painel/orcamentos/novo?cliente=${p.id}`} className="ds-annot hover:text-ds-fg">
                  + novo
                </Link>
              }
            >
              {orcs.length === 0 ? (
                <p className="text-sm text-ds-subtle">Nenhum orçamento ainda.</p>
              ) : (
                <ul className="-my-2 divide-y divide-ds-line">
                  {orcs.map((o) => (
                    <li key={o.id} data-divisao={o.divisao}>
                      <Link href={`/painel/orcamentos/${o.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 hover:bg-ds-surface">
                        <FileText className="size-4 shrink-0 text-ds-subtle" strokeWidth={1.5} aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-ds-fg">{o.projeto_titulo}</span>
                          <span className="ds-annot">
                            #{o.numero} · {dataCurta(o.data_emissao)} · {ORC_STATUS[o.status]}
                          </span>
                        </span>
                        <span className="font-ds-mono text-sm tabular-nums text-ds-fg">{brl(totaisOrcamento(o.itens, o.desconto).total)}</span>
                        <QuoteTrack status={o.status} compact />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {papeis.includes('aluno') && (
              <section className="border border-ds-line p-4">
                <AulasDaPessoa clienteId={p.id} instrumento={p.instrumento} onMudou={recarregar} />
              </section>
            )}

            {eventos.length > 0 && (
              <Panel title="Histórico na agenda">
                <ul className="-my-2 divide-y divide-ds-line">
                  {eventos.map((e) => (
                    <li key={e.id} className="flex items-center gap-3 py-2.5">
                      <span className="w-12 font-ds-mono text-xs tabular-nums text-ds-muted">{dataCurta(e.inicio.slice(0, 10))}</span>
                      <span className="min-w-0 flex-1 truncate text-sm text-ds-fg">{e.titulo}</span>
                      <span className="ds-annot hidden sm:inline">{e.tipo === 'aula' ? 'aula' : e.tipo === 'sessao' ? 'sessão' : 'outro'}</span>
                      <PresencaMark presenca={e.presenca} size="sm" />
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            {(papeis.includes('aluno') || p.conteudo_visivel) && (
              <section className="border border-ds-line p-4">
                <ConteudoDaPessoa clienteId={p.id} />
              </section>
            )}
          </div>

          <div className="min-w-0 space-y-4">
            <Panel title="Cadastro">
              <dl className="-my-2 divide-y divide-ds-line text-sm">
                {[
                  ['WhatsApp', p.telefone],
                  ['E-mail', p.email],
                  ['Empresa', p.empresa],
                  ['CPF/CNPJ', p.documento],
                  ['Instrumento', papeis.includes('aluno') ? p.instrumento : null],
                  ['Responsável', p.responsavel ? RESP_LABEL[p.responsavel].split(' ')[0] : null],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4 py-2">
                      <dt className="ds-annot uppercase">{k}</dt>
                      <dd className="min-w-0 truncate text-right text-ds-fg">{v}</dd>
                    </div>
                  ))}
              </dl>
              {p.notas && <p className="mt-4 whitespace-pre-line border-t border-ds-line pt-4 text-sm text-ds-muted">{p.notas}</p>}
            </Panel>

            <Panel title="Por divisão">
              {porDivisao.length === 0 ? (
                <p className="text-sm text-ds-subtle">Sem lançamentos ainda.</p>
              ) : (
                <ul className="space-y-4">
                  {porDivisao.map((d) => (
                    <li key={d.divisao} data-divisao={d.divisao}>
                      <div className="flex items-baseline justify-between gap-3">
                        <DivisionBadge divisao={d.divisao} />
                        <span className="font-ds-mono text-sm tabular-nums text-ds-fg">{brl(d.recebido + d.aberto)}</span>
                      </div>
                      <div className="mt-2 flex h-1.5 bg-ds-surface-3" aria-hidden>
                        <span className="bg-ds-accent" style={{ width: `${(d.recebido / maiorDivisao) * 100}%` }} />
                        <span className="bg-ds-accent opacity-30" style={{ width: `${(d.aberto / maiorDivisao) * 100}%` }} />
                      </div>
                      <p className="ds-annot mt-1.5">
                        {brl(d.recebido)} recebido
                        {d.aberto > 0 && ` · ${brl(d.aberto)} a receber`}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <section className="border border-ds-line p-4">
              <PortalAcesso p={p} onMudou={recarregar} />
            </section>
          </div>
        </div>
      </div>

      {editar && (
        <ClienteModal
          cliente={p}
          onClose={() => setEditar(false)}
          onSalvo={() => {
            setEditar(false);
            recarregar();
          }}
        />
      )}
      {novoLanc && (
        <LancamentoModal
          lancamento="novo"
          clientes={[{ id: p.id, nome: p.nome }]}
          clienteInicial={p.id}
          onClose={() => setNovoLanc(false)}
          onSalvo={() => {
            setNovoLanc(false);
            recarregar();
          }}
        />
      )}
    </>
  );
}
