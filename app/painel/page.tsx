'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus, CalendarDays, Wallet } from 'lucide-react';
import { supabase, type Orcamento } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { ButtonLink, Skeleton } from '@/components/ds/primitives';
import { brl, KpiTile, QuoteTrack } from '@/components/ds/admin/display';
import { ScreenHeader, Panel } from './_components/ui';
import { hojeISO } from './_lib';

type OrcAberto = Pick<Orcamento, 'id' | 'numero' | 'projeto_titulo' | 'divisao' | 'updated_at'> & {
  status: 'rascunho' | 'enviado' | 'visualizado';
  cliente: { nome: string } | null;
};

type Resumo = {
  pessoas: number;
  alunos: number;
  leads: number;
  aprovadosAno: number;
  aReceber: number;
  atrasado: number;
  abertos: OrcAberto[];
};

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

export default function InicioPage() {
  const { profile, user } = useAuth();
  const [r, setR] = useState<Resumo | null>(null);

  useEffect(() => {
    const inicioAno = `${new Date().getFullYear()}-01-01`;
    Promise.all([
      supabase.from('clientes').select('papeis, status'),
      supabase.from('orcamentos').select('id', { count: 'exact', head: true }).eq('status', 'aprovado').gte('aprovado_em', inicioAno),
      supabase.from('lancamentos').select('valor, vencimento').eq('status', 'pendente'),
      supabase
        .from('orcamentos')
        .select('id, numero, projeto_titulo, divisao, status, updated_at, cliente:clientes(nome)')
        .in('status', ['rascunho', 'enviado', 'visualizado'])
        .order('updated_at', { ascending: false })
        .limit(8)
        .returns<OrcAberto[]>(),
    ]).then(([pessoas, aprovados, pendentes, abertos]) => {
      const lista = pessoas.data ?? [];
      const hoje = hojeISO();
      const lancs = pendentes.data ?? [];
      setR({
        pessoas: lista.filter((p) => p.status !== 'lead').length,
        alunos: lista.filter((p) => p.status === 'ativo' && (p.papeis ?? []).includes('aluno')).length,
        leads: lista.filter((p) => p.status === 'lead').length,
        aprovadosAno: aprovados.count ?? 0,
        aReceber: lancs.reduce((s, l) => s + Number(l.valor), 0),
        atrasado: lancs.filter((l) => l.vencimento < hoje).reduce((s, l) => s + Number(l.valor), 0),
        abertos: abertos.data ?? [],
      });
    });
  }, []);

  const nome = (profile?.nome || user?.email || '').split(' ')[0];
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '');

  return (
    <>
      <ScreenHeader
        sub={hoje}
        title={`${saudacao()}${nome ? `, ${nome}` : ''}`}
        actions={
          <ButtonLink size="sm" href="/painel/pessoas?novo=1">
            <UserPlus className="size-4" strokeWidth={1.5} aria-hidden /> Nova pessoa
          </ButtonLink>
        }
      />
      <div className="space-y-4 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          {r ? (
            <>
              <KpiTile label="Pessoas" value={String(r.pessoas)} note={r.leads ? `+ ${r.leads} lead${r.leads === 1 ? '' : 's'}` : 'cadastradas'} />
              <KpiTile label="Alunos ativos" value={String(r.alunos)} note="DAMA Studio · música" />
              <KpiTile label="Orçamentos abertos" value={String(r.abertos.length)} note={`${r.aprovadosAno} aprovado${r.aprovadosAno === 1 ? '' : 's'} em ${new Date().getFullYear()}`} />
              <KpiTile
                label="A receber"
                value={brl(r.aReceber)}
                note={r.atrasado ? `${brl(r.atrasado)} em atraso` : 'lançamentos pendentes'}
                tone={r.atrasado ? 'danger' : undefined}
              />
            </>
          ) : (
            [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <Panel
            title="Orçamentos abertos"
            action={
              <Link href="/painel/orcamentos" className="ds-annot hover:text-ds-fg">
                todos →
              </Link>
            }
          >
            {!r ? (
              <Skeleton className="h-32" />
            ) : r.abertos.length === 0 ? (
              <p className="py-6 text-center text-sm text-ds-subtle">Nenhum orçamento em aberto.</p>
            ) : (
              <ul className="-my-2 divide-y divide-ds-line">
                {r.abertos.map((o) => (
                  <li key={o.id} data-divisao={o.divisao}>
                    <Link href={`/painel/orcamentos/${o.id}`} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 py-3 text-left">
                      <span className="font-ds-mono text-xs text-ds-subtle">#{o.numero}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ds-fg">{o.projeto_titulo}</span>
                        {o.cliente && <span className="block truncate text-xs text-ds-muted">{o.cliente.nome}</span>}
                      </span>
                      <QuoteTrack status={o.status} compact />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Chegando no painel">
            <ul className="-my-2 divide-y divide-ds-line text-sm">
              {[
                { icon: <CalendarDays />, t: 'Agenda', d: 'aulas e sessões com presença e recorrência' },
                { icon: <Wallet />, t: 'Financeiro', d: 'todos os lançamentos, mensalidades e sessões num lugar só' },
              ].map((x) => (
                <li key={x.t} className="flex items-center gap-3 py-3">
                  <span className="text-ds-subtle [&_svg]:size-4">{x.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-ds-fg">{x.t}</span>
                    <span className="ds-annot">{x.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
