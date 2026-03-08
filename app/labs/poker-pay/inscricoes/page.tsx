'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Inscrito { id: string; nome: string; criadoEm: string; }
interface Sessao { status: 'aberta' | 'fechada'; inscritos: Inscrito[]; data: string; }

const MAX = 9;

export default function InscricoesPage() {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [inscritoNome, setInscritoNome] = useState<string | null>(null);

  const fetchSessao = async () => {
    try {
      const res = await fetch('/api/poker/inscricoes', { cache: 'no-store' });
      if (res.ok) setSessao(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchSessao();
    const interval = setInterval(fetchSessao, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = nome.trim();
    if (!n) return;
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch('/api/poker/inscricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: n }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? 'Erro ao realizar inscrição');
      } else {
        setSessao(data);
        setInscritoNome(n);
        setNome('');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const aberta = sessao?.status === 'aberta';
  const qtd = sessao?.inscritos.length ?? 0;
  const cheio = qtd >= MAX;

  const dataFormatada = sessao?.data
    ? new Date(sessao.data + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-gray-900 p-4">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="text-center pt-8 pb-6">
          <div className="text-5xl mb-3">🎰</div>
          <h1 className="text-3xl font-bold text-yellow-400">Poker Pay</h1>
          <p className="text-gray-300 mt-1 capitalize">{dataFormatada || 'Segunda-Feira'}</p>
          <p className="text-xs text-gray-500 mt-0.5">by DAMA Digital</p>
        </div>

        {/* Status badge */}
        {sessao && (
          <div className={`flex items-center gap-2 rounded-xl py-3 px-4 mb-4 font-bold text-sm ${
            aberta
              ? 'bg-green-900/60 border border-green-600 text-green-400'
              : 'bg-red-900/60 border border-red-600 text-red-400'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${aberta ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {aberta ? 'Inscrições Abertas' : 'Inscrições Encerradas'}
            <span className="ml-auto text-white/60 font-normal">{qtd}/{MAX} vagas</span>
          </div>
        )}

        {/* Progress bar */}
        {sessao && (
          <div className="bg-gray-700 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${cheio ? 'bg-red-500' : 'bg-yellow-500'}`}
              style={{ width: `${(qtd / MAX) * 100}%` }}
            />
          </div>
        )}

        {/* Success state */}
        {inscritoNome && (
          <div className="bg-green-900/60 border border-green-600 rounded-xl p-4 mb-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Presença confirmada!</div>
              <div className="text-sm text-gray-300">{inscritoNome} está na lista ✓</div>
            </div>
          </div>
        )}

        {/* Form */}
        {aberta && !inscritoNome && (
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-4 mb-4">
            <label className="block text-gray-400 text-sm mb-2 font-medium">Seu nome</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Como te chamam na mesa?"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 mb-3 text-base focus:border-yellow-500 focus:outline-none"
              disabled={loading}
              maxLength={30}
              autoComplete="off"
            />
            {erro && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {erro}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !nome.trim()}
              className="w-full bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-700 disabled:bg-gray-600 disabled:opacity-50 text-white py-3 rounded-lg font-bold transition-colors text-base"
            >
              {loading ? 'Confirmando...' : '🃏 Confirmar Presença'}
            </button>
          </form>
        )}

        {/* Encerradas - não inscrito */}
        {!aberta && !inscritoNome && sessao && (
          <div className="bg-gray-800 rounded-xl p-6 mb-4 text-center">
            <div className="text-3xl mb-2">🔒</div>
            <div className="font-bold text-white mb-1">Inscrições encerradas</div>
            <div className="text-sm text-gray-400">
              {cheio ? 'A mesa está completa (9/9 vagas).' : 'As inscrições foram fechadas pelo organizador.'}
            </div>
          </div>
        )}

        {/* Lista de inscritos */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Inscritos ({qtd}/{MAX})
          </h2>
          {qtd === 0 ? (
            <div className="text-center text-gray-500 py-6">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum inscrito ainda</p>
              <p className="text-xs mt-1 opacity-60">Seja o primeiro!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessao?.inscritos.map((inscrito, idx) => (
                <div key={inscrito.id} className="flex items-center gap-3 bg-gray-700 rounded-lg px-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-yellow-600/30 border border-yellow-600/50 flex items-center justify-center text-yellow-400 text-sm font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-white font-medium flex-1">{inscrito.nome}</span>
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                </div>
              ))}
              {cheio && (
                <div className="text-center text-orange-400 font-bold text-sm pt-2">
                  🏆 Mesa completa!
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6 pb-8 leading-relaxed">
          Inscrições encerram automaticamente ao atingir {MAX} jogadores.
          <br />A lista atualiza em tempo real.
        </p>
      </div>
    </div>
  );
}
