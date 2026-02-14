'use client';

import { useState } from 'react';
import {
  Users, DollarSign, Plus, Minus, Check, X,
  Settings, ChevronDown, ChevronUp, LogIn, LogOut, ArrowLeft,
} from 'lucide-react';

interface HistoricoItem { tipo: string; valor: number }
interface Player {
  id: number; name: string; buyIns: number; rebuys: number;
  fichasFinais: number; ativo: boolean; historico: HistoricoItem[];
}
interface Config { buyIn: number; chipValue: number; chipsPerBuyIn: number; maxRebuys: number }

type Tab = 'jogadores' | 'mesa' | 'acerto';

interface Props { onBack: () => void }

export default function CashGameApp({ onBack }: Props) {
  const [config, setConfig] = useState<Config>({ buyIn: 100, chipValue: 1, chipsPerBuyIn: 100, maxRebuys: 3 });
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('jogadores');

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
    if (!playerName.trim() || players.length >= 9) return;
    setPlayers([...players, {
      id: Date.now(), name: playerName.trim(), buyIns: 1, rebuys: 0,
      fichasFinais: config.chipsPerBuyIn, ativo: true,
      historico: [{ tipo: 'Buy-in', valor: config.buyIn }],
    }]);
    setPlayerName('');
  };

  const doRebuy = (id: number, mult: number) =>
    setPlayers(players.map(p => {
      if (p.id !== id || p.rebuys >= config.maxRebuys) return p;
      return {
        ...p, rebuys: p.rebuys + 1,
        fichasFinais: p.fichasFinais + mult * config.chipsPerBuyIn,
        historico: [...p.historico, { tipo: `Rebuy ${mult}x`, valor: mult * config.buyIn }],
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
    <button onClick={() => setTab(id)}
      className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${tab === id ? 'bg-yellow-600 text-white' : 'text-gray-400'}`}>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-gray-900 p-3 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                <DollarSign className="w-5 h-5" /> Cash Game
              </h1>
              <p className="text-xs text-gray-400">Texas Hold'em</p>
            </div>
          </div>
          <button onClick={() => setShowConfig(!showConfig)} className="bg-gray-700 p-3 rounded-lg">
            <Settings className="w-5 h-5 text-yellow-400" />
          </button>
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
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm" />
                </div>
              ))}
            </div>
            <div className="mt-3 bg-gray-700 rounded-lg p-3 text-xs text-gray-400">
              💡 {config.chipsPerBuyIn} fichas = R$ {config.buyIn} → cada ficha vale R$ {config.chipValue}
            </div>
          </div>
        )}

        {/* Resumo */}
        {players.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Pote Total', value: `R$ ${totalPot.toFixed(0)}`, color: 'text-yellow-400' },
              { label: 'Na Mesa', value: `${players.filter(p => p.ativo).length}/${players.length}`, color: 'text-white' },
              { label: 'Rebuys', value: `${players.reduce((s, p) => s + p.rebuys, 0)}`, color: 'text-orange-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">{label}</div>
                <div className={`text-lg font-bold ${color}`}>{value}</div>
              </div>
            ))}
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
                <Users className="w-5 h-5" /> Adicionar Jogador ({players.length}/9)
              </h2>
              <div className="flex gap-2">
                <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addPlayer()} placeholder="Nome do jogador"
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600"
                  disabled={players.length >= 9} />
                <button onClick={addPlayer} disabled={players.length >= 9 || !playerName.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 rounded-lg">
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
                      className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${player.ativo ? 'bg-orange-600' : 'bg-yellow-600'}`}>
                      {player.ativo ? <><LogOut className="w-4 h-4" /> Sair da Mesa</> : <><LogIn className="w-4 h-4" /> Voltar à Mesa</>}
                    </button>

                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Rebuy ({player.rebuys}/{config.maxRebuys})</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(mult => (
                          <button key={mult} onClick={() => doRebuy(player.id, mult)}
                            disabled={player.rebuys >= config.maxRebuys}
                            className="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 py-3 rounded-lg font-bold text-sm flex flex-col items-center">
                            <span>{mult}x</span>
                            <span className="text-xs font-normal text-blue-200">R$ {mult * config.buyIn}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Histórico</label>
                      <div className="space-y-1">
                        {player.historico.map((h, i) => (
                          <div key={i} className="flex justify-between text-xs bg-gray-700 rounded px-3 py-2">
                            <span className="text-gray-300">{h.tipo}</span>
                            {h.valor > 0 && <span className="text-red-400">-R$ {h.valor}</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button onClick={() => removePlayer(player.id)}
                      className="w-full bg-red-700 hover:bg-red-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2">
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
            <div className="bg-gray-700 rounded-xl p-3 text-sm text-gray-300 text-center">
              💡 Informe quantas fichas cada jogador tem no final
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
                    className="bg-gray-600 hover:bg-gray-500 p-3 rounded-lg"><Minus className="w-5 h-5" /></button>
                  <input type="number" value={player.fichasFinais}
                    onChange={e => updateFichas(player.id, Number(e.target.value))}
                    className="flex-1 bg-gray-700 text-white text-center rounded-lg px-3 py-3 border border-gray-600 text-lg font-bold" />
                  <button onClick={() => updateFichas(player.id, player.fichasFinais + 1)}
                    className="bg-gray-600 hover:bg-gray-500 p-3 rounded-lg"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="text-xs text-gray-400 text-center mt-2">fichas</div>
              </div>
            ))}

            {players.length > 0 && (() => {
              const total = players.reduce((s, p) => s + p.fichasFinais, 0);
              const esperado = players.reduce((s, p) => s + (p.buyIns + p.rebuys) * config.chipsPerBuyIn, 0);
              const diff = total - esperado;
              return (
                <div className={`rounded-xl p-4 text-center ${Math.abs(diff) < 1 ? 'bg-green-900 border border-green-600' : 'bg-red-900 border border-red-600'}`}>
                  <div className="text-sm font-bold text-white mb-1">Verificação de Fichas</div>
                  <div className="text-xs text-gray-300">Contado: <strong>{total}</strong> | Esperado: <strong>{esperado}</strong></div>
                  {Math.abs(diff) < 1
                    ? <div className="text-green-400 font-bold mt-1">✓ Fichas conferem!</div>
                    : <div className="text-red-400 font-bold mt-1">⚠ Diferença de {diff} fichas</div>}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── TAB ACERTO ── */}
        {tab === 'acerto' && (
          <div className="space-y-4">
            {players.length === 0 && <div className="text-center text-gray-400 py-10">Nenhum jogador cadastrado ainda.</div>}

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
                      <h2 className="text-base font-bold text-green-400 mb-3">🏆 Ganhadores</h2>
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
                      <h2 className="text-base font-bold text-red-400 mb-3">💸 Perdedores</h2>
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
                        {payments.map((pay, i) => (
                          <div key={i} className="bg-gray-700 border border-yellow-600 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-white">{pay.from}</span>
                              <span className="text-yellow-400">→</span>
                              <span className="font-bold text-white">{pay.to}</span>
                            </div>
                            <div className="text-right text-yellow-400 font-bold text-2xl">R$ {pay.amount}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}