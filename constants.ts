
import { SpeedSetting } from './types';

export const WORLD_WIDTH = 1200;
export const WORLD_HEIGHT = 800;
export const PLAYER_RADIUS = 20;
export const HUNTER_SPEED = 3.5;
export const GHOST_SPEED = 4.2;
export const BULLET_SPEED = 8.0;
export const SHOOT_COOLDOWN = 1000; // ms
export const REVEAL_DURATION = 3; // seconds
export const POSSESS_DIST = 35;
export const POSSESS_ANGLE = 120; // Degrees behind hunter
export const INITIAL_HUNTER_LIVES = 3;
export const INITIAL_GHOST_HEALTH = 100;
export const DAMAGE_PER_HIT = 25;

export const SPEED_MAP: Record<SpeedSetting, number> = {
  VERY_SLOW: 1.2,
  SLOW: 2.2,
  MEDIUM: 3.5,
  FAST: 5.0
};

export const COLORS = {
  HUNTER: '#00f2ff',
  GHOST: '#ff00ea',
  WALL: '#1e293b',
  FLOOR: '#0f172a',
  BULLET: '#fef08a'
};
