
export enum PlayerRole {
  GHOST = 'GHOST',
  HUNTER = 'HUNTER'
}

export enum GameStatus {
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export type ControlType = 'DESKTOP' | 'MOBILE';

export interface Position {
  x: number;
  y: number;
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
  // Mechanics
  stunTimer: number;
  abilityPoints: number;
  isTeleporting: boolean;
  teleportTimer: number;
  teleportCooldown: number; // New: prevents instant re-teleport
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
