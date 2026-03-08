'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import PlayerAutocomplete, { type JogadorBase } from '@/components/labs/PlayerAutocomplete';

interface Sessao { status: 'aberta' | 'fechada'; inscritos: { id: string; nome: string; criadoEm: string }[]; data: string; }

const MAX = 9;

export default function InscricoesPage() {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [jogadores, setJogadores] = useState<JogadorBase[]>([]);
  const [selected, setSelected] = useState<JogadorBase | null>(null);
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

  useEffect(() => {
    fetch('/api/poker/jogadores')
      .then(r => r.json())
      .then((data: JogadorBase[]) => {
        if (Array.isArray(data)) setJogadores(data.filter(j => (j as { ativo?: boolean }).ativo !== false));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch('/api/poker/inscricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: selected.nome }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? 'Erro ao realizar inscrição');
      } else {
        setSessao(data);
        setInscritoNome(selected.nome);
        setSelected(null);
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
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-yellow-600/20 border border-yellow-600/30 flex items-center justify-center">
            <Users className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400">Poker Pay</h1>
          <p className="text-gray-300 mt-1 capitalize">{dataFormatada || 'Inscrições'}</p>
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
              <div className="text-sm text-gray-300">{inscritoNome} está na lista</div>
            </div>
          </div>
        )}

        {/* Form */}
        {aberta && !inscritoNome && (
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-4 mb-4 space-y-3">
            <label className="block text-gray-400 text-sm font-medium">Selecione seu nome</label>

            <PlayerAutocomplete
              jogadores={jogadores}
              selected={selected}
              onSelect={setSelected}
              disabled={loading}
              placeholder="Buscar seu nome..."
            />

            {jogadores.length === 0 && (
              <p className="text-xs text-yellow-500/80 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Nenhum jogador cadastrado ainda. Aguarde o organizador.
              </p>
            )}

            {erro && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selected}
              className="w-full bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-700 disabled:bg-gray-600 disabled:opacity-50 text-white py-3 rounded-lg font-bold transition-colors text-base cursor-pointer"
            >
              {loading ? 'Confirmando...' : 'Confirmar Presença'}
            </button>
          </form>
        )}

        {/* Encerradas - não inscrito */}
        {!aberta && !inscritoNome && sessao && (
          <div className="bg-gray-800 rounded-xl p-6 mb-4 text-center">
            <Clock className="w-10 h-10 mx-auto mb-2 text-gray-600" />
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
                <div className="text-center text-orange-400 font-bold text-sm pt-2 flex items-center justify-center gap-1.5">
                  <Users className="w-4 h-4" /> Mesa completa!
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
