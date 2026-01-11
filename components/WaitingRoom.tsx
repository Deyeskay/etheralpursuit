
import React, { useState, useEffect } from 'react';
import { PlayerRole, WaitingPlayer } from '../types';

interface WaitingRoomProps {
  roomId: string;
  initialRole: PlayerRole;
  playerName: string;
  onStart: (players: WaitingPlayer[]) => void;
  onCancel: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ roomId, initialRole, playerName, onStart, onCancel }) => {
  const [players, setPlayers] = useState<WaitingPlayer[]>([
    { id: 'user', name: playerName, role: initialRole, isReady: false, isLocal: true },
    { id: 'bot1', name: 'CYBER-X', role: PlayerRole.GHOST, isReady: false, isLocal: false },
    { id: 'bot2', name: 'UNIT-01', role: PlayerRole.HUNTER, isReady: false, isLocal: false },
    { id: 'bot3', name: 'SPECTRE', role: PlayerRole.GHOST, isReady: false, isLocal: false },
  ]);

  const [globalTimer, setGlobalTimer] = useState(59);
  const [countdownTimer, setCountdownTimer] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Bots ready logic simulation
  useEffect(() => {
    const timeouts = players.map((p, i) => {
      if (p.isLocal) return null;
      return setTimeout(() => {
        setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, isReady: true } : pl));
      }, 2000 + i * 1500);
    });
    return () => timeouts.forEach(t => t && clearTimeout(t));
  }, []);

  // Check requirements: 1 Hunter, 1 Ghost
  const hasMinPlayers = players.some(p => p.role === PlayerRole.HUNTER) && 
                       players.some(p => p.role === PlayerRole.GHOST);
  const allReady = players.every(p => p.isReady) && hasMinPlayers;

  // Global 59s timer
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalTimer(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          if (hasMinPlayers) onStart(players);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasMinPlayers, players]);

  // 5s Countdown Logic
  useEffect(() => {
    let interval: any;
    if (allReady) {
      setIsCountingDown(true);
      interval = setInterval(() => {
        setCountdownTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onStart(players);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsCountingDown(false);
      setCountdownTimer(5);
    }
    return () => interval && clearInterval(interval);
  }, [allReady, players]);

  const toggleRole = () => {
    setPlayers(prev => prev.map(p => p.isLocal ? { ...p, role: p.role === PlayerRole.HUNTER ? PlayerRole.GHOST : PlayerRole.HUNTER } : p));
  };

  const toggleReady = () => {
    setPlayers(prev => prev.map(p => p.isLocal ? { ...p, isReady: !p.isReady } : p));
  };

  return (
    <div className="max-w-4xl w-full p-8 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col items-center animate-in fade-in duration-500">
      <div className="w-full flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-orbitron font-bold text-white mb-1">MISSION BRIEFING</h2>
          <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Sector: {roomId}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Auto-Deploy In</div>
          <div className="text-4xl font-orbitron font-bold text-white">0:{globalTimer.toString().padStart(2, '0')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-12">
        {players.map(p => (
          <div key={p.id} className={`p-4 border-2 rounded-xl bg-slate-800/50 transition-all ${p.isLocal ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-slate-700 opacity-80'}`}>
            <div className="flex justify-between items-start mb-4">
              <i className={`fas ${p.role === PlayerRole.HUNTER ? 'fa-crosshairs text-cyan-400' : 'fa-ghost text-fuchsia-400'} text-xl`}></i>
              <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${p.isReady ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                {p.isReady ? 'Ready' : 'Waiting'}
              </div>
            </div>
            <div className="text-white font-bold truncate mb-1">{p.name} {p.isLocal && '(YOU)'}</div>
            <div className={`text-[10px] font-mono uppercase font-bold ${p.role === PlayerRole.HUNTER ? 'text-cyan-500' : 'text-fuchsia-500'}`}>
              {p.role}
            </div>
          </div>
        ))}
      </div>

      {!hasMinPlayers && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg text-sm font-mono mb-8 animate-pulse uppercase">
          Warning: Squad Imbalance. Need at least 1 Hunter and 1 Ghost.
        </div>
      )}

      {isCountingDown && (
        <div className="text-center mb-8 animate-bounce">
          <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">Engaging Warp Drive</div>
          <div className="text-6xl font-orbitron font-bold text-white">{countdownTimer}</div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button 
          onClick={toggleRole}
          className="flex-1 py-4 bg-slate-800 border-2 border-slate-700 hover:border-slate-500 rounded-xl text-white font-bold font-orbitron transition-all"
        >
          SWITCH ROLE
        </button>
        <button 
          onClick={toggleReady}
          className={`flex-1 py-4 rounded-xl text-white font-bold font-orbitron transition-all shadow-lg ${
            players.find(p => p.isLocal)?.isReady 
            ? 'bg-red-600 hover:bg-red-500 shadow-red-900/50' 
            : 'bg-green-600 hover:bg-green-500 shadow-green-900/50'
          }`}
        >
          {players.find(p => p.isLocal)?.isReady ? 'CANCEL READY' : 'READY UP'}
        </button>
      </div>

      <button onClick={onCancel} className="mt-8 text-slate-500 hover:text-white font-mono text-xs uppercase tracking-widest underline transition-colors">
        Abandon Mission
      </button>
    </div>
  );
};

export default WaitingRoom;
