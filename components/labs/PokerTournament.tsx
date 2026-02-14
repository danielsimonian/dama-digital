'use client';

import { useState } from 'react';
import {
  Users, DollarSign, Trophy, Plus, Minus,
  Check, X, Settings, ChevronDown, ChevronUp, ArrowLeft,
} from 'lucide-react';

interface Player {
  id: number;
  name: string;
  rebuys: number;
  addOn: boolean;
  paid: boolean;
  position: number | null;
}

interface Config {
  buyIn: number;
  rebuy: number;
  addOn: number;
  maxRebuys: number;
}

interface Props {
  onBack: () => void;
}

export default function TournamentApp({ onBack }: Props) {
  const [config, setConfig] = useState<Config>({ buyIn: 50, rebuy: 50, addOn: 100, maxRebuys: 2 });
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [prizeStructure, setPrizeStructure] = useState([50, 30, 20]);
  const [showConfig, setShowConfig] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);

  const addPlayer = () => {
    if (playerName.trim() && players.length < 9) {
      setPlayers([...players, { id: Date.now(), name: playerName.trim(), rebuys: 0, addOn: false, paid: false, position: null }]);
      setPlayerName('');
    }
  };

  const removePlayer = (id: number) => setPlayers(players.filter(p => p.id !== id));

  const updatePlayer = (id: number, field: keyof Player, value: Player[keyof Player]) =>
    setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));

  const calculateTotal = (p: Player) =>
    config.buyIn + p.rebuys * config.rebuy + (p.addOn ? config.addOn : 0);

  const totalPot = players.reduce((s, p) => s + calculateTotal(p), 0);
  const getPrizes = () => prizeStructure.map(pct => (totalPot * pct / 100).toFixed(2));

  const assignPosition = (playerId: number, position: number) =>
    setPlayers(players.map(p => ({
      ...p,
      position: p.id === playerId ? position : p.position === position ? null : p.position,
    })));

  const getPlayerByPosition = (pos: number) => players.find(p => p.position === pos);

  const calculatePayments = () => {
    const prizes = getPrizes();
    const results = players.map(p => {
      const spent = calculateTotal(p);
      const won = p.position && p.position <= prizeStructure.length ? parseFloat(prizes[p.position - 1]) : 0;
      return { ...p, spent, won, balance: won - spent };
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900 p-3 pb-20">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-green-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Torneio
              </h1>
              <p className="text-xs text-gray-400">Texas Hold'em</p>
            </div>
          </div>
          <button onClick={() => setShowConfig(!showConfig)} className="bg-gray-700 p-3 rounded-lg">
            <Settings className="w-5 h-5 text-green-400" />
          </button>
        </div>

        {/* Configurações */}
        {showConfig && (
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <h2 className="text-base font-bold text-green-400 mb-3">Configurações</h2>
            <div className="grid grid-cols-2 gap-3">
              {([['Buy-in (R$)', 'buyIn'], ['Rebuy (R$)', 'rebuy'], ['Add-on (R$)', 'addOn'], ['Max Rebuys', 'maxRebuys']] as [string, keyof Config][]).map(([label, key]) => (
                <div key={key}>
                  <label className="block text-gray-400 text-xs mb-1">{label}</label>
                  <input type="number" value={config[key]}
                    onChange={e => setConfig({ ...config, [key]: Number(e.target.value) })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumo rápido */}
        {players.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Pote Total', value: `R$ ${totalPot.toFixed(0)}`, color: 'text-green-400' },
              { label: 'Jogadores', value: `${players.length}/9`, color: 'text-white' },
              { label: 'Pagaram', value: `${players.filter(p => p.paid).length}/${players.length}`, color: 'text-white' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">{label}</div>
                <div className={`text-lg font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar jogador */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <h2 className="text-base font-bold text-green-400 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" /> Jogadores ({players.length}/9)
          </h2>
          <div className="flex gap-2 mb-4">
            <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addPlayer()} placeholder="Nome do jogador"
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600"
              disabled={players.length >= 9} />
            <button onClick={addPlayer} disabled={players.length >= 9 || !playerName.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 rounded-lg">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {players.map(player => (
              <div key={player.id} className="bg-gray-700 rounded-xl overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedPlayer(expandedPlayer === player.id ? null : player.id)}>
                  <div className="flex-1">
                    <div className="font-bold text-white">{player.name}</div>
                    <div className="text-xs text-gray-400">
                      {player.rebuys} rebuy{player.rebuys !== 1 ? 's' : ''} •
                      {player.addOn ? ' Add-on ✓' : ' Sem add-on'} •
                      R$ {calculateTotal(player).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); updatePlayer(player.id, 'paid', !player.paid); }}
                      className={`p-2 rounded-lg ${player.paid ? 'bg-green-600' : 'bg-red-600'}`}>
                      {player.paid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                    {expandedPlayer === player.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {expandedPlayer === player.id && (
                  <div className="px-4 pb-4 border-t border-gray-600 pt-3 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Rebuys</label>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updatePlayer(player.id, 'rebuys', Math.max(0, player.rebuys - 1))}
                          className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg flex-1"><Minus className="w-5 h-5 mx-auto" /></button>
                        <span className="text-xl font-bold text-white w-12 text-center">{player.rebuys}</span>
                        <button onClick={() => updatePlayer(player.id, 'rebuys', Math.min(config.maxRebuys, player.rebuys + 1))}
                          disabled={player.rebuys >= config.maxRebuys}
                          className="bg-gray-600 hover:bg-gray-500 disabled:opacity-40 p-2 rounded-lg flex-1"><Plus className="w-5 h-5 mx-auto" /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Add-on</label>
                      <button onClick={() => updatePlayer(player.id, 'addOn', !player.addOn)}
                        className={`w-full py-3 rounded-lg font-bold ${player.addOn ? 'bg-green-600' : 'bg-gray-600'}`}>
                        {player.addOn ? '✓ Fez Add-on' : 'Sem Add-on'}
                      </button>
                    </div>
                    <button onClick={() => removePlayer(player.id)}
                      className="w-full bg-red-700 hover:bg-red-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                      <X className="w-4 h-4" /> Remover
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Premiação */}
        {players.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <h2 className="text-base font-bold text-green-400 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Premiação
            </h2>
            <div className="space-y-3">
              {prizeStructure.map((pct, idx) => (
                <div key={idx} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{idx + 1}º Lugar</span>
                    <span className="text-lg font-bold text-green-400">R$ {getPrizes()[idx]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" value={pct}
                      onChange={e => { const s = [...prizeStructure]; s[idx] = Number(e.target.value); setPrizeStructure(s); }}
                      className="w-20 bg-gray-600 text-white rounded-lg px-3 py-2 border border-gray-500 text-center" />
                    <span className="text-gray-400">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resultados */}
        {players.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-green-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Resultados
              </h2>
              <button onClick={() => setShowResults(!showResults)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold">
                {showResults ? 'Ocultar' : 'Definir'}
              </button>
            </div>
            {showResults && (
              <div className="space-y-3">
                {prizeStructure.map((_, idx) => {
                  const pos = idx + 1;
                  const winner = getPlayerByPosition(pos);
                  return (
                    <div key={pos} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-white">{pos}º Lugar</span>
                        <span className="text-green-400 font-bold">R$ {getPrizes()[idx]}</span>
                      </div>
                      <select value={winner?.id || ''} onChange={e => assignPosition(Number(e.target.value), pos)}
                        className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 border border-gray-500">
                        <option value="">Selecione</option>
                        {players.filter(p => !p.position || p.position === pos).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Acerto de Contas */}
        {showResults && players.some(p => p.position) && (() => {
          const { winners, losers, payments } = calculatePayments();
          return (
            <div className="space-y-4">
              {/* Balanço */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h2 className="text-base font-bold text-green-400 mb-3">Balanço Final</h2>
                <div className="space-y-2">
                  {players.map(player => {
                    const spent = calculateTotal(player);
                    const won = player.position && player.position <= prizeStructure.length ? parseFloat(getPrizes()[player.position - 1]) : 0;
                    const balance = won - spent;
                    return (
                      <div key={player.id} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="font-bold text-white">{player.name}</div>
                            {player.position && <div className="text-xs text-gray-400">{player.position}º lugar</div>}
                          </div>
                          <div className={`text-xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {balance >= 0 ? '+' : ''}R$ {balance.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Gastou: R$ {spent.toFixed(2)}</span>
                          <span>Ganhou: R$ {won.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {winners.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <h2 className="text-base font-bold text-green-400 mb-3">🏆 Ganhadores</h2>
                  <div className="space-y-2">
                    {winners.map(w => (
                      <div key={w.id} className="bg-green-900/30 border border-green-700 rounded-lg p-3 flex justify-between">
                        <span className="font-bold text-white">{w.name}</span>
                        <span className="text-green-400 font-bold">+R$ {w.balance.toFixed(2)}</span>
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
                      <div key={l.id} className="bg-red-900/30 border border-red-700 rounded-lg p-3 flex justify-between">
                        <span className="font-bold text-white">{l.name}</span>
                        <span className="text-red-400 font-bold">-R$ {Math.abs(l.balance).toFixed(2)}</span>
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
            </div>
          );
        })()}
      </div>
    </div>
  );
}