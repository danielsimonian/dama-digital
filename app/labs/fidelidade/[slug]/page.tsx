'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

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
  const codigoUrl = searchParams.get('codigo');

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

  // Estados do voucher
  const [mostrarVoucher, setMostrarVoucher] = useState(false);
  const [senhaResgate, setSenhaResgate] = useState('');
  const [resgateLoading, setResgateLoading] = useState(false);
  const [resgateSucesso, setResgateSucesso] = useState(false);
  const [erroResgate, setErroResgate] = useState('');

  // Mensagens
  const [mensagem, setMensagem] = useState<Mensagem>({ texto: '', tipo: '' });

  // Preenche código se veio pela URL
  useEffect(() => {
    if (codigoUrl) {
      setCodigoInput(codigoUrl);
    }
  }, [codigoUrl]);

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

  // Timer do código - 1 minuto
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

  // Abrir voucher
  const abrirVoucher = () => {
    setSenhaResgate('');
    setResgateSucesso(false);
    setErroResgate('');
    setMostrarVoucher(true);
  };

  // Confirmar resgate com senha do vendedor
  const confirmarResgate = async () => {
    if (senhaResgate.length < 4) {
      setErroResgate('Digite a senha do vendedor');
      return;
    }

    setResgateLoading(true);
    setErroResgate('');

    try {
      const res = await fetch('/api/fidelidade/resgate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          telefone: telefoneLogado,
          senha: senhaResgate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErroResgate(data.erro || 'Erro ao resgatar');
        setResgateLoading(false);
        return;
      }

      // Mostra sucesso
      setResgateSucesso(true);
      
      // Atualiza dados e fecha após 3 segundos
      setTimeout(() => {
        setDadosCliente(data);
        setMostrarVoucher(false);
        setResgateSucesso(false);
        setSenhaResgate('');
        setErroResgate('');
      }, 3000);

    } catch {
      setErroResgate('Erro de conexão');
    } finally {
      setResgateLoading(false);
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
      setTempoRestante(60); // 1 minuto
    } catch {
      mostrarMensagem('Erro de conexão', 'erro');
    }
  };

  // Gera URL do QR Code
  const getQrCodeUrl = () => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/labs/fidelidade/${slug}?codigo=${codigoGerado}`;
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
    <>
      {/* TELA DO VOUCHER */}
      {mostrarVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fundo animado */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500">
            <div className="absolute inset-0 opacity-30">
              {/* Confetes animados */}
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#fff', '#fef08a', '#fbbf24', '#f59e0b'][Math.floor(Math.random() * 4)],
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Conteúdo do voucher */}
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            {!resgateSucesso ? (
              <>
                {/* Voucher */}
                <div className="text-center mb-6">
                  <div className="text-8xl mb-4 animate-bounce">{loja.emoji}</div>
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-2xl py-4 px-6 mb-4">
                    <p className="text-sm font-medium opacity-90">VALE</p>
                    <p className="text-3xl font-black">1 GRÁTIS</p>
                  </div>
                  <p className="text-gray-500 text-sm">{loja.nome}</p>
                </div>

                {/* Linha pontilhada */}
                <div className="border-t-2 border-dashed border-gray-200 my-6 relative">
                  <div className="absolute -left-12 -top-3 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full" />
                  <div className="absolute -right-12 -top-3 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full" />
                </div>

                {/* Área do vendedor */}
                <div className="space-y-4">
                  <p className="text-center text-gray-600 text-sm font-medium">
                    🔐 Vendedor: digite sua senha para confirmar
                  </p>
                  
                  {/* Mensagem de erro */}
                  {erroResgate && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-600 text-sm text-center font-medium">
                      {erroResgate}
                    </div>
                  )}
                  
                  <input
                    type="password"
                    placeholder="Senha do vendedor"
                    value={senhaResgate}
                    onChange={(e) => setSenhaResgate(e.target.value)}
                    className="w-full px-4 py-4 text-center bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-amber-400 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
                  />
                  <button
                    onClick={confirmarResgate}
                    disabled={resgateLoading}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                  >
                    {resgateLoading ? 'CONFIRMANDO...' : '✓ CONFIRMAR ENTREGA'}
                  </button>
                  <button
                    onClick={() => setMostrarVoucher(false)}
                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              /* Sucesso */
              <div className="text-center py-8">
                <div className="text-8xl mb-4">✅</div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">RESGATADO!</h2>
                <p className="text-gray-500">Aproveite! 🎉</p>
              </div>
            )}
          </div>
        </div>
      )}

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
                      className="w-full px-4 py-4 text-center text-xl bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
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
                          setCodigoInput('');
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
                        className="w-full px-4 py-4 text-center text-2xl font-mono tracking-[0.3em] bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none transition-colors text-gray-800 placeholder-gray-300"
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
                          onClick={abrirVoucher}
                          className="w-full py-3 bg-white text-amber-600 font-bold rounded-xl hover:bg-amber-50 transition-colors"
                        >
                          🎁 USAR MEU VALE
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
                    className="w-full px-4 py-4 text-center bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
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
                  <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-4 mb-4">
                    <p className="text-4xl font-mono font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                      {codigoGerado}
                    </p>
                  </div>
                  
                  {/* QR Code */}
                  <div className="bg-white rounded-2xl p-4 mb-4 inline-block">
                    <QRCodeSVG 
                      value={getQrCodeUrl()} 
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Cliente escaneia o QR Code para adicionar o ponto
                  </p>

                  <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${tempoRestante > 20 ? 'bg-green-500' : tempoRestante > 10 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <p>Expira em {tempoRestante}s</p>
                  </div>
                  
                  <button
                    onClick={gerarCodigo}
                    className="px-6 py-2 text-orange-600 font-medium hover:bg-orange-50 rounded-xl transition-colors"
                  >
                    Gerar novo código
                  </button>
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
    </>
  );
}