
export enum PlayerRole {
  GHOST = 'GHOST',
  HUNTER = 'HUNTER'
}

export enum GameStatus {
  LOBBY = 'LOBBY',
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export type ControlType = 'DESKTOP' | 'MOBILE';

export interface Position {
  x: number;
  y: number;
}

export interface WaitingPlayer {
  id: string;
  name: string;
  role: PlayerRole;
  isReady: boolean;
  isLocal: boolean;
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  pos: Position;
  targetPos: Position;
  angle: number;
  lives: number;
  health: number;
  maxHealth: number;
  isVisible: boolean;
  revealTimer: number; 
  blinkTimer: number;   
  isBlinking: boolean;
  color: string;
  score: number;
  lastShootTime: number;
  isBot: boolean;
  stunTimer: number;
  abilityPoints: number;
  isTeleporting: boolean;
  teleportTimer: number;
  teleportCooldown: number;
  portalEntryId: string | null;
}

export interface Bullet {
  id: string;
  ownerId: string;
  pos: Position;
  velocity: Position;
  active: boolean;
}

export interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Portal {
  id: string;
  pos: Position;
}

export interface GameState {
  players: Player[];
  bullets: Bullet[];
  walls: Wall[];
  portals: Portal[];
  status: GameStatus;
  winner: PlayerRole | null;
  roomId: string;
  timeLeft: number;
}
