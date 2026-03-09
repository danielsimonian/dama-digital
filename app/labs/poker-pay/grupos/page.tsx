'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft, Flag, Plus, Pencil, Archive, ArchiveRestore,
  Loader2, Check, X, ChevronRight,
} from 'lucide-react';

interface Grupo {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  descricao?: string;
  ativo: boolean;
  criado_em: string;
}

const CORES: { id: string; label: string; bg: string; border: string; text: string; pill: string }[] = [
  { id: 'blue',   label: 'Azul',     bg: 'bg-blue-500',   border: 'border-blue-500',   text: 'text-blue-400',   pill: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { id: 'orange', label: 'Laranja',  bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400', pill: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  { id: 'purple', label: 'Roxo',     bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-400', pill: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'green',  label: 'Verde',    bg: 'bg-green-500',  border: 'border-green-500',  text: 'text-green-400',  pill: 'bg-green-500/20 text-green-300 border-green-500/40' },
  { id: 'red',    label: 'Vermelho', bg: 'bg-red-500',    border: 'border-red-500',    text: 'text-red-400',    pill: 'bg-red-500/20 text-red-300 border-red-500/40' },
  { id: 'pink',   label: 'Rosa',     bg: 'bg-pink-500',   border: 'border-pink-500',   text: 'text-pink-400',   pill: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  { id: 'yellow', label: 'Amarelo',  bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400', pill: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  { id: 'teal',   label: 'Verde-azul', bg: 'bg-teal-500', border: 'border-teal-500',   text: 'text-teal-400',   pill: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
];

const ICONES = ['🌙', '☀️', '🎲', '🃏', '🏆', '⚡', '🔥', '💎', '🎯', '🌟', '🌊', '🍀'];

function getCorConfig(cor: string) {
  return CORES.find(c => c.id === cor) ?? CORES[2];
}

function formatDate(d: string) {
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Modal Criar/Editar ──────────────────────────────── */

function GrupoModal({
  grupo,
  onClose,
  onSave,
}: {
  grupo?: Grupo;
  onClose: () => void;
  onSave: (g: Grupo) => void;
}) {
  const [nome, setNome]         = useState(grupo?.nome ?? '');
  const [icone, setIcone]       = useState(grupo?.icone ?? '🎲');
  const [cor, setCor]           = useState(grupo?.cor ?? 'purple');
  const [descricao, setDescricao] = useState(grupo?.descricao ?? '');
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState('');

  const corCfg = getCorConfig(cor);

  const handleSave = async () => {
    if (!nome.trim()) { setErr('Nome obrigatório'); return; }
    setSaving(true);
    setErr('');
    try {
      const url    = grupo ? `/api/poker/grupos/${grupo.id}` : '/api/poker/grupos';
      const method = grupo ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, icone, cor, descricao }),
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      const saved: Grupo = await res.json();
      onSave(saved);
    } catch {
      setErr('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{grupo ? 'Editar grupo' : 'Criar grupo'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {/* Preview */}
        <div className={`rounded-xl p-4 flex items-center gap-3 bg-gray-800 border ${corCfg.border}/40`}>
          <div className={`w-12 h-12 rounded-xl ${corCfg.bg} flex items-center justify-center text-2xl shrink-0`}>
            {icone}
          </div>
          <div>
            <div className="font-bold text-white">{nome || 'Nome do grupo'}</div>
            {descricao && <div className="text-xs text-gray-400 mt-0.5">{descricao}</div>}
          </div>
        </div>

        {/* Nome */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400">Nome *</label>
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Ex: Segunda-feira"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 text-sm"
          />
        </div>

        {/* Ícone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400">Ícone</label>
          <div className="grid grid-cols-6 gap-2">
            {ICONES.map(ic => (
              <button
                key={ic}
                onClick={() => setIcone(ic)}
                className={`h-10 rounded-lg text-xl flex items-center justify-center transition-all cursor-pointer ${
                  icone === ic ? 'bg-gray-600 ring-2 ring-white/40' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Cor */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400">Cor</label>
          <div className="grid grid-cols-4 gap-2">
            {CORES.map(c => (
              <button
                key={c.id}
                onClick={() => setCor(c.id)}
                className={`h-9 rounded-lg ${c.bg} flex items-center justify-center text-white text-xs font-bold transition-all cursor-pointer ${
                  cor === c.id ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-gray-900' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {cor === c.id && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400">Descrição <span className="text-gray-600">(opcional)</span></label>
          <input
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Ex: Mesa tradicional das segundas"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 text-sm"
          />
        </div>

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${corCfg.bg} text-white hover:opacity-90 disabled:opacity-50`}
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Check className="w-4 h-4" /> Salvar</>}
        </button>
      </div>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────── */

export default function GruposPage() {
  const [grupos, setGrupos]         = useState<Grupo[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editando, setEditando]     = useState<Grupo | undefined>(undefined);
  const [showInativos, setShowInativos] = useState(false);

  const load = async () => {
    try {
      const res = await fetch('/api/poker/grupos', { cache: 'no-store' });
      const data: Grupo[] = await res.json();
      setGrupos(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = (g: Grupo) => {
    setGrupos(prev => {
      const idx = prev.findIndex(x => x.id === g.id);
      return idx === -1 ? [...prev, g] : prev.map(x => x.id === g.id ? g : x);
    });
    setShowModal(false);
    setEditando(undefined);
  };

  const toggleAtivo = async (grupo: Grupo) => {
    try {
      const res = await fetch(`/api/poker/grupos/${grupo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !grupo.ativo }),
      });
      if (res.ok) {
        const updated: Grupo = await res.json();
        setGrupos(prev => prev.map(g => g.id === updated.id ? updated : g));
      }
    } catch { /* silent */ }
  };

  const ativos   = grupos.filter(g => g.ativo);
  const inativos = grupos.filter(g => !g.ativo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900 p-3 pb-24">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
          <a href="/labs/poker-pay" className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </a>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-purple-400 flex items-center gap-2">
              <Flag className="w-5 h-5" /> Grupos
            </h1>
            <p className="text-xs text-gray-400">Poker Pay · Organização de sessões</p>
          </div>
          <button
            onClick={() => { setEditando(undefined); setShowModal(true); }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Criar
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Carregando grupos...</span>
          </div>
        )}

        {/* Empty */}
        {!loading && grupos.length === 0 && (
          <div className="bg-gray-800/60 border border-white/[0.06] rounded-xl p-10 text-center">
            <Flag className="w-10 h-10 mx-auto mb-3 text-gray-600" />
            <div className="font-bold text-white mb-1">Nenhum grupo criado</div>
            <div className="text-sm text-gray-400 mb-5">
              Crie grupos para organizar suas sessões por dia ou estilo de jogo.
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Criar primeiro grupo
            </button>
          </div>
        )}

        {/* Grupos ativos */}
        {!loading && ativos.length > 0 && (
          <div className="space-y-3">
            {ativos.map(grupo => {
              const corCfg = getCorConfig(grupo.cor);
              return (
                <div
                  key={grupo.id}
                  className={`bg-gray-800 rounded-xl overflow-hidden border ${corCfg.border}/30`}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${corCfg.bg} flex items-center justify-center text-2xl shrink-0 shadow-lg`}>
                      {grupo.icone}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-white text-base`}>{grupo.nome}</div>
                      {grupo.descricao && (
                        <div className="text-xs text-gray-400 mt-0.5 truncate">{grupo.descricao}</div>
                      )}
                      <div className="text-xs text-gray-600 mt-1">Criado em {formatDate(grupo.criado_em)}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`/labs/poker-pay/ranking?grupo=${grupo.id}`}
                        className={`${corCfg.pill} border text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity`}
                      >
                        Ranking <ChevronRight className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => { setEditando(grupo); setShowModal(true); }}
                        className="text-gray-500 hover:text-gray-300 p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleAtivo(grupo)}
                        className="text-gray-500 hover:text-orange-400 p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                        title="Arquivar"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Grupos arquivados */}
        {!loading && inativos.length > 0 && (
          <div>
            <button
              onClick={() => setShowInativos(v => !v)}
              className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1.5 px-1 cursor-pointer transition-colors mb-2"
            >
              <Archive className="w-3.5 h-3.5" />
              {showInativos ? 'Ocultar arquivados' : `Ver ${inativos.length} arquivado${inativos.length > 1 ? 's' : ''}`}
            </button>
            {showInativos && (
              <div className="space-y-2">
                {inativos.map(grupo => (
                  <div key={grupo.id} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-3 flex items-center gap-3 opacity-60">
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-xl shrink-0">
                      {grupo.icone}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-400 font-medium text-sm">{grupo.nome}</div>
                    </div>
                    <button
                      onClick={() => toggleAtivo(grupo)}
                      className="text-gray-500 hover:text-green-400 p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                      title="Reativar"
                    >
                      <ArchiveRestore className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <GrupoModal
          grupo={editando}
          onClose={() => { setShowModal(false); setEditando(undefined); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
