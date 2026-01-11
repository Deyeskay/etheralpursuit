
import React, { useState } from 'react';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import GameView from './components/GameView';
import { GameStatus, PlayerRole, ControlType, WaitingPlayer } from './types';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.LOBBY);
  const [controlType, setControlType] = useState<ControlType>('DESKTOP');
  const [mouseAimEnabled, setMouseAimEnabled] = useState<boolean>(true);
  const [playerName, setPlayerName] = useState<string>('RECRUIT');
  const [roomInfo, setRoomInfo] = useState({ id: '', role: PlayerRole.HUNTER });
  const [finalPlayers, setFinalPlayers] = useState<WaitingPlayer[]>([]);

  const handleJoinWaitingRoom = (id: string, role: PlayerRole, name: string) => {
    setRoomInfo({ id, role });
    setPlayerName(name);
    setGameStatus(GameStatus.WAITING);
  };

  const handleStartGame = (players: WaitingPlayer[]) => {
    setFinalPlayers(players);
    setGameStatus(GameStatus.PLAYING);
  };

  const handleBackToLobby = () => {
    setGameStatus(GameStatus.LOBBY);
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {gameStatus === GameStatus.LOBBY && (
        <Lobby 
          onJoin={handleJoinWaitingRoom} 
          controlType={controlType} 
          onToggleControl={() => setControlType(prev => prev === 'DESKTOP' ? 'MOBILE' : 'DESKTOP')}
          mouseAimEnabled={mouseAimEnabled}
          onToggleMouseAim={() => setMouseAimEnabled(prev => !prev)}
        />
      )}
      {gameStatus === GameStatus.WAITING && (
        <WaitingRoom
          roomId={roomInfo.id}
          initialRole={roomInfo.role}
          playerName={playerName}
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
          onGameOver={handleBackToLobby}
        />
      )}
    </div>
  );
};

export default App;
