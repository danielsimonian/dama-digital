// ============================================
// ARQUIVO: app/admin/clientes/page.tsx
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  MoreVertical,
  Pencil,
  Trash2,
  Users,
  Mail,
  Phone,
  Building,
  X,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { supabase, DIVISAO_CONFIG } from '@/lib/supabase';

type Area = 'tech' | 'sports' | 'studio';

interface Cliente {
  id: string;
  nome: string;
  empresa?: string;
  email?: string;
  telefone?: string;
  documento?: string;
  endereco?: string;
  notas?: string;
  areas?: Area[];
  slug?: string;
  senha_acesso?: string;
}

// Função para gerar slug a partir do nome
function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
    .replace(/\s+/g, '-') // espaços viram hífens
    .replace(/-+/g, '-') // múltiplos hífens viram um
    .trim();
}

// Função para gerar senha aleatória
function gerarSenha(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let senha = '';
  for (let i = 0; i < 6; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    documento: '',
    endereco: '',
    notas: '',
    areas: [] as Area[],
    slug: '',
    senha_acesso: ''
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');

    if (!error && data) {
      setClientes(data);
    }
    setLoading(false);
  }

  const filteredClientes = clientes.filter(cliente => {
    const searchLower = search.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(searchLower) ||
      cliente.empresa?.toLowerCase().includes(searchLower) ||
      cliente.email?.toLowerCase().includes(searchLower) ||
      cliente.telefone?.includes(search)
    );
  });

  function openModal(cliente?: Cliente) {
    if (cliente) {
      setEditingCliente(cliente);
      setForm({
        nome: cliente.nome,
        empresa: cliente.empresa || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        documento: cliente.documento || '',
        endereco: cliente.endereco || '',
        notas: cliente.notas || '',
        areas: cliente.areas || [],
        slug: cliente.slug || '',
        senha_acesso: cliente.senha_acesso || ''
      });
    } else {
      setEditingCliente(null);
      setForm({
        nome: '',
        empresa: '',
        email: '',
        telefone: '',
        documento: '',
        endereco: '',
        notas: '',
        areas: [],
        slug: '',
        senha_acesso: gerarSenha()
      });
    }
    setShowModal(true);
    setMenuOpen(null);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCliente(null);
    setForm({
      nome: '',
      empresa: '',
      email: '',
      telefone: '',
      documento: '',
      endereco: '',
      notas: '',
      areas: [],
      slug: '',
      senha_acesso: ''
    });
  }

  // Toggle área selecionada
  function toggleArea(area: Area) {
    setForm(prev => {
      const areas = prev.areas.includes(area)
        ? prev.areas.filter(a => a !== area)
        : [...prev.areas, area];
      return { ...prev, areas };
    });
  }

  // Atualizar slug quando nome mudar
  function handleNomeChange(nome: string) {
    const novoSlug = editingCliente?.slug || gerarSlug(nome);
    setForm(prev => ({
      ...prev,
      nome,
      slug: editingCliente ? prev.slug : novoSlug
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const clienteData = {
        nome: form.nome,
        empresa: form.empresa || null,
        email: form.email || null,
        telefone: form.telefone || null,
        documento: form.documento || null,
        endereco: form.endereco || null,
        notas: form.notas || null,
        areas: form.areas,
        slug: form.slug || gerarSlug(form.nome),
        senha_acesso: form.senha_acesso || gerarSenha()
      };

      if (editingCliente) {
        const { error } = await supabase
          .from('clientes')
          .update(clienteData)
          .eq('id', editingCliente.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert(clienteData);

        if (error) throw error;
      }

      await fetchClientes();
      closeModal();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCliente(id: string) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao excluir: ' + error.message);
      return;
    }

    setClientes(clientes.filter(c => c.id !== id));
    setMenuOpen(null);
  }

  function goToCliente(clienteId: string) {
    router.push(`/admin/clientes/${clienteId}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-gray-400">Gerencie sua base de clientes</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-all"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome, empresa, email ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-white"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredClientes.length === 0 ? (
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-12 text-center">
          <Users className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-400 mb-4">
            {search 
              ? 'Nenhum cliente encontrado com essa busca'
              : 'Nenhum cliente cadastrado ainda'
            }
          </p>
          {!search && (
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition-colors"
            >
              <Plus size={16} />
              Cadastrar primeiro cliente
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClientes.map((cliente) => (
            <div
              key={cliente.id}
              onClick={() => goToCliente(cliente.id)}
              className="bg-gray-900/50 rounded-2xl border border-gray-800 p-5 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 font-semibold text-lg">
                      {cliente.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">{cliente.nome}</h3>
                    {cliente.empresa && (
                      <p className="text-sm text-gray-500">{cliente.empresa}</p>
                    )}
                  </div>
                </div>
                
                <div className="relative flex items-center gap-1">
                  <ChevronRight size={18} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === cliente.id ? null : cliente.id);
                    }}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <MoreVertical size={18} className="text-gray-400" />
                  </button>
                  
                  {menuOpen === cliente.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                        }}
                      />
                      <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800 rounded-xl border border-gray-700 shadow-xl z-20 overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(cliente);
                          }}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 transition-colors w-full text-white"
                        >
                          <Pencil size={16} />
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCliente(cliente.id);
                          }}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 transition-colors w-full text-red-400"
                        >
                          <Trash2 size={16} />
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Badges das áreas */}
              {cliente.areas && cliente.areas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {cliente.areas.map((area) => {
                    const config = DIVISAO_CONFIG[area];
                    return (
                      <span
                        key={area}
                        className={`text-xs px-2 py-1 rounded-full ${config.bgLight} ${config.textColor}`}
                      >
                        {config.nome}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2">
                {cliente.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail size={14} />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                )}
                {cliente.telefone && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone size={14} />
                    <span>{cliente.telefone}</span>
                  </div>
                )}
                {!cliente.email && !cliente.telefone && (
                  <p className="text-sm text-gray-600 italic">Sem contato cadastrado</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seleção de Áreas */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Áreas do Cliente *</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['tech', 'sports', 'studio'] as const).map((area) => {
                    const config = DIVISAO_CONFIG[area];
                    const isSelected = form.areas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleArea(area)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          isSelected 
                            ? `${config.borderColor} ${config.bgLight}` 
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <p className={`font-medium text-sm ${isSelected ? config.textColor : 'text-gray-400'}`}>
                          {config.nome}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {form.areas.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">Selecione pelo menos uma área</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  placeholder="Nome completo"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              {/* Slug e Senha */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">URL (slug)</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="nome-do-cliente"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">/cliente/{form.slug || 'nome-do-cliente'}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Senha de Acesso</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.senha_acesso}
                      onChange={(e) => setForm({ ...form, senha_acesso: e.target.value })}
                      placeholder="abc123"
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, senha_acesso: gerarSenha() })}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-xs transition-colors"
                    >
                      Gerar
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Empresa</label>
                <input
                  type="text"
                  value={form.empresa}
                  onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                  placeholder="Nome da empresa"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">CPF / CNPJ</label>
                <input
                  type="text"
                  value={form.documento}
                  onChange={(e) => setForm({ ...form, documento: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Endereço</label>
                <input
                  type="text"
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  placeholder="Rua, número, cidade..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Observações</label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  placeholder="Anotações sobre o cliente..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || form.areas.length === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-colors text-white disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}