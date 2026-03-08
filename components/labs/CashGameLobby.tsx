'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LogIn, ArrowLeft, History, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

interface RecentSession {
  id: string;
  savedAt: string;
  isAdmin: boolean;
}

export default function CashGameLobby() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentSession[]>([]);

  useEffect(() => {
    async function loadAndValidate() {
      try {
        const stored = localStorage.getItem('poker-recent-sessions');
        if (!stored) return;
        const parsed: RecentSession[] = JSON.parse(stored);
        if (!parsed.length) return;

        // Verificar quais sessões ainda existem no Redis
        const checks = await Promise.all(
          parsed.map(s =>
            fetch(`/api/poker/session/${s.id}`, { cache: 'no-store' })
              .then(r => ({ id: s.id, ok: r.ok }))
              .catch(() => ({ id: s.id, ok: false }))
          )
        );

        const validas = parsed.filter(s => checks.find(c => c.id === s.id)?.ok);

        // Limpa localStorage se alguma sessão expirou
        if (validas.length !== parsed.length) {
          localStorage.setItem('poker-recent-sessions', JSON.stringify(validas));
        }

        setRecent(validas);
      } catch {}
    }

    loadAndValidate();
  }, []);

  function saveToRecent(id: string, isAdmin: boolean) {
    const entry: RecentSession = { id, savedAt: new Date().toISOString(), isAdmin };
    const updated = [entry, ...recent.filter(s => s.id !== id)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem('poker-recent-sessions', JSON.stringify(updated));
  }

  async function createSession() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/poker/session', { method: 'POST' });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      localStorage.setItem(`poker-admin-${id}`, 'true');
      saveToRecent(id, true);
      router.push(`/labs/poker-pay/cash/${id}`);
    } catch {
      setError('Erro ao criar sessão. Tente novamente.');
      setCreating(false);
    }
  }

  async function joinSession() {
    const id = code.toUpperCase().trim();
    if (id.length < 4) return;
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(`/api/poker/session/${id}`);
      if (res.status === 404) {
        setError('Sessão não encontrada. Verifique o código.');
        setJoining(false);
        return;
      }
      if (!res.ok) throw new Error();
      saveToRecent(id, false);
      router.push(`/labs/poker-pay/cash/${id}`);
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setJoining(false);
    }
  }

  return (
    <div
      className="min-h-screen p-4 pb-16"
      style={{ background: 'linear-gradient(135deg, #451a03 0%, #78350f 35%, #1c1917 100%)' }}
    >
      <div className="max-w-sm mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3 pt-2 pb-2">
          <a
            href="/labs/poker-pay"
            className="bg-white/[0.07] hover:bg-white/[0.12] p-2 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </a>
          <div>
            <h1 className="text-xl font-bold text-yellow-400">Cash Game</h1>
            <p className="text-xs text-gray-400">Escolha como entrar</p>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-900/40 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Nova Sessão */}
        <button
          onClick={createSession}
          disabled={creating}
          className="w-full group relative overflow-hidden bg-yellow-600 hover:bg-yellow-500 disabled:opacity-70 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:shadow-yellow-500/20 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              {creating
                ? <Loader2 className="w-7 h-7 text-white animate-spin" />
                : <Plus className="w-7 h-7 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nova Sessão</h2>
              <p className="text-yellow-100/70 text-sm mt-0.5">Crie uma mesa e compartilhe o link</p>
            </div>
          </div>
        </button>

        {/* Entrar em Sessão */}
        <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-5 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <LogIn className="w-5 h-5 text-yellow-400" />
            Entrar em Sessão
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && joinSession()}
              placeholder="ABC123"
              maxLength={6}
              className="flex-1 bg-white/[0.08] text-white placeholder-gray-400 rounded-xl px-4 py-3 border border-white/[0.08] focus:border-yellow-500/40 focus:outline-none text-base font-mono tracking-[0.25em] uppercase transition-colors"
            />
            <button
              onClick={joinSession}
              disabled={joining || code.length < 4}
              className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:opacity-50 text-white px-4 rounded-xl cursor-pointer transition-colors duration-200"
            >
              {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Peça o código de 6 caracteres ao organizador da mesa
          </p>
        </div>

        {/* Sessões Recentes */}
        {recent.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <History className="w-3.5 h-3.5" />
              Sessões Recentes
            </h2>
            {recent.map(s => (
              <a
                key={s.id}
                href={`/labs/poker-pay/cash/${s.id}`}
                className="flex items-center justify-between bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-xl px-4 py-3 transition-all duration-200 cursor-pointer group"
              >
                <div>
                  <div className="font-mono font-bold text-white text-sm tracking-[0.2em]">{s.id}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {s.isAdmin ? 'Sua mesa' : 'Espectador'} · {new Date(s.savedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${s.isAdmin ? 'bg-yellow-500/15 text-yellow-400' : 'bg-white/[0.06] text-gray-400'}`}>
                    {s.isAdmin ? 'Admin' : 'Ver'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
