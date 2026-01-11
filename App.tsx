
import React, { useState } from 'react';
import Lobby from './components/Lobby';
import GameView from './components/GameView';
import { GameStatus, PlayerRole, ControlType } from './types';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.LOBBY);
  const [controlType, setControlType] = useState<ControlType>('DESKTOP');
  const [mouseAimEnabled, setMouseAimEnabled] = useState<boolean>(true);
  const [roomInfo, setRoomInfo] = useState({ id: '', role: PlayerRole.HUNTER });

  const handleStartGame = (id: string, role: PlayerRole) => {
    setRoomInfo({ id, role });
    setGameStatus(GameStatus.PLAYING);
  };

  const handleBackToLobby = () => {
    setGameStatus(GameStatus.LOBBY);
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {gameStatus === GameStatus.LOBBY && (
        <Lobby 
          onJoin={handleStartGame} 
          controlType={controlType} 
          onToggleControl={() => setControlType(prev => prev === 'DESKTOP' ? 'MOBILE' : 'DESKTOP')}
          mouseAimEnabled={mouseAimEnabled}
          onToggleMouseAim={() => setMouseAimEnabled(prev => !prev)}
        />
      )}
      {gameStatus === GameStatus.PLAYING && (
        <GameView 
          roomId={roomInfo.id} 
          userRole={roomInfo.role} 
          controlType={controlType}
          mouseAimEnabled={mouseAimEnabled}
          onGameOver={handleBackToLobby}
        />
      )}
    </div>
  );
};

export default App;
