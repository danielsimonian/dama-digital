'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronRight as Seta, Plus, CalendarX, RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { supabase, type Cliente, type EventoAgenda, type PacoteAulas, type PresencaAgenda } from '@/lib/supabase';
import { Alert, Avatar, Button } from '@/components/ds/primitives';
import { useToast } from '@/components/ds/interactive';
import { TextField } from '@/components/ds/fields';
import { PRESENCA_LABEL } from '@/components/ds/admin/display';
import { WeekCalendar, AttendanceControl } from '@/components/ds/admin/agenda';
import type { Presenca } from '@/components/ds/admin/types';
import { ScreenHeader } from '../_components/ui';
import { AgendarModal, type AgendarInicial } from './_components/AgendarModal';
import { DIA_LABEL, addDias, conflitos, diaSemana, horaDecimal, horaTexto, inicioSemana, isoData, localParaISO, paraBloco, presencaVisual } from './_lib';

const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function tituloSemana(ini: Date) {
  const fim = addDias(ini, 6);
  return ini.getMonth() === fim.getMonth()
    ? `${ini.getDate()} – ${fim.getDate()} ${MES[fim.getMonth()]}`
    : `${ini.getDate()} ${MES[ini.getMonth()]} – ${fim.getDate()} ${MES[fim.getMonth()]}`;
}

type PacoteInfo = { eventoId: string; pacote: PacoteAulas | null; usadas: number };

export default function AgendaPage() {
  const toast = useToast();
  const [semana, setSemana] = useState(() => inicioSemana(new Date()));
  const [eventos, setEventos] = useState<EventoAgenda[] | null>(null);
  const [clientes, setClientes] = useState<Pick<Cliente, 'id' | 'nome'>[]>([]);
  const [erro, setErro] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [agendar, setAgendar] = useState<AgendarInicial | null>(null);
  const [versao, setVersao] = useState(0);
  const [pacote, setPacote] = useState<PacoteInfo | null>(null);
  const [remarcar, setRemarcar] = useState<{ id: string; data: string; hora: string } | null>(null);

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome')
      .order('nome')
      .then(({ data }) => setClientes(data ?? []));
  }, []);

  // materializa as aulas recorrentes da semana e carrega
  useEffect(() => {
    const de = isoData(semana);
    const ate = isoData(addDias(semana, 6));
    supabase.rpc('gerar_aulas', { p_de: de, p_ate: ate }).then(({ error: genError }) => {
      if (genError) {
        setErro(genError.message);
        return;
      }
      supabase
        .from('eventos_agenda')
        .select('*')
        .gte('inicio', semana.toISOString())
        .lt('inicio', addDias(semana, 7).toISOString())
        .order('inicio')
        .then(({ data, error }) => {
          if (error) setErro(error.message);
          else setEventos((data as EventoAgenda[]) ?? []);
        });
    });
  }, [semana, versao]);

  const atual = eventos?.find((e) => e.id === sel && !e.cancelado) ?? null;

  // pacote da matrícula do evento selecionado
  useEffect(() => {
    if (!atual?.matricula_id) return;
    const eventoId = atual.id;
    Promise.all([
      supabase.from('pacotes_aulas').select('*').eq('matricula_id', atual.matricula_id).order('numero', { ascending: false }),
      supabase.from('eventos_agenda').select('pacote_id').eq('matricula_id', atual.matricula_id).not('pacote_id', 'is', null).eq('cancelado', false),
    ]).then(([p, e]) => {
      const pacotes = (p.data as PacoteAulas[] | null) ?? [];
      const uso = new Map<string, number>();
      for (const x of e.data ?? []) uso.set(x.pacote_id as string, (uso.get(x.pacote_id as string) ?? 0) + 1);
      // pacote em uso: o mais antigo com crédito, senão o último
      const emUso = [...pacotes].reverse().find((pk) => (uso.get(pk.id) ?? 0) < pk.total) ?? pacotes[0] ?? null;
      setPacote({ eventoId, pacote: emUso, usadas: emUso ? (uso.get(emUso.id) ?? 0) : 0 });
    });
  }, [atual?.id, atual?.matricula_id, atual?.presenca]);

  const nomes: Record<string, string> = Object.fromEntries(clientes.map((c) => [c.id, c.nome]));
  for (const e of eventos ?? []) if (!e.cliente_id) nomes[`evento:${e.id}`] = e.titulo;

  const blocos = (eventos ?? []).filter((e) => !e.cancelado).flatMap((e) => paraBloco(e, semana) ?? []);
  const agora = new Date();
  const ehEstaSemana = inicioSemana(agora).getTime() === semana.getTime();
  const datas = Array.from({ length: 7 }, (_, i) => addDias(semana, i).getDate());

  const atualizar = async (id: string, patch: Partial<EventoAgenda>, msg: string) => {
    const { error } = await supabase.from('eventos_agenda').update(patch).eq('id', id);
    if (error) {
      toast({ tone: 'danger', title: 'Não foi possível salvar', description: error.message });
      return false;
    }
    toast({ tone: 'success', title: msg });
    setVersao((v) => v + 1);
    return true;
  };

  const marcar = (e: EventoAgenda, p: Presenca) => {
    const presenca: PresencaAgenda = p === 'reposicao' ? 'agendada' : p;
    const quem = e.cliente_id ? nomes[e.cliente_id] : e.titulo;
    atualizar(e.id, { presenca }, presenca === 'agendada' ? `Presença desfeita · ${quem}` : `${PRESENCA_LABEL[presenca]} · ${quem}`);
  };

  const salvarRemarcacao = async (e: EventoAgenda) => {
    if (!remarcar) return;
    const dur = new Date(e.fim).getTime() - new Date(e.inicio).getTime();
    const inicio = localParaISO(remarcar.data, remarcar.hora);
    const fim = new Date(new Date(inicio).getTime() + dur).toISOString();
    if (await atualizar(e.id, { inicio, fim }, 'Remarcado')) {
      setRemarcar(null);
      const nova = inicioSemana(new Date(inicio));
      if (nova.getTime() !== semana.getTime()) setSemana(nova);
    }
  };

  const excluir = async (e: EventoAgenda) => {
    const { error } = await supabase.from('eventos_agenda').delete().eq('id', e.id);
    if (error) {
      toast({ tone: 'danger', title: 'Não foi possível excluir', description: error.message });
      return;
    }
    toast({ tone: 'info', title: 'Excluído da agenda' });
    setSel(null);
    setVersao((v) => v + 1);
  };

  const conflitoRemarcar =
    atual && remarcar?.id === atual.id && remarcar.data && remarcar.hora
      ? conflitos(
          eventos ?? [],
          localParaISO(remarcar.data, remarcar.hora),
          new Date(new Date(localParaISO(remarcar.data, remarcar.hora)).getTime() + (new Date(atual.fim).getTime() - new Date(atual.inicio).getTime())).toISOString(),
          atual.id,
        )
      : [];

  const ini = atual ? new Date(atual.inicio) : null;
  const pacoteAtual = pacote && atual && pacote.eventoId === atual.id ? pacote : null;

  return (
    <>
      <ScreenHeader
        sub="aulas e sessões · DAMA Studio"
        title={tituloSemana(semana)}
        actions={
          <>
            <Button size="icon" variant="ghost" aria-label="Semana anterior" className="size-9" onClick={() => setSemana((s) => addDias(s, -7))}>
              <ChevronLeft className="size-4" strokeWidth={1.5} />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setSemana(inicioSemana(new Date()))} disabled={ehEstaSemana}>
              Hoje
            </Button>
            <Button size="icon" variant="ghost" aria-label="Próxima semana" className="size-9" onClick={() => setSemana((s) => addDias(s, 7))}>
              <ChevronRight className="size-4" strokeWidth={1.5} />
            </Button>
            <Button size="sm" onClick={() => setAgendar({ data: isoData(ehEstaSemana ? agora : semana), hora: '' })}>
              <Plus className="size-4" strokeWidth={1.5} aria-hidden /> Agendar
            </Button>
          </>
        }
      />
      <div className="grid 2xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 p-4 md:p-6">
          {erro && (
            <div className="mb-4">
              <Alert tone="danger" title="Erro ao carregar a agenda">
                {erro}
              </Alert>
            </div>
          )}
          <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2" data-divisao="studio">
            <span className="inline-flex items-center gap-2 text-xs text-ds-muted">
              <span className="h-3 w-3 border-l-2 border-ds-accent bg-ds-surface-2" /> Aula
            </span>
            <span className="inline-flex items-center gap-2 text-xs text-ds-muted">
              <span className="h-3 w-3 bg-ds-accent-soft ring-1 ring-inset ring-ds-accent/40" /> Sessão de estúdio
            </span>
            {ehEstaSemana && (
              <span className="inline-flex items-center gap-2 text-xs text-ds-muted">
                <span className="h-px w-4 bg-ds-danger" /> Agora
              </span>
            )}
          </div>
          {eventos === null && !erro ? (
            <p className="ds-annot py-10 text-center">carregando…</p>
          ) : blocos.length === 0 ? (
            <p className="border-y border-ds-line py-10 text-center text-sm text-ds-subtle">
              Semana livre. As aulas aparecem aqui sozinhas a partir das matrículas (página do cliente).
            </p>
          ) : (
            <WeekCalendar
              eventos={blocos}
              nomes={nomes}
              datas={datas}
              hoje={ehEstaSemana ? diaSemana(agora) : -1}
              agora={ehEstaSemana ? horaDecimal(agora) : undefined}
              start={8}
              selectedId={sel}
              onSelect={(e) => {
                setSel(e.id);
                setRemarcar(null);
              }}
            />
          )}
        </div>

        <aside className="border-t border-ds-line p-5 2xl:border-l 2xl:border-t-0">
          {atual && ini ? (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-1" data-divisao="studio">
              <div>
                <p className="ds-annot uppercase">
                  {atual.tipo === 'aula' ? (atual.reposicao_de ? 'Reposição' : 'Aula') : atual.tipo === 'sessao' ? 'Sessão de estúdio' : 'Agenda'} · {DIA_LABEL[diaSemana(ini)]}{' '}
                  {ini.getDate()}
                </p>
                <p className="mt-1 text-xl font-medium tracking-tight">{atual.titulo}</p>
                <p className="mt-1 font-ds-mono text-sm tabular-nums text-ds-muted">
                  {horaTexto(ini)} – {horaTexto(new Date(atual.fim))}
                  {atual.slot_original && atual.slot_original !== atual.inicio && ' · remarcada'}
                </p>
              </div>

              {atual.cliente_id && (
                <Link href={`/painel/clientes/${atual.cliente_id}`} className="flex w-full items-center gap-3 border border-ds-line p-3 text-left hover:bg-ds-surface">
                  <Avatar name={nomes[atual.cliente_id] ?? '?'} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm">{nomes[atual.cliente_id]}</span>
                  <Seta className="size-4 text-ds-subtle" strokeWidth={1.5} aria-hidden />
                </Link>
              )}

              <div>
                <p className="ds-annot mb-2 uppercase">Presença</p>
                <AttendanceControl value={presencaVisual(atual)} onChange={(p) => marcar(atual, p)} opcoes={['realizada', 'falta', 'justificada']} />
                <p className="ds-annot mt-2">
                  {atual.matricula_id
                    ? 'realizada e falta usam 1 aula do pacote · justificada não'
                    : atual.valor_aula
                      ? `R$ ${atual.valor_aula} vira lançamento ao marcar realizada ou falta`
                      : atual.tipo === 'sessao'
                        ? 'cobrada pelo orçamento'
                        : 'sem cobrança'}
                </p>
                {atual.presenca === 'justificada' && atual.tipo === 'aula' && atual.cliente_id && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={() =>
                      setAgendar({
                        reposicaoDe: {
                          id: atual.id,
                          titulo: atual.titulo,
                          cliente_id: atual.cliente_id,
                          matricula_id: atual.matricula_id,
                          responsavel: atual.responsavel,
                          duracao: Math.round((new Date(atual.fim).getTime() - ini.getTime()) / 60_000),
                        },
                      })
                    }
                  >
                    <RotateCcw className="size-4" strokeWidth={1.5} aria-hidden /> Agendar reposição
                  </Button>
                )}
              </div>

              {pacoteAtual?.pacote && (
                <div>
                  <p className="ds-annot mb-2 uppercase">Pacote {pacoteAtual.pacote.numero}</p>
                  <div className="flex h-2 gap-[2px]" role="meter" aria-valuemin={0} aria-valuemax={pacoteAtual.pacote.total} aria-valuenow={pacoteAtual.usadas} aria-label="Aulas usadas do pacote">
                    {Array.from({ length: pacoteAtual.pacote.total }, (_, i) => (
                      <span key={i} className={i < pacoteAtual.usadas ? 'flex-1 bg-ds-accent' : 'flex-1 bg-ds-surface-3'} />
                    ))}
                  </div>
                  <p className="ds-annot mt-2">
                    {pacoteAtual.usadas} de {pacoteAtual.pacote.total} aulas usadas
                    {pacoteAtual.usadas >= pacoteAtual.pacote.total && ' · próximo pacote já cobrado'}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {remarcar?.id === atual.id ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <TextField label="Nova data" type="date" value={remarcar.data} onChange={(e) => setRemarcar({ ...remarcar, data: e.target.value })} />
                      <TextField label="Hora" type="time" step={300} value={remarcar.hora} onChange={(e) => setRemarcar({ ...remarcar, hora: e.target.value })} />
                    </div>
                    {conflitoRemarcar.length > 0 && (
                      <Alert tone="warning" title="Horário ocupado">
                        {conflitoRemarcar.map((c) => `${c.titulo} às ${horaTexto(new Date(c.inicio))}`).join(' · ')}
                      </Alert>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setRemarcar(null)}>
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={() => salvarRemarcacao(atual)}>
                        Salvar
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setRemarcar({ id: atual.id, data: isoData(ini), hora: horaTexto(ini) })}>
                      Remarcar
                    </Button>
                    {atual.matricula_id && atual.slot_original ? (
                      <Button size="sm" variant="ghost" onClick={() => atualizar(atual.id, { cancelado: true }, 'Aula cancelada (não será recriada)').then(() => setSel(null))}>
                        <CalendarX className="size-4" strokeWidth={1.5} aria-hidden /> Cancelar aula
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => excluir(atual)}>
                        <Trash2 className="size-4" strokeWidth={1.5} aria-hidden /> Excluir
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-ds-subtle">Selecione uma aula ou sessão.</p>
          )}
        </aside>
      </div>

      {agendar && (
        <AgendarModal
          key={JSON.stringify(agendar)}
          clientes={clientes}
          inicial={agendar}
          onClose={() => setAgendar(null)}
          onSalvo={() => {
            setAgendar(null);
            setVersao((v) => v + 1);
          }}
        />
      )}
    </>
  );
}
