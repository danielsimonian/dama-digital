'use client';

import { useEffect, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { supabase, type Cliente, type EventoAgenda, type Orcamento, type Responsavel } from '@/lib/supabase';
import { Alert, Button } from '@/components/ds/primitives';
import { Modal, useToast } from '@/components/ds/interactive';
import { SelectField, TextField } from '@/components/ds/fields';
import { Chips } from '../../_components/ui';
import { horaTexto, localParaISO } from '../_lib';

type Tipo = EventoAgenda['tipo'];

export type AgendarInicial = {
  tipo?: Tipo;
  clienteId?: string;
  data?: string;
  hora?: string;
  duracao?: number;
  responsavel?: Responsavel | '';
  /** reposição de uma aula com falta avisada */
  reposicaoDe?: Pick<EventoAgenda, 'id' | 'titulo' | 'cliente_id' | 'matricula_id' | 'responsavel'> & { duracao: number };
};

const TITULO: Record<Tipo, string> = { aula: 'Aula avulsa', sessao: 'Sessão de estúdio', outro: '' };
const DURACOES = [30, 45, 50, 60, 90, 120, 180, 240];

export function AgendarModal({
  clientes,
  inicial,
  onClose,
  onSalvo,
}: {
  clientes: Pick<Cliente, 'id' | 'nome'>[];
  inicial: AgendarInicial;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const toast = useToast();
  const rep = inicial.reposicaoDe;
  const [tipo, setTipo] = useState<Tipo>(rep ? 'aula' : (inicial.tipo ?? 'aula'));
  const [clienteId, setClienteId] = useState(rep?.cliente_id ?? inicial.clienteId ?? '');
  const [titulo, setTitulo] = useState(rep ? `Reposição · ${rep.titulo}` : TITULO[inicial.tipo ?? 'aula']);
  const [data, setData] = useState(inicial.data ?? '');
  const [hora, setHora] = useState(inicial.hora ?? '');
  const [duracao, setDuracao] = useState(rep?.duracao ?? inicial.duracao ?? 50);
  const [valor, setValor] = useState('130');
  const [responsavel, setResponsavel] = useState<Responsavel | ''>(rep?.responsavel ?? inicial.responsavel ?? '');
  const [orcamentoId, setOrcamentoId] = useState('');
  const [orcs, setOrcs] = useState<{ cliente: string; lista: Pick<Orcamento, 'id' | 'numero' | 'projeto_titulo'>[] }>({ cliente: '', lista: [] });
  const [choque, setChoque] = useState<{ chave: string; lista: Pick<EventoAgenda, 'id' | 'titulo' | 'inicio'>[] }>({ chave: '', lista: [] });
  const [salvando, setSalvando] = useState(false);

  const completo = !!data && !!hora;
  const inicioISO = completo ? localParaISO(data, hora) : '';
  const fimISO = completo ? new Date(new Date(inicioISO).getTime() + duracao * 60_000).toISOString() : '';
  const chave = `${inicioISO}|${fimISO}`;

  // orçamentos do cliente para vincular a sessão
  useEffect(() => {
    if (tipo !== 'sessao' || !clienteId) return;
    supabase
      .from('orcamentos')
      .select('id, numero, projeto_titulo')
      .eq('cliente_id', clienteId)
      .neq('status', 'recusado')
      .order('updated_at', { ascending: false })
      .then(({ data: d }) => setOrcs({ cliente: clienteId, lista: d ?? [] }));
  }, [tipo, clienteId]);

  // uma sala só: avisa sobreposição
  useEffect(() => {
    if (!completo) return;
    supabase
      .from('eventos_agenda')
      .select('id, titulo, inicio')
      .eq('cancelado', false)
      .neq('presenca', 'justificada')
      .lt('inicio', fimISO)
      .gt('fim', inicioISO)
      .then(({ data: d }) => setChoque({ chave, lista: d ?? [] }));
  }, [completo, inicioISO, fimISO, chave]);

  const conflitos = choque.chave === chave ? choque.lista : [];
  const orcamentos = orcs.cliente === clienteId ? orcs.lista : [];

  const salvar = async () => {
    if (!completo || !titulo.trim() || (tipo !== 'outro' && !clienteId)) {
      toast({ tone: 'danger', title: 'Preencha pessoa, título, data e hora' });
      return;
    }
    setSalvando(true);
    const v = Number(valor.replace(',', '.'));
    const { error } = await supabase.from('eventos_agenda').insert({
      tipo,
      cliente_id: clienteId || null,
      matricula_id: rep?.matricula_id ?? null,
      reposicao_de: rep?.id ?? null,
      titulo: titulo.trim(),
      inicio: inicioISO,
      fim: fimISO,
      responsavel: responsavel || null,
      // reposição de matrícula consome o pacote; aula avulsa cobra por aula
      valor_aula: tipo === 'aula' && !rep?.matricula_id && v > 0 ? v : null,
      orcamento_id: tipo === 'sessao' && orcamentoId ? orcamentoId : null,
    });
    setSalvando(false);
    if (error) {
      toast({ tone: 'danger', title: 'Não foi possível agendar', description: error.message });
      return;
    }
    toast({ tone: 'success', title: 'Agendado', description: `${titulo.trim()} · ${new Date(inicioISO).toLocaleDateString('pt-BR')} ${hora}` });
    onSalvo();
  };

  return (
    <Modal
      open
      onClose={onClose}
      index={rep ? 'falta avisada · consome o mesmo pacote' : 'uma sala só · avisa conflito de horário'}
      title={rep ? 'Agendar reposição' : 'Agendar'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={salvar} loading={salvando}>
            <CalendarPlus className="size-4" strokeWidth={1.5} aria-hidden /> Agendar
          </Button>
        </>
      }
    >
      <div className="-m-1 max-h-[60vh] space-y-4 overflow-y-auto p-1 pr-2">
        {!rep && (
          <Chips
            value={tipo}
            onChange={(t) => {
              setTipo(t);
              setTitulo(TITULO[t]);
            }}
            options={[
              { id: 'aula', label: 'Aula avulsa' },
              { id: 'sessao', label: 'Sessão de estúdio' },
              { id: 'outro', label: 'Outro' },
            ]}
          />
        )}
        <SelectField
          label="Pessoa"
          optional={tipo === 'outro'}
          value={clienteId}
          placeholder="Escolha"
          disabled={!!rep}
          onChange={(e) => setClienteId(e.target.value)}
          options={[...(tipo === 'outro' ? [{ value: '', label: '—' }] : []), ...clientes.map((c) => ({ value: c.id, label: c.nome }))]}
        />
        <TextField label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={tipo === 'outro' ? 'Ensaio, manutenção…' : undefined} />
        <div className="grid grid-cols-3 gap-3">
          <TextField label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          <TextField label="Hora" type="time" step={300} value={hora} onChange={(e) => setHora(e.target.value)} />
          <SelectField
            label="Duração"
            value={String(duracao)}
            onChange={(e) => setDuracao(Number(e.target.value))}
            options={DURACOES.map((m) => ({ value: String(m), label: m < 60 || m % 60 ? `${m} min` : `${m / 60} h` }))}
          />
        </div>
        {conflitos.length > 0 && (
          <Alert tone="warning" title="Horário ocupado">
            {conflitos.map((c) => `${c.titulo} às ${horaTexto(new Date(c.inicio))}`).join(' · ')}
          </Alert>
        )}
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Responsável"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value as Responsavel | '')}
            options={[
              { value: '', label: '—' },
              { value: 'daniel', label: 'Daniel' },
              { value: 'marcella', label: 'Marcella' },
            ]}
          />
          {tipo === 'aula' && !rep && (
            <TextField label="Valor da aula (R$)" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} hint="vira lançamento ao marcar realizada" />
          )}
          {tipo === 'sessao' && (
            <SelectField
              label="Orçamento"
              optional
              value={orcamentoId}
              onChange={(e) => setOrcamentoId(e.target.value)}
              options={[{ value: '', label: '—' }, ...orcamentos.map((o) => ({ value: o.id, label: `${o.numero} · ${o.projeto_titulo}` }))]}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
