'use client';

import { useState } from 'react';
import { supabase, type Cliente, type Divisao, type Lancamento, type LancamentoForma } from '@/lib/supabase';
import { Button, DIVISAO_LABEL } from '@/components/ds/primitives';
import { Modal, useToast } from '@/components/ds/interactive';
import { Checkbox, SelectField, TextArea, TextField } from '@/components/ds/fields';
import { brl } from '@/components/ds/admin/display';
import { FORMAS } from '../../_components/Lancamentos';
import { hojeISO } from '../../_lib';

const ORIGEM_LABEL: Record<Lancamento['origem'], string> = {
  orcamento: 'orçamento',
  mensalidade: 'pacote de aulas',
  sessao: 'sessão de estúdio',
  pacote: 'pacote',
  avulso: 'avulso',
};

/** Novo lançamento avulso ou edição de um existente. Montar com `key`. */
export function LancamentoModal({
  lancamento,
  clientes,
  clienteInicial,
  onClose,
  onSalvo,
}: {
  lancamento: Lancamento | 'novo';
  clientes: Pick<Cliente, 'id' | 'nome'>[];
  /** cliente já escolhido num lançamento novo (página do cliente) */
  clienteInicial?: string;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const toast = useToast();
  const l = lancamento === 'novo' ? null : lancamento;
  const [descricao, setDescricao] = useState(l?.descricao ?? '');
  const [clienteId, setClienteId] = useState(l?.cliente_id ?? clienteInicial ?? '');
  const [divisao, setDivisao] = useState<Divisao>(l?.divisao ?? 'studio');
  const [valor, setValor] = useState(l ? String(l.valor) : '');
  const [vencimento, setVencimento] = useState(l?.vencimento ?? hojeISO());
  const [observacoes, setObservacoes] = useState(l?.observacoes ?? '');
  const [recebido, setRecebido] = useState(false);
  const [forma, setForma] = useState<LancamentoForma>('Pix');
  const [salvando, setSalvando] = useState(false);

  const gravar = async (patch: Partial<Lancamento>, msg: string) => {
    setSalvando(true);
    const { error } = l ? await supabase.from('lancamentos').update(patch).eq('id', l.id) : await supabase.from('lancamentos').insert(patch);
    setSalvando(false);
    if (error) {
      toast({ tone: 'danger', title: 'Não foi possível salvar', description: error.message });
      return;
    }
    toast({ tone: 'success', title: msg });
    onSalvo();
  };

  const salvar = () => {
    const v = Number(valor.replace(',', '.'));
    if (!descricao.trim() || !Number.isFinite(v) || v < 0 || !vencimento) {
      toast({ tone: 'danger', title: 'Confira descrição, valor e vencimento' });
      return;
    }
    const base = {
      descricao: descricao.trim(),
      cliente_id: clienteId || null,
      divisao,
      valor: v,
      vencimento,
      observacoes: observacoes.trim() || null,
    };
    if (l) return gravar(base, 'Lançamento atualizado');
    return gravar(
      { ...base, origem: 'avulso', ...(recebido ? { status: 'pago' as const, forma, pago_em: vencimento } : {}) },
      recebido ? `${brl(v)} registrado como recebido` : 'Lançamento criado',
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      index={l ? `${ORIGEM_LABEL[l.origem]} · ${l.status}` : 'avulso'}
      title={l ? 'Lançamento' : 'Novo lançamento'}
      footer={
        <>
          {l?.status === 'pago' && (
            <Button variant="ghost" disabled={salvando} onClick={() => gravar({ status: 'pendente', forma: null, pago_em: null }, 'Pagamento desfeito')}>
              Desfazer pagamento
            </Button>
          )}
          {l?.status === 'pendente' && (
            <Button variant="ghost" disabled={salvando} onClick={() => gravar({ status: 'cancelado' }, 'Lançamento cancelado')}>
              Cancelar lançamento
            </Button>
          )}
          <Button onClick={salvar} loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="-m-1 max-h-[60vh] space-y-4 overflow-y-auto p-1 pr-2">
        <TextField label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} autoFocus={!l} />
        <SelectField
          label="Cliente"
          optional
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          options={[{ value: '', label: '—' }, ...clientes.map((c) => ({ value: c.id, label: c.nome }))]}
        />
        <div className="grid grid-cols-3 gap-3">
          <TextField label="Valor (R$)" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} />
          <TextField label={recebido ? 'Recebido em' : 'Vencimento'} type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} />
          <SelectField
            label="Divisão"
            value={divisao}
            onChange={(e) => setDivisao(e.target.value as Divisao)}
            options={(['studio', 'tech', 'sports'] as Divisao[]).map((d) => ({ value: d, label: DIVISAO_LABEL[d].replace('DAMA ', '') }))}
          />
        </div>
        {!l && (
          <>
            <Checkbox label="Já recebido" checked={recebido} onChange={(e) => setRecebido(e.target.checked)} />
            {recebido && <SelectField label="Forma" value={forma} onChange={(e) => setForma(e.target.value as LancamentoForma)} options={FORMAS.map((f) => ({ value: f, label: f }))} />}
          </>
        )}
        {l?.status === 'pago' && (
          <p className="ds-annot">
            recebido {l.pago_em && new Date(`${l.pago_em}T12:00:00`).toLocaleDateString('pt-BR')}
            {l.forma && ` · ${l.forma}`}
          </p>
        )}
        <TextArea label="Observações" optional value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="min-h-16" />
      </div>
    </Modal>
  );
}

export { ORIGEM_LABEL };
