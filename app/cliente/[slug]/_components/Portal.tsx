'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ExternalLink, FileText, Link2, MessageCircle, PenTool, Type, Video } from 'lucide-react';
import type { Divisao, PortalPainel, TipoConteudo } from '@/lib/supabase';
import { socialLinks } from '@/lib/constants';
import { cn, buttonClass, DivisionBadge, Eyebrow, Frame } from '@/components/ds/primitives';
import { Accordion, Tabs } from '@/components/ds/interactive';
import { brl, LancamentoStatusLabel, PresencaMark, QuoteTrack } from '@/components/ds/admin/display';

type Lanc = PortalPainel['lancamentos'][number];
type Evento = PortalPainel['agenda'][number];
type Matricula = PortalPainel['matriculas'][number];

const DIA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const DIA_SEG = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']; // horarios.dia: 0 = segunda
const MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dataCurta = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const hora = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const mesDe = (iso: string) => `${MES[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
const soma = (ls: Lanc[]) => ls.reduce((s, l) => s + Number(l.valor), 0);

function duracao(inicio: string, fim: string) {
  const min = Math.round((new Date(fim).getTime() - new Date(inicio).getTime()) / 60000);
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h${m ? String(m).padStart(2, '0') : ''}` : `${m} min`;
}

function situacao(l: Lanc) {
  if (l.status === 'pago') return 'pago' as const;
  return l.vencimento < hojeISO() ? ('atrasado' as const) : ('pendente' as const);
}

/** Agrupa por mês (chave "YYYY-MM"), na ordem em que os itens chegam. */
function porMes<T>(itens: T[], data: (i: T) => string) {
  const grupos = new Map<string, T[]>();
  for (const i of itens) {
    const k = data(i).slice(0, 7);
    grupos.set(k, [...(grupos.get(k) ?? []), i]);
  }
  return [...grupos.entries()];
}

function divisaoPrincipal(d: PortalPainel): Divisao | undefined {
  const p = d.cliente.papeis[0];
  if (!p) return d.lancamentos[0]?.divisao;
  return p === 'aluno' || p === 'estudio' ? 'studio' : p;
}

export function PortalConteudo({ dados }: { dados: PortalPainel }) {
  const { cliente: c, lancamentos, agenda, matriculas, modulos, orcamentos } = dados;
  const agora = new Date().toISOString();
  const proximos = agenda.filter((e) => e.inicio > agora).reverse();
  const passados = agenda.filter((e) => e.inicio <= agora);
  const verDinheiro = c.ver_financeiro || c.ver_servicos || c.ver_sessoes;
  const abertos = lancamentos.filter((l) => l.status !== 'pago');
  const atrasados = abertos.filter((l) => situacao(l) === 'atrasado');
  const pagos = lancamentos.filter((l) => l.status === 'pago');
  const primeiro = c.nome.trim().split(/\s+/)[0];

  const tabs = [
    (agenda.length > 0 || matriculas.length > 0) && {
      id: 'agenda',
      label: c.aluno ? 'Aulas' : 'Sessões',
      count: passados.length || undefined,
      content: <Agenda proximos={proximos} passados={passados} matriculas={matriculas} />,
    },
    verDinheiro && { id: 'financeiro', label: 'Financeiro', count: lancamentos.length || undefined, content: <Financeiro lancamentos={lancamentos} /> },
    c.ver_conteudo && modulos.length > 0 && { id: 'conteudo', label: 'Conteúdo', count: modulos.length, content: <Conteudo modulos={modulos} /> },
    orcamentos.length > 0 && { id: 'orcamentos', label: 'Orçamentos', count: orcamentos.length, content: <Orcamentos orcamentos={orcamentos} /> },
  ].filter((t): t is { id: string; label: string; count: number | undefined; content: React.JSX.Element } => !!t);

  const proximo = proximos[0];

  return (
    <main data-divisao={divisaoPrincipal(dados)}>
      <section className="border-b border-ds-line">
        <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
          <Eyebrow>Área do cliente{c.empresa && c.empresa !== c.nome ? ` · ${c.empresa}` : ''}</Eyebrow>
          <h1 className="mt-5 text-[clamp(2rem,1.4rem+2vw,3rem)] font-medium leading-tight tracking-tight">
            Olá, {primeiro}.
            <span className="block text-ds-subtle">Tudo o que a gente faz junto, num lugar só.</span>
          </h1>

          <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4">
            {verDinheiro && (
              <>
                <Numero label="A pagar" valor={brl(soma(abertos))} nota={abertos.length ? `${abertos.length} em aberto` : 'tudo em dia'} />
                <Numero
                  label="Em atraso"
                  valor={brl(soma(atrasados))}
                  nota={atrasados.length ? `${atrasados.length} vencido${atrasados.length === 1 ? '' : 's'}` : 'nada vencido'}
                  alerta={atrasados.length > 0}
                />
                <Numero label="Já pago" valor={brl(soma(pagos))} nota={`${pagos.length} pagamento${pagos.length === 1 ? '' : 's'}`} />
              </>
            )}
            <Numero
              label={c.aluno ? 'Próxima aula' : 'Próxima sessão'}
              valor={proximo ? `${DIA[new Date(proximo.inicio).getDay()]} ${dataCurta(proximo.inicio.slice(0, 10))}` : '—'}
              nota={proximo ? `${hora(new Date(proximo.inicio))} · ${duracao(proximo.inicio, proximo.fim)}` : 'nada marcado'}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        {tabs.length ? (
          <Tabs tabs={tabs} />
        ) : (
          <p className="border-y border-ds-line py-10 text-center text-sm text-ds-subtle">Ainda não tem nada por aqui. Assim que começarmos, tudo aparece nesta página.</p>
        )}
      </section>

      <footer className="border-t border-ds-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8 md:px-6">
          <div>
            <p className="text-sm text-ds-fg">Alguma dúvida sobre valores ou horários?</p>
            <p className="ds-annot mt-1">a gente responde pelo WhatsApp</p>
          </div>
          <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: 'secondary' })}>
            <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> Falar com a DAMA
          </a>
        </div>
      </footer>
    </main>
  );
}

function Numero({ label, valor, nota, alerta }: { label: string; valor: string; nota: string; alerta?: boolean }) {
  return (
    <div className="ds-corners relative flex min-w-0 flex-col gap-3 bg-ds-surface p-4">
      <p className="ds-annot flex items-center justify-between gap-2 uppercase">
        {label}
        {alerta && <span className="size-2 rounded-full bg-ds-danger" aria-label="atenção" />}
      </p>
      <p className="truncate text-2xl font-medium tracking-tight tabular-nums text-ds-fg">{valor}</p>
      <p className={cn('text-xs', alerta ? 'text-ds-danger' : 'text-ds-subtle')}>{nota}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Aulas / sessões                                                     */
/* ------------------------------------------------------------------ */

function Agenda({ proximos, passados, matriculas }: { proximos: Evento[]; passados: Evento[]; matriculas: Matricula[] }) {
  return (
    <div className="space-y-10">
      {matriculas.map((m) => (
        <Pacote key={m.id} m={m} />
      ))}

      {proximos.length > 0 && (
        <div>
          <p className="ds-annot mb-3 uppercase">Próximos horários</p>
          <ul className="divide-y divide-ds-line border-y border-ds-line">
            {proximos.slice(0, 6).map((e) => (
              <LinhaEvento key={e.id} e={e} />
            ))}
          </ul>
        </div>
      )}

      {porMes(passados, (e) => e.inicio).map(([mes, evs]) => {
        const comValor = evs.filter((e) => e.valor !== null);
        return (
          <div key={mes}>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <p className="ds-annot uppercase">{mesDe(mes)}</p>
              <p className="ds-annot tabular-nums">
                {evs.length} {evs.length === 1 ? 'horário' : 'horários'}
                {comValor.length > 0 && ` · ${brl(comValor.reduce((s, e) => s + Number(e.valor), 0))}`}
              </p>
            </div>
            <ul className="divide-y divide-ds-line border-y border-ds-line">
              {evs.map((e) => (
                <LinhaEvento key={e.id} e={e} />
              ))}
            </ul>
          </div>
        );
      })}

      {!proximos.length && !passados.length && !matriculas.length && <p className="text-sm text-ds-subtle">Nenhum horário ainda.</p>}
    </div>
  );
}

function LinhaEvento({ e }: { e: Evento }) {
  const d = new Date(e.inicio);
  const futuro = e.inicio > new Date().toISOString();
  const presenca = e.presenca === 'agendada' && e.reposicao ? 'reposicao' : e.presenca;
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
      <span className="w-20 font-ds-mono text-xs tabular-nums text-ds-muted">
        {DIA[d.getDay()]} {dataCurta(e.inicio.slice(0, 10))}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-ds-fg">{e.titulo}</span>
        <span className="ds-annot">
          {hora(d)}–{hora(new Date(e.fim))} · {duracao(e.inicio, e.fim)}
        </span>
      </span>
      {e.tipo === 'aula' && !futuro && <PresencaMark presenca={presenca} size="sm" />}
      {e.valor !== null && (
        <span className="flex items-center gap-3">
          <span className="font-ds-mono text-sm tabular-nums text-ds-fg">{brl(Number(e.valor), true)}</span>
          {!futuro && <LancamentoStatusLabel status={e.pago ? 'pago' : 'pendente'} />}
        </span>
      )}
    </li>
  );
}

function Pacote({ m }: { m: Matricula }) {
  const pacote = m.pacotes.find((p) => p.usos.length < p.total) ?? m.pacotes[m.pacotes.length - 1];
  const horarios = m.horarios.map((h) => `${DIA_SEG[h.dia]} ${h.hora}`).join(' · ');
  return (
    <Frame className="bg-ds-surface p-5 [--ds-corner:var(--ds-accent)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ds-annot uppercase">Suas aulas</p>
          <p className="mt-2 text-lg font-medium tracking-tight">{m.instrumento || 'Aulas de música'}</p>
          <p className="ds-annot mt-1">
            {horarios} · {m.duracao_min} min
          </p>
        </div>
        {m.modalidade === 'pacote' && pacote && (
          <div className="text-right">
            <p className="text-2xl font-medium tabular-nums">
              {pacote.total - pacote.usos.length}
              <span className="text-ds-subtle">/{pacote.total}</span>
            </p>
            <p className="ds-annot">aulas restantes no pacote {pacote.numero}</p>
          </div>
        )}
      </div>
      {m.modalidade === 'pacote' && pacote && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ds-line pt-4">
          <span className="flex gap-1.5">
            {Array.from({ length: pacote.total }, (_, i) => {
              const u = pacote.usos[i];
              return <PresencaMark key={i} presenca={u ? (u.presenca === 'agendada' && u.reposicao ? 'reposicao' : u.presenca) : 'agendada'} />;
            })}
          </span>
          <LancamentoStatusLabel status={pacote.pago ? 'pago' : 'pendente'} />
        </div>
      )}
      <p className="mt-4 text-xs text-ds-subtle">Falta sem aviso conta como aula dada. Avisando antes, a gente marca uma reposição.</p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Financeiro                                                          */
/* ------------------------------------------------------------------ */

type Filtro = 'todos' | 'abertos' | 'pagos';

function Financeiro({ lancamentos }: { lancamentos: Lanc[] }) {
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const lista = lancamentos.filter((l) => filtro === 'todos' || (filtro === 'pagos' ? l.status === 'pago' : l.status !== 'pago'));

  if (!lancamentos.length) return <p className="text-sm text-ds-subtle">Nenhuma cobrança por enquanto.</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar cobranças">
        {(
          [
            ['todos', 'Todas'],
            ['abertos', 'A pagar'],
            ['pagos', 'Pagas'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFiltro(id)}
            aria-pressed={filtro === id}
            className={cn(
              'ds-press inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors',
              filtro === id ? 'border-ds-fg bg-ds-fg text-ds-bg' : 'border-ds-line text-ds-muted hover:border-ds-line-strong hover:text-ds-fg',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {lista.length === 0 && <p className="text-sm text-ds-subtle">Nada aqui.</p>}

      {porMes(lista, (l) => l.vencimento).map(([mes, ls]) => (
        <div key={mes}>
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <p className="ds-annot uppercase">{mesDe(mes)}</p>
            <p className="ds-annot tabular-nums">{brl(soma(ls), true)}</p>
          </div>
          <ul className="divide-y divide-ds-line border-y border-ds-line">
            {ls.map((l) => {
              const s = situacao(l);
              return (
                <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3" data-divisao={l.divisao}>
                  <span className="w-12 font-ds-mono text-xs tabular-nums text-ds-muted">{dataCurta(l.vencimento)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ds-fg">{l.descricao}</span>
                    <span className="ds-annot">
                      {s === 'pago'
                        ? `pago${l.pago_em ? ` em ${dataCurta(l.pago_em)}` : ''}${l.forma ? ` · ${l.forma}` : ''}`
                        : s === 'atrasado'
                          ? `venceu em ${dataCurta(l.vencimento)}`
                          : `vence em ${dataCurta(l.vencimento)}`}
                    </span>
                  </span>
                  <span className="font-ds-mono text-sm tabular-nums text-ds-fg">{brl(Number(l.valor), true)}</span>
                  <span className="w-24 text-right">
                    <LancamentoStatusLabel status={s} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Conteúdo                                                            */
/* ------------------------------------------------------------------ */

const TIPO: Record<TipoConteudo, { label: string; acao: string; icon: typeof Video }> = {
  video: { label: 'Vídeo', acao: 'Assistir', icon: Video },
  pdf: { label: 'PDF', acao: 'Abrir PDF', icon: FileText },
  exercicio: { label: 'Exercício', acao: 'Abrir', icon: PenTool },
  link: { label: 'Link', acao: 'Abrir link', icon: Link2 },
  texto: { label: 'Texto', acao: 'Abrir', icon: Type },
};

function Conteudo({ modulos }: { modulos: PortalPainel['modulos'] }) {
  return (
    <Accordion
      items={modulos.map((m) => ({
        q: m.titulo,
        a: (
          <div className="space-y-5">
            {m.descricao && <p>{m.descricao}</p>}
            {m.conteudos.length === 0 && <p className="text-ds-subtle">Os materiais deste módulo chegam em breve.</p>}
            {m.conteudos.map((ct) => {
              const t = TIPO[ct.tipo] ?? TIPO.link;
              const Icone = t.icon;
              return (
                <div key={ct.id} className="flex gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center border border-ds-line text-ds-accent">
                    <Icone className="size-4" strokeWidth={1.5} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-ds-fg">{ct.titulo}</p>
                    <p className="ds-annot">{t.label}</p>
                    {ct.descricao && <p className="mt-1">{ct.descricao}</p>}
                    {ct.conteudo && <p className="mt-2 whitespace-pre-wrap border-l-2 border-ds-accent bg-ds-surface px-4 py-3 text-ds-fg">{ct.conteudo}</p>}
                    {ct.url && (
                      <a href={ct.url} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: 'secondary', size: 'sm', className: 'mt-3' })}>
                        {t.acao} <ExternalLink className="size-3.5" strokeWidth={1.5} aria-hidden />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ),
      }))}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Orçamentos                                                          */
/* ------------------------------------------------------------------ */

function Orcamentos({ orcamentos }: { orcamentos: PortalPainel['orcamentos'] }) {
  return (
    <ul className="divide-y divide-ds-line border-y border-ds-line">
      {orcamentos.map((o) => (
        <li key={o.numero} data-divisao={o.divisao}>
          <Link href={`/orcamento/${o.slug}`} className="group flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm text-ds-fg group-hover:underline">{o.titulo}</span>
                <ArrowUpRight className="size-4 shrink-0 text-ds-subtle transition-colors group-hover:text-ds-accent" strokeWidth={1.5} aria-hidden />
              </span>
              <span className="ds-annot">
                #{o.numero} · {dataCurta(o.data)}
                {o.validade && o.status !== 'aprovado' && ` · válido até ${dataCurta(o.validade)}`}
              </span>
            </span>
            <DivisionBadge divisao={o.divisao} />
            <span className="font-ds-mono text-sm tabular-nums text-ds-fg">{brl(Number(o.total))}</span>
            <QuoteTrack status={o.status} compact />
          </Link>
        </li>
      ))}
    </ul>
  );
}
