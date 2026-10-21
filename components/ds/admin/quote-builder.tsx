'use client';

import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Plus, Search, Trash2, Minus, Send, FileText, Repeat } from 'lucide-react';
import type { Divisao } from '@/lib/supabase';
import { cn, Button, DivisionBadge, DIVISAO_LABEL, Kbd } from '../primitives';
import { SelectField } from '../fields';
import { brl, QuoteTrack } from './display';
import type { CatalogoItem, OrcamentoStatus } from './types';

type Linha = {
  id: string;
  nome: string;
  valor: number;
  qtd: number;
  unidade: CatalogoItem['unidade'];
  divisao: Divisao;
  // repassados sem edição ao salvar (itens vindos do catálogo ou do editor antigo)
  catalogoId?: string | null;
  descricao?: string | null;
  detalhes?: { texto: string; valor: number | null }[] | null;
};

export type QuoteDraft = { titulo: string; clienteId: string; divisao: Divisao; linhas: Linha[]; desconto: number; entrada: number; parcelas: number };

const isMensal = (l: Linha) => l.unidade === 'mês';

export function QuoteBuilder({
  catalogo,
  clientes,
  inicial,
  onSend,
  onSave,
  saving,
  readOnly,
  children,
  aside,
}: {
  catalogo: CatalogoItem[];
  clientes: { id: string; nome: string }[];
  inicial: {
    numero: string;
    titulo: string;
    clienteId: string;
    divisao: Divisao;
    linhas: Linha[];
    desconto: number;
    status: OrcamentoStatus;
    versao: number;
    entrada?: number;
    parcelas?: number;
  };
  /** protótipo: só avisa */
  onSend?: (msg: string) => void;
  /** uso real: grava; o status vem de `inicial` depois de recarregar */
  onSave?: (d: QuoteDraft, acao: 'rascunho' | 'enviar') => void;
  saving?: boolean;
  readOnly?: boolean;
  /** campos extras na coluna do editor (descrição, validade…) */
  children?: ReactNode;
  /** conteúdo extra no fim do resumo */
  aside?: ReactNode;
}) {
  const [titulo, setTitulo] = useState(inicial.titulo);
  const [clienteId, setClienteId] = useState(inicial.clienteId);
  const [divisao, setDivisao] = useState<Divisao>(inicial.divisao);
  const [linhas, setLinhas] = useState<Linha[]>(inicial.linhas);
  const [desconto, setDesconto] = useState(inicial.desconto);
  const [entrada, setEntrada] = useState(inicial.entrada ?? 50);
  const [parcelas, setParcelas] = useState(inicial.parcelas ?? 1);
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(false);
  const [statusLocal, setStatus] = useState<OrcamentoStatus>(inicial.status);
  const status = onSave ? inicial.status : statusLocal;
  const buscaRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const sugestoes = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return catalogo
      .filter((c) => c.divisao === divisao)
      .filter((c) => !q || c.nome.toLowerCase().includes(q))
      .slice(0, 6);
  }, [busca, catalogo, divisao]);

  const add = (c: CatalogoItem) => {
    setLinhas((ls) => {
      const found = ls.find((l) => l.id === c.id);
      if (found) return ls.map((l) => (l.id === c.id ? { ...l, qtd: l.qtd + 1 } : l));
      return [...ls, { id: c.id, nome: c.nome, valor: c.valor, qtd: 1, unidade: c.unidade, divisao: c.divisao, catalogoId: c.id }];
    });
    setBusca('');
    setAberto(false);
    buscaRef.current?.focus();
  };
  const addAvulso = () => {
    const nome = busca.trim();
    if (!nome) return;
    setLinhas((ls) => [...ls, { id: `avulso-${ls.length}-${nome}`, nome, valor: 0, qtd: 1, unidade: 'projeto', divisao }]);
    setBusca('');
    setAberto(false);
    buscaRef.current?.focus();
  };
  const upd = (id: string, patch: Partial<Linha>) => setLinhas((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const del = (id: string) => setLinhas((ls) => ls.filter((l) => l.id !== id));

  const unico = linhas.filter((l) => !isMensal(l)).reduce((s, l) => s + l.valor * l.qtd, 0);
  const mensal = linhas.filter(isMensal).reduce((s, l) => s + l.valor * l.qtd, 0);
  const total = Math.max(0, unico - desconto);
  const valorEntrada = Math.round((total * entrada) / 100);
  const resto = total - valorEntrada;
  const valorParcela = parcelas ? resto / parcelas : 0;
  const nLanc = (entrada > 0 ? 1 : 0) + (resto > 0 ? parcelas : 0) + (mensal > 0 ? 1 : 0);
  const enviado = status !== 'rascunho';
  const draft: QuoteDraft = { titulo, clienteId, divisao, linhas, desconto, entrada, parcelas };

  return (
    <div data-divisao={divisao} className="@container">
      <div className="grid gap-6 @4xl:grid-cols-[1fr_19rem]">
        {/* ---------------- editor ---------------- */}
        <fieldset disabled={readOnly} className="@container min-w-0 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-ds-mono text-xs text-ds-subtle">#{inicial.numero}</span>
            <span className="rounded-ds-xs border border-ds-line px-1.5 font-ds-mono text-[10px] text-ds-muted">v{inicial.versao}</span>
            <DivisionBadge divisao={divisao} />
            {enviado && !readOnly && <span className="ds-annot">reenviar depois de editar cria a v{inicial.versao + 1}</span>}
          </div>

          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            aria-label="Título do orçamento"
            className="w-full border-0 border-b border-transparent bg-transparent pb-1 text-2xl font-medium tracking-tight text-ds-fg outline-none hover:border-ds-line focus:border-ds-accent"
          />

          <div className="grid gap-4 @md:grid-cols-2">
            <SelectField
              label="Cliente"
              value={clienteId}
              placeholder="Escolha o cliente"
              onChange={(e) => setClienteId(e.target.value)}
              options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
            />
            <SelectField
              label="Divisão"
              value={divisao}
              onChange={(e) => setDivisao(e.target.value as Divisao)}
              options={(['studio', 'tech', 'sports'] as Divisao[]).map((d) => ({ value: d, label: DIVISAO_LABEL[d] }))}
            />
          </div>

          {/* itens */}
          <div>
            <div className="mb-2 flex items-end justify-between">
              <p className="ds-annot uppercase">Itens · {linhas.length}</p>
              <p className="ds-annot hidden @md:block">valor e quantidade editáveis</p>
            </div>
            <div className="border-y border-ds-line">
              {linhas.length === 0 && (
                <p className="py-8 text-center text-sm text-ds-subtle">Nenhum item. Busque no catálogo abaixo.</p>
              )}
              <ul className="divide-y divide-ds-line">
                {linhas.map((l, i) => (
                  <li key={l.id} className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-x-3 gap-y-2 py-3 @xl:grid-cols-[1.5rem_1fr_7rem_6.5rem_6rem_2.5rem]">
                    <span className="ds-annot tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ds-fg">{l.nome}</p>
                      <p className="ds-annot flex items-center gap-1">
                        {isMensal(l) && <Repeat className="size-3" strokeWidth={1.5} aria-hidden />}
                        por {l.unidade}
                      </p>
                    </div>
                    <div className="col-start-2 flex flex-wrap items-center gap-2 @xl:contents">
                    <div className="flex items-center gap-1" aria-label={`Quantidade de ${l.nome}`}>
                      <button onClick={() => upd(l.id, { qtd: Math.max(1, l.qtd - 1) })} aria-label="Diminuir" className="inline-flex size-8 items-center justify-center border border-ds-line text-ds-muted hover:text-ds-fg">
                        <Minus className="size-3" strokeWidth={1.5} />
                      </button>
                      <span className="w-8 text-center font-ds-mono text-sm tabular-nums">{l.qtd}</span>
                      <button onClick={() => upd(l.id, { qtd: l.qtd + 1 })} aria-label="Aumentar" className="inline-flex size-8 items-center justify-center border border-ds-line text-ds-muted hover:text-ds-fg">
                        <Plus className="size-3" strokeWidth={1.5} />
                      </button>
                    </div>
                    <label className="relative block w-28 @xl:w-auto">
                      <span className="sr-only">Valor unitário de {l.nome}</span>
                      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-ds-mono text-[11px] text-ds-subtle">R$</span>
                      <input
                        type="number"
                        min={0}
                        value={l.valor}
                        onChange={(e) => upd(l.id, { valor: Number(e.target.value) || 0 })}
                        className="h-8 w-full rounded-ds-xs border border-ds-line bg-ds-surface pl-7 pr-2 text-right font-ds-mono text-sm tabular-nums outline-none focus:border-ds-accent"
                      />
                    </label>
                    </div>
                    <p className="row-start-1 col-start-3 text-right font-ds-mono text-sm tabular-nums text-ds-fg @xl:col-start-auto @xl:row-start-auto">
                      {brl(l.valor * l.qtd)}
                      {isMensal(l) && <span className="text-ds-subtle">/mês</span>}
                    </p>
                    <button onClick={() => del(l.id)} aria-label={`Remover ${l.nome}`} className="col-start-3 inline-flex size-8 items-center justify-center justify-self-end text-ds-subtle hover:text-ds-danger @xl:col-start-auto">
                      <Trash2 className="size-4" strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* busca no catálogo */}
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ds-subtle" strokeWidth={1.5} aria-hidden />
              <input
                ref={buscaRef}
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setAberto(true);
                }}
                onFocus={() => setAberto(true)}
                onBlur={() => setTimeout(() => setAberto(false), 120)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && sugestoes[0]) {
                    e.preventDefault();
                    add(sugestoes[0]);
                  } else if (e.key === 'Enter' && busca.trim()) {
                    e.preventDefault();
                    addAvulso();
                  }
                  if (e.key === 'Escape') setAberto(false);
                }}
                role="combobox"
                aria-expanded={aberto}
                aria-controls={listId}
                aria-label="Adicionar item do catálogo"
                placeholder={`Adicionar do catálogo ${DIVISAO_LABEL[divisao]}…`}
                className="h-11 w-full rounded-ds-sm border border-dashed border-ds-line-strong bg-transparent pl-9 pr-16 text-sm outline-none placeholder:text-ds-subtle focus:border-solid focus:border-ds-accent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <Kbd>↵</Kbd>
              </span>
              {aberto && (sugestoes.length > 0 || busca.trim()) && (
                <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-ds-sm border border-ds-line bg-ds-surface-2 p-1 shadow-[0_12px_32px_-12px_oklch(0%_0_0/0.4)]">
                  {sugestoes.map((c, i) => (
                    <li key={c.id} role="option" aria-selected={i === 0}>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => add(c)}
                        className={cn('flex w-full items-center gap-3 rounded-ds-xs px-3 py-2 text-left hover:bg-ds-surface-3', i === 0 && 'bg-ds-surface-3/60')}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-ds-fg">{c.nome}</span>
                          <span className="block truncate text-xs text-ds-muted">{c.descricao}</span>
                        </span>
                        <span className="shrink-0 font-ds-mono text-xs tabular-nums text-ds-muted">
                          {brl(c.valor)}/{c.unidade}
                        </span>
                      </button>
                    </li>
                  ))}
                  {busca.trim() && (
                    <li role="option" aria-selected={sugestoes.length === 0}>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={addAvulso}
                        className={cn('flex w-full items-center gap-2 rounded-ds-xs px-3 py-2 text-left text-sm text-ds-muted hover:bg-ds-surface-3', sugestoes.length === 0 && 'bg-ds-surface-3/60')}
                      >
                        <Plus className="size-3.5" strokeWidth={1.5} aria-hidden /> Adicionar “{busca.trim()}” como item avulso
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* condições */}
          <div className="grid gap-4 @xl:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm">
              Desconto
              <span className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-ds-mono text-xs text-ds-subtle">R$</span>
                <input
                  type="number"
                  min={0}
                  value={desconto}
                  onChange={(e) => setDesconto(Number(e.target.value) || 0)}
                  className="h-11 w-full rounded-ds-sm border border-ds-line bg-ds-surface pl-9 pr-3 font-ds-mono tabular-nums outline-none focus:border-ds-accent"
                />
              </span>
            </label>
            <fieldset className="flex flex-col gap-1.5 text-sm">
              <legend className="mb-1.5">Entrada</legend>
              <div className="flex gap-1">
                {[0, 30, 50, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => setEntrada(p)}
                    aria-pressed={entrada === p}
                    className={cn('h-11 flex-1 rounded-ds-xs border font-ds-mono text-xs tabular-nums', entrada === p ? 'border-ds-accent bg-ds-accent-soft text-ds-fg' : 'border-ds-line text-ds-muted hover:text-ds-fg')}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="flex flex-col gap-1.5 text-sm">
              Parcelas do restante
              <select
                value={parcelas}
                onChange={(e) => setParcelas(Number(e.target.value))}
                disabled={entrada === 100}
                className="h-11 rounded-ds-sm border border-ds-line bg-ds-surface px-3 font-ds-mono text-sm outline-none focus:border-ds-accent disabled:opacity-40"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}× · 30 em 30 dias
                  </option>
                ))}
              </select>
            </label>
          </div>

          {children}
        </fieldset>

        {/* ---------------- resumo ---------------- */}
        <aside className="min-w-0">
          <div className="ds-corners sticky top-4 bg-ds-surface p-5 [--ds-corner:var(--ds-accent)]">
            <p className="ds-annot uppercase">Resumo</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ds-muted">Subtotal</dt>
                <dd className="font-ds-mono tabular-nums">{brl(unico)}</dd>
              </div>
              {desconto > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ds-muted">Desconto</dt>
                  <dd className="font-ds-mono tabular-nums text-ds-success">− {brl(desconto)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 border-t border-ds-line pt-4">
              <p className="ds-annot">total do projeto</p>
              <p className="mt-1 text-3xl font-medium tabular-nums tracking-tight">{brl(total)}</p>
              {mensal > 0 && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ds-muted">
                  <Repeat className="size-3.5" strokeWidth={1.5} aria-hidden />+ {brl(mensal)}/mês recorrente
                </p>
              )}
            </div>

            <ol className="mt-5 space-y-1.5 border-t border-ds-line pt-4 text-xs">
              {entrada > 0 && (
                <li className="flex justify-between gap-2">
                  <span className="text-ds-muted">Entrada {entrada}% · na aprovação</span>
                  <span className="font-ds-mono tabular-nums">{brl(valorEntrada)}</span>
                </li>
              )}
              {resto > 0 &&
                Array.from({ length: parcelas }, (_, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span className="text-ds-muted">
                      Parcela {i + 1}/{parcelas} · +{(i + 1) * 30} dias
                    </span>
                    <span className="font-ds-mono tabular-nums">{brl(valorParcela, valorParcela % 1 !== 0)}</span>
                  </li>
                ))}
            </ol>

            <p className="mt-4 flex items-start gap-2 rounded-ds-xs bg-ds-accent-soft p-2.5 text-xs text-ds-muted">
              <FileText className="mt-0.5 size-3.5 shrink-0 text-ds-accent" strokeWidth={1.5} aria-hidden />
              Ao aprovar, gera {nLanc} lançamento{nLanc === 1 ? '' : 's'} no financeiro automaticamente.
            </p>

            <div className="mt-5">
              <QuoteTrack status={status} />
            </div>

            {!readOnly && (
              <div className="mt-5 grid gap-2">
                <Button
                  onClick={() => {
                    if (onSave) return onSave(draft, 'enviar');
                    setStatus('enviado');
                    onSend?.(`#${inicial.numero} enviado para ${clientes.find((c) => c.id === clienteId)?.nome ?? 'o cliente'}`);
                  }}
                  disabled={!linhas.length || !clienteId || saving}
                  loading={saving}
                >
                  <Send className="size-4" strokeWidth={1.5} aria-hidden /> {enviado ? 'Salvar e reenviar' : 'Enviar ao cliente'}
                </Button>
                {!enviado && (
                  <Button variant="ghost" disabled={saving} onClick={() => (onSave ? onSave(draft, 'rascunho') : onSend?.('Rascunho salvo'))}>
                    Salvar rascunho
                  </Button>
                )}
              </div>
            )}
            {aside}
          </div>
        </aside>
      </div>
    </div>
  );
}

export type { Linha as QuoteLine };
