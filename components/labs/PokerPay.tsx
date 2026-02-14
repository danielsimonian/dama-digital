'use client';

import { useState } from 'react';
import { Trophy, DollarSign, ArrowLeft } from 'lucide-react';
import TournamentApp from './PokerTournament';
import CashGameApp from './CashGame';

type Mode = null | 'tournament' | 'cash';

export default function PokerPay() {
  const [mode, setMode] = useState<Mode>(null);

  if (mode === 'tournament') {
    return <TournamentApp onBack={() => setMode(null)} />;
  }

  if (mode === 'cash') {
    return <CashGameApp onBack={() => setMode(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900 flex flex-col">
      {/* Voltar para Labs */}
      <div className="p-4">
        <a
          href="/labs"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Labs
        </a>
      </div>

      {/* Conteúdo central */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Logo / Título */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎰</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Poker Pay
          </h1>
          <p className="text-gray-400 text-lg">
            Gerencie sua mesa e acerte as contas na hora
          </p>
          <p className="text-gray-500 text-sm mt-1">by DAMA Digital</p>
        </div>

        {/* Botões de modo */}
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => setMode('tournament')}
            className="w-full group relative overflow-hidden bg-gray-800 hover:bg-gray-750 border border-white/10 hover:border-green-500/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 shrink-0">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                  Torneio
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  Buy-in fixo, rebuys, add-on e premiação
                </p>
              </div>
            </div>
            {/* glow de fundo no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          </button>

          <button
            onClick={() => setMode('cash')}
            className="w-full group relative overflow-hidden bg-gray-800 hover:bg-gray-750 border border-white/10 hover:border-yellow-500/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 shrink-0">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                  Cash Game
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  Fichas, rebuys e acerto final em dinheiro
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
}