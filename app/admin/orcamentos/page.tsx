// ============================================
// ARQUIVO: app/admin/orcamentos/page.tsx
// ============================================

'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Copy,
  Pencil,
  Trash2,
  ExternalLink,
  FileText
} from 'lucide-react';
import { supabase, Orcamento, formatarMoeda, formatarDataCurta, DIVISAO_CONFIG } from '@/lib/supabase';

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  // Fechar menu ao fazer scroll
  useEffect(() => {
    const handleScroll = () => setMenuOpen(null);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  async function fetchOrcamentos() {
    const { data, error } = await supabase
      .from('orcamentos')
      .select(`
        *,
        cliente:clientes(nome, empresa),
        itens:orcamento_itens(valor, quantidade)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrcamentos(data);
    }
    setLoading(false);
  }

  const filteredOrcamentos = orcamentos.filter(orc => {
    const matchSearch = 
      orc.projeto_titulo.toLowerCase().includes(search.toLowerCase()) ||
      orc.numero.toLowerCase().includes(search.toLowerCase()) ||
      orc.cliente?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      orc.cliente?.empresa?.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = statusFilter === 'todos' || orc.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/orcamento/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteOrcamento = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;
    
    await supabase.from('orcamentos').delete().eq('id', id);
    setOrcamentos(orcamentos.filter(o => o.id !== id));
    setMenuOpen(null);
  };

  const toggleMenu = (id: string) => {
    if (menuOpen === id) {
      setMenuOpen(null);
      return;
    }

    const button = menuButtonRefs.current[id];
    if (button) {
      const rect = button.getBoundingClientRect();
      const menuWidth = 192; // w-48 = 12rem = 192px
      const menuHeight = 144; // altura aproximada do menu
      
      let top = rect.bottom + 4;
      let left = rect.right - menuWidth;

      // Se não cabe embaixo, abre pra cima
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4;
      }

      // Se sair da tela pela esquerda
      if (left < 8) {
        left = 8;
      }

      setMenuPosition({ top, left });
    }
    
    setMenuOpen(id);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'aprovado':
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Aprovado' };
      case 'recusado':
        return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Recusado' };
      case 'visualizado':
        return { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Visualizado' };
      case 'enviado':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Enviado' };
      case 'expirado':
        return { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Expirado' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Rascunho' };
    }
  };

  const calcularTotal = (orc: any) => {
    const subtotal = orc.itens?.reduce((acc: number, item: any) => 
      acc + (Number(item.valor) * Number(item.quantidade)), 0
    ) || 0;
    return subtotal - Number(orc.desconto || 0);
  };

  // Encontrar o orçamento do menu aberto
  const currentOrc = menuOpen ? orcamentos.find(o => o.id === menuOpen) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <p className="text-gray-400">Gerencie seus orçamentos e propostas</p>
        </div>
        <Link
          href="/admin/orcamentos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-all"
        >
          <Plus size={20} />
          Novo Orçamento
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por título, número ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-white"
        >
          <option value="todos">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="enviado">Enviado</option>
          <option value="visualizado">Visualizado</option>
          <option value="aprovado">Aprovado</option>
          <option value="recusado">Recusado</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredOrcamentos.length === 0 ? (
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-12 text-center">
          <FileText className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-400 mb-4">
            {search || statusFilter !== 'todos' 
              ? 'Nenhum orçamento encontrado com esses filtros'
              : 'Nenhum orçamento ainda'
            }
          </p>
          {!search && statusFilter === 'todos' && (
            <Link
              href="/admin/orcamentos/novo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition-colors"
            >
              <Plus size={16} />
              Criar primeiro orçamento
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Projeto</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden md:table-cell">Cliente</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden lg:table-cell">Valor</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400 hidden sm:table-cell">Data</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredOrcamentos.map((orc) => {
                  const statusConfig = getStatusConfig(orc.status);
                  const divisaoConfig = DIVISAO_CONFIG[orc.divisao as keyof typeof DIVISAO_CONFIG];
                  
                  return (
                    <tr key={orc.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${divisaoConfig?.bgLight || 'bg-gray-800'} flex items-center justify-center flex-shrink-0`}>
                            <FileText className={divisaoConfig?.textColor || 'text-gray-400'} size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate text-white">{orc.projeto_titulo}</p>
                            <p className="text-sm text-gray-500">{orc.numero}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-gray-300">{orc.cliente?.empresa || orc.cliente?.nome || '-'}</p>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <p className="font-medium text-white">{formatarMoeda(calcularTotal(orc))}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 hidden sm:table-cell">
                        {formatarDataCurta(orc.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyLink(orc.slug)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Copiar link"
                          >
                            {copiedId === orc.slug ? (
                              <span className="text-xs text-emerald-400">Copiado!</span>
                            ) : (
                              <Copy size={18} className="text-gray-400" />
                            )}
                          </button>
                          
                          <button
                            ref={(el) => { menuButtonRefs.current[orc.id] = el; }}
                            onClick={() => toggleMenu(orc.id)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <MoreVertical size={18} className="text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Menu Dropdown - Renderizado fora da tabela com position fixed */}
      {menuOpen && currentOrc && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setMenuOpen(null)}
          />
          <div 
            className="fixed z-50 w-48 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden"
            style={{ 
              top: menuPosition.top, 
              left: menuPosition.left 
            }}
          >
            <Link
              href={`/admin/orcamentos/${currentOrc.id}`}
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 transition-colors text-white"
              onClick={() => setMenuOpen(null)}
            >
              <Pencil size={16} />
              Editar
            </Link>
            <Link
              href={`/orcamento/${currentOrc.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 transition-colors text-white"
              onClick={() => setMenuOpen(null)}
            >
              <ExternalLink size={16} />
              Visualizar
            </Link>
            <button
              onClick={() => deleteOrcamento(currentOrc.id)}
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-700 transition-colors w-full text-red-400"
            >
              <Trash2 size={16} />
              Excluir
            </button>
          </div>
        </>
      )}
    </div>
  );
}