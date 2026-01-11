
import React, { useState, useEffect } from 'react';
import { PlayerRole, WaitingPlayer } from '../types';

interface WaitingRoomProps {
  roomId: string;
  initialRole: PlayerRole;
  playerName: string;
  includeBots: boolean;
  onStart: (players: WaitingPlayer[]) => void;
  onCancel: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ roomId, initialRole, playerName, includeBots, onStart, onCancel }) => {
  const [players, setPlayers] = useState<WaitingPlayer[]>(() => {
    const initialPlayers: WaitingPlayer[] = [
      { id: 'user', name: playerName, role: initialRole, isReady: false, isLocal: true }
    ];
    if (includeBots) {
      initialPlayers.push(
        { id: 'bot1', name: 'CYBER-X', role: PlayerRole.GHOST, isReady: false, isLocal: false },
        { id: 'bot2', name: 'UNIT-01', role: PlayerRole.HUNTER, isReady: false, isLocal: false },
        { id: 'bot3', name: 'SPECTRE', role: PlayerRole.GHOST, isReady: false, isLocal: false }
      );
    }
    return initialPlayers;
  });

  const [globalTimer, setGlobalTimer] = useState(59);
  const [countdownTimer, setCountdownTimer] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const hasMinPlayers = players.some(p => p.role === PlayerRole.HUNTER) && 
                         players.some(p => p.role === PlayerRole.GHOST);

  const allReady = players.every(p => p.isReady) && hasMinPlayers;

  useEffect(() => {
    if (!includeBots || timedOut) return;
    const timeouts = players.map((p, i) => {
      if (p.isLocal) return null;
      return setTimeout(() => {
        setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, isReady: true } : pl));
      }, 2000 + i * 1500);
    });
    return () => timeouts.forEach(t => t && clearTimeout(t));
  }, [includeBots, timedOut]);

  useEffect(() => {
    if (timedOut) return;
    const interval = setInterval(() => {
      setGlobalTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (hasMinPlayers) {
            onStart(players);
          } else {
            setTimedOut(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasMinPlayers, players, onStart, timedOut]);

  useEffect(() => {
    let interval: any;
    if (allReady && !timedOut) {
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
  }, [allReady, players, onStart, timedOut]);

  const toggleRole = () => {
    if (timedOut) return;
    setPlayers(prev => prev.map(p => p.isLocal ? { ...p, role: p.role === PlayerRole.HUNTER ? PlayerRole.GHOST : PlayerRole.HUNTER } : p));
  };

  const toggleReady = () => {
    if (timedOut) return;
    setPlayers(prev => prev.map(p => p.isLocal ? { ...p, isReady: !p.isReady } : p));
  };

  return (
    <div className="max-w-4xl w-full h-full sm:h-auto max-h-screen sm:max-h-[95vh] p-2 sm:p-8 bg-slate-900 border-none sm:border sm:border-slate-700 rounded-none sm:rounded-2xl shadow-2xl flex flex-col items-center animate-in fade-in duration-500 overflow-hidden">
      
      {/* Header Area */}
      <div className="w-full flex justify-between items-center mb-2 sm:mb-10 shrink-0">
        <div>
          <h2 className="text-base sm:text-3xl font-orbitron font-bold text-white leading-tight">BRIEFING</h2>
          <p className="text-cyan-400 font-mono text-[8px] sm:text-sm tracking-widest uppercase">
            Sector: {roomId}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[7px] sm:text-[10px] text-slate-500 font-bold uppercase">{timedOut ? 'Status' : 'Auto-Deploy'}</div>
          <div className={`text-base sm:text-4xl font-orbitron font-bold ${timedOut ? 'text-red-500' : 'text-white'}`}>
            {timedOut ? 'FAIL' : `0:${globalTimer.toString().padStart(2, '0')}`}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full overflow-y-auto custom-scrollbar pr-1 mb-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 w-full mb-4 sm:mb-12">
          {players.map(p => (
            <div key={p.id} className={`p-2 sm:p-4 border-2 rounded-xl bg-slate-800/50 transition-all ${p.isLocal ? 'border-cyan-500' : 'border-slate-700 opacity-80'}`}>
              <div className="flex justify-between items-start mb-1 sm:mb-4">
                <i className={`fas ${p.role === PlayerRole.HUNTER ? 'fa-crosshairs text-cyan-400' : 'fa-ghost text-fuchsia-400'} text-xs sm:text-xl`}></i>
                <div className={`px-1 py-0.5 rounded text-[7px] font-bold uppercase ${p.isReady ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {p.isReady ? 'RDY' : 'WT'}
                </div>
              </div>
              <div className="text-white font-bold truncate text-[10px] sm:text-sm mb-0.5">{p.name}</div>
              <div className={`text-[8px] sm:text-[10px] font-mono uppercase font-bold ${p.role === PlayerRole.HUNTER ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
                {p.role}
              </div>
            </div>
          ))}
        </div>

        {!hasMinPlayers && !timedOut && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-3 py-1.5 rounded-lg text-[8px] sm:text-sm font-mono mb-2 sm:mb-8 animate-pulse uppercase flex items-center gap-2 justify-center text-center">
            <i className="fas fa-exclamation-triangle"></i>
            <span>Squad Incomplete: Need 1 Hunter & 1 Ghost</span>
          </div>
        )}

        {isCountingDown && !timedOut && (
          <div className="text-center mb-2 sm:mb-8 animate-bounce">
            <div className="text-cyan-400 text-[8px] font-bold uppercase tracking-widest">DEPLOYING</div>
            <div className="text-2xl sm:text-6xl font-orbitron font-bold text-white">{countdownTimer}</div>
          </div>
        )}

        {timedOut && (
          <div className="w-full text-center py-4 bg-red-900/10 border border-red-900/40 rounded-xl mb-4 animate-in slide-in-from-top">
            <h3 className="text-lg font-orbitron font-bold text-red-500 mb-1 uppercase">Mission Fail</h3>
            <button onClick={onCancel} className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg text-xs">EXIT</button>
          </div>
        )}
      </div>

      {!timedOut && (
        <div className="w-full shrink-0 flex flex-col items-center border-t border-slate-800 pt-3 mt-auto">
          <div className="flex flex-row gap-2 w-full max-w-sm">
            <button 
              onClick={toggleRole}
              className="flex-1 py-2 sm:py-4 bg-slate-800 border-2 border-slate-700 rounded-lg text-white font-bold font-orbitron text-[10px] sm:text-sm"
            >
              SWITCH ROLE
            </button>
            <button 
              onClick={toggleReady}
              className={`flex-1 py-2 sm:py-4 rounded-lg text-white font-bold font-orbitron transition-all text-[10px] sm:text-sm ${
                players.find(p => p.isLocal)?.isReady ? 'bg-red-600' : 'bg-green-600'
              }`}
            >
              {players.find(p => p.isLocal)?.isReady ? 'CANCEL' : 'READY'}
            </button>
          </div>
          <button onClick={onCancel} className="mt-2 text-slate-600 hover:text-white font-mono text-[8px] uppercase tracking-widest underline transition-colors">
            Abandon
          </button>
        </div>
      )}
    </div>
  );
};

export default WaitingRoom;
