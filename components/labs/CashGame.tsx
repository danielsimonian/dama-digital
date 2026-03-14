'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, DollarSign, Plus, Minus, Check, X,
  Settings, ChevronDown, ChevronUp, LogIn, LogOut, ArrowLeft,
  ClipboardList, Play, Trash2, ToggleLeft, ToggleRight, Link2,
  Trophy, Save, Loader2, Info, AlertTriangle, CheckCircle2,
  TrendingDown, CreditCard, Share2, Eye, Cloud, CloudOff, ShieldCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PlayerAutocomplete, { type JogadorBase } from './PlayerAutocomplete';

/* ─── tipos ────────────────────────────────────────────── */

interface HistoricoItem { tipo: string; valor: number; mult?: number; histId?: string }
interface Player {
  id: number; name: string; jogadorId?: string; buyIns: number; rebuys: number;
  fichasFinais: number; ativo: boolean; historico: HistoricoItem[];
}
interface Config { buyIn: number; chipValue: number; chipsPerBuyIn: number; maxRebuys: number }

type Tab = 'jogadores' | 'mesa' | 'acerto';

interface Props {
  onBack?: () => void;
  sessionId?: string;
  isAdmin?: boolean;
  initialConfig?: Config;
  initialPlayers?: Player[];
  initialDealerChips?: number;
  initialFinalizada?: boolean;
  initialSalvaEm?: string;
}

interface Inscrito { id: string; nome: string; criadoEm: string; }
interface Sessao { status: 'aberta' | 'fechada'; inscritos: Inscrito[]; data: string; }

interface GrupoOpt { id: string; nome: string; icone: string; cor: string; }

const MAX_PLAYERS = 9;
const LINK_INSCRICOES = 'https://damadigitalcriativa.com.br/labs/poker-pay/inscricoes';

/* ─── componente ───────────────────────────────────────── */

export default function CashGameApp({
  onBack,
  sessionId,
  isAdmin,
  initialConfig,
  initialPlayers,
  initialDealerChips,
  initialFinalizada,
  initialSalvaEm,
}: Props) {
  // — jogo —
  const [config, setConfig] = useState<Config>(
    initialConfig ?? { buyIn: 100, chipValue: 1, chipsPerBuyIn: 100, maxRebuys: 3 }
  );
  const [fichasDealer, setFichasDealer] = useState<number>(initialDealerChips ?? 0);
  const [players, setPlayers] = useState<Player[]>(initialPlayers ?? []);
  const [playerName, setPlayerName] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('jogadores');

  // — inscrições admin —
  const [showInscricoes, setShowInscricoes] = useState(false);
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [inscricoesLoading, setInscricoesLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // — salvar sessão no ranking —
  const [salvandoSessao, setSalvandoSessao] = useState(false);
  const [sessaoSalva, setSessaoSalva] = useState(false);
  const [finalizada, setFinalizada] = useState(initialFinalizada ?? false);
  const [salvaEm, setSalvaEm] = useState<string | null>(initialSalvaEm ?? null);

  // — grupos —
  const [grupos, setGrupos]             = useState<GrupoOpt[]>([]);
  const [showGrupoModal, setShowGrupoModal] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState<GrupoOpt | null>(null);

  // — jogadores cadastrados (autocomplete) —
  const [jogadores, setJogadores] = useState<JogadorBase[]>([]);
  const [selectedJogador, setSelectedJogador] = useState<JogadorBase | null>(null);

  // — sessão Redis: auto-save e share —
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);

  /* ── helpers ─────────────────────────────────────────── */

  // Carrega jogadores cadastrados para o autocomplete
  useEffect(() => {
    fetch('/api/poker/jogadores')
      .then(r => r.json())
      .then((data: JogadorBase[]) => {
        if (Array.isArray(data)) setJogadores(data.filter(j => (j as { ativo?: boolean }).ativo !== false));
      })
      .catch(() => {});
  }, []);

  // Carrega grupos ativos
  useEffect(() => {
    fetch('/api/poker/grupos')
      .then(r => r.json())
      .then((data: (GrupoOpt & { ativo?: boolean })[]) => {
        if (Array.isArray(data)) setGrupos(data.filter(g => g.ativo !== false));
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  /* ── auto-save no Redis ──────────────────────────────── */

  const scheduleAutoSave = useCallback((payload: { config: Config; players: Player[]; dealerChips: number }) => {
    if (!sessionId || !isAdmin) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/poker/session/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setSaveStatus(r.ok ? 'idle' : 'error');
      } catch {
        setSaveStatus('error');
      }
    }, 1000);
  }, [sessionId, isAdmin]);

  // Dispara auto-save a cada mudança relevante (pula mount inicial)
  useEffect(() => {
    if (!isMountedRef.current) { isMountedRef.current = true; return; }
    scheduleAutoSave({ config, players, dealerChips: fichasDealer });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, players, fichasDealer]);

  // Polling para espectadores (a cada 5s)
  useEffect(() => {
    if (!sessionId || isAdmin !== false) return;
    const poll = async () => {
      try {
        const r = await fetch(`/api/poker/session/${sessionId}`, { cache: 'no-store' });
        if (!r.ok) return;
        const d = await r.json();
        if (d.config) setConfig(d.config);
        if (d.players) setPlayers(d.players);
        if (typeof d.dealerChips === 'number') setFichasDealer(d.dealerChips);
      } catch {}
    };
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [sessionId, isAdmin]);

  /* ── share helpers ───────────────────────────────────── */

  const shareUrl = typeof window !== 'undefined' && sessionId
    ? `${window.location.origin}/labs/poker-pay/cash/${sessionId}`
    : '';

  const copyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link copiado! Envie para os jogadores acompanharem.');
    } catch {
      showToast('Não foi possível copiar o link');
    }
  };

  const assumirControle = () => {
    if (!sessionId) return;
    localStorage.setItem(`poker-admin-${sessionId}`, 'true');
    window.location.reload();
  };

  /* ── inscrições ──────────────────────────────────────── */

  const fetchSessao = useCallback(async () => {
    try {
      const res = await fetch('/api/poker/inscricoes', { cache: 'no-store' });
      if (res.ok) setSessao(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    if (!showInscricoes) return;
    fetchSessao();
    const id = setInterval(fetchSessao, 8000);
    return () => clearInterval(id);
  }, [showInscricoes, fetchSessao]);

  /* ── inscrições: ações ───────────────────────────────── */

  const toggleStatus = async () => {
    if (!sessao) return;
    setInscricoesLoading(true);
    try {
      const novoStatus = sessao.status === 'aberta' ? 'fechada' : 'aberta';
      const res = await fetch('/api/poker/inscricoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (res.ok) setSessao(await res.json());
    } finally {
      setInscricoesLoading(false);
    }
  };

  const removerInscrito = async (id: string) => {
    setInscricoesLoading(true);
    try {
      const res = await fetch('/api/poker/inscricoes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setSessao(await res.json());
    } finally {
      setInscricoesLoading(false);
    }
  };

  const importarInscritos = () => {
    if (!sessao || sessao.inscritos.length === 0) return;
    const jaExistentes = new Set(players.map(p => p.jogadorId ?? p.name.toLowerCase()));
    // Mapa nome→jogador para enriquecer com jogadorId
    const nomeParaJogador = new Map(jogadores.map(j => [j.nome.toLowerCase(), j]));
    const novos = sessao.inscritos
      .filter(i => {
        const jog = nomeParaJogador.get(i.nome.toLowerCase());
        return !jaExistentes.has(jog?.id ?? i.nome.toLowerCase());
      })
      .slice(0, MAX_PLAYERS - players.length)
      .map((i, idx) => {
        const jog = nomeParaJogador.get(i.nome.toLowerCase());
        return {
          id: Date.now() + idx,
          jogadorId: jog?.id,
          name: i.nome,
          buyIns: 1, rebuys: 0,
          fichasFinais: config.chipsPerBuyIn,
          ativo: true,
          historico: [{ tipo: 'Buy-in', valor: config.buyIn }],
        };
      });
    setPlayers(prev => [...prev, ...novos]);
    setShowInscricoes(false);
    showToast(`${novos.length} jogador(es) importado(s) ✓`);
  };

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(LINK_INSCRICOES);
      showToast('Link copiado! 🔗');
    } catch {
      showToast('Não foi possível copiar o link');
    }
  };

  const salvarSessao = async (grupo: GrupoOpt | null) => {
    if (players.length === 0) return;
    setShowGrupoModal(false);
    setSalvandoSessao(true);
    try {
      // Ordenar por fichasFinais desc para determinar posição
      const sorted = [...players].sort((a, b) => b.fichasFinais - a.fichasFinais);

      const jogadoresSessao = sorted.map((p, idx) => {
        const { spent, won, balance } = calcBalance(p);
        return {
          nome:         p.name,
          jogadorId:    p.jogadorId,
          fichasFinais: p.fichasFinais,
          investido:    spent,
          ganho:        won,
          balanco:      balance,
          posicao:      idx + 1,
          pontos:       10 - (idx + 1), // 1º=9, 2º=8, ..., 9º=1
        };
      });

      const br = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      const data = `${br.getFullYear()}-${String(br.getMonth() + 1).padStart(2, '0')}-${String(br.getDate()).padStart(2, '0')}`;

      const res = await fetch('/api/poker/historico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          totalPot,
          jogadores: jogadoresSessao,
          grupoId:   grupo?.id,
          grupoNome: grupo?.nome,
        }),
      });

      if (res.ok) {
        setSessaoSalva(true);
        const agora = new Date().toISOString();
        if (sessionId) {
          await fetch(`/api/poker/session/${sessionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'finalizada', salvaEm: agora }),
          });
          setFinalizada(true);
          setSalvaEm(agora);
        }
        showToast(grupo ? `Sessão salva no grupo "${grupo.nome}"! 🏆` : 'Sessão salva no ranking! 🏆');
      } else {
        showToast('Erro ao salvar sessão.');
      }
    } catch {
      showToast('Erro de conexão.');
    } finally {
      setSalvandoSessao(false);
    }
  };

  /* ── jogo: helpers ───────────────────────────────────── */

  const totalPot = players.reduce((s, p) => s + (p.buyIns + p.rebuys) * config.buyIn, 0);

  const calcBalance = (p: Player) => {
    const spent = (p.buyIns + p.rebuys) * config.buyIn;
    const won   = p.fichasFinais * config.chipValue;
    return { spent, won, balance: won - spent };
  };

  const calcPayments = () => {
    const results = players.map(p => ({ ...p, ...calcBalance(p) }));
    const winners = results.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);
    const losers  = results.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);
    const payments: { from: string; to: string; amount: string }[] = [];
    const debts   = losers.map(l => ({ ...l, rem: Math.abs(l.balance) }));
    const credits = winners.map(w => ({ ...w, rem: w.balance }));
    const dealerValue = fichasDealer * config.chipValue;
    if (dealerValue > 0) {
      credits.push({ id: 'dealer', name: 'Dealer', balance: dealerValue, rem: dealerValue } as typeof credits[0]);
    }
    debts.forEach(l => credits.forEach(w => {
      if (l.rem > 0.01 && w.rem > 0.01) {
        const amt = Math.min(l.rem, w.rem);
        payments.push({ from: l.name, to: w.name, amount: amt.toFixed(2) });
        l.rem -= amt; w.rem -= amt;
      }
    }));
    return { winners, losers, payments };
  };

  const addPlayer = () => {
    if (!selectedJogador || players.length >= MAX_PLAYERS) return;
    // Evitar duplicata na mesa
    if (players.some(p => p.jogadorId === selectedJogador.id)) {
      showToast(`${selectedJogador.nome} já está na mesa`);
      return;
    }
    setPlayers([...players, {
      id: Date.now(),
      jogadorId: selectedJogador.id,
      name: selectedJogador.nome,
      buyIns: 1, rebuys: 0,
      fichasFinais: config.chipsPerBuyIn, ativo: true,
      historico: [{ tipo: 'Buy-in', valor: config.buyIn }],
    }]);
    setSelectedJogador(null);
  };

  const doRebuy = (id: number, mult: number) =>
    setPlayers(players.map(p => {
      if (p.id !== id || p.rebuys >= config.maxRebuys) return p;
      return {
        ...p, rebuys: p.rebuys + 1,
        fichasFinais: p.fichasFinais + mult * config.chipsPerBuyIn,
        historico: [...p.historico, {
          tipo: `Rebuy ${mult}x`, valor: mult * config.buyIn,
          mult, histId: `${Date.now()}-${Math.random()}`,
        }],
      };
    }));

  const undoRebuy = (playerId: number, histIndex: number) =>
    setPlayers(players.map(p => {
      if (p.id !== playerId) return p;
      const item = p.historico[histIndex];
      const mult = item.mult ?? 1;
      return {
        ...p,
        rebuys: Math.max(0, p.rebuys - 1),
        fichasFinais: Math.max(0, p.fichasFinais - mult * config.chipsPerBuyIn),
        historico: p.historico.filter((_, i) => i !== histIndex),
      };
    }));

  const toggleAtivo = (id: number) =>
    setPlayers(players.map(p => {
      if (p.id !== id) return p;
      const ativo = !p.ativo;
      return { ...p, ativo, historico: [...p.historico, { tipo: ativo ? 'Voltou à mesa' : 'Saiu da mesa', valor: 0 }] };
    }));

  const updateFichas = (id: number, val: number) =>
    setPlayers(players.map(p => p.id === id ? { ...p, fichasFinais: Math.max(0, val) } : p));

  const removePlayer = (id: number) => setPlayers(players.filter(p => p.id !== id));

  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
        tab === id
          ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
          : 'text-slate-500 hover:text-slate-300 border border-transparent'
      }`}
    >
      {label}
    </button>
  );

  /* ── painel admin inscrições ─────────────────────────── */

  if (showInscricoes) {
    const qtd = sessao?.inscritos.length ?? 0;
    const aberta = sessao?.status === 'aberta';

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-gray-900 p-3 pb-24">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Header admin */}
          <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowInscricoes(false)} className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" /> Gerenciar Inscrições
                </h1>
                <p className="text-xs text-gray-400">{qtd}/{MAX_PLAYERS} inscritos</p>
              </div>
            </div>
            {/* Recarregar */}
            <button onClick={fetchSessao} className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-gray-300 text-xs font-medium px-3">
              ↺
            </button>
          </div>

          {/* Status + controles */}
          <div className="bg-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-300 mb-0.5">Status das inscrições</div>
                <div className={`text-xs font-bold flex items-center gap-1.5 ${aberta ? 'text-green-400' : 'text-red-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${aberta ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  {aberta ? 'Abertas' : 'Encerradas'}
                </div>
              </div>
              <button
                onClick={toggleStatus}
                disabled={inscricoesLoading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 ${
                  aberta ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-green-700 hover:bg-green-600 text-white'
                }`}
              >
                {aberta
                  ? <><ToggleRight className="w-4 h-4" /> Fechar</>
                  : <><ToggleLeft className="w-4 h-4" /> Abrir</>}
              </button>
            </div>

            {/* Copiar link */}
            <button
              onClick={copiarLink}
              className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Link2 className="w-4 h-4" />
              Copiar link de inscrição
            </button>
          </div>

          {/* Lista de inscritos */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Inscritos ({qtd}/{MAX_PLAYERS})
            </h2>

            {sessao === null && (
              <div className="text-center text-gray-500 py-6 text-sm">Carregando...</div>
            )}

            {sessao !== null && qtd === 0 && (
              <div className="text-center text-gray-500 py-6">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <div className="text-sm">Nenhum inscrito ainda</div>
                <div className="text-xs mt-1 opacity-60">Compartilhe o link para receber inscrições</div>
              </div>
            )}

            {qtd > 0 && (
              <div className="space-y-2">
                {sessao?.inscritos.map((inscrito, idx) => (
                  <div key={inscrito.id} className="flex items-center gap-3 bg-gray-700 rounded-lg px-3 py-2.5">
                    <div className="w-7 h-7 rounded-full bg-yellow-600/30 border border-yellow-600/50 flex items-center justify-center text-yellow-400 text-sm font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-white font-medium flex-1">{inscrito.nome}</span>
                    <button
                      onClick={() => removerInscrito(inscrito.id)}
                      disabled={inscricoesLoading}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-40"
                      title="Remover inscrito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Barra progress */}
          {sessao && (
            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${qtd >= MAX_PLAYERS ? 'bg-red-500' : 'bg-yellow-500'}`}
                style={{ width: `${(qtd / MAX_PLAYERS) * 100}%` }}
              />
            </div>
          )}

          {/* Importar jogadores */}
          <button
            onClick={importarInscritos}
            disabled={!sessao || qtd === 0}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            Iniciar Jogo com Inscritos ({qtd})
          </button>

          <p className="text-center text-gray-600 text-xs pb-4">
            Jogadores já adicionados ao jogo não serão duplicados.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm border border-yellow-500/40 text-yellow-300 font-semibold text-sm px-5 py-3 rounded-xl shadow-2xl shadow-black/50 z-50 whitespace-nowrap">
            {toast}
          </div>
        )}
      </div>
    );
  }

  /* ── tela principal do Cash Game ─────────────────────── */

  const ro = isAdmin === false || finalizada; // read-only (espectador ou sessão finalizada)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-gray-900 p-3 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Banner sessão finalizada */}
        {finalizada && (
          <div className="bg-orange-900/70 border border-orange-500/50 rounded-xl px-4 py-3 mb-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-orange-200 text-sm font-semibold">
                <span className="text-base">🔒</span>
                Sessão Finalizada — Somente Visualização
              </div>
              <a
                href="/labs/poker-pay/ranking"
                className="flex items-center gap-1.5 text-xs font-bold bg-orange-700/50 hover:bg-orange-700 text-orange-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                <Trophy className="w-3.5 h-3.5" />
                Ver no Ranking
              </a>
            </div>
            {salvaEm && (
              <p className="text-orange-300/70 text-xs mt-1.5">
                Salva em {new Date(salvaEm).toLocaleDateString('pt-BR')} às {new Date(salvaEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
              </p>
            )}
          </div>
        )}

        {/* Banner espectador */}
        {ro && !finalizada && (
          <div className="bg-yellow-900/60 border border-yellow-600/30 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-yellow-300 text-sm font-medium">
              <Eye className="w-4 h-4 shrink-0" />
              Modo Espectador — Acompanhando ao vivo
            </div>
            <button
              onClick={assumirControle}
              className="flex items-center gap-1.5 text-xs font-bold bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-200 px-3 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer shrink-0"
              title="Assumir o controle da mesa neste dispositivo"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Assumir Controle
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (sessionId) window.location.href = '/labs/poker-pay/cash';
                else if (onBack) onBack();
              }}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg cursor-pointer transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                <DollarSign className="w-5 h-5" /> Cash Game
              </h1>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                {sessionId
                  ? <><span className="font-mono tracking-widest">{sessionId}</span> · {ro ? 'Espectador' : 'Admin'}</>
                  : "Texas Hold'em"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Save status — só quando em sessão admin */}
            {sessionId && isAdmin && (
              <div className="flex items-center" title={saveStatus === 'error' ? 'Erro ao salvar' : saveStatus === 'saving' ? 'Salvando...' : 'Salvo'}>
                {saveStatus === 'saving' && <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />}
                {saveStatus === 'error'  && <CloudOff className="w-4 h-4 text-red-400" />}
                {saveStatus === 'idle'   && <Cloud className="w-4 h-4 text-gray-600" />}
              </div>
            )}
            {/* Compartilhar — só quando em sessão */}
            {sessionId && (
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-yellow-700/50 hover:bg-yellow-700 p-2.5 rounded-lg cursor-pointer transition-colors duration-200"
                title="Compartilhar sessão"
              >
                <Share2 className="w-4 h-4 text-yellow-300" />
              </button>
            )}
            {/* Encerrar Sala — só para admin */}
            {sessionId && isAdmin && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-900/50 hover:bg-red-800 p-2.5 rounded-lg cursor-pointer transition-colors duration-200"
                title="Encerrar sala"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            )}
            <a
              href="/labs/poker-pay/ranking"
              className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg"
              title="Ver Ranking"
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
            </a>
            {/* Botões admin-only */}
            {isAdmin !== false && (
              <>
                <button
                  onClick={() => setShowInscricoes(true)}
                  className="bg-yellow-700 hover:bg-yellow-600 p-3 rounded-lg cursor-pointer transition-colors duration-200"
                  title="Gerenciar Inscrições"
                >
                  <ClipboardList className="w-5 h-5 text-yellow-200" />
                </button>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg cursor-pointer transition-colors duration-200"
                >
                  <Settings className="w-5 h-5 text-yellow-400" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Config */}
        {showConfig && (
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <h2 className="text-base font-bold text-yellow-400 mb-3">Configurações da Mesa</h2>
            <div className="grid grid-cols-2 gap-3">
              {([['Buy-in (R$)', 'buyIn'], ['Fichas por Buy-in', 'chipsPerBuyIn'], ['Valor da Ficha (R$)', 'chipValue'], ['Max Rebuys', 'maxRebuys']] as [string, keyof Config][]).map(([label, key]) => (
                <div key={key}>
                  <label className="block text-gray-400 text-xs mb-1">{label}</label>
                  <input type="number" value={config[key]}
                    onChange={e => setConfig({ ...config, [key]: Number(e.target.value) })}
                    disabled={ro}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
                </div>
              ))}
            </div>

            {/* Fichas da Dealer */}
            <div className="mt-3">
              <label className="block text-gray-400 text-xs mb-1">Fichas da Dealer (doação)</label>
              <input
                type="number"
                value={fichasDealer}
                min={0}
                onChange={e => setFichasDealer(Math.max(0, Number(e.target.value)))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-yellow-600 text-sm"
              />
            </div>

            <div className="mt-3 bg-gray-700/60 rounded-lg p-3 text-xs text-gray-400 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-yellow-500/70" />
              <div>
                {config.chipsPerBuyIn} fichas = R$ {config.buyIn} → cada ficha vale R$ {config.chipValue}
                {fichasDealer > 0 && (
                  <div className="mt-1 text-yellow-400">{fichasDealer} fichas reservadas para a dealer</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resumo */}
        {players.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center shadow-sm shadow-yellow-500/10">
              <div className="text-xs text-yellow-400/70 mb-1">Pote Total</div>
              <div className="text-lg font-bold text-yellow-400">R$ {totalPot.toFixed(0)}</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Na Mesa</div>
              <div className="text-lg font-bold text-white">{players.filter(p => p.ativo).length}/{players.length}</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Rebuys</div>
              <div className="text-lg font-bold text-orange-400">{players.reduce((s, p) => s + p.rebuys, 0)}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-gray-800 rounded-xl p-1 mb-4 flex gap-1">
          <TabBtn id="jogadores" label="Jogadores" />
          <TabBtn id="mesa"      label="Mesa" />
          <TabBtn id="acerto"    label="Acerto" />
        </div>

        {/* ── TAB JOGADORES ── */}
        {tab === 'jogadores' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-base font-bold text-yellow-400 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" /> Adicionar Jogador ({players.length}/{MAX_PLAYERS})
              </h2>
              <div className="flex gap-2">
                <div className="flex-1">
                  <PlayerAutocomplete
                    jogadores={jogadores}
                    selected={selectedJogador}
                    onSelect={setSelectedJogador}
                    disabled={ro || players.length >= MAX_PLAYERS}
                    placeholder="Buscar jogador cadastrado..."
                  />
                </div>
                <button
                  onClick={addPlayer}
                  disabled={ro || players.length >= MAX_PLAYERS || !selectedJogador}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 rounded-lg cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {players.map(player => (
              <div key={player.id} className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedPlayer(expandedPlayer === player.id ? null : player.id)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${player.ativo ? 'bg-yellow-400' : 'bg-gray-500'}`} />
                    <div>
                      <div className="font-bold text-white">{player.name}</div>
                      <div className="text-xs text-gray-400">
                        {player.rebuys}/{config.maxRebuys} rebuys • R$ {((player.buyIns + player.rebuys) * config.buyIn).toFixed(0)}
                      </div>
                    </div>
                  </div>
                  {expandedPlayer === player.id
                    ? <ChevronUp className="w-5 h-5 text-gray-400" />
                    : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>

                {expandedPlayer === player.id && (
                  <div className="px-4 pb-4 border-t border-gray-700 pt-3 space-y-3">
                    <button onClick={() => toggleAtivo(player.id)}
                      disabled={ro}
                      className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${player.ativo ? 'bg-orange-600 hover:bg-orange-500' : 'bg-yellow-600 hover:bg-yellow-500'}`}>
                      {player.ativo ? <><LogOut className="w-4 h-4" /> Sair da Mesa</> : <><LogIn className="w-4 h-4" /> Voltar à Mesa</>}
                    </button>

                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Rebuy ({player.rebuys}/{config.maxRebuys})</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(mult => (
                          <button key={mult} onClick={() => doRebuy(player.id, mult)}
                            disabled={ro || player.rebuys >= config.maxRebuys}
                            className="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer py-3 rounded-lg font-bold text-sm flex flex-col items-center transition-colors">
                            <span>{mult}x</span>
                            <span className="text-xs font-normal text-blue-200">R$ {mult * config.buyIn}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Histórico</label>
                      <div className="space-y-1">
                        {player.historico.map((h, i) => {
                          const isRebuy = h.tipo.startsWith('Rebuy');
                          return (
                            <div key={h.histId ?? i} className="flex justify-between items-center text-xs bg-gray-700 rounded px-3 py-2">
                              <span className="text-gray-300">{h.tipo}</span>
                              <div className="flex items-center gap-2">
                                {h.valor > 0 && <span className="text-red-400">-R$ {h.valor}</span>}
                                {isRebuy && (
                                  <button
                                    onClick={e => { e.stopPropagation(); undoRebuy(player.id, i); }}
                                    className="text-gray-500 hover:text-red-400 transition-colors p-0.5 rounded"
                                    title="Desfazer rebuy"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button onClick={() => removePlayer(player.id)}
                      disabled={ro}
                      className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                      <X className="w-4 h-4" /> Remover Jogador
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB MESA ── */}
        {tab === 'mesa' && (
          <div className="space-y-3">
            <div className="bg-gray-800/60 border border-white/[0.06] rounded-xl p-3 text-sm text-gray-400 flex items-center justify-center gap-2">
              <Info className="w-4 h-4 text-yellow-500/70 shrink-0" />
              Informe quantas fichas cada jogador tem no final
            </div>

            {/* Card Fichas da Dealer */}
            <div className="bg-gray-800 border border-yellow-600/50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    Fichas da Dealer
                  </div>
                  <div className="text-xs text-gray-400">Doação livre — não entra no balanço</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Valor em R$</div>
                  <div className="font-bold text-yellow-400">R$ {(fichasDealer * config.chipValue).toFixed(2)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setFichasDealer(v => Math.max(0, v - 1))}
                  disabled={ro}
                  className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer p-3 rounded-lg transition-colors"><Minus className="w-5 h-5" /></button>
                <input
                  type="number" value={fichasDealer} min={0}
                  onChange={e => setFichasDealer(Math.max(0, Number(e.target.value)))}
                  disabled={ro}
                  className="flex-1 bg-gray-700 text-white text-center rounded-lg px-3 py-3 border border-yellow-600 text-lg font-bold disabled:opacity-60"
                />
                <button onClick={() => setFichasDealer(v => v + 1)}
                  disabled={ro}
                  className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer p-3 rounded-lg transition-colors"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="text-xs text-gray-400 text-center mt-2">fichas</div>
            </div>

            {players.length === 0 && <div className="text-center text-gray-400 py-10">Nenhum jogador cadastrado ainda.</div>}
            {players.map(player => (
              <div key={player.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="font-bold text-white">{player.name}</div>
                    <div className="text-xs text-gray-400">Investiu R$ {((player.buyIns + player.rebuys) * config.buyIn).toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Valor em R$</div>
                    <div className="font-bold text-yellow-400">R$ {(player.fichasFinais * config.chipValue).toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateFichas(player.id, player.fichasFinais - 1)}
                    disabled={ro}
                    className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer p-3 rounded-lg transition-colors"><Minus className="w-5 h-5" /></button>
                  <input type="number" value={player.fichasFinais}
                    onChange={e => updateFichas(player.id, Number(e.target.value))}
                    disabled={ro}
                    className="flex-1 bg-gray-700 text-white text-center rounded-lg px-3 py-3 border border-gray-600 text-lg font-bold disabled:opacity-60" />
                  <button onClick={() => updateFichas(player.id, player.fichasFinais + 1)}
                    disabled={ro}
                    className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer p-3 rounded-lg transition-colors"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="text-xs text-gray-400 text-center mt-2">fichas</div>
              </div>
            ))}

            {players.length > 0 && (() => {
              const total = players.reduce((s, p) => s + p.fichasFinais, 0);
              const esperado = players.reduce((s, p) => s + (p.buyIns + p.rebuys) * config.chipsPerBuyIn, 0) - fichasDealer;
              const diff = total - esperado;
              return (
                <div className={`rounded-xl p-4 text-center ${Math.abs(diff) < 1 ? 'bg-green-900 border border-green-600' : 'bg-red-900 border border-red-600'}`}>
                  <div className="text-sm font-bold text-white mb-1">Verificação de Fichas</div>
                  <div className="text-xs text-gray-300">
                    Contado: <strong>{total}</strong> | Esperado: <strong>{esperado}</strong>
                    {fichasDealer > 0 && <span className="text-yellow-300"> (−{fichasDealer} dealer)</span>}
                  </div>
                  {Math.abs(diff) < 1
                    ? <div className="text-green-400 font-bold mt-1 flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Fichas conferem!</div>
                    : <div className="text-red-400 font-bold mt-1 flex items-center justify-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Diferença de {diff} fichas</div>}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── TAB ACERTO ── */}
        {tab === 'acerto' && (
          <div className="space-y-4">
            {players.length === 0 && <div className="text-center text-gray-400 py-10">Nenhum jogador cadastrado ainda.</div>}

            {/* Salvar Sessão — oculto para espectadores */}
            {!ro && players.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" /> Salvar no Ranking
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {sessaoSalva ? 'Sessão registrada com sucesso!' : 'Registra posições e pontos desta sessão'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (grupos.length > 0) {
                      setGrupoSelecionado(null);
                      setShowGrupoModal(true);
                    } else {
                      salvarSessao(null);
                    }
                  }}
                  disabled={salvandoSessao || sessaoSalva}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors shrink-0 ${
                    sessaoSalva
                      ? 'bg-green-700 text-green-200 cursor-default'
                      : 'bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white'
                  }`}
                >
                  {salvandoSessao
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                    : sessaoSalva
                    ? <><Check className="w-4 h-4" /> Salvo!</>
                    : <><Save className="w-4 h-4" /> Salvar</>}
                </button>
              </div>
            )}

            {players.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-4">
                <h2 className="text-base font-bold text-yellow-400 mb-3">Balanço Final</h2>
                <div className="space-y-2">
                  {players.map(player => {
                    const { spent, won, balance } = calcBalance(player);
                    return (
                      <div key={player.id} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white">{player.name}</span>
                          <span className={`text-lg font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {balance >= 0 ? '+' : ''}R$ {balance.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Investiu: R$ {spent.toFixed(2)}</span>
                          <span>Fichas: R$ {won.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {players.length > 0 && (() => {
              const { winners, losers, payments } = calcPayments();
              return (
                <>
                  {winners.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-4">
                      <h2 className="text-base font-bold text-green-400 mb-3 flex items-center gap-2"><Trophy className="w-4 h-4" /> Ganhadores</h2>
                      <div className="space-y-2">
                        {winners.map(w => (
                          <div key={w.id} className="bg-green-900/40 border border-green-700 rounded-lg p-3 flex justify-between">
                            <span className="font-bold text-white">{w.name}</span>
                            <span className="text-green-400 font-bold text-lg">+R$ {w.balance.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {losers.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-4">
                      <h2 className="text-base font-bold text-red-400 mb-3 flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Perdedores</h2>
                      <div className="space-y-2">
                        {losers.map(l => (
                          <div key={l.id} className="bg-red-900/40 border border-red-700 rounded-lg p-3 flex justify-between">
                            <span className="font-bold text-white">{l.name}</span>
                            <span className="text-red-400 font-bold text-lg">-R$ {Math.abs(l.balance).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {payments.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-4">
                      <h2 className="text-base font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" /> Quem Paga Quem
                      </h2>
                      <div className="space-y-3">
                        {payments.map((pay, i) => {
                          const isDealer = pay.to === 'Dealer';
                          return (
                            <div key={i} className={`rounded-lg p-4 ${isDealer ? 'bg-yellow-900/40 border-2 border-yellow-400' : 'bg-gray-700 border border-yellow-600'}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white">{pay.from}</span>
                                <span className="text-yellow-400">→</span>
                                <span className={`font-bold ${isDealer ? 'text-yellow-300' : 'text-white'}`}>
                                  {isDealer ? '🎰 Dealer' : pay.to}
                                </span>
                              </div>
                              <div className={`text-right font-bold text-2xl ${isDealer ? 'text-yellow-300' : 'text-yellow-400'}`}>R$ {pay.amount}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Modal: Escolher grupo ao salvar */}
      {showGrupoModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowGrupoModal(false)}
        >
          <div
            className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" /> Salvar sessão
              </h3>
              <button onClick={() => setShowGrupoModal(false)} className="text-gray-500 hover:text-gray-300 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-400">Escolha em qual grupo esta sessão será registrada:</p>

            {/* Opção: sem grupo */}
            <button
              onClick={() => setGrupoSelecionado(null)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                grupoSelecionado === null
                  ? 'border-gray-400 bg-gray-700/60 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-xl shrink-0">📋</div>
              <div>
                <div className="font-semibold text-sm">Sem grupo</div>
                <div className="text-xs opacity-60">Salvo só no histórico geral</div>
              </div>
              {grupoSelecionado === null && <Check className="w-4 h-4 ml-auto text-white shrink-0" />}
            </button>

            {/* Grupos disponíveis */}
            {grupos.map(g => (
              <button
                key={g.id}
                onClick={() => setGrupoSelecionado(g)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  grupoSelecionado?.id === g.id
                    ? 'border-yellow-500/60 bg-yellow-900/20 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-xl shrink-0">
                  {g.icone}
                </div>
                <div className="font-semibold text-sm">{g.nome}</div>
                {grupoSelecionado?.id === g.id && <Check className="w-4 h-4 ml-auto text-yellow-400 shrink-0" />}
              </button>
            ))}

            <button
              onClick={() => salvarSessao(grupoSelecionado)}
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              {grupoSelecionado ? `Salvar em "${grupoSelecionado.nome}"` : 'Salvar sem grupo'}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm border border-yellow-500/40 text-yellow-300 font-semibold text-sm px-5 py-3 rounded-xl shadow-2xl shadow-black/50 z-50 whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Modal Compartilhar */}
      {showShareModal && sessionId && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-xs space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white text-center">Compartilhar Mesa</h3>

            {/* QR Code */}
            <div className="flex justify-center bg-white p-4 rounded-xl">
              <QRCodeSVG value={shareUrl} size={160} />
            </div>

            {/* Código */}
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Código da Mesa</div>
              <div className="text-4xl font-black text-yellow-400 tracking-[0.2em] font-mono">{sessionId}</div>
            </div>

            {/* URL truncada */}
            <div className="bg-white/[0.05] rounded-lg px-3 py-2 text-xs text-gray-400 font-mono truncate text-center">
              {shareUrl}
            </div>

            {/* Botões */}
            <button
              onClick={copyShareLink}
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200"
            >
              <Link2 className="w-4 h-4" />
              Copiar Link
            </button>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full text-gray-500 hover:text-gray-300 text-sm cursor-pointer transition-colors py-1"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
      {/* Modal Encerrar Sala */}
      {showDeleteModal && sessionId && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="bg-gray-900 border border-red-700 rounded-2xl p-6 w-full max-w-sm space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-900/50 p-2.5 rounded-xl">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Encerrar Sala</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Tem certeza? Isso vai <span className="text-red-400 font-semibold">apagar a sala e todos os dados não salvos</span>. Se já salvou no ranking, o histórico permanece.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await fetch(`/api/poker/session/${sessionId}`, { method: 'DELETE' });
                    localStorage.removeItem(`poker-admin-${sessionId}`);
                    window.location.href = '/labs/poker-pay/cash';
                  } catch {
                    setDeleting(false);
                  }
                }}
                className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Encerrando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
