'use client';

import { useState } from 'react';
import { Trophy, DollarSign, ArrowLeft, Crown, ChevronRight } from 'lucide-react';
import TournamentApp from './PokerTournament';

type Mode = null | 'tournament';

export default function PokerPay() {
  const [mode, setMode] = useState<Mode>(null);

  if (mode === 'tournament') return <TournamentApp onBack={() => setMode(null)} />;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #1e0f3a 0%, #0a0a14 55%, #0d1117 100%)' }}
    >
      {/* Voltar para Labs */}
      <div className="p-4">
        <a
          href="/labs"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors duration-200 text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Labs
        </a>
      </div>

      {/* Conteúdo central */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-14">

        {/* Logo / Título */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-purple-600/20 to-violet-900/30 border border-purple-500/20 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Crown className="w-9 h-9 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            Poker Pay
          </h1>
          <p className="text-slate-400 text-base">
            Gerencie sua mesa e acerte as contas na hora
          </p>
          <p className="text-slate-600 text-xs mt-1.5">by DAMA Digital</p>
        </div>

        {/* Cards de modo */}
        <div className="w-full max-w-sm space-y-3">

          {/* Ranking link */}
          <a
            href="/labs/poker-pay/ranking"
            className="w-full flex items-center justify-between gap-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-yellow-500/30 rounded-xl px-4 py-3 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-yellow-400 group-hover:text-yellow-300 text-sm font-medium transition-colors duration-200">
              <Trophy className="w-4 h-4" />
              Ver Ranking Semanal
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-yellow-500/60 transition-colors duration-200" />
          </a>

          {/* Torneio */}
          <button
            onClick={() => setMode('tournament')}
            className="w-full group relative overflow-hidden bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-green-500/40 rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-xl hover:shadow-green-500/10 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25 shrink-0">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors duration-200">
                  Torneio
                </h2>
                <p className="text-slate-500 text-sm mt-0.5 leading-snug">
                  Buy-in fixo, rebuys, add-on e premiação
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-green-400/60 transition-colors duration-200 shrink-0" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl pointer-events-none" />
          </button>

          {/* Cash Game */}
          <a
            href="/labs/poker-pay/cash"
            className="w-full group relative overflow-hidden bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-yellow-500/40 rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-xl hover:shadow-yellow-500/10 cursor-pointer block"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/25 shrink-0">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors duration-200">
                  Cash Game
                </h2>
                <p className="text-slate-500 text-sm mt-0.5 leading-snug">
                  Fichas, rebuys e acerto final em dinheiro
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-yellow-400/60 transition-colors duration-200 shrink-0" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl pointer-events-none" />
          </a>
        </div>
      </div>
    </div>
  );
}
