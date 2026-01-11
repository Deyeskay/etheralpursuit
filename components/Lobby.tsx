
import React, { useState } from 'react';
import { PlayerRole, ControlType } from '../types';

interface LobbyProps {
  onJoin: (roomId: string, role: PlayerRole, name: string) => void;
  controlType: ControlType;
  onToggleControl: () => void;
  mouseAimEnabled: boolean;
  onToggleMouseAim: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ 
  onJoin, 
  controlType, 
  onToggleControl, 
  mouseAimEnabled, 
  onToggleMouseAim 
}) => {
  const [selectedRole, setSelectedRole] = useState<PlayerRole>(PlayerRole.HUNTER);
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');

  const roles = [
    { 
      type: PlayerRole.GHOST, 
      label: 'Ghost', 
      desc: 'Use portals to sneak and teleport. Possess hunters from behind.',
      icon: 'fa-ghost',
      color: 'border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500/10'
    },
    { 
      type: PlayerRole.HUNTER, 
      label: 'Hunter', 
      desc: 'Kill all ghosts. 3 Lives. Careful of backstabs!',
      icon: 'fa-crosshairs',
      color: 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10'
    }
  ];

  const handleDeploy = () => {
    if (!playerName.trim()) {
      alert("Please enter a player name.");
      return;
    }
    onJoin(roomId || 'GLOBAL', selectedRole, playerName.trim());
  };

  return (
    <div className="max-w-4xl w-full p-4 sm:p-8 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-300 relative flex flex-col mx-auto my-4 overflow-y-auto max-h-[95vh]">
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 sm:mb-12">
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-3xl sm:text-5xl font-orbitron font-bold tracking-tighter text-white">
            ETHEREAL <span className="text-cyan-400">PURSUIT</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-mono italic">"The portal is your only sanctuary..."</p>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2">
          <button 
            onClick={onToggleControl}
            className="w-full sm:w-auto bg-slate-800 border border-slate-600 px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center space-x-2 hover:bg-slate-700 transition-colors shadow-lg"
          >
            <i className={`fas ${controlType === 'DESKTOP' ? 'fa-desktop' : 'fa-mobile-alt'}`}></i>
            <span>MODE: {controlType}</span>
          </button>
          
          {controlType === 'DESKTOP' && (
            <button 
              onClick={onToggleMouseAim}
              className={`w-full sm:w-auto bg-slate-800 border ${mouseAimEnabled ? 'border-cyan-500 text-cyan-400' : 'border-slate-600 text-slate-400'} px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center space-x-2 hover:bg-slate-700 transition-colors shadow-lg`}
            >
              <i className={`fas ${mouseAimEnabled ? 'fa-mouse-pointer' : 'fa-arrows-alt'}`}></i>
              <span>MOUSE AIM: {mouseAimEnabled ? 'ON' : 'OFF'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
        {roles.map((role) => (
          <button
            key={role.type}
            onClick={() => setSelectedRole(role.type)}
            className={`flex flex-col items-center p-4 sm:p-6 border-2 rounded-2xl transition-all duration-300 ${
              selectedRole === role.type ? `scale-105 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${role.color.split(' ')[0]} bg-slate-800/80` : 'border-transparent bg-slate-800/40 opacity-60'
            } ${role.color.split(' ').slice(1).join(' ')}`}
          >
            <i className={`fas ${role.icon} text-3xl sm:text-5xl mb-4`}></i>
            <span className="text-xl sm:text-2xl font-bold mb-2 uppercase tracking-widest">{role.label}</span>
            <p className="text-xs sm:text-sm text-center opacity-80">{role.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col space-y-4 max-w-sm mx-auto w-full">
        <div className="space-y-4">
          <div className="relative">
            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Player Name</label>
            <input
              type="text"
              placeholder="ENTER NAME"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
              maxLength={12}
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg py-3 sm:py-4 px-6 text-white text-base sm:text-lg focus:outline-none focus:border-cyan-500 transition-colors uppercase font-mono"
            />
          </div>
          <div className="relative">
            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Room ID (Optional)</label>
            <input
              type="text"
              placeholder="GLOBAL"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg py-3 sm:py-4 px-6 text-white text-base sm:text-lg focus:outline-none focus:border-cyan-500 transition-colors uppercase font-mono"
            />
          </div>
        </div>
        
        <button
          onClick={handleDeploy}
          className={`w-full py-3 sm:py-4 rounded-lg text-lg sm:text-xl font-bold font-orbitron transition-all transform hover:scale-[1.02] active:scale-95 ${
            selectedRole === PlayerRole.HUNTER 
            ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/50 shadow-lg' 
            : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-900/50 shadow-lg'
          }`}
        >
          DEPLOY TO VOID
        </button>
      </div>

      <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] sm:text-xs text-slate-500 font-mono">
        <div className="border border-slate-800 p-2 sm:p-3 rounded">
          <div className="text-white font-bold mb-1 uppercase">Mechanics</div>
          Portals recharge Ghost energy. Hunters get stunned on hit.
        </div>
        <div className="border border-slate-800 p-2 sm:p-3 rounded">
          <div className="text-white font-bold mb-1 uppercase">Stealth</div>
          Hit: 3s Visible, then 3s Blinking. Portals = Instant Stealth.
        </div>
        <div className="border border-slate-800 p-2 sm:p-3 rounded">
          <div className="text-white font-bold mb-1 uppercase">Controls</div>
          WASD + Mouse for precision combat.
        </div>
      </div>
    </div>
  );
};

export default Lobby;
