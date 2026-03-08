'use client';

import { useState, useEffect } from 'react';
import {
  Users, Plus, ArrowLeft, Pencil, Archive, ArchiveRestore,
  Check, X, Loader2, AlertCircle, ChevronDown, ChevronUp,
  Download, Trash2,
} from 'lucide-react';

interface Jogador {
  id: string;
  nome: string;
  apelido?: string;
  ativo: boolean;
  criadoEm: string;
}

interface HistoricoNome {
  nome: string;
  sessoes: number;
}

export default function JogadoresPage() {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form: adicionar
  const [showAddForm, setShowAddForm] = useState(false);
  const [addNome, setAddNome] = useState('');
  const [addApelido, setAddApelido] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Edição inline
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editApelido, setEditApelido] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Arquivados
  const [showArchived, setShowArchived] = useState(false);

  // Migração
  const [showMigration, setShowMigration] = useState(false);
  const [histNomes, setHistNomes] = useState<HistoricoNome[]>([]);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationDone, setMigrationDone] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  /* ── fetch jogadores ─────────────────────────────────── */

  async function fetchJogadores() {
    try {
      const res = await fetch('/api/poker/jogadores');
      if (res.ok) setJogadores(await res.json());
      else setError('Erro ao carregar jogadores');
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchJogadores(); }, []);

  /* ── adicionar ───────────────────────────────────────── */

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const nome = addNome.trim();
    if (!nome) return;
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await fetch('/api/poker/jogadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, apelido: addApelido.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.erro ?? 'Erro ao adicionar'); return; }
      setJogadores(prev => [...prev, data]);
      setAddNome(''); setAddApelido('');
      setShowAddForm(false);
      showToast(`${nome} adicionado com sucesso`);
    } catch {
      setAddError('Erro de conexão');
    } finally {
      setAddLoading(false);
    }
  }

  /* ── editar ──────────────────────────────────────────── */

  function startEdit(j: Jogador) {
    setEditId(j.id);
    setEditNome(j.nome);
    setEditApelido(j.apelido ?? '');
    setEditError(null);
  }

  function cancelEdit() { setEditId(null); setEditError(null); }

  async function handleEdit(id: string) {
    const nome = editNome.trim();
    if (!nome) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/poker/jogadores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, apelido: editApelido.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.erro ?? 'Erro ao salvar'); return; }
      setJogadores(prev => prev.map(j => j.id === id ? data : j));
      setEditId(null);
      showToast('Jogador atualizado');
    } catch {
      setEditError('Erro de conexão');
    } finally {
      setEditLoading(false);
    }
  }

  /* ── arquivar / reativar ─────────────────────────────── */

  async function toggleAtivo(id: string) {
    try {
      const res = await fetch(`/api/poker/jogadores/${id}`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setJogadores(prev => prev.map(j => j.id === id ? updated : j));
        showToast(updated.ativo ? 'Jogador reativado' : 'Jogador arquivado');
      }
    } catch {}
  }

  /* ── migração do histórico ───────────────────────────── */

  async function loadHistoricoNomes() {
    setMigrationLoading(true);
    try {
      const res = await fetch('/api/poker/historico?filtro=todas');
      if (!res.ok) return;
      const data = await res.json();
      const nomesMap = new Map<string, number>();
      for (const s of data.sessoes ?? []) {
        for (const j of s.jogadores ?? []) {
          nomesMap.set(j.nome, (nomesMap.get(j.nome) ?? 0) + 1);
        }
      }
      // Filtrar nomes que já não têm jogador cadastrado (case-insensitive)
      const cadastrados = new Set(jogadores.map(j => j.nome.toLowerCase()));
      const naoVinculados = [...nomesMap.entries()]
        .filter(([nome]) => !cadastrados.has(nome.toLowerCase()))
        .map(([nome, sessoes]) => ({ nome, sessoes }))
        .sort((a, b) => b.sessoes - a.sessoes);
      setHistNomes(naoVinculados);
    } catch {} finally {
      setMigrationLoading(false);
    }
  }

  async function autoImportar() {
    setMigrationLoading(true);
    let criados = 0;
    for (const { nome } of histNomes) {
      try {
        const res = await fetch('/api/poker/jogadores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome }),
        });
        if (res.ok) criados++;
      } catch {}
    }
    await fetchJogadores();
    setHistNomes([]);
    setMigrationDone(true);
    showToast(`${criados} jogador(es) importado(s) do histórico`);
    setMigrationLoading(false);
  }

  /* ── render helpers ──────────────────────────────────── */

  const ativos    = jogadores.filter(j => j.ativo);
  const arquivados = jogadores.filter(j => !j.ativo);

  const initial = (nome: string) => nome.charAt(0).toUpperCase();

  const PlayerCard = ({ j }: { j: Jogador }) => {
    const isEditing = editId === j.id;

    return (
      <div className="bg-gray-800/60 border border-white/[0.06] rounded-xl overflow-hidden">
        {isEditing ? (
          /* ── modo edição ── */
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nome *</label>
                <input
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                  className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2 border border-gray-600 focus:border-yellow-500/40 focus:outline-none text-sm"
                  placeholder="Nome completo"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Apelido</label>
                <input
                  value={editApelido}
                  onChange={e => setEditApelido(e.target.value)}
                  className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2 border border-gray-600 focus:border-yellow-500/40 focus:outline-none text-sm"
                  placeholder="Opcional"
                />
              </div>
            </div>
            {editError && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{editError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(j.id)}
                disabled={editLoading || !editNome.trim()}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Salvar
              </button>
              <button
                onClick={cancelEdit}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" /> Cancelar
              </button>
            </div>
          </div>
        ) : (
          /* ── modo visualização ── */
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-600/20 border border-yellow-600/30 flex items-center justify-center text-yellow-400 font-bold text-base shrink-0">
              {initial(j.nome)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white truncate">{j.nome}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {j.apelido && <span className="text-gray-400 mr-2">{j.apelido}</span>}
                desde {j.criadoEm}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => startEdit(j)}
                className="p-2 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10 cursor-pointer transition-colors"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleAtivo(j.id)}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${j.ativo ? 'text-gray-500 hover:text-orange-400 hover:bg-orange-400/10' : 'text-gray-500 hover:text-green-400 hover:bg-green-400/10'}`}
                title={j.ativo ? 'Arquivar' : 'Reativar'}
              >
                {j.ativo ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ── page render ──────────────────────────────────────── */

  return (
    <div
      className="min-h-screen p-3 pb-16"
      style={{ background: 'linear-gradient(135deg, #451a03 0%, #78350f 35%, #1c1917 100%)' }}
    >
      <div className="max-w-lg mx-auto space-y-4">

        {/* Breadcrumb / Header */}
        <div className="flex items-center gap-3 pt-2">
          <a
            href="/labs/poker-pay"
            className="bg-white/[0.07] hover:bg-white/[0.12] p-2 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </a>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
              <Users className="w-5 h-5" /> Jogadores
            </h1>
            <p className="text-xs text-gray-400">Poker Pay · Cadastro</p>
          </div>
          <button
            onClick={() => { setShowAddForm(v => !v); setAddError(null); }}
            className="flex items-center gap-1.5 bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        {/* Form: Adicionar */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="bg-gray-800/70 border border-white/[0.06] rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-bold text-yellow-400">Novo Jogador</h2>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nome *</label>
                <input
                  value={addNome}
                  onChange={e => setAddNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2.5 border border-gray-600 focus:border-yellow-500/40 focus:outline-none text-sm"
                  autoFocus
                  maxLength={40}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Apelido <span className="text-gray-600">(opcional)</span></label>
                <input
                  value={addApelido}
                  onChange={e => setAddApelido(e.target.value)}
                  placeholder="Ex: MD, Duarte"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2.5 border border-gray-600 focus:border-yellow-500/40 focus:outline-none text-sm"
                  maxLength={20}
                />
              </div>
            </div>
            {addError && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{addError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addLoading || !addNome.trim()}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setAddNome(''); setAddApelido(''); setAddError(null); }}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* Lista: Ativos */}
        {!loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Ativos ({ativos.length})
              </h2>
            </div>

            {ativos.length === 0 ? (
              <div className="bg-gray-800/40 border border-white/[0.04] rounded-xl p-8 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm text-gray-400">Nenhum jogador cadastrado</p>
                <p className="text-xs text-gray-600 mt-1">Clique em "Adicionar" para começar</p>
              </div>
            ) : (
              ativos.map(j => <PlayerCard key={j.id} j={j} />)
            )}
          </div>
        )}

        {/* Lista: Arquivados */}
        {!loading && arquivados.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowArchived(v => !v)}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider px-1 cursor-pointer hover:text-gray-400 transition-colors w-full"
            >
              {showArchived ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Arquivados ({arquivados.length})
            </button>
            {showArchived && (
              <div className="space-y-2 opacity-60">
                {arquivados.map(j => <PlayerCard key={j.id} j={j} />)}
              </div>
            )}
          </div>
        )}

        {/* Migração do Histórico */}
        {!loading && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <button
              onClick={() => {
                setShowMigration(v => !v);
                if (!showMigration && histNomes.length === 0 && !migrationDone) loadHistoricoNomes();
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                <Download className="w-4 h-4" />
                Importar do Histórico
              </div>
              {showMigration ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
            </button>

            {showMigration && (
              <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04]">
                <p className="text-xs text-gray-500 pt-3">
                  Nomes do histórico de sessões que ainda não têm jogador cadastrado.
                </p>

                {migrationLoading && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
                  </div>
                )}

                {!migrationLoading && migrationDone && histNomes.length === 0 && (
                  <p className="text-xs text-green-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Todos os nomes do histórico já estão cadastrados.
                  </p>
                )}

                {!migrationLoading && histNomes.length > 0 && (
                  <>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {histNomes.map(n => (
                        <div key={n.nome} className="flex items-center justify-between bg-gray-800/60 rounded-lg px-3 py-2">
                          <span className="text-white text-sm font-medium">{n.nome}</span>
                          <span className="text-xs text-gray-500">{n.sessoes} sessão{n.sessoes !== 1 ? 'ões' : ''}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={autoImportar}
                      disabled={migrationLoading}
                      className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Criar {histNomes.length} jogador{histNomes.length !== 1 ? 'es' : ''} automaticamente
                    </button>
                    <p className="text-xs text-gray-600 text-center">
                      Cada nome vira um jogador ativo. Você pode editar depois.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
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
