"use client";

import React, { useState } from 'react';
import { Users, DollarSign, Trophy, Plus, Minus, Check, X, Settings, ChevronDown, ChevronUp } from 'lucide-react';

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

export default function PayPoker() {
  const [config, setConfig] = useState<Config>({
    buyIn: 50,
    rebuy: 50,
    addOn: 100,
    maxRebuys: 2
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [prizeStructure, setPrizeStructure] = useState([50, 30, 20]);
  const [showConfig, setShowConfig] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);

  const addPlayer = () => {
    if (playerName.trim() && players.length < 9) {
      setPlayers([...players, {
        id: Date.now(),
        name: playerName.trim(),
        rebuys: 0,
        addOn: false,
        paid: false,
        position: null
      }]);
      setPlayerName('');
    }
  };

  const removePlayer = (id: number) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const updatePlayer = (id: number, field: keyof Player, value: any) => {
    setPlayers(players.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const calculateTotal = (player: Player) => {
    return config.buyIn + (player.rebuys * config.rebuy) + (player.addOn ? config.addOn : 0);
  };

  const totalPot = players.reduce((sum, p) => sum + calculateTotal(p), 0);

  const getPrizes = () => {
    return prizeStructure.map(percent => (totalPot * percent / 100).toFixed(2));
  };

  const assignPosition = (playerId: number, position: number) => {
    setPlayers(players.map(p => ({
      ...p,
      position: p.id === playerId ? position : (p.position === position ? null : p.position)
    })));
  };

  const getPlayerByPosition = (pos: number) => {
    return players.find(p => p.position === pos);
  };

  const calculatePayments = () => {
    const prizes = getPrizes();
    const results = players.map(player => {
      const spent = calculateTotal(player);
      let won = 0;
      
      if (player.position && player.position <= prizeStructure.length) {
        won = parseFloat(prizes[player.position - 1]);
      }
      
      return {
        ...player,
        spent,
        won,
        balance: won - spent
      };
    });

    const winners = results.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);
    const losers = results.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);

    const payments: Array<{ from: string; to: string; amount: string }> = [];
    const loserDebts = losers.map(l => ({ ...l, remaining: Math.abs(l.balance) }));
    const winnerCredits = winners.map(w => ({ ...w, remaining: w.balance }));

    loserDebts.forEach(loser => {
      winnerCredits.forEach(winner => {
        if (loser.remaining > 0 && winner.remaining > 0) {
          const amount = Math.min(loser.remaining, winner.remaining);
          if (amount > 0.01) {
            payments.push({
              from: loser.name,
              to: winner.name,
              amount: amount.toFixed(2)
            });
            loser.remaining -= amount;
            winner.remaining -= amount;
          }
        }
      });
    });

    return { winners, losers, payments };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900 p-3 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-green-400 flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Torneio Poker
              </h1>
              <p className="text-xs text-gray-400">Texas Hold'em</p>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg"
            >
              <Settings className="w-5 h-5 text-green-400" />
            </button>
          </div>
        </div>

        {/* Configurações */}
        {showConfig && (
          <div className="bg-gray-800 rounded-xl shadow-xl p-4 mb-4">
            <h2 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 text-xs mb-1">Buy-in (R$)</label>
                <input
                  type="number"
                  value={config.buyIn}
                  onChange={(e) => setConfig({...config, buyIn: Number(e.target.value)})}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-xs mb-1">Rebuy (R$)</label>
                <input
                  type="number"
                  value={config.rebuy}
                  onChange={(e) => setConfig({...config, rebuy: Number(e.target.value)})}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-xs mb-1">Add-on (R$)</label>
                <input
                  type="number"
                  value={config.addOn}
                  onChange={(e) => setConfig({...config, addOn: Number(e.target.value)})}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-xs mb-1">Max Rebuys</label>
                <input
                  type="number"
                  value={config.maxRebuys}
                  onChange={(e) => setConfig({...config, maxRebuys: Number(e.target.value)})}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Resumo Rápido */}
        {players.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Pote Total</div>
              <div className="text-lg font-bold text-green-400">R$ {totalPot.toFixed(0)}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Jogadores</div>
              <div className="text-lg font-bold text-white">{players.length}/9</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Pagaram</div>
              <div className="text-lg font-bold text-white">{players.filter(p => p.paid).length}/{players.length}</div>
            </div>
          </div>
        )}

        {/* Adicionar Jogador */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-4 mb-4">
          <h2 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Jogadores ({players.length}/9)
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              placeholder="Nome do jogador"
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600"
              disabled={players.length >= 9}
            />
            <button
              onClick={addPlayer}
              disabled={players.length >= 9 || !playerName.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 rounded-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Jogadores */}
          {players.length > 0 && (
            <div className="space-y-2">
              {players.map(player => (
                <div key={player.id} className="bg-gray-700 rounded-lg overflow-hidden">
                  {/* Cabeçalho do Jogador */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedPlayer(expandedPlayer === player.id ? null : player.id)}
                  >
                    <div className="flex-1">
                      <div className="font-bold text-white mb-1">{player.name}</div>
                      <div className="text-xs text-gray-400">
                        {player.rebuys} rebuy{player.rebuys !== 1 ? 's' : ''} • 
                        {player.addOn ? ' Add-on ✓' : ' Sem add-on'} • 
                        R$ {calculateTotal(player).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePlayer(player.id, 'paid', !player.paid);
                        }}
                        className={`p-2 rounded-lg ${player.paid ? 'bg-green-600' : 'bg-red-600'}`}
                      >
                        {player.paid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                      {expandedPlayer === player.id ? 
                        <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      }
                    </div>
                  </div>

                  {/* Controles Expandidos */}
                  {expandedPlayer === player.id && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-600 pt-3">
                      {/* Rebuys */}
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">Rebuys</label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updatePlayer(player.id, 'rebuys', Math.max(0, player.rebuys - 1))}
                            className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg flex-1"
                          >
                            <Minus className="w-5 h-5 mx-auto" />
                          </button>
                          <span className="text-xl font-bold text-white w-12 text-center">{player.rebuys}</span>
                          <button
                            onClick={() => updatePlayer(player.id, 'rebuys', Math.min(config.maxRebuys, player.rebuys + 1))}
                            className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg flex-1"
                            disabled={player.rebuys >= config.maxRebuys}
                          >
                            <Plus className="w-5 h-5 mx-auto" />
                          </button>
                        </div>
                      </div>

                      {/* Add-on */}
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">Add-on</label>
                        <button
                          onClick={() => updatePlayer(player.id, 'addOn', !player.addOn)}
                          className={`w-full py-3 rounded-lg font-bold ${player.addOn ? 'bg-green-600' : 'bg-gray-600'}`}
                        >
                          {player.addOn ? '✓ Fez Add-on' : 'Sem Add-on'}
                        </button>
                      </div>

                      {/* Remover */}
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Remover Jogador
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Premiação */}
        {players.length > 0 && (
          <div className="bg-gray-800 rounded-xl shadow-xl p-4 mb-4">
            <h2 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Premiação
            </h2>
            <div className="space-y-3">
              {prizeStructure.map((percent, idx) => (
                <div key={idx} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{idx + 1}º Lugar</span>
                    <span className="text-lg font-bold text-green-400">
                      R$ {getPrizes()[idx]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={percent}
                      onChange={(e) => {
                        const newStructure = [...prizeStructure];
                        newStructure[idx] = Number(e.target.value);
                        setPrizeStructure(newStructure);
                      }}
                      className="w-20 bg-gray-600 text-white rounded-lg px-3 py-2 border border-gray-500 text-center"
                    />
                    <span className="text-gray-400">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resultados */}
        {players.length > 0 && (
          <div className="bg-gray-800 rounded-xl shadow-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-green-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Resultados
              </h2>
              <button
                onClick={() => setShowResults(!showResults)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
              >
                {showResults ? 'Ocultar' : 'Definir'}
              </button>
            </div>

            {showResults && (
              <div className="space-y-3">
                {prizeStructure.map((_, idx) => {
                  const position = idx + 1;
                  const winner = getPlayerByPosition(position);
                  return (
                    <div key={position} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white">{position}º Lugar</span>
                        <span className="text-green-400 font-bold">R$ {getPrizes()[idx]}</span>
                      </div>
                      <select
                        value={winner?.id || ''}
                        onChange={(e) => assignPosition(Number(e.target.value), position)}
                        className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 border border-gray-500"
                      >
                        <option value="">Selecione</option>
                        {players.filter(p => !p.position || p.position === position).map(p => (
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
        {showResults && players.some(p => p.position) && (
          <>
            {/* Balanço */}
            <div className="bg-gray-800 rounded-xl shadow-xl p-4 mb-4">
              <h2 className="text-lg font-bold text-green-400 mb-3">Balanço Final</h2>
              <div className="space-y-2">
                {players.map(player => {
                  const spent = calculateTotal(player);
                  const prizes = getPrizes();
                  const won = player.position && player.position <= prizeStructure.length 
                    ? parseFloat(prizes[player.position - 1]) 
                    : 0;
                  const balance = won - spent;
                  
                  return (
                    <div key={player.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-white">{player.name}</div>
                          {player.position && (
                            <div className="text-xs text-gray-400">{player.position}º lugar</div>
                          )}
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

            {/* Transações */}
            {(() => {
              const { winners, losers, payments } = calculatePayments();
              
              return (
                <>
                  {/* Ganhadores */}
                  {winners.length > 0 && (
                    <div className="bg-gray-800 rounded-xl shadow-xl p-4 mb-4">
                      <h2 className="text-lg font-bold text-green-400 mb-3">
                        🏆 Ganhadores
                      </h2>
                      <div className="space-y-2">
                        {winners.map(w => (
                          <div key={w.id} className="bg-green-900 bg-opacity-30 rounded-lg p-3 border border-green-700">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{w.name}</span>
                              <span className="text-green-400 font-bold text-lg">
                                +R$ {w.balance.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Perdedores */}
                  {losers.length > 0 && (
                    <div className="bg-gray-800 rounded-xl shadow-xl p-4 mb-4">
                      <h2 className="text-lg font-bold text-red-400 mb-3">
                        💸 Perdedores
                      </h2>
                      <div className="space-y-2">
                        {losers.map(l => (
                          <div key={l.id} className="bg-red-900 bg-opacity-30 rounded-lg p-3 border border-red-700">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{l.name}</span>
                              <span className="text-red-400 font-bold text-lg">
                                -R$ {Math.abs(l.balance).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quem Paga Quem */}
                  {payments.length > 0 && (
                    <div className="bg-gray-800 rounded-xl shadow-xl p-4 mb-4">
                      <h2 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Quem Paga Quem
                      </h2>
                      <div className="space-y-3">
                        {payments.map((payment, idx) => (
                          <div key={idx} className="bg-gray-700 rounded-lg p-4 border border-yellow-600">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{payment.from}</span>
                                <span className="text-yellow-400">→</span>
                                <span className="font-bold text-white">{payment.to}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-yellow-400 font-bold text-2xl">
                                R$ {payment.amount}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}