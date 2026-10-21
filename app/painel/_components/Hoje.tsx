'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, type EventoAgenda, type PresencaAgenda } from '@/lib/supabase';
import { cn, Button, Skeleton } from '@/components/ds/primitives';
import { useToast } from '@/components/ds/interactive';
import { PRESENCA_LABEL, PresencaMark } from '@/components/ds/admin/display';
import { addDias, horaTexto, isoData, presencaVisual } from '../agenda/_lib';
import { Panel } from './ui';

type Item = EventoAgenda & { cliente: { nome: string } | null };

/** Aulas e sessões de hoje com presença em um toque. */
export function HojePanel() {
  const toast = useToast();
  const [itens, setItens] = useState<Item[] | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    const hoje = new Date();
    const ini = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    supabase.rpc('gerar_aulas', { p_de: isoData(ini), p_ate: isoData(ini) }).then(() =>
      supabase
        .from('eventos_agenda')
        .select('*, cliente:clientes(nome)')
        .eq('cancelado', false)
        .gte('inicio', ini.toISOString())
        .lt('inicio', addDias(ini, 1).toISOString())
        .order('inicio')
        .returns<Item[]>()
        .then(({ data }) => setItens(data ?? [])),
    );
  }, [versao]);

  const marcar = async (e: Item, presenca: PresencaAgenda) => {
    const { error } = await supabase.from('eventos_agenda').update({ presenca }).eq('id', e.id);
    if (error) {
      toast({ tone: 'danger', title: 'Não foi possível salvar', description: error.message });
      return;
    }
    if (presenca !== 'agendada') toast({ tone: presenca === 'falta' ? 'danger' : 'success', title: `${PRESENCA_LABEL[presenca]} · ${e.cliente?.nome ?? e.titulo}` });
    setVersao((v) => v + 1);
  };

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }).replace('.', '');

  return (
    <Panel
      title={`Hoje · ${hoje}`}
      action={
        <Link href="/painel/agenda" className="ds-annot hover:text-ds-fg">
          agenda →
        </Link>
      }
    >
      {itens === null ? (
        <Skeleton className="h-24" />
      ) : itens.length === 0 ? (
        <p className="py-6 text-center text-sm text-ds-subtle">Nada na agenda hoje.</p>
      ) : (
        <ul className="-my-2 divide-y divide-ds-line" data-divisao="studio">
          {itens.map((e) => {
            const ini = new Date(e.inicio);
            const vis = presencaVisual(e);
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="w-12 font-ds-mono text-xs tabular-nums text-ds-muted">{horaTexto(ini)}</span>
                <span className={cn('h-8 w-0.5', e.tipo === 'aula' ? 'bg-ds-accent' : 'bg-ds-accent/40')} />
                <Link href={e.cliente_id ? `/painel/pessoas?id=${e.cliente_id}` : '/painel/agenda'} className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ds-fg hover:underline">{e.cliente?.nome ?? e.titulo}</span>
                  <span className="block truncate text-xs text-ds-muted">{e.cliente ? e.titulo : e.tipo === 'sessao' ? 'Sessão de estúdio' : 'Agenda'}</span>
                </Link>
                {e.presenca === 'agendada' ? (
                  <span className="flex gap-1">
                    <Button size="sm" variant="secondary" onClick={() => marcar(e, 'realizada')}>
                      Realizada
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => marcar(e, 'falta')}>
                      Falta
                    </Button>
                  </span>
                ) : (
                  <button onClick={() => marcar(e, 'agendada')} className="inline-flex items-center gap-2 text-xs text-ds-muted" aria-label={`Desfazer ${PRESENCA_LABEL[vis]}`}>
                    <PresencaMark presenca={vis} /> {PRESENCA_LABEL[vis]}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
