'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Search, UserX } from 'lucide-react';

export interface JogadorBase {
  id: string;
  nome: string;
  apelido?: string;
}

interface Props {
  jogadores: JogadorBase[];
  selected: JogadorBase | null;
  onSelect: (j: JogadorBase | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function PlayerAutocomplete({
  jogadores,
  selected,
  onSelect,
  disabled = false,
  placeholder = 'Buscar jogador...',
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = query.toLowerCase().trim();
  const filtered = q
    ? jogadores.filter(
        j =>
          j.nome.toLowerCase().includes(q) ||
          (j.apelido?.toLowerCase().includes(q) ?? false)
      )
    : jogadores;

  const initial = (nome: string) => nome.charAt(0).toUpperCase();

  // Estado: jogador já selecionado
  if (selected) {
    return (
      <div className="flex items-center gap-3 bg-gray-700 rounded-lg px-4 py-3 border border-yellow-600/40 min-h-[48px]">
        <div className="w-8 h-8 rounded-full bg-yellow-600/25 border border-yellow-600/40 flex items-center justify-center text-yellow-400 text-sm font-bold shrink-0">
          {initial(selected.nome)}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-white font-medium">{selected.nome}</span>
          {selected.apelido && (
            <span className="text-gray-400 text-sm ml-1.5">({selected.apelido})</span>
          )}
        </div>
        {!disabled && (
          <button
            onClick={() => onSelect(null)}
            className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors shrink-0"
            aria-label="Limpar seleção"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-10 py-3 border border-gray-600 focus:border-yellow-500/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 z-30 overflow-hidden">
          {jogadores.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <UserX className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-400 font-medium">Nenhum jogador cadastrado</p>
              <a
                href="/labs/poker-pay/jogadores"
                className="text-xs text-yellow-400 hover:text-yellow-300 underline mt-1 block"
              >
                Cadastrar jogadores
              </a>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <p className="text-sm text-gray-300 font-medium">Jogador não encontrado</p>
              <p className="text-xs text-gray-500 mt-1">
                Fale com o admin para cadastrar.
              </p>
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto">
              {filtered.map((j, idx) => (
                <button
                  key={j.id}
                  onClick={() => { onSelect(j); setOpen(false); setQuery(''); }}
                  className={`w-full px-4 py-3 text-left hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center gap-3 ${idx < filtered.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-600/20 border border-yellow-600/30 flex items-center justify-center text-yellow-400 text-sm font-bold shrink-0">
                    {initial(j.nome)}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{j.nome}</div>
                    {j.apelido && <div className="text-gray-500 text-xs">{j.apelido}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
