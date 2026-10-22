// Proposta pública (link enviado ao cliente): ver, baixar em PDF e aprovar. Dados via RPCs orcamento_*.

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import { Check, Download, MessageCircle } from 'lucide-react';
import { supabase, type OrcamentoItem, type OrcamentoPublico } from '@/lib/supabase';
import { cn, Alert, Button, buttonClass, DIVISAO_LABEL, Eyebrow, Frame, Skeleton } from '@/components/ds/primitives';
import { Modal } from '@/components/ds/interactive';
import { DamaLogo } from '@/components/ds/site';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const WHATSAPP = '5513997434878';
const ETAPAS = ['Proposta', 'Aprovação', 'Produção', 'Entrega'];
const MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// datas "YYYY-MM-DD" lidas sem fuso, para não voltar um dia
const dataLonga = (iso: string) => `${Number(iso.slice(8, 10))} de ${MES[Number(iso.slice(5, 7)) - 1]} de ${iso.slice(0, 4)}`;
const whats = (texto: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

type Detalhe = { texto: string; valor: number | null } | string;
const detalhesDe = (i: OrcamentoItem) => ((i.detalhes ?? []) as Detalhe[]).map((d) => (typeof d === 'string' ? { texto: d, valor: null } : d));
const valorItem = (i: OrcamentoItem) => Number(i.valor) * Number(i.quantidade);

type Estado = { tipo: 'carregando' } | { tipo: 'inexistente' } | { tipo: 'rascunho' } | { tipo: 'ok'; orc: OrcamentoPublico };

export default function OrcamentoPublicoPage() {
  const { slug } = useParams<{ slug: string }>();
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });
  const [confirmar, setConfirmar] = useState<{ pacote: string | null } | null>(null);
  const [aprovando, setAprovando] = useState(false);
  const [erro, setErro] = useState('');
  const [acabouDeAprovar, setAcabouDeAprovar] = useState(false);
  const visto = useRef(false);

  useEffect(() => {
    supabase.rpc('orcamento_publico', { p_slug: slug }).then(({ data, error }) => {
      const orc = data as OrcamentoPublico | null;
      if (error || !orc) return setEstado({ tipo: 'inexistente' });
      if (orc.status === 'rascunho') return setEstado({ tipo: 'rascunho' });
      setEstado({ tipo: 'ok', orc });
      document.title = `Proposta ${orc.numero} — ${orc.projeto_titulo} · DAMA`;
      if (orc.status === 'enviado' && !visto.current) {
        visto.current = true;
        supabase.rpc('orcamento_registrar_visualizacao', { p_slug: slug }).then(({ data: ok }) => {
          if (ok) setEstado((e) => (e.tipo === 'ok' ? { tipo: 'ok', orc: { ...e.orc, status: 'visualizado' } } : e));
        });
      }
    });
  }, [slug]);

  const aprovar = async () => {
    if (!confirmar || estado.tipo !== 'ok') return;
    setAprovando(true);
    setErro('');
    const { data: ok, error } = await supabase.rpc('orcamento_aprovar', {
      p_slug: slug,
      p_pacote: confirmar.pacote,
    });
    setAprovando(false);
    if (error || !ok) {
      setErro('Não foi possível aprovar agora. Tente de novo em instantes ou fale com a gente no WhatsApp.');
      return;
    }
    setEstado({
      tipo: 'ok',
      orc: {
        ...estado.orc,
        status: 'aprovado',
        pacote_escolhido: confirmar.pacote ?? estado.orc.pacote_escolhido,
      },
    });
    setConfirmar(null);
    setAcabouDeAprovar(true);
  };

  const divisao = estado.tipo === 'ok' ? estado.orc.divisao : undefined;

  return (
    <div className={`${geist.variable} ${geistMono.variable} ds min-h-dvh bg-ds-bg text-ds-fg`} data-theme="light">
      {/* o acento da divisão vale para quem está dentro do .ds */}
      <div data-divisao={divisao}>
        <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-avoid { break-inside: avoid; }
        }
      `}</style>

        <header className="border-b border-ds-line">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4 md:px-6">
            <Link href="/" aria-label="DAMA Digital — site">
              <DamaLogo className="h-7" />
            </Link>
            {estado.tipo === 'ok' ? (
              <div className="no-print flex items-center gap-2">
                <button onClick={() => window.print()} className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                  <Download className="size-4" strokeWidth={1.5} aria-hidden /> <span className="hidden sm:inline">Baixar PDF</span>
                  <span className="sr-only sm:hidden">Baixar PDF</span>
                </button>
                <a
                  href={whats(`Olá! Quero falar sobre a proposta ${estado.orc.numero}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass({ variant: 'secondary', size: 'sm' })}
                >
                  <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> WhatsApp
                </a>
              </div>
            ) : (
              <span className="ds-annot uppercase">Proposta</span>
            )}
          </div>
        </header>

        {estado.tipo === 'carregando' && (
          <div className="mx-auto max-w-4xl space-y-4 px-4 py-12 md:px-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-64" />
          </div>
        )}

        {(estado.tipo === 'inexistente' || estado.tipo === 'rascunho') && (
          <div className="mx-auto max-w-md px-4 py-24 text-center">
            <Eyebrow>{estado.tipo === 'rascunho' ? 'Em preparo' : '404'}</Eyebrow>
            <h1 className="mt-4 text-2xl font-medium tracking-tight">
              {estado.tipo === 'rascunho' ? 'Essa proposta ainda está sendo preparada' : 'Proposta não encontrada'}
            </h1>
            <p className="mt-2 text-sm text-ds-muted">
              {estado.tipo === 'rascunho'
                ? 'Assim que ficar pronta, a gente te manda o link.'
                : 'O link pode estar incompleto. Confira a mensagem que a gente te mandou.'}
            </p>
            <a
              href={whats('Olá! Não consegui abrir a proposta que vocês me mandaram.')}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass({
                variant: 'secondary',
                className: 'mt-8',
              })}
            >
              <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> Falar com a DAMA
            </a>
          </div>
        )}

        {estado.tipo === 'ok' && (
          <Proposta
            orc={estado.orc}
            acabouDeAprovar={acabouDeAprovar}
            onAprovar={(pacote) => {
              setErro('');
              setConfirmar({ pacote });
            }}
          />
        )}

        <Modal
          open={!!confirmar}
          onClose={() => !aprovando && setConfirmar(null)}
          index={estado.tipo === 'ok' ? `proposta ${estado.orc.numero}` : undefined}
          title={confirmar?.pacote ? `Aprovar o pacote ${confirmar.pacote}?` : 'Aprovar esta proposta?'}
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmar(null)} disabled={aprovando}>
                Cancelar
              </Button>
              <Button onClick={aprovar} loading={aprovando}>
                <Check className="size-4" strokeWidth={1.5} aria-hidden /> Aprovar
              </Button>
            </>
          }
        >
          <p>Ao aprovar, você concorda com os itens, valores e condições desta proposta. A gente entra em contato para combinar os próximos passos.</p>
          {erro && (
            <div className="mt-4">
              <Alert tone="danger" title="Não deu certo">
                {erro}
              </Alert>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Documento                                                           */
/* ------------------------------------------------------------------ */

function Proposta({ orc, acabouDeAprovar, onAprovar }: { orc: OrcamentoPublico; acabouDeAprovar: boolean; onAprovar: (pacote: string | null) => void }) {
  const pacotes = orc.tipo === 'pacotes';
  const subtotal = orc.itens.reduce((s, i) => s + valorItem(i), 0);
  const desconto = Number(orc.desconto) || 0;
  const total = Math.max(0, subtotal - desconto);
  const mensal = orc.itens.reduce((s, i) => s + (Number(i.valor_mensal) || 0), 0);
  const aberto = orc.status === 'enviado' || orc.status === 'visualizado';
  const etapa = orc.status === 'aprovado' ? 1 : 0;

  return (
    <main className="mx-auto max-w-4xl px-4 md:px-6">
      {/* Abertura */}
      <section className="print-avoid border-b border-ds-line py-10 md:py-14">
        <Eyebrow>
          {DIVISAO_LABEL[orc.divisao]} · Proposta {orc.numero}
        </Eyebrow>
        <h1 className="mt-5 text-[clamp(2rem,1.3rem+2.4vw,3.25rem)] font-medium leading-[1.08] tracking-tight">
          {orc.projeto_titulo}
          {orc.cliente?.nome && !orc.projeto_titulo.toLowerCase().includes(orc.cliente.nome.toLowerCase()) && (
            <span className="block text-ds-subtle">para {orc.cliente.nome}</span>
          )}
        </h1>
        {orc.projeto_descricao && (
          <p className="mt-6 max-w-[62ch] whitespace-pre-line text-base leading-relaxed text-ds-muted md:text-lg">{orc.projeto_descricao}</p>
        )}

        <dl className="mt-10 grid grid-cols-2 border-t border-ds-line sm:grid-cols-4">
          {[
            ['Número', orc.numero],
            ['Emitida em', dataLonga(orc.data_emissao)],
            ['Válida até', orc.validade ? dataLonga(orc.validade) : '—'],
            ['Situação', SITUACAO[orc.status]],
          ].map(([k, v]) => (
            <div key={k} className="border-b border-ds-line py-3 pr-4 sm:border-b-0">
              <dt className="ds-annot uppercase">{k}</dt>
              <dd className="mt-1 text-sm text-ds-fg">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Itens */}
      <section className="border-b border-ds-line py-10 md:py-14">
        <p className="ds-annot mb-6 uppercase">{pacotes ? 'Escolha um pacote' : 'O que está incluído'}</p>
        {pacotes ? (
          <Pacotes orc={orc} aberto={aberto} onAprovar={onAprovar} />
        ) : (
          <>
            <ol className="border-t border-ds-line">
              {orc.itens.map((item, i) => (
                <Item key={item.id} item={item} index={i} />
              ))}
            </ol>

            <div className="print-avoid ml-auto mt-8 max-w-sm space-y-2 text-sm">
              {desconto > 0 && (
                <>
                  <Linha label="Subtotal" valor={brl(subtotal)} />
                  <Linha label="Desconto" valor={`− ${brl(desconto)}`} />
                </>
              )}
              <div className="flex items-baseline justify-between gap-4 border-t border-ds-fg pt-3">
                <span className="ds-annot uppercase">Total</span>
                <span className="text-3xl font-medium tracking-tight tabular-nums">{brl(total)}</span>
              </div>
              {mensal > 0 && <Linha label="Recorrente" valor={`+ ${brl(mensal)}/mês`} />}
            </div>
          </>
        )}
      </section>

      {/* Condições */}
      {(orc.prazo_entrega || orc.condicoes_pagamento || orc.observacoes) && (
        <section className="print-avoid border-b border-ds-line py-10 md:py-14">
          <p className="ds-annot mb-6 uppercase">Condições</p>
          <dl className="divide-y divide-ds-line border-y border-ds-line">
            {[
              ['Prazo', orc.prazo_entrega],
              ['Pagamento', orc.condicoes_pagamento],
              ['Observações', orc.observacoes],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="ds-annot uppercase">{k}</dt>
                  <dd className="whitespace-pre-line text-sm leading-relaxed text-ds-fg">{v}</dd>
                </div>
              ))}
          </dl>
        </section>
      )}

      {/* Decisão */}
      <section className="no-print py-10 md:py-14">
        {orc.status === 'aprovado' ? (
          <Frame className={cn('bg-ds-surface p-6 sm:p-8 [--ds-corner:var(--ds-accent)]')}>
            <p className="ds-annot flex items-center gap-2 uppercase text-ds-accent!">
              <Check className="size-4" strokeWidth={2} aria-hidden /> Aprovada
              {orc.pacote_escolhido ? ` · pacote ${orc.pacote_escolhido}` : ''}
            </p>
            <h2 className="mt-4 text-2xl font-medium tracking-tight">{acabouDeAprovar ? 'Obrigado pela confiança!' : 'Proposta aprovada'}</h2>
            <p className="mt-2 max-w-[56ch] text-sm text-ds-muted">A gente entra em contato para combinar o início. Se quiser adiantar, chama no WhatsApp.</p>
            <ol className="mt-6 grid grid-cols-4 gap-2">
              {ETAPAS.map((e, i) => (
                <li key={e} className={cn('border-t pt-2', i <= etapa ? 'border-ds-accent' : 'border-ds-line')}>
                  <span className={cn('ds-annot block tabular-nums', i <= etapa && 'text-ds-fg')}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={cn('text-xs', i <= etapa ? 'text-ds-fg' : 'text-ds-subtle')}>{e}</span>
                </li>
              ))}
            </ol>
            <a
              href={whats(`Olá! Acabei de aprovar a proposta ${orc.numero}${orc.pacote_escolhido ? ` (pacote ${orc.pacote_escolhido})` : ''}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass({ className: 'mt-8' })}
            >
              <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> Falar com a DAMA
            </a>
          </Frame>
        ) : aberto ? (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-medium tracking-tight">Tudo certo por aí?</h2>
              <p className="mt-2 max-w-[48ch] text-sm text-ds-muted">
                {pacotes ? 'Escolha um dos pacotes acima para aprovar.' : 'Aprovando, a gente já reserva a agenda e combina o início com você.'} Ficou alguma
                dúvida? Fala com a gente.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={whats(`Olá! Tenho uma dúvida sobre a proposta ${orc.numero}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass({ variant: 'secondary', size: 'lg' })}
              >
                <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> Tirar dúvida
              </a>
              {!pacotes && (
                <Button size="lg" onClick={() => onAprovar(null)}>
                  <Check className="size-4" strokeWidth={1.5} aria-hidden /> Aprovar proposta
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Alert tone="warning" title={orc.status === 'expirado' ? 'Esta proposta venceu' : 'Esta proposta foi recusada'}>
            Se ainda tiver interesse, fala com a gente que preparamos uma versão atualizada.
          </Alert>
        )}
      </section>

      <footer className="border-t border-ds-line py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="ds-annot">DAMA Digital · Santos · SP</p>
          <p className="ds-annot">(13) 99743-4878 · damadigitalcriativa.com.br</p>
        </div>
      </footer>
    </main>
  );
}

const SITUACAO: Record<OrcamentoPublico['status'], string> = {
  rascunho: 'Em preparo',
  enviado: 'Aguardando sua resposta',
  visualizado: 'Aguardando sua resposta',
  aprovado: 'Aprovada',
  recusado: 'Recusada',
  expirado: 'Vencida',
};

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-ds-muted">
      <span>{label}</span>
      <span className="font-ds-mono tabular-nums">{valor}</span>
    </div>
  );
}

function Item({ item, index }: { item: OrcamentoItem; index: number }) {
  const detalhes = detalhesDe(item);
  const v = valorItem(item);
  const m = Number(item.valor_mensal) || 0;
  return (
    <li className="print-avoid grid gap-x-6 gap-y-2 border-b border-ds-line py-5 sm:grid-cols-[2.5rem_1fr_auto]">
      <span className="ds-annot tabular-nums">_{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0">
        <p className="text-base font-medium text-ds-fg">
          {item.nome}
          {Number(item.quantidade) > 1 && <span className="ds-annot ml-2">× {item.quantidade}</span>}
        </p>
        {item.categoria && <p className="ds-annot mt-0.5">{item.categoria}</p>}
        {item.descricao && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ds-muted">{item.descricao}</p>}
        {detalhes.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {detalhes.map((d, i) => (
              <li key={i} className="flex items-baseline gap-2 text-sm text-ds-muted">
                <span className="size-1 shrink-0 translate-y-[-2px] bg-ds-accent" aria-hidden />
                <span className="flex-1">{d.texto}</span>
                {d.valor ? <span className="font-ds-mono text-xs tabular-nums">{brl(Number(d.valor))}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="text-left sm:text-right">
        {(v > 0 || !m) && <p className="font-ds-mono text-base tabular-nums text-ds-fg">{brl(v)}</p>}
        {m > 0 && (
          <p className="font-ds-mono text-sm tabular-nums text-ds-muted">
            {v > 0 && '+ '}
            {brl(m)}/mês
          </p>
        )}
        {m > 0 && item.descricao_mensal && <p className="ds-annot mt-0.5">{item.descricao_mensal}</p>}
      </div>
    </li>
  );
}

function Pacotes({ orc, aberto, onAprovar }: { orc: OrcamentoPublico; aberto: boolean; onAprovar: (pacote: string) => void }) {
  const grupos = new Map<string, { nome: string; destaque: boolean; itens: OrcamentoItem[] }>();
  for (const item of orc.itens) {
    const nome = item.pacote || 'Padrão';
    const g = grupos.get(nome) ?? { nome, destaque: false, itens: [] };
    g.destaque ||= Boolean(item.pacote_destaque);
    g.itens.push(item);
    grupos.set(nome, g);
  }

  return (
    <div className="grid gap-2 md:grid-cols-3">
      {[...grupos.values()].map((p) => {
        const total = p.itens.reduce((s, i) => s + valorItem(i), 0);
        const mensal = p.itens.reduce((s, i) => s + (Number(i.valor_mensal) || 0), 0);
        const escolhido = orc.status === 'aprovado' && orc.pacote_escolhido === p.nome;
        return (
          <Frame key={p.nome} className={cn('print-avoid flex flex-col p-5', p.destaque || escolhido ? 'bg-ds-surface [--ds-corner:var(--ds-accent)]' : '')}>
            <p className="ds-annot h-4 uppercase text-ds-accent!">{escolhido ? 'escolhido' : p.destaque ? 'recomendado' : ''}</p>
            <p className="mt-2 text-lg font-medium tracking-tight">{p.nome}</p>
            <p className="mt-4 text-2xl font-medium tracking-tight tabular-nums">{brl(total)}</p>
            {mensal > 0 && <p className="ds-annot">+ {brl(mensal)}/mês</p>}
            <ul className="mt-5 flex-1 space-y-2 border-t border-ds-line pt-4">
              {p.itens.map((i) => (
                <li key={i.id} className="flex items-start gap-2 text-sm text-ds-muted">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-ds-accent" strokeWidth={2} aria-hidden />
                  <span>
                    {i.nome}
                    {i.descricao && <span className="block text-xs text-ds-subtle">{i.descricao}</span>}
                  </span>
                </li>
              ))}
            </ul>
            {aberto && (
              <Button variant={p.destaque ? 'primary' : 'secondary'} className="no-print mt-6 w-full" onClick={() => onAprovar(p.nome)}>
                Escolher este pacote
              </Button>
            )}
          </Frame>
        );
      })}
    </div>
  );
}
