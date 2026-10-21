'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Copy, MessageCircle, ExternalLink, CircleCheck, CircleX, ArrowUpRight } from 'lucide-react';
import {
  supabase,
  gerarSlug,
  type CatalogoServico,
  type Cliente,
  type Divisao,
  type Lancamento,
  type Orcamento,
  type OrcamentoItem,
  type OrcamentoVersao,
} from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Alert, Button, ButtonLink, Skeleton } from '@/components/ds/primitives';
import { useToast } from '@/components/ds/interactive';
import { TextArea, TextField } from '@/components/ds/fields';
import { QuoteBuilder, type QuoteDraft } from '@/components/ds/admin/quote-builder';
import { Panel } from '../../_components/ui';
import { ListaLancamentos } from '../../_components/Lancamentos';
import { dataCurta, whatsappUrl } from '../../_lib';
import { condicoesTexto, itensParaLinhas, linhasParaItens } from '../_lib';

type Dados = {
  catalogo: CatalogoServico[];
  clientes: Pick<Cliente, 'id' | 'nome' | 'telefone'>[];
  orc: Orcamento | null;
  itens: OrcamentoItem[];
  lancamentos: Lancamento[];
  versoes: Pick<OrcamentoVersao, 'versao' | 'created_at'>[];
};

type Extras = { descricao: string; validade: string; prazo: string; observacoes: string };

const FECHADOS: Orcamento['status'][] = ['aprovado', 'recusado', 'expirado'];

function Editor() {
  const { id } = useParams<{ id: string }>();
  const novo = id === 'novo';
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState('');
  const [extras, setExtras] = useState<Extras>({ descricao: '', validade: '', prazo: '', observacoes: '' });
  const [salvando, setSalvando] = useState(false);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    const vazio = { data: null, error: null };
    Promise.all([
      supabase.from('catalogo_servicos').select('*').eq('ativo', true).order('ordem').order('nome'),
      supabase.from('clientes').select('id, nome, telefone').order('nome'),
      novo ? vazio : supabase.from('orcamentos').select('*').eq('id', id).single(),
      novo ? vazio : supabase.from('orcamento_itens').select('*').eq('orcamento_id', id).order('ordem'),
      novo ? vazio : supabase.from('lancamentos').select('*').eq('orcamento_id', id).order('vencimento'),
      novo ? vazio : supabase.from('orcamento_versoes').select('versao, created_at').eq('orcamento_id', id).order('versao', { ascending: false }),
    ]).then(([cat, cli, orc, itens, lanc, vers]) => {
      const falha = cat.error || cli.error || orc.error || itens.error || lanc.error || vers.error;
      if (falha) {
        setErro(falha.message);
        return;
      }
      const o = orc.data as Orcamento | null;
      setDados({
        catalogo: cat.data ?? [],
        clientes: cli.data ?? [],
        orc: o,
        itens: (itens.data as OrcamentoItem[] | null) ?? [],
        lancamentos: (lanc.data as Lancamento[] | null) ?? [],
        versoes: (vers.data as Dados['versoes'] | null) ?? [],
      });
      if (o) {
        setExtras({ descricao: o.projeto_descricao ?? '', validade: o.validade ?? '', prazo: o.prazo_entrega ?? '', observacoes: o.observacoes ?? '' });
      }
    });
  }, [id, novo, versao]);

  if (erro) {
    return (
      <div className="p-4 md:p-6">
        <Alert tone="danger" title="Erro ao carregar o orçamento">
          {erro}
        </Alert>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { orc } = dados;
  const link = orc && typeof window !== 'undefined' ? `${window.location.origin}/orcamento/${orc.slug}` : '';
  const cliente = dados.clientes.find((c) => c.id === orc?.cliente_id);
  const fechado = !!orc && FECHADOS.includes(orc.status);
  const divisaoInicial = orc?.divisao ?? 'studio';

  const salvar = async (d: QuoteDraft, acao: 'rascunho' | 'enviar') => {
    if (!d.titulo.trim()) {
      toast({ tone: 'danger', title: 'Dê um título ao orçamento' });
      return;
    }
    setSalvando(true);
    try {
      const jaEnviado = !!orc && orc.status !== 'rascunho';
      const versaoNova = acao === 'enviar' && jaEnviado ? (orc?.versao ?? 1) + 1 : (orc?.versao ?? 1);
      const campos = {
        projeto_titulo: d.titulo.trim(),
        cliente_id: d.clienteId || null,
        divisao: d.divisao,
        desconto: d.desconto,
        entrada_pct: d.entrada,
        parcelas: d.entrada >= 100 ? 1 : d.parcelas,
        condicoes_pagamento: condicoesTexto(d.entrada, d.parcelas),
        projeto_descricao: extras.descricao.trim() || null,
        validade: extras.validade || null,
        prazo_entrega: extras.prazo.trim() || null,
        observacoes: extras.observacoes.trim() || null,
        tipo: 'simples' as const,
        status: acao === 'enviar' ? ('enviado' as const) : (orc?.status ?? 'rascunho'),
        versao: versaoNova,
      };

      let orcId = orc?.id;
      if (orcId) {
        const { error } = await supabase.from('orcamentos').update(campos).eq('id', orcId);
        if (error) throw error;
        const { error: delError } = await supabase.from('orcamento_itens').delete().eq('orcamento_id', orcId);
        if (delError) throw delError;
      } else {
        const { data: numero } = await supabase.rpc('gerar_numero_orcamento');
        const { data, error } = await supabase
          .from('orcamentos')
          .insert({
            ...campos,
            numero: (numero as string | null) ?? `ORC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
            slug: gerarSlug(campos.projeto_titulo),
            criado_por: user?.id ?? null,
          })
          .select('id, slug')
          .single();
        if (error) throw error;
        orcId = data.id;
      }

      const itens = linhasParaItens(d.linhas, orcId!);
      if (itens.length) {
        const { error } = await supabase.from('orcamento_itens').insert(itens);
        if (error) throw error;
      }

      if (acao === 'enviar') {
        await supabase
          .from('orcamento_versoes')
          .upsert({ orcamento_id: orcId, versao: versaoNova, snapshot: { orcamento: campos, itens }, criado_por: user?.id ?? null }, { onConflict: 'orcamento_id,versao' });
      }

      toast({
        tone: 'success',
        title: acao === 'enviar' ? `Pronto para enviar${versaoNova > 1 ? ` · v${versaoNova}` : ''}` : 'Rascunho salvo',
        description: acao === 'enviar' ? 'Copie o link ou mande pelo WhatsApp no resumo.' : undefined,
      });
      if (!orc) router.replace(`/painel/orcamentos/${orcId}`);
      else setVersao((v) => v + 1);
    } catch (e) {
      toast({ tone: 'danger', title: 'Não foi possível salvar', description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSalvando(false);
    }
  };

  const mudarStatus = async (status: 'aprovado' | 'recusado') => {
    if (!orc) return;
    const { error } = await supabase
      .from('orcamentos')
      .update(status === 'aprovado' ? { status, aprovado_em: new Date().toISOString() } : { status })
      .eq('id', orc.id);
    if (error) {
      toast({ tone: 'danger', title: 'Não foi possível atualizar', description: error.message });
      return;
    }
    toast({ tone: status === 'aprovado' ? 'success' : 'info', title: status === 'aprovado' ? 'Aprovado · lançamentos gerados' : 'Marcado como recusado' });
    setVersao((v) => v + 1);
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast({ tone: 'success', title: 'Link copiado' });
    } catch {
      toast({ tone: 'danger', title: 'Não deu para copiar', description: link });
    }
  };

  if (orc?.tipo === 'pacotes') {
    return (
      <>
        <Topo numero={orc.numero} />
        <div className="p-4 md:p-6">
          <Alert
            tone="info"
            title="Orçamento com pacotes"
            action={
              <ButtonLink size="sm" variant="secondary" href={`/admin/orcamentos/${orc.id}`}>
                Abrir no admin antigo <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
              </ButtonLink>
            }
          >
            O gerador v2 ainda não monta pacotes. {orc.projeto_titulo} continua editável no admin antigo.
          </Alert>
        </div>
      </>
    );
  }

  const wa = cliente?.telefone ? whatsappUrl(cliente.telefone, `Olá, ${cliente.nome.split(' ')[0]}! Segue o orçamento “${orc?.projeto_titulo}” da DAMA: ${link}`) : null;

  return (
    <>
      <Topo numero={orc?.numero} />
      <div className="space-y-6 p-4 md:p-6">
        {orc?.status === 'visualizado' && orc.visualizado_em && (
          <Alert tone="info" title={`Visualizado em ${dataCurta(orc.visualizado_em)}`}>
            O cliente abriu a proposta. Bom momento para um lembrete no WhatsApp.
          </Alert>
        )}

        <QuoteBuilder
          key={`${orc?.id ?? 'novo'}-${orc?.updated_at ?? ''}`}
          catalogo={dados.catalogo.map((c) => ({ ...c, descricao: c.descricao ?? '' }))}
          clientes={dados.clientes}
          inicial={{
            numero: orc?.numero ?? 'novo',
            titulo: orc?.projeto_titulo ?? 'Novo orçamento',
            clienteId: orc?.cliente_id ?? params.get('cliente') ?? '',
            divisao: divisaoInicial as Divisao,
            linhas: itensParaLinhas(dados.itens, divisaoInicial as Divisao),
            desconto: Number(orc?.desconto) || 0,
            status: orc?.status ?? 'rascunho',
            versao: orc?.versao ?? 1,
            entrada: orc?.entrada_pct ?? undefined,
            parcelas: orc?.parcelas ?? undefined,
          }}
          onSave={salvar}
          saving={salvando}
          readOnly={fechado}
          aside={
            orc &&
            orc.status !== 'rascunho' && (
              <div className="mt-5 space-y-3 border-t border-ds-line pt-4">
                <p className="ds-annot uppercase">Link do cliente</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="secondary" onClick={copiar}>
                    <Copy className="size-4" strokeWidth={1.5} aria-hidden /> Copiar
                  </Button>
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-ds-sm border border-ds-line-strong text-sm text-ds-fg hover:bg-ds-surface-2"
                    >
                      <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> WhatsApp
                    </a>
                  ) : (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-ds-sm border border-ds-line-strong text-sm text-ds-fg hover:bg-ds-surface-2"
                    >
                      <ExternalLink className="size-4" strokeWidth={1.5} aria-hidden /> Abrir
                    </a>
                  )}
                </div>
                {!fechado && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="ghost" onClick={() => mudarStatus('aprovado')}>
                      <CircleCheck className="size-4" strokeWidth={1.5} aria-hidden /> Aprovado
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => mudarStatus('recusado')}>
                      <CircleX className="size-4" strokeWidth={1.5} aria-hidden /> Recusado
                    </Button>
                  </div>
                )}
                {dados.versoes.length > 0 && (
                  <p className="ds-annot">
                    {dados.versoes.map((v) => `v${v.versao} · ${dataCurta(v.created_at)}`).join('  ·  ')}
                  </p>
                )}
              </div>
            )
          }
        >
          <div className="grid gap-4 @xl:grid-cols-2">
            <TextArea
              label="Descrição do projeto"
              optional
              value={extras.descricao}
              onChange={(e) => setExtras({ ...extras, descricao: e.target.value })}
              className="min-h-20 @xl:col-span-2"
            />
            <TextField label="Válido até" type="date" optional value={extras.validade} onChange={(e) => setExtras({ ...extras, validade: e.target.value })} />
            <TextField label="Prazo de entrega" optional value={extras.prazo} onChange={(e) => setExtras({ ...extras, prazo: e.target.value })} placeholder="ex.: 30 dias após a aprovação" />
            <TextArea
              label="Observações"
              optional
              value={extras.observacoes}
              onChange={(e) => setExtras({ ...extras, observacoes: e.target.value })}
              className="min-h-20"
            />
          </div>
        </QuoteBuilder>

        {orc?.status === 'aprovado' && (
          <Panel title="Lançamentos gerados">
            <ListaLancamentos
              lancamentos={dados.lancamentos}
              onMudou={() => setVersao((v) => v + 1)}
              vazio="Aprovado antes do painel novo — os lançamentos deste orçamento entram na migração do financeiro."
            />
          </Panel>
        )}
      </div>
    </>
  );
}

function Topo({ numero }: { numero?: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-ds-line px-4 py-3 md:px-6">
      <Link href="/painel/orcamentos" className="ds-annot inline-flex items-center gap-1 hover:text-ds-fg">
        <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden /> orçamentos
      </Link>
      {numero && <span className="font-ds-mono text-xs text-ds-subtle">/ {numero}</span>}
    </div>
  );
}

export default function OrcamentoPage() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  );
}
