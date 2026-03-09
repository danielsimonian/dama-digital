// ============================================
// ARQUIVO: app/admin/orcamentos/[id]/page.tsx
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  Star
} from 'lucide-react';
import { supabase, Cliente, gerarSlug, DIVISAO_CONFIG } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

const CATEGORIAS = ['DAMA Tech', 'DAMA Sports', 'DAMA Studio'];

type ItemForm = {
  id?: string;
  categoria: string;
  nome: string;
  descricao: string;
  valor: string;
  quantidade: string;
  detalhes: { texto: string; valor: string }[];
  valor_mensal: string;
  descricao_mensal: string;
};

type PacoteForm = {
  nome: string;
  destaque: boolean;
  itens: ItemForm[];
};

type OrcamentoForm = {
  numero: string;
  slug: string;
  cliente_id: string;
  projeto_titulo: string;
  projeto_descricao: string;
  divisao: 'tech' | 'sports' | 'studio';
  validade: string;
  desconto: string;
  observacoes: string;
  condicoes_pagamento: string;
  prazo_entrega: string;
  status: string;
  tipo: 'simples' | 'pacotes';
};

function emptyItem(divisao: string): ItemForm {
  return {
    categoria: `DAMA ${divisao.charAt(0).toUpperCase() + divisao.slice(1)}`,
    nome: '',
    descricao: '',
    valor: '',
    quantidade: '1',
    detalhes: [{ texto: '', valor: '' }],
    valor_mensal: '',
    descricao_mensal: '',
  };
}

export default function OrcamentoFormPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const isEditing = params?.id && params.id !== 'novo';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState<OrcamentoForm>({
    numero: '',
    slug: '',
    cliente_id: '',
    projeto_titulo: '',
    projeto_descricao: '',
    divisao: 'tech',
    validade: '',
    desconto: '0',
    observacoes: '',
    condicoes_pagamento: '50% na aprovação, 50% na entrega',
    prazo_entrega: '30 dias úteis após aprovação',
    status: 'rascunho',
    tipo: 'simples',
  });

  // State para modo simples
  const [itens, setItens] = useState<ItemForm[]>([
    { categoria: 'DAMA Tech', nome: '', descricao: '', valor: '', quantidade: '1', detalhes: [{ texto: '', valor: '' }] }
  ]);

  // State para modo pacotes
  const [pacotes, setPacotes] = useState<PacoteForm[]>([
    { nome: 'Básico', destaque: false, itens: [emptyItem('tech')] },
    { nome: 'Intermediário', destaque: true, itens: [emptyItem('tech')] },
    { nome: 'Premium', destaque: false, itens: [emptyItem('tech')] },
  ]);
  const [pacoteAtivo, setPacoteAtivo] = useState(0);

  // Helpers: operam nos itens ativos (simples ou pacote ativo)
  function getActiveItens(): ItemForm[] {
    return form.tipo === 'pacotes' ? (pacotes[pacoteAtivo]?.itens ?? []) : itens;
  }

  function setActiveItens(newItens: ItemForm[]) {
    if (form.tipo === 'pacotes') {
      setPacotes(prev => prev.map((p, i) => i === pacoteAtivo ? { ...p, itens: newItens } : p));
    } else {
      setItens(newItens);
    }
  }

  useEffect(() => {
    initialize();
  }, [params?.id]);

  async function initialize() {
    try {
      await fetchClientes();
      if (isEditing) {
        await loadOrcamento();
      } else {
        const ano = new Date().getFullYear();
        const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        setForm(f => ({ ...f, numero: `ORC-${ano}-${random}` }));
      }
    } catch (err: any) {
      console.error('Erro ao inicializar:', err);
      setErrorMsg('Erro ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');
    if (error) throw error;
    if (data) setClientes(data);
  }

  async function loadOrcamento() {
    const { data: orc, error: orcError } = await supabase
      .from('orcamentos')
      .select('*')
      .eq('id', params?.id)
      .single();

    if (orcError) throw orcError;

    const { data: itensData, error: itensError } = await supabase
      .from('orcamento_itens')
      .select('*')
      .eq('orcamento_id', params?.id)
      .order('ordem');

    if (itensError) console.error('Erro ao carregar itens:', itensError);

    if (orc) {
      setForm({
        numero: orc.numero,
        slug: orc.slug,
        cliente_id: orc.cliente_id || '',
        projeto_titulo: orc.projeto_titulo,
        projeto_descricao: orc.projeto_descricao || '',
        divisao: orc.divisao,
        validade: orc.validade?.split('T')[0] || '',
        desconto: String(orc.desconto || 0),
        observacoes: orc.observacoes || '',
        condicoes_pagamento: orc.condicoes_pagamento || '',
        prazo_entrega: orc.prazo_entrega || '',
        status: orc.status,
        tipo: orc.tipo || 'simples',
      });
    }

    if (itensData?.length) {
      const tipo = orc?.tipo || 'simples';

      const mapItem = (item: any): ItemForm => ({
        id: item.id,
        categoria: item.categoria,
        nome: item.nome,
        descricao: item.descricao || '',
        valor: String(item.valor),
        quantidade: String(item.quantidade),
        detalhes: item.detalhes?.length
          ? item.detalhes.map((d: any) => ({ texto: d.texto || '', valor: d.valor ? String(d.valor) : '' }))
          : [{ texto: '', valor: '' }],
        valor_mensal: item.valor_mensal ? String(item.valor_mensal) : '',
        descricao_mensal: item.descricao_mensal || '',
      });

      if (tipo === 'pacotes') {
        const pacoteMap = new Map<string, { destaque: boolean; itens: ItemForm[] }>();
        for (const item of itensData) {
          const nome = item.pacote || 'Padrão';
          if (!pacoteMap.has(nome)) {
            pacoteMap.set(nome, { destaque: Boolean(item.pacote_destaque), itens: [] });
          }
          pacoteMap.get(nome)!.itens.push(mapItem(item));
        }
        if (pacoteMap.size > 0) {
          setPacotes(Array.from(pacoteMap.entries()).map(([nome, data]) => ({
            nome,
            destaque: data.destaque,
            itens: data.itens,
          })));
        }
      } else {
        setItens(itensData.map(mapItem));
      }
    }
  }

  useEffect(() => {
    if (form.projeto_titulo && !isEditing) {
      setForm(f => ({ ...f, slug: gerarSlug(f.projeto_titulo) }));
    }
  }, [form.projeto_titulo, isEditing]);

  // ── Item handlers (operam no array ativo) ──────────────────────────────────

  const addItem = () => {
    const active = getActiveItens();
    setActiveItens([...active, emptyItem(form.divisao)]);
    setExpandedItem(active.length);
  };

  const removeItem = (index: number) => {
    const active = getActiveItens();
    if (active.length === 1) return;
    setActiveItens(active.filter((_, i) => i !== index));
    if (expandedItem === index) setExpandedItem(null);
  };

  const updateItem = (index: number, field: keyof ItemForm, value: any) => {
    const active = getActiveItens();
    setActiveItens(active.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addDetalhe = (itemIndex: number) => {
    const active = getActiveItens();
    setActiveItens(active.map((item, i) =>
      i === itemIndex ? { ...item, detalhes: [...item.detalhes, { texto: '', valor: '' }] } : item
    ));
  };

  const updateDetalhe = (itemIndex: number, detalheIndex: number, field: 'texto' | 'valor', value: string) => {
    const active = getActiveItens();
    setActiveItens(active.map((item, i) => {
      if (i !== itemIndex) return item;
      const newDetalhes = [...item.detalhes];
      newDetalhes[detalheIndex] = { ...newDetalhes[detalheIndex], [field]: value };
      return { ...item, detalhes: newDetalhes };
    }));
  };

  const removeDetalhe = (itemIndex: number, detalheIndex: number) => {
    const active = getActiveItens();
    setActiveItens(active.map((item, i) => {
      if (i !== itemIndex || item.detalhes.length <= 1) return item;
      return { ...item, detalhes: item.detalhes.filter((_, di) => di !== detalheIndex) };
    }));
  };

  // ── Package handlers ───────────────────────────────────────────────────────

  const addPacote = () => {
    const newPacote: PacoteForm = {
      nome: `Pacote ${pacotes.length + 1}`,
      destaque: false,
      itens: [emptyItem(form.divisao)],
    };
    setPacotes([...pacotes, newPacote]);
    setPacoteAtivo(pacotes.length);
    setExpandedItem(0);
  };

  const removePacote = (idx: number) => {
    if (pacotes.length <= 1) return;
    const newPacotes = pacotes.filter((_, i) => i !== idx);
    setPacotes(newPacotes);
    setPacoteAtivo(Math.min(pacoteAtivo, newPacotes.length - 1));
    setExpandedItem(0);
  };

  const updatePacoteNome = (idx: number, nome: string) => {
    setPacotes(prev => prev.map((p, i) => i === idx ? { ...p, nome } : p));
  };

  const setDestaquePacote = (idx: number) => {
    setPacotes(prev => prev.map((p, i) => ({ ...p, destaque: i === idx })));
  };

  // ── Totais ────────────────────────────────────────────────────────────────

  const subtotal = form.tipo === 'simples'
    ? itens.reduce((acc, item) => acc + (Number(item.valor) || 0) * (Number(item.quantidade) || 1), 0)
    : 0;
  const total = subtotal - (Number(form.desconto) || 0);

  const pacoteTotais = pacotes.map(p =>
    p.itens.reduce((acc, item) => acc + (Number(item.valor) || 0) * (Number(item.quantidade) || 1), 0)
  );

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent, newStatus?: string) {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    console.log('=== INICIANDO SALVAMENTO ===');
    console.log('User ID:', user?.id);
    console.log('Form:', form);

    try {
      if (!form.projeto_titulo.trim()) throw new Error('Título do projeto é obrigatório');
      if (!form.numero.trim()) throw new Error('Número do orçamento é obrigatório');
      if (!form.slug.trim()) throw new Error('Slug é obrigatório');

      const orcamentoData = {
        numero: form.numero,
        slug: form.slug,
        cliente_id: form.cliente_id || null,
        criado_por: user?.id || null,
        projeto_titulo: form.projeto_titulo,
        projeto_descricao: form.projeto_descricao || null,
        divisao: form.divisao,
        validade: form.validade || null,
        desconto: Number(form.desconto) || 0,
        observacoes: form.observacoes || null,
        condicoes_pagamento: form.condicoes_pagamento || null,
        prazo_entrega: form.prazo_entrega || null,
        status: newStatus || form.status,
        tipo: form.tipo,
      };

      console.log('Dados do orçamento a salvar:', orcamentoData);

      let orcamentoId = params?.id as string;

      if (isEditing) {
        console.log('Atualizando orçamento existente:', orcamentoId);
        const { error } = await supabase
          .from('orcamentos')
          .update(orcamentoData)
          .eq('id', orcamentoId);
        if (error) throw error;

        const { error: deleteError } = await supabase
          .from('orcamento_itens')
          .delete()
          .eq('orcamento_id', orcamentoId);
        if (deleteError) console.error('Erro ao deletar itens antigos:', deleteError);
      } else {
        console.log('Criando novo orçamento');
        const { data, error } = await supabase
          .from('orcamentos')
          .insert(orcamentoData)
          .select()
          .single();
        if (error) throw error;
        console.log('Orçamento criado:', data);
        orcamentoId = data.id;
      }

      // Montar itens para inserção
      let itensToInsert: any[] = [];

      if (form.tipo === 'simples') {
        itensToInsert = itens
          .filter(item => item.nome && item.valor)
          .map((item, index) => ({
            orcamento_id: orcamentoId,
            categoria: item.categoria,
            nome: item.nome,
            descricao: item.descricao || null,
            valor: Number(item.valor),
            quantidade: Number(item.quantidade) || 1,
            detalhes: item.detalhes
              .filter(d => d.texto.trim())
              .map(d => ({ texto: d.texto, valor: d.valor ? Number(d.valor) : null })),
            ordem: index,
            pacote: null,
            pacote_destaque: false,
            valor_mensal: item.valor_mensal ? Number(item.valor_mensal) : null,
            descricao_mensal: item.descricao_mensal || null,
          }));
      } else {
        let ordem = 0;
        for (const pacote of pacotes) {
          for (const item of pacote.itens.filter(i => i.nome && i.valor)) {
            itensToInsert.push({
              orcamento_id: orcamentoId,
              categoria: item.categoria,
              nome: item.nome,
              descricao: item.descricao || null,
              valor: Number(item.valor),
              quantidade: Number(item.quantidade) || 1,
              detalhes: item.detalhes
                .filter(d => d.texto.trim())
                .map(d => ({ texto: d.texto, valor: d.valor ? Number(d.valor) : null })),
              ordem: ordem++,
              pacote: pacote.nome,
              pacote_destaque: pacote.destaque,
              valor_mensal: item.valor_mensal ? Number(item.valor_mensal) : null,
              descricao_mensal: item.descricao_mensal || null,
            });
          }
        }
      }

      console.log('Itens a inserir:', itensToInsert);

      if (itensToInsert.length > 0) {
        const { error: itensError } = await supabase
          .from('orcamento_itens')
          .insert(itensToInsert);
        if (itensError) throw itensError;
      }

      console.log('=== SALVAMENTO CONCLUÍDO COM SUCESSO ===');
      router.push('/admin/orcamentos');

    } catch (err: any) {
      console.error('=== ERRO NO SALVAMENTO ===', err);
      const mensagem = err.message || err.details || 'Erro desconhecido ao salvar';
      setErrorMsg(mensagem);
      alert('Erro ao salvar: ' + mensagem);
    } finally {
      setSaving(false);
    }
  }

  async function handleNovoCliente(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nome: formData.get('nome'),
        empresa: formData.get('empresa') || null,
        email: formData.get('email') || null,
        telefone: formData.get('telefone') || null
      })
      .select()
      .single();

    if (error) { alert('Erro ao criar cliente: ' + error.message); return; }
    await fetchClientes();
    setForm(f => ({ ...f, cliente_id: data.id }));
    setShowNovoCliente(false);
  }

  const divisaoConfig = DIVISAO_CONFIG[form.divisao];
  const activeItens = getActiveItens();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Seção de itens (reutilizada em simples e dentro de cada pacote) ────────
  function renderItemsSection() {
    return (
      <div className="space-y-4">
        {activeItens.map((item, itemIndex) => (
          <div
            key={itemIndex}
            className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden"
          >
            {/* Header do item */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/80"
              onClick={() => setExpandedItem(expandedItem === itemIndex ? null : itemIndex)}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm font-medium">
                  {itemIndex + 1}
                </span>
                <div>
                  <p className="font-medium text-white">{item.nome || 'Novo item'}</p>
                  <p className="text-sm text-gray-500">{item.categoria}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {item.valor && (
                  <div className="text-right">
                    <span className="font-semibold text-white">
                      R$ {(Number(item.valor) * Number(item.quantidade || 1)).toLocaleString('pt-BR')}
                    </span>
                    {item.valor_mensal && (
                      <p className="text-xs text-gray-400">
                        + R$ {Number(item.valor_mensal).toLocaleString('pt-BR')}/mês
                      </p>
                    )}
                  </div>
                )}
                {expandedItem === itemIndex ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {/* Conteúdo expandido */}
            {expandedItem === itemIndex && (
              <div className="p-4 pt-0 border-t border-gray-700 space-y-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                    <select
                      value={item.categoria}
                      onChange={(e) => updateItem(itemIndex, 'categoria', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                    >
                      {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Nome *</label>
                    <input
                      type="text"
                      value={item.nome}
                      onChange={(e) => updateItem(itemIndex, 'nome', e.target.value)}
                      placeholder="Ex: Landing Page"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-1">Valor *</label>
                      <input
                        type="number"
                        value={item.valor}
                        onChange={(e) => updateItem(itemIndex, 'valor', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                      />
                    </div>
                    <div className="w-20">
                      <label className="block text-sm text-gray-400 mb-1">Qtd</label>
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => updateItem(itemIndex, 'quantidade', e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Valor mensal */}
                <div className="grid md:grid-cols-2 gap-4 pt-1 border-t border-gray-700/50">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Valor mensal <span className="text-gray-600">(opcional)</span></label>
                    <input
                      type="number"
                      value={item.valor_mensal}
                      onChange={(e) => updateItem(itemIndex, 'valor_mensal', e.target.value)}
                      placeholder="Ex: 500"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Descrição do mensal</label>
                    <input
                      type="text"
                      value={item.descricao_mensal}
                      onChange={(e) => updateItem(itemIndex, 'descricao_mensal', e.target.value)}
                      placeholder="Ex: Manutenção, Hospedagem, Suporte"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                  <textarea
                    value={item.descricao}
                    onChange={(e) => updateItem(itemIndex, 'descricao', e.target.value)}
                    rows={2}
                    placeholder="Descrição breve do serviço..."
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">O que está incluso:</label>
                  <div className="space-y-2">
                    {item.detalhes.map((detalhe, detalheIndex) => (
                      <div key={detalheIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={detalhe.texto}
                          onChange={(e) => updateDetalhe(itemIndex, detalheIndex, 'texto', e.target.value)}
                          placeholder="Ex: Coordenador Geral, Ambulância..."
                          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                        />
                        <input
                          type="number"
                          value={detalhe.valor}
                          onChange={(e) => updateDetalhe(itemIndex, detalheIndex, 'valor', e.target.value)}
                          placeholder="Valor (opcional)"
                          className="w-28 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeDetalhe(itemIndex, detalheIndex)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addDetalhe(itemIndex)}
                      className="text-sm text-purple-400 hover:text-purple-300"
                    >
                      + Adicionar item
                    </button>

                    {item.detalhes.some(d => d.valor && Number(d.valor) > 0) && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Subtotal dos itens:</span>
                          <span className="font-medium">
                            {item.detalhes.reduce((acc, d) => acc + (Number(d.valor) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                        {Math.abs(item.detalhes.reduce((acc, d) => acc + (Number(d.valor) || 0), 0) - Number(item.valor)) > 0.01 && Number(item.valor) > 0 && (
                          <p className="text-xs text-yellow-400 mt-1">
                            ⚠️ Subtotal diferente do valor do item ({Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {activeItens.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(itemIndex)}
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                    Remover este item
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orcamentos" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h1>
          <p className="text-gray-400">{form.numero || 'Gerando número...'}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <p className="font-medium">Erro:</p>
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Divisão */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
          <h2 className="font-semibold text-lg mb-4">Divisão</h2>
          <div className="grid grid-cols-3 gap-4">
            {(['tech', 'sports', 'studio'] as const).map((div) => {
              const config = DIVISAO_CONFIG[div];
              const isSelected = form.divisao === div;
              return (
                <button
                  key={div}
                  type="button"
                  onClick={() => setForm({ ...form, divisao: div })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? `${config.borderColor} ${config.bgLight}`
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <p className={`font-semibold ${isSelected ? config.textColor : 'text-white'}`}>
                    {config.nome}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tipo de Orçamento */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
          <h2 className="font-semibold text-lg mb-4">Tipo de Orçamento</h2>
          <div className="grid grid-cols-2 gap-4">
            {([
              { value: 'simples' as const, label: 'Orçamento Simples', desc: 'Lista única de serviços' },
              { value: 'pacotes' as const, label: 'Com Pacotes', desc: 'Ex: Básico, Intermediário, Premium' },
            ]).map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, tipo: value })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  form.tipo === value
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <p className={`font-semibold ${form.tipo === value ? 'text-purple-400' : 'text-white'}`}>
                  {label}
                </p>
                <p className="text-sm text-gray-400 mt-1">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Informações do Projeto */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-lg mb-4">Informações do Projeto</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Título do Projeto *</label>
              <input
                type="text"
                value={form.projeto_titulo}
                onChange={(e) => setForm({ ...form, projeto_titulo: e.target.value })}
                placeholder="Ex: Vídeo Institucional + Landing Page"
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Descrição</label>
              <textarea
                value={form.projeto_descricao}
                onChange={(e) => setForm({ ...form, projeto_descricao: e.target.value })}
                rows={3}
                placeholder="Descreva brevemente o projeto..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Cliente</label>
              <div className="flex gap-2">
                <select
                  value={form.cliente_id}
                  onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} {c.empresa && `(${c.empresa})`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNovoCliente(true)}
                  className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Válido até</label>
              <input
                type="date"
                value={form.validade}
                onChange={(e) => setForm({ ...form, validade: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
              />
            </div>
          </div>
        </div>

        {/* ── Itens (simples) ────────────────────────────────────────────────── */}
        {form.tipo === 'simples' && (
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Serviços / Itens</h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition-colors"
              >
                <Plus size={16} />
                Adicionar
              </button>
            </div>
            {renderItemsSection()}
          </div>
        )}

        {/* ── Pacotes ────────────────────────────────────────────────────────── */}
        {form.tipo === 'pacotes' && (
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">Pacotes</h2>
              <button
                type="button"
                onClick={addPacote}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
              >
                <Plus size={16} />
                Novo Pacote
              </button>
            </div>

            {/* Tabs dos pacotes */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {pacotes.map((pacote, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setPacoteAtivo(idx); setExpandedItem(0); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    pacoteAtivo === idx
                      ? `bg-gradient-to-r ${divisaoConfig.gradiente} text-white`
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {pacote.destaque && <Star size={12} className="fill-current" />}
                  {pacote.nome}
                  {pacoteTotais[idx] > 0 && (
                    <span className="text-xs opacity-75">
                      R$ {pacoteTotais[idx].toLocaleString('pt-BR')}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Pacote ativo */}
            {pacotes[pacoteAtivo] && (
              <div>
                {/* Cabeçalho do pacote */}
                <div className="flex flex-wrap items-end gap-3 mb-6 pb-4 border-b border-gray-700">
                  <div className="flex-1 min-w-40">
                    <label className="block text-xs text-gray-400 mb-1">Nome do pacote</label>
                    <input
                      type="text"
                      value={pacotes[pacoteAtivo].nome}
                      onChange={(e) => updatePacoteNome(pacoteAtivo, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDestaquePacote(pacoteAtivo)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        pacotes[pacoteAtivo].destaque
                          ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                          : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-yellow-500/30 hover:text-yellow-400'
                      }`}
                    >
                      <Star size={14} className={pacotes[pacoteAtivo].destaque ? 'fill-yellow-400' : ''} />
                      {pacotes[pacoteAtivo].destaque ? 'Destaque' : 'Marcar como destaque'}
                    </button>
                    {pacotes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePacote(pacoteAtivo)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-800 border border-gray-700 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                        Remover
                      </button>
                    )}
                  </div>
                </div>

                {/* Itens do pacote */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-400">
                    Itens do pacote <span className="text-white font-medium">{pacotes[pacoteAtivo].nome}</span>
                  </p>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition-colors"
                  >
                    <Plus size={16} />
                    Adicionar
                  </button>
                </div>

                {renderItemsSection()}

                {/* Total do pacote */}
                {pacoteTotais[pacoteAtivo] > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                    <span className="text-gray-400">Total deste pacote:</span>
                    <span className={`text-xl font-bold bg-gradient-to-r ${divisaoConfig.gradiente} bg-clip-text text-transparent`}>
                      R$ {pacoteTotais[pacoteAtivo].toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Valores e Condições */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-lg mb-4">Valores e Condições</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {form.tipo === 'simples' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Desconto (R$)</label>
                  <input
                    type="number"
                    value={form.desconto}
                    onChange={(e) => setForm({ ...form, desconto: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Prazo de Entrega</label>
                <input
                  type="text"
                  value={form.prazo_entrega}
                  onChange={(e) => setForm({ ...form, prazo_entrega: e.target.value })}
                  placeholder="Ex: 30 dias úteis após aprovação"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Condições de Pagamento</label>
                <input
                  type="text"
                  value={form.condicoes_pagamento}
                  onChange={(e) => setForm({ ...form, condicoes_pagamento: e.target.value })}
                  placeholder="Ex: 50% na aprovação, 50% na entrega"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                />
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6">
              {form.tipo === 'simples' ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
                  </div>
                  {Number(form.desconto) > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Desconto</span>
                      <span>- R$ {Number(form.desconto).toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                  <div className="h-px bg-gray-700 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className={`text-2xl font-bold bg-gradient-to-r ${divisaoConfig.gradiente} bg-clip-text text-transparent`}>
                      R$ {total.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Totais por pacote</p>
                  {pacotes.map((pacote, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-300 flex items-center gap-2">
                        {pacote.destaque && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
                        {pacote.nome}
                      </span>
                      <span className={`font-semibold bg-gradient-to-r ${divisaoConfig.gradiente} bg-clip-text text-transparent`}>
                        R$ {pacoteTotais[idx].toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              rows={3}
              placeholder="Observações adicionais..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.push('/admin/orcamentos')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Salvar Rascunho
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e as any, 'enviado')}
            disabled={saving}
            className={`px-6 py-3 bg-gradient-to-r ${divisaoConfig.gradiente} hover:opacity-90 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            Salvar e Enviar
          </button>
        </div>
      </form>

      {/* Modal Novo Cliente */}
      {showNovoCliente && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-white">Novo Cliente</h3>
            <form onSubmit={handleNovoCliente} className="space-y-4">
              <input name="nome" placeholder="Nome *" required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white" />
              <input name="empresa" placeholder="Empresa" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white" />
              <input name="email" type="email" placeholder="Email" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white" />
              <input name="telefone" placeholder="Telefone" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNovoCliente(false)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors text-white">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors text-white">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
