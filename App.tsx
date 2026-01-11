
import React, { useState } from 'react';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import GameView from './components/GameView';
import { GameStatus, PlayerRole, ControlType, WaitingPlayer, SpeedSetting } from './types';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.LOBBY);
  const [controlType, setControlType] = useState<ControlType>('DESKTOP');
  const [mouseAimEnabled, setMouseAimEnabled] = useState<boolean>(true);
  const [playerName, setPlayerName] = useState<string>('RECRUIT');
  const [includeBots, setIncludeBots] = useState<boolean>(true);
  const [speedSetting, setSpeedSetting] = useState<SpeedSetting>('SLOW');
  const [roomInfo, setRoomInfo] = useState({ id: '', role: PlayerRole.HUNTER });
  const [finalPlayers, setFinalPlayers] = useState<WaitingPlayer[]>([]);

  const handleJoinWaitingRoom = (id: string, role: PlayerRole, name: string, bots: boolean) => {
    setRoomInfo({ id, role });
    setPlayerName(name);
    setIncludeBots(bots);
    // Fix: Changed 'Status.WAITING' to 'GameStatus.WAITING' as defined in types.ts
    setGameStatus(GameStatus.WAITING);
  };

  const handleStartGame = (players: WaitingPlayer[]) => {
    const localPlayer = players.find(p => p.isLocal);
    if (localPlayer) {
      setRoomInfo(prev => ({ ...prev, role: localPlayer.role }));
    }
    setFinalPlayers(players);
    setGameStatus(GameStatus.PLAYING);
  };

  const handleBackToLobby = () => {
    setGameStatus(GameStatus.LOBBY);
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-mono">
      {gameStatus === GameStatus.LOBBY && (
        <Lobby 
          onJoin={handleJoinWaitingRoom} 
          controlType={controlType} 
          onToggleControl={() => setControlType(prev => prev === 'DESKTOP' ? 'MOBILE' : 'DESKTOP')}
          mouseAimEnabled={mouseAimEnabled}
          onToggleMouseAim={() => setMouseAimEnabled(prev => !prev)}
          includeBots={includeBots}
          onToggleBots={() => setIncludeBots(prev => !prev)}
          speedSetting={speedSetting}
          onSpeedChange={setSpeedSetting}
        />
      )}
      {gameStatus === GameStatus.WAITING && (
        <WaitingRoom
          roomId={roomInfo.id}
          initialRole={roomInfo.role}
          playerName={playerName}
          includeBots={includeBots}
          onStart={handleStartGame}
          onCancel={handleBackToLobby}
        />
      )}
      {gameStatus === GameStatus.PLAYING && (
        <GameView 
          roomId={roomInfo.id} 
          userRole={roomInfo.role} 
          userName={playerName}
          lobbyPlayers={finalPlayers}
          controlType={controlType}
          mouseAimEnabled={mouseAimEnabled}
          speedSetting={speedSetting}
          onGameOver={handleBackToLobby}
        />
      )}
    </div>
  );
};

export default App;
