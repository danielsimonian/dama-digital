// ============================================
// ARQUIVO: app/admin/page.tsx
// ============================================

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { supabase, Orcamento, formatarMoeda, formatarDataCurta, DIVISAO_CONFIG } from '@/lib/supabase';

type DashboardStats = {
  totalOrcamentos: number;
  orcamentosPendentes: number;
  orcamentosAprovados: number;
  valorTotal: number;
  valorAprovado: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrcamentos: 0,
    orcamentosPendentes: 0,
    orcamentosAprovados: 0,
    valorTotal: 0,
    valorAprovado: 0
  });
  const [recentOrcamentos, setRecentOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: orcamentos } = await supabase
        .from('orcamentos')
        .select(`
          *,
          cliente:clientes(nome, empresa),
          itens:orcamento_itens(valor, quantidade)
        `)
        .order('created_at', { ascending: false });

      if (orcamentos) {
        const pendentes = orcamentos.filter(o => 
          ['rascunho', 'enviado', 'visualizado'].includes(o.status)
        );
        const aprovados = orcamentos.filter(o => o.status === 'aprovado');

        const calcularValor = (orc: any) => {
          const subtotal = orc.itens?.reduce((acc: number, item: any) => 
            acc + (Number(item.valor) * Number(item.quantidade)), 0
          ) || 0;
          return subtotal - Number(orc.desconto || 0);
        };

        const valorTotal = orcamentos.reduce((acc, orc) => acc + calcularValor(orc), 0);
        const valorAprovado = aprovados.reduce((acc, orc) => acc + calcularValor(orc), 0);

        setStats({
          totalOrcamentos: orcamentos.length,
          orcamentosPendentes: pendentes.length,
          orcamentosAprovados: aprovados.length,
          valorTotal,
          valorAprovado
        });

        setRecentOrcamentos(orcamentos.slice(0, 5));
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400">Visão geral do seu negócio</p>
        </div>
        <Link
          href="/admin/orcamentos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-all"
        >
          <Plus size={20} />
          Novo Orçamento
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FileText className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Orçamentos</p>
              <p className="text-2xl font-bold">{stats.totalOrcamentos}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="text-yellow-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pendentes</p>
              <p className="text-2xl font-bold">{stats.orcamentosPendentes}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Aprovados</p>
              <p className="text-2xl font-bold">{stats.orcamentosAprovados}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Valor Aprovado</p>
              <p className="text-xl font-bold">{formatarMoeda(stats.valorAprovado)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quotes */}
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Orçamentos Recentes</h2>
          <Link 
            href="/admin/orcamentos"
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        {recentOrcamentos.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto mb-4 text-gray-600" size={48} />
            <p className="text-gray-400 mb-4">Nenhum orçamento ainda</p>
            <Link
              href="/admin/orcamentos/novo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition-colors"
            >
              <Plus size={16} />
              Criar primeiro orçamento
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentOrcamentos.map((orc: any) => {
              const statusConfig = getStatusConfig(orc.status);
              const divisaoConfig = DIVISAO_CONFIG[orc.divisao as keyof typeof DIVISAO_CONFIG];
              
              return (
                <Link
                  key={orc.id}
                  href={`/admin/orcamentos/${orc.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${divisaoConfig?.bgLight || 'bg-gray-800'} flex items-center justify-center`}>
                      <FileText className={divisaoConfig?.textColor || 'text-gray-400'} size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{orc.projeto_titulo}</p>
                      <p className="text-sm text-gray-500">
                        {orc.cliente?.empresa || orc.cliente?.nome || 'Sem cliente'} • {orc.numero}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <span className="text-sm text-gray-400 hidden sm:block">
                      {formatarDataCurta(orc.created_at)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}