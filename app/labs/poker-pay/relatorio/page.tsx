'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  BarChart2, ArrowLeft, TrendingUp, TrendingDown,
  Calendar, ChevronDown, ChevronUp, Star, Loader2, Flag,
  Lock, LogOut, DollarSign,
} from 'lucide-react';

/* ─── tipos ──────────────────────────────────────────────── */

interface JogadorSessao {
  nome: string; fichasFinais: number; investido: number;
  ganho: number; balanco: number; posicao: number; pontos: number;
}
interface SessaoHistorico {
  data: string; totalPot: number; jogadores: JogadorSessao[]; savedAt: string;
  grupoId?: string; grupoNome?: string;
}
interface RankingEntry {
  nome: string; pontos: number; lucroTotal: number; sessoes: number; melhorPosicao: number;
}
interface HistoricoData {
  ranking:      RankingEntry[];
  rankingLucro: RankingEntry[];
  sessoes:      SessaoHistorico[];
  filtro:       string;
  grupoId?:     string;
}
interface Grupo {
  id: string; nome: string; icone: string; cor: string; ativo: boolean;
}

type Filtro = '4semanas' | 'mes' | 'todas';

const SENHA_CORRETA = 'poker2026';
const LS_KEY = 'poker_relatorio_auth';

/* ─── cor dos grupos ─────────────────────────────────────── */

const COR_MAP: Record<string, { tab: string; badge: string }> = {
  blue:   { tab: 'bg-blue-500/15 text-blue-400 border-blue-500/30',      badge: 'bg-blue-500/20 text-blue-300'     },
  orange: { tab: 'bg-orange-500/15 text-orange-400 border-orange-500/30', badge: 'bg-orange-500/20 text-orange-300' },
  purple: { tab: 'bg-purple-500/15 text-purple-400 border-purple-500/30', badge: 'bg-purple-500/20 text-purple-300' },
  green:  { tab: 'bg-green-500/15 text-green-400 border-green-500/30',    badge: 'bg-green-500/20 text-green-300'   },
  red:    { tab: 'bg-red-500/15 text-red-400 border-red-500/30',          badge: 'bg-red-500/20 text-red-300'       },
  pink:   { tab: 'bg-pink-500/15 text-pink-400 border-pink-500/30',       badge: 'bg-pink-500/20 text-pink-300'     },
  yellow: { tab: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', badge: 'bg-yellow-500/20 text-yellow-300' },
  teal:   { tab: 'bg-teal-500/15 text-teal-400 border-teal-500/30',       badge: 'bg-teal-500/20 text-teal-300'     },
};

function getCorCfg(cor: string) {
  return COR_MAP[cor] ?? COR_MAP.purple;
}

/* ─── helpers visuais ────────────────────────────────────── */

const FILTROS: { id: Filtro; label: string }[] = [
  { id: '4semanas', label: 'Últimas 4 semanas' },
  { id: 'mes',      label: 'Mês atual' },
  { id: 'todas',    label: 'Todas' },
];

function positionBadge(pos: number) {
  if (pos === 1) return 'bg-yellow-500 text-yellow-950 font-black';
  if (pos === 2) return 'bg-gray-400 text-gray-950 font-bold';
  if (pos === 3) return 'bg-orange-500 text-orange-950 font-bold';
  return 'bg-gray-700 text-gray-300 font-semibold';
}

function positionRow(pos: number) {
  if (pos === 1) return 'border border-yellow-600/40 bg-yellow-900/10';
  if (pos === 2) return 'border border-gray-500/30 bg-gray-700/10';
  if (pos === 3) return 'border border-orange-600/30 bg-orange-900/10';
  return '';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function lucroColor(v: number) {
  return v > 0 ? 'text-green-400' : v < 0 ? 'text-red-400' : 'text-gray-400';
}

function fmtLucro(v: number) {
  return (v >= 0 ? '+' : '') + 'R$ ' + v.toFixed(0);
}

function fmtBRL(v: number) {
  return 'R$ ' + Math.abs(v).toFixed(0);
}

/* ─── tela de login ──────────────────────────────────────── */

function LoginScreen({ onAuth }: { onAuth: () => void }) {
  const [senha, setSenha]   = useState('');
  const [erro, setErro]     = useState(false);
  const [shake, setShake]   = useState(false);

  function tentar() {
    if (senha === SENHA_CORRETA) {
      localStorage.setItem(LS_KEY, '1');
      onAuth();
    } else {
      setErro(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className={`w-full max-w-xs ${shake ? 'animate-shake' : ''}`}>
        <div className="bg-gray-800 rounded-2xl p-8 space-y-6 shadow-2xl border border-white/[0.07]">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Relatório Privado</h1>
            <p className="text-sm text-gray-500 mt-1">Acesso restrito — Poker Pay</p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              value={senha}
              onChange={e => { setSenha(e.target.value); setErro(false); }}
              onKeyDown={e => e.key === 'Enter' && tentar()}
              placeholder="Senha"
              autoFocus
              className={`w-full bg-gray-700 border rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-green-500/50 transition-colors ${
                erro ? 'border-red-500/60' : 'border-gray-600'
              }`}
            />
            {erro && <p className="text-red-400 text-xs text-center">Senha incorreta</p>}
            <button
              onClick={tentar}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer text-sm"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
        .animate-shake{animation:shake .5s ease-in-out}
      `}</style>
    </div>
  );
}

/* ─── tabela de ranking por lucro ────────────────────────── */

function TabelaLucro({ ranking }: { ranking: RankingEntry[] }) {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="px-3 py-2.5 border-b border-gray-700 grid grid-cols-12 text-xs text-gray-500 font-medium">
        <span className="col-span-1">#</span>
        <span className="col-span-5">Jogador</span>
        <span className="col-span-4 text-right">Lucro</span>
        <span className="col-span-2 text-center">Pts</span>
      </div>
      <div className="divide-y divide-gray-700/60">
        {ranking.map((e, idx) => {
          const pos = idx + 1;
          return (
            <div key={e.nome} className={`px-3 py-2.5 grid grid-cols-12 items-center gap-1 ${positionRow(pos)}`}>
              <div className="col-span-1">
                <span className={`inline-flex w-5 h-5 rounded-full items-center justify-center text-xs ${positionBadge(pos)}`}>
                  {pos}
                </span>
              </div>
              <div className="col-span-5">
                <div className="font-bold text-white text-xs truncate">{e.nome}</div>
                <div className="text-xs text-gray-600">{e.sessoes}x · #{e.melhorPosicao}</div>
              </div>
              <div className={`col-span-4 text-right font-bold text-xs ${lucroColor(e.lucroTotal)}`}>
                {e.lucroTotal >= 0
                  ? <span className="flex items-center justify-end gap-0.5"><TrendingUp className="w-3 h-3" />{fmtLucro(e.lucroTotal)}</span>
                  : <span className="flex items-center justify-end gap-0.5"><TrendingDown className="w-3 h-3" />-{fmtBRL(e.lucroTotal)}</span>}
              </div>
              <div className="col-span-2 text-center text-gray-500 text-xs font-medium">
                {e.pontos}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── estatísticas financeiras ───────────────────────────── */

function EstatisticasFinanceiras({ ranking, sessoes }: { ranking: RankingEntry[]; sessoes: SessaoHistorico[] }) {
  if (ranking.length === 0) return null;

  const totalEmCirculacao = sessoes.reduce((acc, s) => acc + (s.totalPot ?? 0), 0);
  const maiorGanhador = [...ranking].sort((a, b) => b.lucroTotal - a.lucroTotal)[0];
  const maiorPerdedor = [...ranking].sort((a, b) => a.lucroTotal - b.lucroTotal)[0];
  const lucroPorSessao = sessoes.length > 0 ? totalEmCirculacao / sessoes.length : 0;
  const totalPositivo  = ranking.filter(e => e.lucroTotal > 0).reduce((a, e) => a + e.lucroTotal, 0);
  const totalNegativo  = ranking.filter(e => e.lucroTotal < 0).reduce((a, e) => a + e.lucroTotal, 0);

  const cards = [
    {
      label: 'Total em Circulação',
      value: `R$ ${totalEmCirculacao.toFixed(0)}`,
      icon: <DollarSign className="w-4 h-4" />,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
    },
    {
      label: 'Maior Ganhador',
      value: maiorGanhador ? `${maiorGanhador.nome} (+R$ ${maiorGanhador.lucroTotal.toFixed(0)})` : '—',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
    },
    {
      label: 'Maior Perdedor',
      value: maiorPerdedor && maiorPerdedor.lucroTotal < 0
        ? `${maiorPerdedor.nome} (-R$ ${Math.abs(maiorPerdedor.lucroTotal).toFixed(0)})`
        : '—',
      icon: <TrendingDown className="w-4 h-4" />,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
    },
    {
      label: 'Pote Médio / Sessão',
      value: `R$ ${lucroPorSessao.toFixed(0)}`,
      icon: <BarChart2 className="w-4 h-4" />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Total Ganho (todos)',
      value: `+R$ ${totalPositivo.toFixed(0)}`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
    },
    {
      label: 'Total Perdido (todos)',
      value: `-R$ ${Math.abs(totalNegativo).toFixed(0)}`,
      icon: <TrendingDown className="w-4 h-4" />,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
    },
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold text-gray-400 px-1 flex items-center gap-2">
        <BarChart2 className="w-4 h-4" /> Estatísticas Financeiras
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {cards.map(c => (
          <div key={c.label} className={`rounded-xl p-3 border ${c.bg}`}>
            <div className={`flex items-center gap-1.5 text-xs font-medium mb-1 ${c.color}`}>
              {c.icon}
              <span>{c.label}</span>
            </div>
            <div className="text-white font-bold text-sm leading-tight">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── inner component ────────────────────────────────────── */

function RelatorioInner({ onLogout }: { onLogout: () => void }) {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const grupoParam = searchParams.get('grupo') ?? null;

  const [filtro, setFiltro]   = useState<Filtro>('4semanas');
  const [grupoId, setGrupoId] = useState<string | null>(grupoParam);
  const [grupos, setGrupos]   = useState<Grupo[]>([]);
  const [data, setData]       = useState<HistoricoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/poker/grupos', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: Grupo[]) => setGrupos(Array.isArray(d) ? d.filter(g => g.ativo) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setErro(false);
    const params = new URLSearchParams({ filtro });
    if (grupoId) params.set('grupo', grupoId);
    fetch(`/api/poker/historico?${params}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [filtro, grupoId]);

  const selectGrupo = (id: string | null) => {
    setGrupoId(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('grupo', id);
    else params.delete('grupo');
    router.replace(`/labs/poker-pay/relatorio?${params}`);
  };

  const grupoAtivo    = grupos.find(g => g.id === grupoId);
  const rankingLucro  = data?.rankingLucro ?? [];
  const sessoes       = data?.sessoes ?? [];
  const pogLucro      = rankingLucro[0] ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 p-3 pb-24">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
          <a href="/labs/poker-pay" className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </a>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-green-400 flex items-center gap-2">
              <BarChart2 className="w-5 h-5" /> Relatório Financeiro
            </h1>
            <p className="text-xs text-gray-400">Poker Pay · Acesso Privado</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 text-xs font-medium transition-colors cursor-pointer"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs de grupo */}
        {grupos.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => selectGrupo(null)}
              className={`flex-shrink-0 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap border ${
                !grupoId ? 'bg-gray-700 text-white border-gray-600' : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              Todas
            </button>
            {grupos.map(g => {
              const cfg      = getCorCfg(g.cor);
              const isActive = grupoId === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => selectGrupo(g.id)}
                  className={`flex-shrink-0 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
                    isActive ? cfg.tab : 'text-slate-500 hover:text-slate-300 border-transparent'
                  }`}
                >
                  <span>{g.icone}</span>{g.nome}
                </button>
              );
            })}
          </div>
        )}

        {/* Badge grupo ativo */}
        {grupoAtivo && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${getCorCfg(grupoAtivo.cor).badge}`}>
            <span className="text-base">{grupoAtivo.icone}</span>
            <span>{grupoAtivo.nome}</span>
            <span className="ml-auto text-xs opacity-70">{sessoes.length} sessão{sessoes.length !== 1 ? 'ões' : ''}</span>
          </div>
        )}

        {/* Filtro de tempo */}
        <div className="bg-gray-800 rounded-xl p-1 flex gap-1">
          {FILTROS.map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filtro === f.id
                  ? 'bg-green-500/15 text-green-400 border border-green-500/30'
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
            <span className="text-sm">Carregando relatório...</span>
          </div>
        )}

        {/* Erro */}
        {!loading && erro && (
          <div className="bg-red-900/40 border border-red-600 rounded-xl p-6 text-center text-red-400 text-sm">
            Erro ao carregar dados. Tente recarregar a página.
          </div>
        )}

        {/* Empty */}
        {!loading && !erro && rankingLucro.length === 0 && (
          <div className="bg-gray-800/60 border border-white/[0.06] rounded-xl p-10 text-center">
            <BarChart2 className="w-10 h-10 mx-auto mb-3 text-gray-600" />
            <div className="font-bold text-white mb-1">Nenhuma sessão registrada</div>
            <div className="text-sm text-gray-400">
              {grupoAtivo
                ? `Nenhuma sessão salva no grupo "${grupoAtivo.nome}" para o período selecionado.`
                : 'Finalize um Cash Game e salve a sessão para ela aparecer aqui.'}
            </div>
          </div>
        )}

        {/* ── RANKING POR LUCRO ────────────────────────────────── */}
        {!loading && rankingLucro.length > 0 && (
          <>
            {/* Card líder */}
            {pogLucro && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-700 via-yellow-600 to-orange-600 p-5 shadow-xl shadow-yellow-600/20">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-400/15 rounded-full blur-2xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-yellow-200 text-xs font-bold mb-3 uppercase tracking-widest">
                    <Star className="w-3.5 h-3.5 fill-yellow-200" />
                    💰 Maior Lucro
                    {grupoAtivo && <span className="ml-1 opacity-70">· {grupoAtivo.icone} {grupoAtivo.nome}</span>}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-black text-white leading-none">{pogLucro.nome}</div>
                      <div className="text-yellow-200 text-sm mt-1">{pogLucro.sessoes} sessão{pogLucro.sessoes > 1 ? 'ões' : ''} · melhor #{pogLucro.melhorPosicao}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-black ${pogLucro.lucroTotal >= 0 ? 'text-white' : 'text-red-200'}`}>
                        {fmtLucro(pogLucro.lucroTotal)}
                      </div>
                      <div className="text-yellow-200 text-xs">lucro total</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-yellow-500/40 flex items-center justify-between">
                    <span className="text-yellow-100 text-sm">Pontos acumulados</span>
                    <span className="font-bold text-lg text-white">{pogLucro.pontos} pts</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tabela */}
            <TabelaLucro ranking={rankingLucro} />

            {/* Estatísticas */}
            <EstatisticasFinanceiras ranking={rankingLucro} sessoes={sessoes} />

            {/* Histórico de Sessões */}
            {sessoes.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-gray-400 px-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Histórico de Sessões ({sessoes.length})
                </h2>

                {sessoes.map(s => {
                  const isOpen  = expanded === s.data;
                  const ordered = [...s.jogadores].sort((a, b) => (b.balanco ?? 0) - (a.balanco ?? 0));
                  const gAtivo  = s.grupoId ? grupos.find(g => g.id === s.grupoId) : null;

                  return (
                    <div key={s.data} className="bg-gray-800 rounded-xl overflow-hidden">
                      <button
                        className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                        onClick={() => setExpanded(isOpen ? null : s.data)}
                      >
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            {formatDate(s.data)}
                            {gAtivo && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-md font-normal ${getCorCfg(gAtivo.cor).badge}`}>
                                {gAtivo.icone} {gAtivo.nome}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {s.jogadores.length} jogadores · pote R$ {s.totalPot.toFixed(0)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> {ordered[0]?.nome}
                          </span>
                          {isOpen
                            ? <ChevronUp  className="w-4 h-4 text-gray-400" />
                            : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-gray-700 px-4 pb-4 pt-3 space-y-1.5">
                          <div className="grid grid-cols-12 text-xs text-gray-500 px-2 mb-1">
                            <span className="col-span-1">#</span>
                            <span className="col-span-5">Jogador</span>
                            <span className="col-span-3 text-right">Resultado</span>
                            <span className="col-span-3 text-right">Pts</span>
                          </div>
                          {ordered.map((j, idx) => {
                            const pos = idx + 1;
                            const pts = Math.max(0, 10 - pos);
                            return (
                              <div key={j.nome} className="grid grid-cols-12 items-center bg-gray-700/50 rounded-lg px-3 py-2">
                                <span className="col-span-1 text-gray-500 text-xs font-bold">{pos}</span>
                                <span className="col-span-5 text-white text-sm font-medium truncate">{j.nome}</span>
                                <span className={`col-span-3 text-right text-xs font-bold ${lucroColor(j.balanco ?? 0)}`}>
                                  {(j.balanco ?? 0) >= 0 ? '+' : ''}R$ {(j.balanco ?? 0).toFixed(0)}
                                </span>
                                <span className="col-span-3 text-right text-yellow-400 text-sm font-bold">
                                  {pts} pts
                                </span>
                              </div>
                            );
                          })}
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
          </>
        )}
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

/* ─── wrapper com auth + Suspense ────────────────────────── */

function RelatorioWithAuth() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(localStorage.getItem(LS_KEY) === '1');
  }, []);

  function logout() {
    localStorage.removeItem(LS_KEY);
    setAuthed(false);
  }

  if (authed === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!authed) return <LoginScreen onAuth={() => setAuthed(true)} />;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Carregando...</span>
      </div>
    }>
      <RelatorioInner onLogout={logout} />
    </Suspense>
  );
}

export default function RelatorioPage() {
  return <RelatorioWithAuth />;
}
