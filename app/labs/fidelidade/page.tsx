'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================
// PÁGINA PRINCIPAL - CRIAR NOVA LOJA
// Rota: /labs/fidelidade
// ============================================

interface FormData {
  nome: string;
  slug: string;
  meta: number;
  senha: string;
  emoji: string;
}

export default function FidelidadeHome() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    slug: '',
    meta: 10,
    senha: '',
    emoji: '🧃',
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const emojis = ['🧃', '☕', '🍕', '🍔', '🌮', '🍜', '🍦', '🧁', '🥤', '🍺', '💇', '💅', '🛒', '⭐'];

  // Gera slug a partir do nome
  const gerarSlug = (nome: string): string => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setFormData(prev => ({
      ...prev,
      nome,
      slug: gerarSlug(nome),
    }));
  };

  const criarLoja = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const res = await fetch('/api/fidelidade/loja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || 'Erro ao criar loja');
        return;
      }

      // Redireciona para a página da loja criada
      router.push(`/labs/fidelidade/${formData.slug}?admin=1`);
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-4">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-fuchsia-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto pt-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mb-4 text-4xl">
            🎯
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Fidelidade Digital</h1>
          <p className="text-white/80">Crie seu cartão fidelidade em segundos</p>
        </header>

        {/* Formulário */}
        <form onSubmit={criarLoja} className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do seu negócio
            </label>
            <input
              type="text"
              required
              maxLength={30}
              placeholder="Ex: Sucos do Zé"
              value={formData.nome}
              onChange={handleNomeChange}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link do seu cartão
            </label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl text-sm">
              <span className="text-gray-400 truncate">seusite.com/labs/fidelidade/</span>
              <span className="font-mono font-bold text-purple-600">{formData.slug || '...'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escolha um ícone
            </label>
            <div className="flex flex-wrap gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                  className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                    formData.emoji === emoji
                      ? 'bg-purple-100 border-2 border-purple-400 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantas compras para ganhar 1 grátis?
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={5}
                max={20}
                value={formData.meta}
                onChange={(e) => setFormData(prev => ({ ...prev, meta: parseInt(e.target.value) }))}
                className="flex-1 accent-purple-500"
              />
              <span className="w-12 text-center text-2xl font-bold text-purple-600">{formData.meta}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha do vendedor
            </label>
            <input
              type="password"
              required
              minLength={4}
              placeholder="Mínimo 4 caracteres"
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">Você vai usar essa senha para gerar códigos de compra</p>
          </div>

          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.nome || !formData.senha}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'CRIAR MEU CARTÃO FIDELIDADE'}
          </button>
        </form>

        {/* Footer */}
        <footer className="text-center mt-8 pb-8">
          <p className="text-white/60 text-sm">
            Grátis • Sem cadastro • Pronto pra usar
          </p>
        </footer>
      </div>
    </div>
  );
}