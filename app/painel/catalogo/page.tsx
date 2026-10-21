'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Pencil } from 'lucide-react';
import { supabase, type CatalogoServico, type CatalogoUnidade, type Divisao } from '@/lib/supabase';
import { cn, Button, DivisionBadge, Skeleton, Alert, DIVISAO_LABEL } from '@/components/ds/primitives';
import { Modal, useToast } from '@/components/ds/interactive';
import { TextField, TextArea, SelectField, Switch } from '@/components/ds/fields';
import { brl } from '@/components/ds/admin/display';
import { ScreenHeader, Chips } from '../_components/ui';

const DIVISOES: Divisao[] = ['studio', 'tech', 'sports'];
const UNIDADES: CatalogoUnidade[] = ['aula', 'mês', 'hora', 'pacote', 'faixa', 'projeto', 'evento', 'dia', 'atleta'];

type Form = { id?: string; nome: string; divisao: Divisao; unidade: CatalogoUnidade; valor: string; descricao: string; ativo: boolean };

const VAZIO: Form = { nome: '', divisao: 'studio', unidade: 'aula', valor: '', descricao: '', ativo: true };

function CatalogoTela() {
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const [itens, setItens] = useState<CatalogoServico[] | null>(null);
  const [erro, setErro] = useState('');
  const [mostrar, setMostrar] = useState<'ativos' | 'todos'>('ativos');
  const [form, setForm] = useState<Form | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [versao, setVersao] = useState(0);
  const [pedido, setPedido] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('catalogo_servicos')
      .select('*')
      .order('ordem')
      .order('nome')
      .then(({ data, error }) => {
        if (error) setErro(error.message);
        else setItens(data);
      });
  }, [versao]);

  // ?novo=1 vem da paleta de comandos
  const novo = params.get('novo');
  if (novo !== pedido) {
    setPedido(novo);
    if (novo === '1') setForm(VAZIO);
  }
  useEffect(() => {
    if (novo) router.replace('/painel/catalogo');
  }, [novo, router]);

  const salvar = async () => {
    if (!form) return;
    const valor = Number(form.valor.replace(',', '.'));
    if (!form.nome.trim() || !Number.isFinite(valor) || valor < 0) {
      toast({ tone: 'danger', title: 'Confira nome e valor' });
      return;
    }
    setSalvando(true);
    const dados = {
      nome: form.nome.trim(),
      divisao: form.divisao,
      unidade: form.unidade,
      valor,
      descricao: form.descricao.trim() || null,
      ativo: form.ativo,
    };
    const { error } = form.id
      ? await supabase.from('catalogo_servicos').update(dados).eq('id', form.id)
      : await supabase.from('catalogo_servicos').insert(dados);
    setSalvando(false);
    if (error) {
      toast({ tone: 'danger', title: 'Não foi possível salvar', description: error.message });
      return;
    }
    toast({ tone: 'success', title: form.id ? 'Item atualizado' : 'Item criado', description: dados.nome });
    setForm(null);
    setVersao((v) => v + 1);
  };

  const visiveis = (itens ?? []).filter((c) => mostrar === 'todos' || c.ativo);
  const inativos = (itens ?? []).filter((c) => !c.ativo).length;

  return (
    <>
      <ScreenHeader
        sub="preços base que alimentam os orçamentos"
        title="Catálogo"
        actions={
          <Button size="sm" onClick={() => setForm(VAZIO)}>
            <Plus className="size-4" strokeWidth={1.5} aria-hidden /> Item
          </Button>
        }
      />
      <div className="space-y-8 p-4 md:p-6">
        {erro && <Alert tone="danger" title="Erro ao carregar o catálogo">{erro}</Alert>}

        {inativos > 0 && (
          <Chips
            value={mostrar}
            onChange={setMostrar}
            options={[
              { id: 'ativos', label: 'Ativos', count: (itens ?? []).length - inativos },
              { id: 'todos', label: 'Todos', count: (itens ?? []).length },
            ]}
          />
        )}

        {itens === null && !erro && (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {itens?.length === 0 && (
          <div className="border-y border-ds-line py-12 text-center">
            <p className="text-sm text-ds-muted">O catálogo está vazio.</p>
            <p className="ds-annot mt-1">cadastre os serviços com preço base — eles viram linhas prontas no orçamento</p>
            <Button size="sm" variant="secondary" className="mt-4" onClick={() => setForm(VAZIO)}>
              <Plus className="size-4" strokeWidth={1.5} aria-hidden /> Primeiro item
            </Button>
          </div>
        )}

        {itens &&
          itens.length > 0 &&
          DIVISOES.map((d) => {
            const lista = visiveis.filter((c) => c.divisao === d);
            if (!lista.length) return null;
            return (
              <div key={d} data-divisao={d}>
                <div className="mb-2 flex items-center gap-3">
                  <DivisionBadge divisao={d} />
                  <span className="h-px flex-1 bg-ds-line" />
                  <span className="ds-annot">{lista.length}</span>
                </div>
                <ul className="divide-y divide-ds-line border-b border-ds-line">
                  {lista.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() =>
                          setForm({
                            id: c.id,
                            nome: c.nome,
                            divisao: c.divisao,
                            unidade: c.unidade,
                            valor: String(c.valor),
                            descricao: c.descricao ?? '',
                            ativo: c.ativo,
                          })
                        }
                        className={cn(
                          'group grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 py-3 text-left hover:bg-ds-surface sm:grid-cols-[1fr_1fr_auto_1.5rem]',
                          !c.ativo && 'opacity-50',
                        )}
                      >
                        <span className="text-sm text-ds-fg">
                          {c.nome}
                          {!c.ativo && <span className="ds-annot ml-2 uppercase">inativo</span>}
                        </span>
                        <span className="col-start-1 row-start-2 text-xs text-ds-muted sm:col-start-auto sm:row-start-auto">{c.descricao}</span>
                        <span className="row-span-2 text-right font-ds-mono text-sm tabular-nums sm:row-span-1">
                          {brl(c.valor, c.valor % 1 !== 0)}
                          <span className="text-ds-subtle">/{c.unidade}</span>
                        </span>
                        <Pencil className="hidden size-3.5 text-ds-subtle opacity-0 group-hover:opacity-100 sm:block" strokeWidth={1.5} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
      </div>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        index={form?.id ? 'editar item' : 'novo item'}
        title={form?.id ? form.nome || 'Item' : 'Novo item no catálogo'}
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
          <div className="space-y-4">
            <TextField label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Divisão"
                value={form.divisao}
                onChange={(e) => setForm({ ...form, divisao: e.target.value as Divisao })}
                options={DIVISOES.map((d) => ({ value: d, label: DIVISAO_LABEL[d] }))}
              />
              <SelectField
                label="Unidade"
                value={form.unidade}
                onChange={(e) => setForm({ ...form, unidade: e.target.value as CatalogoUnidade })}
                options={UNIDADES.map((u) => ({ value: u, label: u }))}
              />
            </div>
            <TextField
              label="Preço base (R$)"
              inputMode="decimal"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              hint={`por ${form.unidade} · pode ser ajustado em cada orçamento`}
            />
            <TextArea label="Descrição" optional value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="min-h-20" />
            {form.id && <Switch label="Ativo (aparece no gerador de orçamentos)" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />}
          </div>
        )}
      </Modal>
    </>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense>
      <CatalogoTela />
    </Suspense>
  );
}
