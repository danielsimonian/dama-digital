'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import CashGameApp from '@/components/labs/CashGame';

interface Config {
  buyIn: number;
  chipValue: number;
  chipsPerBuyIn: number;
  maxRebuys: number;
}

interface SessionData {
  id: string;
  config: Config;
  players: unknown[];
  dealerChips: number;
}

export default function SessionPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = (params?.sessionId ?? '').toUpperCase();

  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setIsAdmin(localStorage.getItem(`poker-admin-${sessionId}`) === 'true');

    fetch(`/api/poker/session/${sessionId}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(d => { if (d) setData(d); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Carregando sessão...</span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 p-6">
        <AlertTriangle className="w-12 h-12 text-yellow-500/60" />
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-1">Sessão não encontrada</h1>
          <p className="text-gray-400 text-sm">O código <span className="font-mono text-yellow-400">{sessionId}</span> não existe ou expirou.</p>
        </div>
        <a
          href="/labs/poker-pay/cash"
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Lobby
        </a>
      </div>
    );
  }

  return (
    <CashGameApp
      sessionId={sessionId}
      isAdmin={isAdmin}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialConfig={data?.config as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialPlayers={data?.players as any}
      initialDealerChips={data?.dealerChips}
    />
  );
}
