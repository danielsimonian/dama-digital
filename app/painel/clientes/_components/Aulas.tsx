'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { supabase, type EventoAgenda, type HorarioAula, type Lancamento, type Matricula, type PacoteAulas, type Responsavel } from '@/lib/supabase';
import { cn, Button } from '@/components/ds/primitives';
import { Modal, useToast } from '@/components/ds/interactive';
import { SelectField, TextArea, TextField, Radio } from '@/components/ds/fields';
import { brl, PresencaMark } from '@/components/ds/admin/display';
import { DIA_LABEL, DIA_NOME, addDias, horaTexto, isoData, presencaVisual } from '../../agenda/_lib';
import { hojeISO } from '../../_lib';

type Dados = {
  clienteId: string;
  matriculas: Matricula[];
  pacotes: (PacoteAulas & { lancamento: Pick<Lancamento, 'status'> | null })[];
  eventos: Pick<EventoAgenda, 'id' | 'matricula_id' | 'pacote_id' | 'inicio' | 'presenca' | 'reposicao_de' | 'cancelado'>[];
};

type Form = {
  id?: string;
  instrumento: string;
  responsavel: Responsavel | '';
  modalidade: Matricula['modalidade'];
  aulas_por_pacote: string;
  valor_pacote: string;
  valor_aula: string;
  duracao_min: string;
  horarios: HorarioAula[];
  inicio: string;
  status: Matricula['status'];
  observacoes: string;
};

const NOVO = (instrumento: string): Form => ({
  instrumento,
  responsavel: '',
  modalidade: 'pacote',
  aulas_por_pacote: '4',
  valor_pacote: '400',
  valor_aula: '130',
  duracao_min: '50',
  horarios: [{ dia: 0, hora: '19:00' }],
  inicio: hojeISO(),
  status: 'ativa',
  observacoes: '',
});

const RESP: Record<Responsavel, string> = { daniel: 'Daniel', marcella: 'Marcella' };

function horariosTexto(h: HorarioAula[]) {
  return h.map((x) => `${DIA_LABEL[x.dia]} ${x.hora}`).join(', ');
}

const num = (s: string) => Number(s.replace(',', '.'));

export function AulasDaPessoa({ clienteId, instrumento, onMudou }: { clienteId: string; instrumento?: string | null; onMudou?: () => void }) {
  const toast = useToast();
  const [dados, setDados] = useState<Dados | null>(null);
  const [versao, setVersao] = useState(0);
  const [form, setForm] = useState<Form | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    // garante as próximas semanas geradas antes de mostrar "próximas aulas"
    const hoje = new Date();
    supabase.rpc('gerar_aulas', { p_de: isoData(hoje), p_ate: isoData(addDias(hoje, 28)) }).then(() =>
      supabase
        .from('matriculas')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at')
        .then(async ({ data: ms }) => {
          const matriculas = (ms as Matricula[] | null) ?? [];
          const ids = matriculas.map((m) => m.id);
          if (!ids.length) {
            setDados({ clienteId, matriculas, pacotes: [], eventos: [] });
            return;
          }
          const [p, e] = await Promise.all([
            supabase.from('pacotes_aulas').select('*, lancamento:lancamentos(status)').in('matricula_id', ids).order('numero'),
            supabase
              .from('eventos_agenda')
              .select('id, matricula_id, pacote_id, inicio, presenca, reposicao_de, cancelado')
              .in('matricula_id', ids)
              .eq('cancelado', false)
              .order('inicio'),
          ]);
          setDados({ clienteId, matriculas, pacotes: (p.data as Dados['pacotes'] | null) ?? [], eventos: (e.data as Dados['eventos'] | null) ?? [] });
        }),
    );
  }, [clienteId, versao]);

  const atual = dados?.clienteId === clienteId ? dados : null;

  const salvar = async () => {
    if (!form) return;
    const horarios = form.horarios.filter((h) => /^\d{2}:\d{2}$/.test(h.hora));
    if (!horarios.length) {
      toast({ tone: 'danger', title: 'Informe ao menos um horário' });
      return;
    }
    setSalvando(true);
    const campos = {
      cliente_id: clienteId,
      instrumento: form.instrumento.trim() || null,
      responsavel: form.responsavel || null,
      modalidade: form.modalidade,
      aulas_por_pacote: Math.max(1, Math.round(num(form.aulas_por_pacote) || 4)),
      valor_pacote: num(form.valor_pacote) || 0,
      valor_aula: num(form.valor_aula) || 0,
      duracao_min: Math.round(num(form.duracao_min) || 50),
      horarios,
      inicio: form.inicio || hojeISO(),
      status: form.status,
      fim: form.status === 'encerrada' ? hojeISO() : null,
      observacoes: form.observacoes.trim() || null,
    };
    try {
      if (form.id) {
        const { error } = await supabase.from('matriculas').update(campos).eq('id', form.id);
        if (error) throw error;
        // aulas futuras ainda não marcadas nem remarcadas são refeitas com os dados novos
        const { data: futuras } = await supabase
          .from('eventos_agenda')
          .select('id, inicio, slot_original')
          .eq('matricula_id', form.id)
          .eq('presenca', 'agendada')
          .eq('cancelado', false)
          .is('reposicao_de', null)
          .gt('inicio', new Date().toISOString());
        const apagar = (futuras ?? []).filter((f) => f.slot_original && new Date(f.slot_original).getTime() === new Date(f.inicio).getTime()).map((f) => f.id);
        if (apagar.length) await supabase.from('eventos_agenda').delete().in('id', apagar);
      } else {
        const { error } = await supabase.from('matriculas').insert(campos);
        if (error) throw error;
      }
      toast({
        tone: 'success',
        title: form.id ? 'Matrícula atualizada' : 'Matrícula criada',
        description: !form.id && form.modalidade === 'pacote' ? `Pacote 1 lançado: ${brl(campos.valor_pacote)}` : undefined,
      });
      setForm(null);
      setVersao((v) => v + 1);
      onMudou?.();
    } catch (e) {
      toast({ tone: 'danger', title: 'Não foi possível salvar', description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSalvando(false);
    }
  };

  const editar = (m: Matricula) =>
    setForm({
      id: m.id,
      instrumento: m.instrumento ?? '',
      responsavel: m.responsavel ?? '',
      modalidade: m.modalidade,
      aulas_por_pacote: String(m.aulas_por_pacote),
      valor_pacote: String(m.valor_pacote),
      valor_aula: String(m.valor_aula),
      duracao_min: String(m.duracao_min),
      horarios: m.horarios.length ? m.horarios : [{ dia: 0, hora: '19:00' }],
      inicio: m.inicio,
      status: m.status,
      observacoes: m.observacoes ?? '',
    });

  const agoraISO = new Date().toISOString();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="ds-annot uppercase">Aulas</p>
        <button onClick={() => setForm(NOVO(instrumento ?? ''))} className="ds-annot hover:text-ds-fg">
          + matrícula
        </button>
      </div>

      {!atual ? (
        <p className="ds-annot">carregando…</p>
      ) : atual.matriculas.length === 0 ? (
        <p className="text-sm text-ds-subtle">Sem matrícula. Crie uma para as aulas aparecerem na agenda.</p>
      ) : (
        <ul className="space-y-4">
          {atual.matriculas.map((m) => {
            const pacotes = atual.pacotes.filter((p) => p.matricula_id === m.id);
            const evs = atual.eventos.filter((e) => e.matricula_id === m.id);
            const uso = (pid: string) => evs.filter((e) => e.pacote_id === pid).length;
            const pacote = pacotes.find((p) => uso(p.id) < p.total) ?? pacotes[pacotes.length - 1];
            const usados = pacote ? evs.filter((e) => e.pacote_id === pacote.id) : [];
            const proximas = evs.filter((e) => e.inicio > agoraISO && e.presenca === 'agendada').slice(0, 3);
            return (
              <li key={m.id} className={cn('border border-ds-line p-3', m.status !== 'ativa' && 'opacity-60')} data-divisao="studio">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-ds-fg">
                      {m.instrumento || 'Aulas'}
                      {m.status !== 'ativa' && <span className="ds-annot ml-2 uppercase">{m.status}</span>}
                    </p>
                    <p className="ds-annot">
                      {horariosTexto(m.horarios)} · {m.duracao_min} min{m.responsavel && ` · ${RESP[m.responsavel]}`}
                    </p>
                    <p className="ds-annot">
                      {m.modalidade === 'pacote' ? `pacote de ${m.aulas_por_pacote} · ${brl(Number(m.valor_pacote))}` : `avulsa · ${brl(Number(m.valor_aula))}/aula`}
                    </p>
                  </div>
                  <button onClick={() => editar(m)} aria-label="Editar matrícula" className="inline-flex size-8 shrink-0 items-center justify-center text-ds-subtle hover:text-ds-fg">
                    <Pencil className="size-3.5" strokeWidth={1.5} />
                  </button>
                </div>

                {m.modalidade === 'pacote' && pacote && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex gap-1">
                        {Array.from({ length: pacote.total }, (_, i) =>
                          usados[i] ? <PresencaMark key={i} presenca={presencaVisual(usados[i])} size="sm" /> : <PresencaMark key={i} presenca="agendada" size="sm" />,
                        )}
                      </span>
                      <span className="ds-annot tabular-nums">
                        pacote {pacote.numero} · {usados.length}/{pacote.total}
                        {pacote.lancamento && (pacote.lancamento.status === 'pago' ? ' · pago' : ' · a receber')}
                      </span>
                    </div>
                  </div>
                )}

                {proximas.length > 0 && (
                  <p className="ds-annot mt-2">
                    próximas:{' '}
                    {proximas
                      .map((e) => {
                        const d = new Date(e.inicio);
                        return `${DIA_LABEL[(d.getDay() + 6) % 7]} ${d.getDate()}/${d.getMonth() + 1} ${horaTexto(d)}`;
                      })
                      .join(' · ')}{' '}
                    <Link href="/painel/agenda" className="hover:text-ds-fg">
                      → agenda
                    </Link>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        index={form?.id ? 'editar matrícula' : 'horário fixo semanal · aulas aparecem sozinhas na agenda'}
        title={form?.id ? 'Matrícula' : 'Nova matrícula'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setForm(null)}>
              Cancelar
            </Button>
            <Button onClick={salvar} loading={salvando}>
              Salvar
            </Button>
          </>
        }
      >
        {form && (
          <div className="-m-1 max-h-[60vh] space-y-4 overflow-y-auto p-1 pr-2">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Instrumento" value={form.instrumento} onChange={(e) => setForm({ ...form, instrumento: e.target.value })} placeholder="Violão, canto…" />
              <SelectField
                label="Professor"
                value={form.responsavel}
                onChange={(e) => setForm({ ...form, responsavel: e.target.value as Responsavel | '' })}
                options={[
                  { value: '', label: '—' },
                  { value: 'daniel', label: 'Daniel' },
                  { value: 'marcella', label: 'Marcella' },
                ]}
              />
            </div>

            <fieldset>
              <legend className="mb-1 text-sm text-ds-fg">Horários</legend>
              <ul className="space-y-2">
                {form.horarios.map((h, i) => (
                  <li key={i} className="grid grid-cols-[1fr_7rem_2.5rem] items-end gap-2">
                    <SelectField
                      label={`Dia ${i + 1}`}
                      value={String(h.dia)}
                      onChange={(e) => setForm({ ...form, horarios: form.horarios.map((x, j) => (j === i ? { ...x, dia: Number(e.target.value) } : x)) })}
                      options={DIA_NOME.map((d, j) => ({ value: String(j), label: d }))}
                    />
                    <TextField
                      label="Hora"
                      type="time"
                      step={300}
                      value={h.hora}
                      onChange={(e) => setForm({ ...form, horarios: form.horarios.map((x, j) => (j === i ? { ...x, hora: e.target.value } : x)) })}
                    />
                    <button
                      onClick={() => setForm({ ...form, horarios: form.horarios.filter((_, j) => j !== i) })}
                      disabled={form.horarios.length === 1}
                      aria-label="Remover horário"
                      className="inline-flex size-11 items-center justify-center text-ds-subtle hover:text-ds-danger disabled:opacity-30"
                    >
                      <Trash2 className="size-4" strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setForm({ ...form, horarios: [...form.horarios, { dia: 3, hora: form.horarios[0]?.hora ?? '19:00' }] })}
                className="ds-annot mt-2 inline-flex items-center gap-1 hover:text-ds-fg"
              >
                <Plus className="size-3" strokeWidth={1.5} aria-hidden /> outro dia na semana
              </button>
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <TextField label="Duração (min)" inputMode="numeric" value={form.duracao_min} onChange={(e) => setForm({ ...form, duracao_min: e.target.value })} />
              <TextField label="Início" type="date" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} disabled={!!form.id} />
            </div>

            <fieldset>
              <legend className="mb-1 text-sm text-ds-fg">Cobrança</legend>
              <Radio
                name="modalidade"
                label="Pacote antecipado"
                description="cobra o pacote antes; ao usar a última aula, o próximo já é lançado"
                checked={form.modalidade === 'pacote'}
                onChange={() => setForm({ ...form, modalidade: 'pacote' })}
              />
              <Radio
                name="modalidade"
                label="Aula avulsa"
                description="cada aula realizada vira um lançamento"
                checked={form.modalidade === 'avulsa'}
                onChange={() => setForm({ ...form, modalidade: 'avulsa' })}
              />
            </fieldset>
            {form.modalidade === 'pacote' ? (
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Aulas por pacote" inputMode="numeric" value={form.aulas_por_pacote} onChange={(e) => setForm({ ...form, aulas_por_pacote: e.target.value })} />
                <TextField label="Valor do pacote (R$)" inputMode="decimal" value={form.valor_pacote} onChange={(e) => setForm({ ...form, valor_pacote: e.target.value })} />
              </div>
            ) : (
              <TextField label="Valor por aula (R$)" inputMode="decimal" value={form.valor_aula} onChange={(e) => setForm({ ...form, valor_aula: e.target.value })} />
            )}

            {form.id && (
              <SelectField
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Matricula['status'] })}
                options={[
                  { value: 'ativa', label: 'Ativa' },
                  { value: 'pausada', label: 'Pausada (para de gerar aulas)' },
                  { value: 'encerrada', label: 'Encerrada' },
                ]}
              />
            )}
            <TextArea label="Observações" optional value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} className="min-h-16" />
            {!form.id && form.modalidade === 'pacote' && (
              <p className="ds-annot">ao salvar, o pacote 1 ({brl(num(form.valor_pacote) || 0)}) entra no financeiro com vencimento no início</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
