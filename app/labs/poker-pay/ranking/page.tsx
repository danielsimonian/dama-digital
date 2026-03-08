'use client';

import { useState, useEffect } from 'react';
import {
  Trophy, ArrowLeft, TrendingUp, TrendingDown,
  Calendar, ChevronDown, ChevronUp, Star, Loader2,
} from 'lucide-react';

/* ─── tipos ──────────────────────────────────────────────── */

interface JogadorSessao {
  nome: string; fichasFinais: number; investido: number;
  ganho: number; balanco: number; posicao: number; pontos: number;
}
interface SessaoHistorico {
  data: string; totalPot: number; jogadores: JogadorSessao[]; savedAt: string;
}
interface RankingEntry {
  nome: string; pontos: number; lucroTotal: number; sessoes: number; melhorPosicao: number;
}
interface HistoricoData {
  ranking: RankingEntry[]; sessoes: SessaoHistorico[]; filtro: string;
}

type Filtro = '4semanas' | 'mes' | 'todas';

/* ─── helpers visuais ────────────────────────────────────── */

const FILTROS: { id: Filtro; label: string }[] = [
  { id: '4semanas', label: 'Últimas 4 semanas' },
  { id: 'mes',      label: 'Mês atual' },
  { id: 'todas',    label: 'Todas' },
];

function positionMeta(pos: number) {
  if (pos === 1) return { badge: 'bg-yellow-500 text-yellow-950 font-black', row: 'border border-yellow-600/40 bg-yellow-900/10', emoji: '🥇' };
  if (pos === 2) return { badge: 'bg-gray-400 text-gray-950 font-bold', row: 'border border-gray-500/30 bg-gray-700/10', emoji: '🥈' };
  if (pos === 3) return { badge: 'bg-orange-500 text-orange-950 font-bold', row: 'border border-orange-600/30 bg-orange-900/10', emoji: '🥉' };
  return { badge: 'bg-gray-700 text-gray-300 font-semibold', row: '', emoji: '' };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function lucroColor(v: number) {
  return v > 0 ? 'text-green-400' : v < 0 ? 'text-red-400' : 'text-gray-400';
}

/* ─── componente ─────────────────────────────────────────── */

export default function RankingPage() {
  const [filtro, setFiltro]     = useState<Filtro>('4semanas');
  const [data, setData]         = useState<HistoricoData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErro(false);
    fetch(`/api/poker/historico?filtro=${filtro}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [filtro]);

  const pog     = data?.ranking[0] ?? null;
  const ranking = data?.ranking ?? [];
  const sessoes = data?.sessoes ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-gray-900 p-3 pb-24">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
          <a href="/labs/poker-pay" className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </a>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Ranking
            </h1>
            <p className="text-xs text-gray-400">Poker Pay · Cash Game</p>
          </div>
        </div>

        {/* Filtro */}
        <div className="bg-gray-800 rounded-xl p-1 flex gap-1">
          {FILTROS.map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                filtro === f.id
                  ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Carregando ranking...</span>
          </div>
        )}

        {/* Erro */}
        {!loading && erro && (
          <div className="bg-red-900/40 border border-red-600 rounded-xl p-6 text-center text-red-400 text-sm">
            Erro ao carregar dados. Tente recarregar a página.
          </div>
        )}

        {/* Empty */}
        {!loading && !erro && ranking.length === 0 && (
          <div className="bg-gray-800/60 border border-white/[0.06] rounded-xl p-10 text-center">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-600" />
            <div className="font-bold text-white mb-1">Nenhuma sessão registrada</div>
            <div className="text-sm text-gray-400">
              Finalize um Cash Game e salve a sessão para ela aparecer aqui.
            </div>
          </div>
        )}

        {/* ── POG Card ─────────────────────────────────────── */}
        {!loading && pog && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-700 via-yellow-600 to-orange-600 p-5 shadow-xl shadow-yellow-600/20">
            {/* ambient glow */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-400/15 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 text-yellow-200 text-xs font-bold mb-3 uppercase tracking-widest">
                <Star className="w-3.5 h-3.5 fill-yellow-200" />
                POG · Player of the Game
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-black text-white leading-none">{pog.nome}</div>
                  <div className="text-yellow-200 text-sm mt-1">{pog.sessoes} sessão{pog.sessoes > 1 ? 'ões' : ''} · melhor: #{pog.melhorPosicao}</div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white">{pog.pontos}</div>
                  <div className="text-yellow-200 text-xs">pontos</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-yellow-500/40 flex items-center justify-between">
                <span className="text-yellow-100 text-sm">Lucro acumulado</span>
                <span className={`font-bold text-lg ${pog.lucroTotal >= 0 ? 'text-white' : 'text-red-200'}`}>
                  {pog.lucroTotal >= 0 ? '+' : ''}R$ {pog.lucroTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Tabela de ranking ────────────────────────────── */}
        {!loading && ranking.length > 0 && (
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            {/* cabeçalho */}
            <div className="px-4 py-3 border-b border-gray-700 grid grid-cols-12 text-xs text-gray-500 font-medium">
              <span className="col-span-1">#</span>
              <span className="col-span-4">Jogador</span>
              <span className="col-span-2 text-center">Pts</span>
              <span className="col-span-3 text-right">Lucro</span>
              <span className="col-span-2 text-right">Sessões</span>
            </div>

            <div className="divide-y divide-gray-700/60">
              {ranking.map((entry, idx) => {
                const pos  = idx + 1;
                const meta = positionMeta(pos);
                return (
                  <div key={entry.nome} className={`px-4 py-3 grid grid-cols-12 items-center gap-1 ${meta.row}`}>
                    {/* posição */}
                    <div className="col-span-1">
                      <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs ${meta.badge}`}>
                        {pos}
                      </span>
                    </div>

                    {/* nome */}
                    <div className="col-span-4">
                      <div className="font-bold text-white text-sm truncate">{entry.nome}</div>
                      <div className="text-xs text-gray-500">melhor #{entry.melhorPosicao}</div>
                    </div>

                    {/* pontos */}
                    <div className="col-span-2 text-center">
                      <span className="font-black text-yellow-400 text-lg leading-none">{entry.pontos}</span>
                      <div className="text-xs text-gray-500">pts</div>
                    </div>

                    {/* lucro */}
                    <div className={`col-span-3 text-right font-bold text-sm ${lucroColor(entry.lucroTotal)}`}>
                      {entry.lucroTotal >= 0
                        ? <span className="flex items-center justify-end gap-0.5"><TrendingUp className="w-3.5 h-3.5" />R$ {entry.lucroTotal.toFixed(0)}</span>
                        : <span className="flex items-center justify-end gap-0.5"><TrendingDown className="w-3.5 h-3.5" />R$ {Math.abs(entry.lucroTotal).toFixed(0)}</span>}
                    </div>

                    {/* sessões */}
                    <div className="col-span-2 text-right text-gray-400 text-sm font-medium">
                      {entry.sessoes}x
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Histórico de Sessões ─────────────────────────── */}
        {!loading && sessoes.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-gray-400 px-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Histórico de Sessões ({sessoes.length})
            </h2>

            {sessoes.map(s => {
              const isOpen  = expanded === s.data;
              const ordered = [...s.jogadores].sort((a, b) => a.posicao - b.posicao);

              return (
                <div key={s.data} className="bg-gray-800 rounded-xl overflow-hidden">
                  {/* Cabeçalho da sessão */}
                  <button
                    className="w-full p-4 flex items-center justify-between text-left"
                    onClick={() => setExpanded(isOpen ? null : s.data)}
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{formatDate(s.data)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {s.jogadores.length} jogadores · pote R$ {s.totalPot.toFixed(0)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-yellow-400 font-bold flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> {ordered[0]?.nome}
                      </span>
                      {isOpen
                        ? <ChevronUp  className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {/* Detalhes expandidos */}
                  {isOpen && (
                    <div className="border-t border-gray-700 px-4 pb-4 pt-3 space-y-1.5">
                      {/* Cabeçalho cols */}
                      <div className="grid grid-cols-12 text-xs text-gray-500 px-2 mb-1">
                        <span className="col-span-1">#</span>
                        <span className="col-span-5">Jogador</span>
                        <span className="col-span-3 text-right">Resultado</span>
                        <span className="col-span-3 text-right">Pts</span>
                      </div>
                      {ordered.map(j => (
                        <div key={j.nome} className="grid grid-cols-12 items-center bg-gray-700/50 rounded-lg px-3 py-2">
                          <span className="col-span-1 text-gray-500 text-xs font-bold">{j.posicao}</span>
                          <span className="col-span-5 text-white text-sm font-medium truncate">{j.nome}</span>
                          <span className={`col-span-3 text-right text-xs font-bold ${lucroColor(j.balanco)}`}>
                            {j.balanco >= 0 ? '+' : ''}R$ {j.balanco.toFixed(0)}
                          </span>
                          <span className="col-span-3 text-right text-yellow-400 text-sm font-bold">
                            {j.pontos} pts
                          </span>
                        </div>
                      ))}
                      <div className="text-xs text-gray-600 text-right pt-1">
                        Salvo em {new Date(s.savedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
