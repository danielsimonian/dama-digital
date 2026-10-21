'use client';

import { useState } from 'react';
import { Receipt } from 'lucide-react';
import { supabase, type Lancamento, type LancamentoForma } from '@/lib/supabase';
import { Button } from '@/components/ds/primitives';
import { Modal, useToast } from '@/components/ds/interactive';
import { SelectField, TextField } from '@/components/ds/fields';
import { brl, LancamentoStatusLabel } from '@/components/ds/admin/display';
import { dataCurta, hojeISO } from '../_lib';

const FORMAS: LancamentoForma[] = ['Pix', 'Cartão', 'Dinheiro', 'Boleto', 'Transferência'];

export function statusVisual(l: Pick<Lancamento, 'status' | 'vencimento'>) {
  if (l.status === 'pago') return 'pago' as const;
  return l.vencimento < hojeISO() ? ('atrasado' as const) : ('pendente' as const);
}

export function ListaLancamentos({ lancamentos, onMudou, vazio }: { lancamentos: Lancamento[]; onMudou: () => void; vazio?: string }) {
  const toast = useToast();
  const [pagar, setPagar] = useState<Lancamento | null>(null);
  const [forma, setForma] = useState<LancamentoForma>('Pix');
  const [data, setData] = useState(hojeISO());
  const [salvando, setSalvando] = useState(false);

  const visiveis = lancamentos.filter((l) => l.status !== 'cancelado');

  const confirmar = async () => {
    if (!pagar) return;
    setSalvando(true);
    const { error } = await supabase.from('lancamentos').update({ status: 'pago', forma, pago_em: data }).eq('id', pagar.id);
    setSalvando(false);
    if (error) {
      toast({ tone: 'danger', title: 'Não foi possível registrar', description: error.message });
      return;
    }
    toast({ tone: 'success', title: `${brl(Number(pagar.valor), true)} recebido`, description: forma });
    setPagar(null);
    onMudou();
  };

  if (!visiveis.length) return <p className="text-sm text-ds-subtle">{vazio ?? 'Nenhum lançamento.'}</p>;

  return (
    <>
      <ul className="divide-y divide-ds-line border-y border-ds-line">
        {visiveis.map((l) => {
          const s = statusVisual(l);
          return (
            <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
              <span className="w-12 font-ds-mono text-xs tabular-nums text-ds-muted">{dataCurta(l.vencimento)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ds-fg">{l.descricao}</span>
                {l.status === 'pago' ? (
                  <span className="ds-annot">
                    {l.forma} · {l.pago_em && dataCurta(l.pago_em)}
                  </span>
                ) : (
                  <LancamentoStatusLabel status={s} />
                )}
              </span>
              <span className="font-ds-mono text-sm tabular-nums">{brl(Number(l.valor), Number(l.valor) % 1 !== 0)}</span>
              {l.status !== 'pago' && (
                <Button
                  size="sm"
                  variant={s === 'atrasado' ? 'primary' : 'secondary'}
                  onClick={() => {
                    setPagar(l);
                    setData(hojeISO());
                  }}
                >
                  Marcar pago
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <Modal
        open={!!pagar}
        onClose={() => setPagar(null)}
        index={pagar ? `venc. ${dataCurta(pagar.vencimento)}` : undefined}
        title={pagar ? `Registrar ${brl(Number(pagar.valor), true)}` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPagar(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmar} loading={salvando}>
              <Receipt className="size-4" strokeWidth={1.5} aria-hidden /> Confirmar recebimento
            </Button>
          </>
        }
      >
        <p className="mb-4">{pagar?.descricao}</p>
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Forma" value={forma} onChange={(e) => setForma(e.target.value as LancamentoForma)} options={FORMAS.map((f) => ({ value: f, label: f }))} />
          <TextField label="Recebido em" type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
      </Modal>
    </>
  );
}
