
import React, { useState } from 'react';
import { PlayerRole, ControlType, SpeedSetting } from '../types';

interface LobbyProps {
  onJoin: (roomId: string, role: PlayerRole, name: string, includeBots: boolean) => void;
  controlType: ControlType;
  onToggleControl: () => void;
  mouseAimEnabled: boolean;
  onToggleMouseAim: () => void;
  includeBots: boolean;
  onToggleBots: () => void;
  speedSetting: SpeedSetting;
  onSpeedChange: (speed: SpeedSetting) => void;
}

const Lobby: React.FC<LobbyProps> = ({ 
  onJoin, 
  controlType, 
  onToggleControl, 
  mouseAimEnabled, 
  onToggleMouseAim,
  includeBots,
  onToggleBots,
  speedSetting,
  onSpeedChange
}) => {
  const [selectedRole, setSelectedRole] = useState<PlayerRole>(PlayerRole.HUNTER);
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const roles = [
    { 
      type: PlayerRole.GHOST, 
      label: 'Ghost', 
      desc: 'Stealth & Portals',
      icon: 'fa-ghost',
      color: 'border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500/10'
    },
    { 
      type: PlayerRole.HUNTER, 
      label: 'Hunter', 
      desc: 'Tactical Combat',
      icon: 'fa-crosshairs',
      color: 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10'
    }
  ];

  const handleDeploy = () => {
    if (!playerName.trim()) {
      alert("Please enter a player name.");
      return;
    }
    onJoin(roomId || 'GLOBAL', selectedRole, playerName.trim(), includeBots);
  };

  return (
    <div className="max-w-4xl w-full h-full sm:h-auto sm:max-h-[95vh] p-3 sm:p-8 bg-slate-900 border-none sm:border sm:border-slate-700 rounded-none sm:rounded-xl shadow-2xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 relative mx-auto overflow-hidden">
      
      {/* Header Area */}
      <div className="w-full flex justify-between items-center mb-2 sm:mb-10 landscape:mb-2 relative">
        <div className="flex flex-col items-start">
          <h1 className="text-xl sm:text-5xl font-orbitron font-bold tracking-tighter text-white leading-none">
            ETHEREAL <span className="text-cyan-400">PURSUIT</span>
          </h1>
          <p className="hidden sm:block text-slate-500 text-[10px] font-mono uppercase tracking-widest mt-1">v1.1.0 Strategic displacement Protocol</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 sm:p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all shadow-lg active:scale-95"
            title="System Configuration"
          >
            <i className="fas fa-cog text-lg sm:text-xl animate-spin-slow"></i>
          </button>
        </div>
      </div>

      {/* Settings Modal - Changed to fixed inset-0 to prevent cutoff on desktop */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl relative flex flex-col overflow-hidden">
            
            <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-lg sm:text-2xl font-orbitron font-bold text-white flex items-center gap-3">
                <i className="fas fa-sliders-h text-cyan-400"></i>
                SYSTEM CONFIG
              </h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-500 hover:text-white transition-colors p-2"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-6 flex-1 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Interface Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => controlType !== 'DESKTOP' && onToggleControl()}
                    className={`py-2 sm:py-3 rounded-lg border-2 font-bold transition-all text-[10px] sm:text-sm ${controlType === 'DESKTOP' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-700 text-slate-500'}`}
                  >
                    <i className="fas fa-desktop mr-2"></i> PC
                  </button>
                  <button 
                    onClick={() => controlType !== 'MOBILE' && onToggleControl()}
                    className={`py-2 sm:py-3 rounded-lg border-2 font-bold transition-all text-[10px] sm:text-sm ${controlType === 'MOBILE' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-700 text-slate-500'}`}
                  >
                    <i className="fas fa-mobile-alt mr-2"></i> MOBILE
                  </button>
                </div>
              </div>

              {controlType === 'DESKTOP' && (
                <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-mouse-pointer text-slate-400"></i>
                    <span className="font-bold text-slate-200 uppercase text-[10px] sm:text-sm">Mouse Aim</span>
                  </div>
                  <button 
                    onClick={onToggleMouseAim}
                    className={`w-9 h-5 sm:w-12 sm:h-6 rounded-full relative transition-colors ${mouseAimEnabled ? 'bg-cyan-600' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 sm:top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transition-all ${mouseAimEnabled ? 'right-0.5 sm:right-1' : 'left-0.5 sm:left-1'}`}></div>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2">
                  <i className="fas fa-robot text-slate-400"></i>
                  <span className="font-bold text-slate-200 uppercase text-[10px] sm:text-sm">AI Units</span>
                </div>
                <button 
                  onClick={onToggleBots}
                  className={`w-9 h-5 sm:w-12 sm:h-6 rounded-full relative transition-colors ${includeBots ? 'bg-cyan-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-0.5 sm:top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transition-all ${includeBots ? 'right-0.5 sm:right-1' : 'left-0.5 sm:left-1'}`}></div>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Speed Profile</label>
                <select 
                  value={speedSetting}
                  onChange={(e) => onSpeedChange(e.target.value as SpeedSetting)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 sm:py-3 px-4 text-white focus:outline-none focus:border-cyan-500 appearance-none font-bold text-[10px] sm:text-sm"
                >
                  <option value="VERY_SLOW">VERY SLOW (SNAIL)</option>
                  <option value="SLOW">SLOW (TACTICAL)</option>
                  <option value="MEDIUM">MEDIUM (STANDARD)</option>
                  <option value="FAST">FAST (OVERDRIVE)</option>
                </select>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-800 shrink-0">
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-3 sm:py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-orbitron rounded-xl shadow-lg transition-all active:scale-95 text-[10px] sm:text-sm"
              >
                APPLY SETTINGS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full flex flex-col landscape:flex-row sm:flex-col gap-3 sm:gap-8 landscape:gap-4 items-center sm:items-stretch">
        
        <div className="flex-1 w-full grid grid-cols-2 gap-3 sm:gap-6">
          {roles.map((role) => (
            <button
              key={role.type}
              onClick={() => setSelectedRole(role.type)}
              className={`flex flex-col items-center justify-center p-2 sm:p-6 border-2 rounded-xl transition-all duration-300 ${
                selectedRole === role.type 
                  ? `scale-[1.02] shadow-lg ${role.color.split(' ')[0]} bg-slate-800/80` 
                  : 'border-transparent bg-slate-800/40 opacity-60'
              } ${role.color.split(' ').slice(1).join(' ')}`}
            >
              <i className={`fas ${role.icon} text-lg sm:text-4xl mb-1 sm:mb-3`}></i>
              <span className="text-xs sm:text-xl font-bold uppercase tracking-widest">{role.label}</span>
              <p className="hidden sm:block text-[10px] text-center opacity-80 mt-1">{role.desc}</p>
            </button>
          ))}
        </div>

        <div className="flex-1 w-full flex flex-col space-y-3 sm:space-y-6">
          <div className="grid grid-cols-1 landscape:grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-4">
            <div className="relative">
              <label className="text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase mb-0.5 sm:mb-1 block ml-1">Player Name</label>
              <input
                type="text"
                placeholder="NAME"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                maxLength={12}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 sm:py-3 px-3 text-white text-xs sm:text-lg focus:outline-none focus:border-cyan-500 transition-colors uppercase font-mono"
              />
            </div>
            <div className="relative">
              <label className="text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase mb-0.5 sm:mb-1 block ml-1">Room ID</label>
              <input
                type="text"
                placeholder="GLOBAL"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 sm:py-3 px-3 text-white text-xs sm:text-lg focus:outline-none focus:border-cyan-500 transition-colors uppercase font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4">
            <button
              onClick={handleDeploy}
              className={`flex-1 sm:w-full py-2 sm:py-4 rounded-lg text-xs sm:text-xl font-bold font-orbitron transition-all transform active:scale-95 shadow-lg ${
                selectedRole === PlayerRole.HUNTER 
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/50' 
                : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-900/50'
              }`}
            >
              DEPLOY TO VOID
            </button>
          </div>
        </div>
      </div>

      <div className="hidden sm:grid landscape:hidden sm:landscape:grid mt-8 grid-cols-3 gap-3 text-[10px] text-slate-500 font-mono">
        <div className="border border-slate-800 p-2 rounded">
          <div className="text-white font-bold mb-1 uppercase">Tactical AI</div>
          Ghosts stalk from behind; Hunters chase and search.
        </div>
        <div className="border border-slate-800 p-2 rounded">
          <div className="text-white font-bold mb-1 uppercase">Extraction</div>
          Portals recharge possession energy and health.
        </div>
        <div className="border border-slate-800 p-2 rounded">
          <div className="text-white font-bold mb-1 uppercase">Configuration</div>
          Use the gear icon to adjust displacement speed.
        </div>
      </div>
      
      <div className="sm:hidden landscape:block sm:landscape:hidden mt-2">
        <p className="text-[8px] text-slate-600 font-mono tracking-[0.2em] italic">READY FOR DISPLACEMENT</p>
      </div>
    </div>
  );
};

export default Lobby;
