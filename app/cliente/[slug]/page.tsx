// ============================================
// ARQUIVO: app/[slug]/page.tsx
// Página pública do cliente (acesso com senha)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Lock, 
  Loader2, 
  Music, 
  BookOpen, 
  Calendar,
  Clock,
  DollarSign,
  Video,
  FileIcon,
  PenTool,
  ExternalLink,
  Type,
  ChevronDown,
  ChevronUp,
  User,
  LogOut
} from 'lucide-react';
import { supabase, formatarMoeda, formatarData, DIVISAO_CONFIG } from '@/lib/supabase';

type Area = 'tech' | 'sports' | 'studio';
type Tab = 'sessoes' | 'aulas';
type TipoConteudo = 'video' | 'pdf' | 'exercicio' | 'link' | 'texto';

interface Cliente {
  id: string;
  nome: string;
  areas: Area[];
  slug: string;
  senha_acesso: string;
}

interface Sessao {
  id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  valor_hora: number;
  observacoes: string;
  pago: boolean;
}

interface Modulo {
  id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  conteudos?: Conteudo[];
}

interface Conteudo {
  id: string;
  tipo: TipoConteudo;
  titulo: string;
  descricao: string;
  url: string;
  conteudo: string;
  ordem: number;
}

export default function ClientePublicoPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState(false);
  const [verificandoSenha, setVerificandoSenha] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('sessoes');
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [expandedModulos, setExpandedModulos] = useState<string[]>([]);

  // Filtro de mês para sessões
  const [mesSessao, setMesSessao] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (slug) {
      fetchCliente();
    }
  }, [slug]);

  useEffect(() => {
    // Verificar se já está autenticado (sessionStorage)
    if (cliente) {
      const savedAuth = sessionStorage.getItem(`cliente_auth_${cliente.id}`);
      if (savedAuth === 'true') {
        setAutenticado(true);
        fetchDados();
      }
    }
  }, [cliente]);

  async function fetchCliente() {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, areas, slug, senha_acesso')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setCliente(null);
      } else {
        setCliente(data);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDados() {
    if (!cliente) return;

    // Buscar sessões
    const { data: sessoesData } = await supabase
      .from('sessoes')
      .select('*')
      .eq('cliente_id', cliente.id)
      .order('data', { ascending: false });

    setSessoes(sessoesData || []);

    // Buscar módulos com conteúdos
    const { data: modulosData } = await supabase
      .from('aulas_modulos')
      .select(`
        *,
        conteudos:aulas_conteudos(*)
      `)
      .eq('cliente_id', cliente.id)
      .order('ordem', { ascending: true });

    const modulosOrdenados = (modulosData || []).map(m => ({
      ...m,
      conteudos: m.conteudos?.sort((a: Conteudo, b: Conteudo) => a.ordem - b.ordem) || []
    }));

    setModulos(modulosOrdenados);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setVerificandoSenha(true);
    setErroSenha(false);

    // Simular delay para feedback visual
    setTimeout(() => {
      if (senha === cliente?.senha_acesso) {
        setAutenticado(true);
        sessionStorage.setItem(`cliente_auth_${cliente.id}`, 'true');
        fetchDados();
      } else {
        setErroSenha(true);
      }
      setVerificandoSenha(false);
    }, 500);
  }

  function handleLogout() {
    if (cliente) {
      sessionStorage.removeItem(`cliente_auth_${cliente.id}`);
    }
    setAutenticado(false);
    setSenha('');
  }

  // Funções auxiliares
  function calcularHoras(inicio: string, fim: string): number {
    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const [hFim, mFim] = fim.split(':').map(Number);
    const minutosInicio = hInicio * 60 + mInicio;
    const minutosFim = hFim * 60 + mFim;
    return (minutosFim - minutosInicio) / 60;
  }

  function formatarHoras(horas: number): string {
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  }

  function getDiaSemana(dataStr: string): string {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const data = new Date(dataStr + 'T00:00:00');
    return dias[data.getDay()];
  }

  function toggleModulo(moduloId: string) {
    setExpandedModulos(prev => 
      prev.includes(moduloId) 
        ? prev.filter(id => id !== moduloId)
        : [...prev, moduloId]
    );
  }

  const tiposConteudo: { value: TipoConteudo; label: string; icon: any }[] = [
    { value: 'video', label: 'Vídeo', icon: Video },
    { value: 'pdf', label: 'PDF', icon: FileIcon },
    { value: 'exercicio', label: 'Exercício', icon: PenTool },
    { value: 'link', label: 'Link', icon: ExternalLink },
    { value: 'texto', label: 'Texto', icon: Type },
  ];

  function getTipoConfig(tipo: TipoConteudo) {
    return tiposConteudo.find(t => t.value === tipo) || tiposConteudo[0];
  }

  // Filtrar sessões por mês
  const sessoesFiltradas = sessoes.filter(s => s.data.startsWith(mesSessao));

  // Calcular resumo do mês
  const resumoMes = sessoesFiltradas.reduce((acc, s) => {
    const horas = calcularHoras(s.hora_inicio, s.hora_fim);
    const valor = horas * Number(s.valor_hora);
    return {
      totalHoras: acc.totalHoras + horas,
      totalValor: acc.totalValor + valor,
      valorAberto: acc.valorAberto + (s.pago ? 0 : valor),
      qtdSessoes: acc.qtdSessoes + 1
    };
  }, { totalHoras: 0, totalValor: 0, valorAberto: 0, qtdSessoes: 0 });

  // Verificar se cliente é Studio
  const isStudio = cliente?.areas?.includes('studio') || false;

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Cliente não encontrado
  if (!cliente) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
          <p className="text-gray-400">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  // Tela de Login
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
              <span className="text-white font-bold text-2xl">D</span>
            </div>
            <h1 className="text-xl font-bold text-white">DAMA Studio</h1>
            <p className="text-gray-400 mt-1">Área do Cliente</p>
          </div>

          {/* Card de Login */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-3">
                <User size={24} className="text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">{cliente.nome}</h2>
              <p className="text-sm text-gray-400">Digite sua senha para acessar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setErroSenha(false);
                    }}
                    placeholder="Senha de acesso"
                    className={`w-full pl-12 pr-4 py-3 bg-gray-800 border rounded-xl focus:outline-none text-white ${
                      erroSenha 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-700 focus:border-blue-500'
                    }`}
                    autoFocus
                  />
                </div>
                {erroSenha && (
                  <p className="text-red-400 text-sm mt-2">Senha incorreta. Tente novamente.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={verificandoSenha || !senha}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-medium transition-colors text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verificandoSenha ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Precisa de ajuda? Entre em contato com a DAMA.
          </p>
        </div>
      </div>
    );
  }

  // Área do Cliente (autenticado)
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <div>
                <h1 className="font-semibold">{cliente.nome}</h1>
                <p className="text-xs text-gray-400">DAMA Studio</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {isStudio && (
          <div className="max-w-4xl mx-auto px-4">
            <nav className="flex gap-1 -mb-px">
              <button
                onClick={() => setActiveTab('sessoes')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'sessoes'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Music size={18} />
                Sessões
              </button>
              <button
                onClick={() => setActiveTab('aulas')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'aulas'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen size={18} />
                Aulas
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab: Sessões */}
        {activeTab === 'sessoes' && (
          <div className="space-y-6">
            {/* Filtro de Mês */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Suas Sessões</h2>
              <input
                type="month"
                value={mesSessao}
                onChange={(e) => setMesSessao(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white text-sm"
              />
            </div>

            {/* Resumo do Mês */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <p className="text-xs text-gray-400 mb-1">Sessões</p>
                <p className="text-xl font-bold">{resumoMes.qtdSessoes}</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <p className="text-xs text-gray-400 mb-1">Horas</p>
                <p className="text-xl font-bold">{formatarHoras(resumoMes.totalHoras)}</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <p className="text-xs text-gray-400 mb-1">Total</p>
                <p className="text-xl font-bold text-blue-400">{formatarMoeda(resumoMes.totalValor)}</p>
              </div>

              <div className={`bg-gray-900/50 rounded-xl border p-4 ${resumoMes.valorAberto > 0 ? 'border-yellow-500/30' : 'border-emerald-500/30'}`}>
                <p className={`text-xs mb-1 ${resumoMes.valorAberto > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  Em Aberto
                </p>
                <p className={`text-xl font-bold ${resumoMes.valorAberto > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  {formatarMoeda(resumoMes.valorAberto)}
                </p>
              </div>
            </div>

            {/* Lista de Sessões */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
              {sessoesFiltradas.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Music size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhuma sessão neste mês</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {sessoesFiltradas.map((sessao) => {
                    const horas = calcularHoras(sessao.hora_inicio, sessao.hora_fim);
                    const valor = horas * Number(sessao.valor_hora);
                    
                    return (
                      <div
                        key={sessao.id}
                        className={`p-4 ${sessao.pago ? 'bg-emerald-500/5' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{formatarData(sessao.data)}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                                {getDiaSemana(sessao.data)}
                              </span>
                              {sessao.pago && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                                  Pago
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {sessao.hora_inicio} - {sessao.hora_fim}
                              </span>
                              <span>{formatarHoras(horas)}</span>
                            </div>
                          </div>
                          
                          <p className={`text-lg font-bold ${sessao.pago ? 'text-gray-500' : 'text-blue-400'}`}>
                            {formatarMoeda(valor)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Aulas */}
        {activeTab === 'aulas' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Suas Aulas</h2>

            {modulos.length === 0 ? (
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-12 text-center">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Nenhum conteúdo disponível ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modulos.map((modulo, index) => {
                  const isExpanded = expandedModulos.includes(modulo.id);
                  
                  return (
                    <div
                      key={modulo.id}
                      className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden"
                    >
                      {/* Header do Módulo */}
                      <button
                        onClick={() => toggleModulo(modulo.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                            {index + 1}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-white">{modulo.titulo}</h3>
                            {modulo.descricao && (
                              <p className="text-sm text-gray-400">{modulo.descricao}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {modulo.conteudos?.length || 0} itens
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={20} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Conteúdos */}
                      {isExpanded && modulo.conteudos && modulo.conteudos.length > 0 && (
                        <div className="border-t border-gray-800 divide-y divide-gray-800">
                          {modulo.conteudos.map((conteudo) => {
                            const tipoConfig = getTipoConfig(conteudo.tipo);
                            const TipoIcon = tipoConfig.icon;
                            
                            return (
                              <div
                                key={conteudo.id}
                                className="p-4 hover:bg-gray-800/30 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                                    <TipoIcon size={20} className="text-blue-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white">{conteudo.titulo}</h4>
                                    {conteudo.descricao && (
                                      <p className="text-sm text-gray-400 mt-1">{conteudo.descricao}</p>
                                    )}
                                    
                                    {/* Conteúdo baseado no tipo */}
                                    {conteudo.url && (
                                      <a
                                        href={conteudo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors"
                                      >
                                        {conteudo.tipo === 'video' && 'Assistir Vídeo'}
                                        {conteudo.tipo === 'pdf' && 'Abrir PDF'}
                                        {conteudo.tipo === 'link' && 'Abrir Link'}
                                        <ExternalLink size={14} />
                                      </a>
                                    )}
                                    
                                    {conteudo.conteudo && (
                                      <div className="mt-3 p-4 bg-gray-800/50 rounded-xl text-sm text-gray-300 whitespace-pre-wrap">
                                        {conteudo.conteudo}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            DAMA Digital Criativa • damadigitalcriativa.com.br
          </p>
        </div>
      </footer>
    </div>
  );
}