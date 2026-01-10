'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

// ============================================
// PÁGINA DA LOJA - CLIENTE E VENDEDOR
// Rota: /labs/fidelidade/[slug]
// ============================================

interface Loja {
  nome: string;
  slug: string;
  meta: number;
  emoji: string;
}

interface DadosCliente {
  pontos: number;
  resgates: number;
  ganhouResgate?: boolean;
}

interface Mensagem {
  texto: string;
  tipo: string;
}

export default function LojaFidelidade() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const isAdmin = searchParams.get('admin') === '1';

  const [loja, setLoja] = useState<Loja | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Estados do cliente
  const [tela, setTela] = useState('cliente');
  const [telefone, setTelefone] = useState('');
  const [telefoneLogado, setTelefoneLogado] = useState('');
  const [dadosCliente, setDadosCliente] = useState<DadosCliente>({ pontos: 0, resgates: 0 });
  const [codigoInput, setCodigoInput] = useState('');

  // Estados do vendedor
  const [senhaInput, setSenhaInput] = useState('');
  const [codigoGerado, setCodigoGerado] = useState('');
  const [tempoRestante, setTempoRestante] = useState(0);

  // Mensagens
  const [mensagem, setMensagem] = useState<Mensagem>({ texto: '', tipo: '' });

  // Carrega dados da loja
  useEffect(() => {
    const carregarLoja = async () => {
      try {
        const res = await fetch(`/api/fidelidade/loja?slug=${slug}`);
        const data = await res.json();

        if (!res.ok) {
          setErro(data.erro || 'Loja não encontrada');
          return;
        }

        setLoja(data);
      } catch {
        setErro('Erro ao carregar loja');
      } finally {
        setLoading(false);
      }
    };

    if (slug) carregarLoja();
  }, [slug]);

  // Timer do código
  useEffect(() => {
    if (codigoGerado && tempoRestante > 0) {
      const timer = setTimeout(() => setTempoRestante(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (tempoRestante === 0 && codigoGerado) {
      setCodigoGerado('');
    }
  }, [tempoRestante, codigoGerado]);

  const mostrarMensagem = (texto: string, tipo: string = 'sucesso') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem({ texto: '', tipo: '' }), 4000);
  };

  // Formata telefone
  const formatarTelefone = (valor: string): string => {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  };

  // Cliente faz login
  const loginCliente = async () => {
    const tel = telefone.replace(/\D/g, '');
    if (tel.length < 10) {
      mostrarMensagem('Digite um telefone válido', 'erro');
      return;
    }

    try {
      const res = await fetch(`/api/fidelidade/cliente?slug=${slug}&telefone=${tel}`);
      const data = await res.json();

      if (res.ok) {
        setDadosCliente(data);
        setTelefoneLogado(tel);
      }
    } catch {
      mostrarMensagem('Erro de conexão', 'erro');
    }
  };

  // Cliente adiciona ponto
  const adicionarPonto = async () => {
    if (!codigoInput || codigoInput.length !== 6) {
      mostrarMensagem('Digite o código de 6 dígitos', 'erro');
      return;
    }

    try {
      const res = await fetch('/api/fidelidade/ponto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          telefone: telefoneLogado,
          codigo: codigoInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarMensagem(data.erro || 'Erro ao adicionar ponto', 'erro');
        return;
      }

      setDadosCliente(data);
      setCodigoInput('');

      if (data.ganhouResgate) {
        mostrarMensagem('🎉 PARABÉNS! Você ganhou 1 grátis!', 'especial');
      } else {
        mostrarMensagem(`+1 ponto! Faltam ${loja!.meta - data.pontos} para o grátis`);
      }
    } catch {
      mostrarMensagem('Erro de conexão', 'erro');
    }
  };

  // Cliente resgata
  const resgatarPremio = async () => {
    try {
      const res = await fetch('/api/fidelidade/resgate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          telefone: telefoneLogado,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarMensagem(data.erro || 'Erro ao resgatar', 'erro');
        return;
      }

      setDadosCliente(data);
      mostrarMensagem('✅ Resgatado! Mostre essa tela pro vendedor', 'especial');
    } catch {
      mostrarMensagem('Erro de conexão', 'erro');
    }
  };

  // Vendedor gera código
  const gerarCodigo = async () => {
    if (senhaInput.length < 4) {
      mostrarMensagem('Digite a senha', 'erro');
      return;
    }

    try {
      const res = await fetch('/api/fidelidade/codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          senha: senhaInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarMensagem(data.erro || 'Senha incorreta', 'erro');
        return;
      }

      setCodigoGerado(data.codigo);
      setTempoRestante(300); // 5 minutos
    } catch {
      mostrarMensagem('Erro de conexão', 'erro');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  // Erro state
  if (erro || !loja) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Ops!</h1>
          <p className="text-gray-500 mb-6">{erro || 'Loja não encontrada'}</p>
          <a
            href="/labs/fidelidade"
            className="inline-block px-6 py-3 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 transition-colors"
          >
            Criar um cartão fidelidade
          </a>
        </div>
      </div>
    );
  }

  // Cores baseadas no emoji (simplificado)
  const cores = {
    from: 'from-orange-400',
    via: 'via-orange-500',
    to: 'to-amber-500',
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${cores.from} ${cores.via} ${cores.to} p-4`}>
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto">
        {/* Header */}
        <header className="text-center mb-6 pt-4">
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 mb-4">
            <span className="text-3xl">{loja.emoji}</span>
            <span className="text-white font-bold text-lg">{loja.nome}</span>
          </div>
          <p className="text-white/80">Cartão Fidelidade Digital</p>
        </header>

        {/* Navegação */}
        <nav className="flex gap-2 mb-6">
          <button
            onClick={() => setTela('cliente')}
            className={`flex-1 py-3 rounded-2xl font-medium transition-all duration-300 ${
              tela === 'cliente'
                ? 'bg-white text-orange-600 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {loja.emoji} Cliente
          </button>
          <button
            onClick={() => setTela('vendedor')}
            className={`flex-1 py-3 rounded-2xl font-medium transition-all duration-300 ${
              tela === 'vendedor'
                ? 'bg-white text-orange-600 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            🏪 Vendedor
          </button>
        </nav>

        {/* Mensagem de feedback */}
        {mensagem.texto && (
          <div className={`mb-4 p-4 rounded-2xl text-center font-medium ${
            mensagem.tipo === 'erro' ? 'bg-red-500/90 text-white' :
            mensagem.tipo === 'especial' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' :
            'bg-green-500/90 text-white'
          }`}>
            {mensagem.texto}
          </div>
        )}

        {/* TELA DO CLIENTE */}
        {tela === 'cliente' && (
          <div className="space-y-4">
            {/* Login */}
            {!telefoneLogado ? (
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">{loja.emoji}</div>
                  <h2 className="text-xl font-bold text-gray-800">Entrar</h2>
                  <p className="text-gray-500 text-sm">Digite seu celular para ver seus pontos</p>
                </div>
                <div className="space-y-3">
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                    className="text-gray-500 w-full px-4 py-4 text-center text-xl bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={loginCliente}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    VER MEUS PONTOS
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Card de Pontos */}
                <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-500 text-sm">Olá! Seus pontos:</p>
                    <button
                      onClick={() => {
                        setTelefoneLogado('');
                        setTelefone('');
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Trocar
                    </button>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                        {dadosCliente.pontos}
                      </span>
                      <span className="text-2xl text-gray-400">/{loja.meta}</span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-6">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(dadosCliente.pontos / loja.meta) * 100}%` }}
                    />
                  </div>

                  {/* Ícones de Pontos */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {Array.from({ length: loja.meta }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                          i < dadosCliente.pontos
                            ? 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-md scale-105'
                            : 'bg-gray-100'
                        }`}
                      >
                        {i < dadosCliente.pontos ? loja.emoji : '○'}
                      </div>
                    ))}
                  </div>

                  {/* Input do Código */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Código da compra"
                      value={codigoInput}
                      onChange={(e) => setCodigoInput(e.target.value.replace(/\D/g, ''))}
                      className="text-gray-500 w-full px-4 py-4 text-center text-1xl font-mono tracking-[0.5em] bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={adicionarPonto}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      ADICIONAR PONTO
                    </button>
                  </div>
                </div>

                {/* Card de Resgates */}
                {dadosCliente.resgates > 0 && (
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-3xl p-6 shadow-2xl">
                    <div className="text-center text-white">
                      <p className="text-lg mb-2">🎉 Você tem</p>
                      <p className="text-5xl font-black mb-2">{dadosCliente.resgates}</p>
                      <p className="text-lg mb-4">grátis para resgatar!</p>
                      <button
                        onClick={resgatarPremio}
                        className="w-full py-3 bg-white text-amber-600 font-bold rounded-xl hover:bg-amber-50 transition-colors"
                      >
                        RESGATAR AGORA
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TELA DO VENDEDOR */}
        {tela === 'vendedor' && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
            {!codigoGerado ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🔐</div>
                  <h2 className="text-xl font-bold text-gray-800">Área do Vendedor</h2>
                  <p className="text-gray-500 text-sm">Digite a senha para gerar o código</p>
                </div>
                <input
                  type="password"
                  placeholder="Senha do vendedor"
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  className="text-gray-500 w-full px-4 py-4 text-center bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none transition-colors"
                />
                <button
                  onClick={gerarCodigo}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  GERAR CÓDIGO
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 mb-2">Código da compra:</p>
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-6 mb-4">
                  <p className="text-5xl font-mono font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                    {codigoGerado}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <p>Expira em {Math.floor(tempoRestante / 60)}:{(tempoRestante % 60).toString().padStart(2, '0')}</p>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Mostre este código para o cliente digitar
                </p>
                <button
                  onClick={() => {
                    setCodigoGerado('');
                    setTempoRestante(0);
                  }}
                  className="px-6 py-2 text-orange-600 font-medium hover:bg-orange-50 rounded-xl transition-colors"
                >
                  Gerar novo código
                </button>
              </div>
            )}

            {/* Link para compartilhar */}
            {isAdmin && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Link para seus clientes:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-xs text-gray-600 truncate">
                    {typeof window !== 'undefined' ? window.location.href.replace('?admin=1', '') : ''}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href.replace('?admin=1', ''));
                      mostrarMensagem('Link copiado!');
                    }}
                    className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    📋
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-8 pb-8">
          <p className="text-white/60 text-sm">
            Compre {loja.meta} e ganhe 1 grátis! ✨
          </p>
        </footer>
      </div>
    </div>
  );
}