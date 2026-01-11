
import React, { useRef, useEffect, useState } from 'react';
import { 
  GameState, PlayerRole, GameStatus, Player, Bullet, Position, ControlType, Portal, WaitingPlayer, SpeedSetting 
} from '../types';
import { 
  WORLD_WIDTH, WORLD_HEIGHT, PLAYER_RADIUS, 
  BULLET_SPEED, REVEAL_DURATION, POSSESS_DIST, POSSESS_ANGLE, 
  INITIAL_HUNTER_LIVES, INITIAL_GHOST_HEALTH, DAMAGE_PER_HIT, COLORS, SPEED_MAP
} from '../constants';

const STUN_DURATION = 2.0;
const BLINK_DURATION = 3.0;
const TELEPORT_WINDOW = 10;
const MAX_ABILITY_POINTS = 2;
const PORTAL_RADIUS = 40;
const TELEPORT_COOLDOWN = 3.0;

interface GameViewProps {
  roomId: string;
  userRole: PlayerRole;
  userName: string;
  lobbyPlayers: WaitingPlayer[];
  controlType: ControlType;
  mouseAimEnabled: boolean;
  speedSetting: SpeedSetting;
  onGameOver: () => void;
}

const GameView: React.FC<GameViewProps> = ({ 
  roomId, 
  userRole, 
  userName, 
  lobbyPlayers,
  controlType, 
  mouseAimEnabled, 
  speedSetting,
  onGameOver 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const keysRef = useRef<Record<string, boolean>>({});
  const mousePosRef = useRef<Position>({ x: 0, y: 0 });
  const isFiringRef = useRef(false);
  const joystickRef = useRef({ active: false, start: { x: 0, y: 0 }, current: { x: 0, y: 0 } });

  const initialGameState: GameState = {
    players: [],
    bullets: [],
    walls: [
      { x: 500, y: 350, width: 200, height: 100, color: COLORS.WALL },
      { x: 200, y: 120, width: 300, height: 40, color: COLORS.WALL },
      { x: 700, y: 120, width: 300, height: 40, color: COLORS.WALL },
      { x: 200, y: 640, width: 300, height: 40, color: COLORS.WALL },
      { x: 700, y: 640, width: 300, height: 40, color: COLORS.WALL },
      { x: 80, y: 250, width: 40, height: 300, color: COLORS.WALL },
      { x: 1080, y: 250, width: 40, height: 300, color: COLORS.WALL },
      { x: 350, y: 280, width: 40, height: 240, color: COLORS.WALL },
      { x: 810, y: 280, width: 40, height: 240, color: COLORS.WALL },
      { x: 0, y: 0, width: 1200, height: 20, color: COLORS.WALL },
      { x: 0, y: 780, width: 1200, height: 20, color: COLORS.WALL },
      { x: 0, y: 20, width: 20, height: 760, color: COLORS.WALL },
      { x: 1180, y: 20, width: 20, height: 760, color: COLORS.WALL },
    ],
    portals: [
      { id: 'p1', pos: { x: 120, y: 120 } },
      { id: 'p2', pos: { x: 1080, y: 680 } },
      { id: 'p3', pos: { x: 600, y: 550 } }
    ],
    status: GameStatus.PLAYING,
    winner: null,
    roomId,
    timeLeft: 300,
  };

  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const gameStateRef = useRef<GameState>(initialGameState);

  useEffect(() => {
    let hunterIdx = 0;
    let ghostIdx = 0;
    
    const finalPlayers = lobbyPlayers.map((lp) => {
      const isUser = lp.isLocal;
      const spawnPos = lp.role === PlayerRole.HUNTER 
        ? { x: 300 + (hunterIdx++) * 100, y: 240 }
        : { x: 900 - (ghostIdx++) * 100, y: 560 };

      return {
        id: lp.id,
        name: lp.name,
        role: lp.role,
        pos: spawnPos,
        targetPos: { x: 0, y: 0 },
        angle: lp.role === PlayerRole.HUNTER ? 0 : Math.PI,
        lives: lp.role === PlayerRole.HUNTER ? INITIAL_HUNTER_LIVES : 1,
        health: INITIAL_GHOST_HEALTH,
        maxHealth: INITIAL_GHOST_HEALTH,
        isVisible: lp.role === PlayerRole.HUNTER,
        revealTimer: 0,
        blinkTimer: 0,
        isBlinking: false,
        color: lp.role === PlayerRole.HUNTER ? COLORS.HUNTER : COLORS.GHOST,
        score: 0,
        lastShootTime: 0,
        isBot: !isUser,
        stunTimer: 0,
        abilityPoints: lp.role === PlayerRole.GHOST ? 1 : 0,
        isTeleporting: false,
        teleportTimer: 0,
        teleportCooldown: 0,
        portalEntryId: null
      } as Player;
    });

    gameStateRef.current.players = finalPlayers;
    setGameState(prev => ({ ...prev, players: finalPlayers }));
  }, [lobbyPlayers, roomId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = WORLD_WIDTH / rect.width;
        const scaleY = WORLD_HEIGHT / rect.height;
        mousePosRef.current = { 
          x: (e.clientX - rect.left) * scaleX, 
          y: (e.clientY - rect.top) * scaleY 
        };
      }
    };
    const handleMouseDown = () => { isFiringRef.current = true; };
    const handleMouseUp = () => { isFiringRef.current = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleJoystickStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    joystickRef.current = { active: true, start: { x: touch.clientX, y: touch.clientY }, current: { x: touch.clientX, y: touch.clientY } };
  };
  const handleJoystickMove = (e: React.TouchEvent) => {
    if (!joystickRef.current.active) return;
    const touch = e.touches[0];
    joystickRef.current.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleJoystickEnd = () => { joystickRef.current.active = false; };

  const checkCircleRectCollision = (cx: number, cy: number, r: number, rx: number, ry: number, rw: number, rh: number) => {
    const testX = Math.max(rx, Math.min(cx, rx + rw));
    const testY = Math.max(ry, Math.min(cy, ry + rh));
    const distSq = (cx - testX) ** 2 + (cy - testY) ** 2;
    return distSq <= r * r;
  };

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const update = (dt: number, time: number) => {
      const state = gameStateRef.current;
      if (state.status !== GameStatus.PLAYING) return;

      const newPlayers = [...state.players];
      const newBullets = [...state.bullets];
      const baseSpeed = SPEED_MAP[speedSetting];
      
      newPlayers.forEach(p => {
        // --- DEAD PLAYERS ARE COMPLETELY INACTIVE ---
        if (p.role === PlayerRole.HUNTER && p.lives <= 0) return;
        if (p.role === PlayerRole.GHOST && p.health <= 0) return;

        if (p.teleportCooldown > 0) p.teleportCooldown -= dt;
        if (p.isTeleporting) {
          p.teleportTimer -= dt;
          if (p.teleportTimer <= 0) {
            const exitPortal = state.portals.find(port => port.id === p.portalEntryId) || state.portals[0];
            p.pos = { ...exitPortal.pos };
            p.isTeleporting = false;
            p.teleportCooldown = TELEPORT_COOLDOWN;
            if (p.role === PlayerRole.GHOST) {
              p.health = Math.min(p.health + 20, p.maxHealth);
            }
          }
          return;
        }

        if (p.stunTimer > 0) {
          p.stunTimer -= dt;
          return;
        }

        let moveX = 0;
        let moveY = 0;
        let botShoot = false;
        let currentMaxSpeed = baseSpeed;
        
        if (p.role === PlayerRole.GHOST) {
          currentMaxSpeed = (p.abilityPoints > 0) ? baseSpeed * 1.15 : baseSpeed;
        }

        if (!p.isBot) {
          if (controlType === 'MOBILE' && joystickRef.current.active) {
            const dx = joystickRef.current.current.x - joystickRef.current.start.x;
            const dy = joystickRef.current.current.y - joystickRef.current.start.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 5) {
              const maxD = 50;
              moveX = (dx / Math.min(dist, maxD));
              moveY = (dy / Math.min(dist, maxD));
            }
          } else {
            if (keysRef.current['KeyW']) moveY -= 1;
            if (keysRef.current['KeyS']) moveY += 1;
            if (keysRef.current['KeyA']) moveX -= 1;
            if (keysRef.current['KeyD']) moveX += 1;
          }

          const mag = Math.sqrt(moveX * moveX + moveY * moveY);
          if (mag > 0) {
            moveX = (moveX / mag) * currentMaxSpeed;
            moveY = (moveY / mag) * currentMaxSpeed;
          }

          if (p.role === PlayerRole.HUNTER) {
            if (controlType === 'DESKTOP' && mouseAimEnabled) {
              p.angle = Math.atan2(mousePosRef.current.y - p.pos.y, mousePosRef.current.x - p.pos.x);
            } else if (mag > 0) {
              p.angle = Math.atan2(moveY, moveX);
            }
          } else if (mag > 0) {
            p.angle = Math.atan2(moveY, moveX);
          }
        } else {
          // --- AI LOGIC ---
          if (p.role === PlayerRole.HUNTER) {
            const visibleGhost = newPlayers.find(g => g.role === PlayerRole.GHOST && g.isVisible && g.health > 0);
            if (visibleGhost) {
              const dx = visibleGhost.pos.x - p.pos.x;
              const dy = visibleGhost.pos.y - p.pos.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              p.angle = Math.atan2(dy, dx);
              if (dist > 80) {
                moveX = (dx / dist) * currentMaxSpeed;
                moveY = (dy / dist) * currentMaxSpeed;
              }
              if (time - p.lastShootTime > 800) botShoot = true;
            } else {
              p.angle += dt * 0.8;
              moveX = Math.cos(p.angle) * currentMaxSpeed * 0.6;
              moveY = Math.sin(p.angle) * currentMaxSpeed * 0.6;
              if (Math.random() < 0.01 && time - p.lastShootTime > 1500) botShoot = true;
            }
          } else {
            // GHOST BOT
            const targetHunter = newPlayers.find(h => h.role === PlayerRole.HUNTER && h.lives > 0);
            const nearestPortal = state.portals.reduce((prev, curr) => {
              const dPrev = Math.sqrt((prev.pos.x - p.pos.x)**2 + (prev.pos.y - p.pos.y)**2);
              const dCurr = Math.sqrt((curr.pos.x - p.pos.x)**2 + (curr.pos.y - p.pos.y)**2);
              return dCurr < dPrev ? curr : prev;
            });

            // STRICT FLEE LOGIC
            if (p.isVisible || p.health < p.maxHealth * 0.4 || p.abilityPoints === 0) {
              const dx = nearestPortal.pos.x - p.pos.x;
              const dy = nearestPortal.pos.y - p.pos.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist > 8) {
                moveX = (dx / dist) * currentMaxSpeed;
                moveY = (dy / dist) * currentMaxSpeed;
                p.angle = Math.atan2(dy, dx);
              }
            } else if (targetHunter) {
              const stalkDist = 80;
              const behindX = targetHunter.pos.x - Math.cos(targetHunter.angle) * stalkDist;
              const behindY = targetHunter.pos.y - Math.sin(targetHunter.angle) * stalkDist;
              const dx = behindX - p.pos.x;
              const dy = behindY - p.pos.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              
              if (dist > 30) {
                moveX = (dx / dist) * currentMaxSpeed * 0.9;
                moveY = (dy / dist) * currentMaxSpeed * 0.9;
                p.angle = Math.atan2(dy, dx);
              } else {
                const strikeX = targetHunter.pos.x - p.pos.x;
                const strikeY = targetHunter.pos.y - p.pos.y;
                const strikeDist = Math.sqrt(strikeX*strikeX + strikeY*strikeY);
                moveX = (strikeX / strikeDist) * currentMaxSpeed;
                moveY = (strikeY / strikeDist) * currentMaxSpeed;
                p.angle = Math.atan2(strikeY, strikeX);
              }
            }
          }
        }

        const nextX = p.pos.x + moveX;
        const nextY = p.pos.y + moveY;
        let collided = state.walls.some(w => checkCircleRectCollision(nextX, nextY, PLAYER_RADIUS, w.x, w.y, w.width, w.height));
        
        if (!collided && nextX > PLAYER_RADIUS && nextX < WORLD_WIDTH - PLAYER_RADIUS && nextY > PLAYER_RADIUS && nextY < WORLD_HEIGHT - PLAYER_RADIUS) {
          p.pos.x = nextX;
          p.pos.y = nextY;
        } else if (p.isBot) {
          p.angle += Math.PI * 0.3;
        }

        if (p.role === PlayerRole.GHOST && p.teleportCooldown <= 0) {
          state.portals.forEach(port => {
            const dx = port.pos.x - p.pos.x;
            const dy = port.pos.y - p.pos.y;
            if (Math.sqrt(dx*dx + dy*dy) < PORTAL_RADIUS) {
              p.isTeleporting = true;
              p.teleportTimer = TELEPORT_WINDOW;
              p.portalEntryId = port.id;
              p.abilityPoints = Math.min(p.abilityPoints + 1, MAX_ABILITY_POINTS);
              p.isVisible = false;
              p.revealTimer = 0;
              p.blinkTimer = 0;
            }
          });
        }

        if (p.revealTimer > 0) {
          p.revealTimer -= dt;
          if (p.revealTimer <= 0) p.blinkTimer = BLINK_DURATION;
        } else if (p.blinkTimer > 0) {
          p.blinkTimer -= dt;
          if (p.blinkTimer <= 0) p.isVisible = false;
        }

        const wantsToShoot = !p.isBot 
          ? (isFiringRef.current || (controlType === 'MOBILE' && keysRef.current['KeyF']))
          : botShoot;

        if (p.role === PlayerRole.HUNTER && wantsToShoot) {
           const hasActiveBullet = newBullets.some(b => b.ownerId === p.id && b.active);
           if (!hasActiveBullet && time - p.lastShootTime > (p.isBot ? 800 : 150)) {
              newBullets.push({
                id: `b-${Date.now()}-${p.id}`, ownerId: p.id, pos: { ...p.pos },
                velocity: { x: Math.cos(p.angle) * BULLET_SPEED, y: Math.sin(p.angle) * BULLET_SPEED },
                active: true
              });
              p.lastShootTime = time;
           }
        }
      });

      newBullets.forEach(b => {
        if (!b.active) return;
        b.pos.x += b.velocity.x;
        b.pos.y += b.velocity.y;
        if (state.walls.some(w => b.pos.x > w.x && b.pos.x < w.x + w.width && b.pos.y > w.y && b.pos.y < w.y + w.height)) b.active = false;
        newPlayers.forEach(p => {
          if (p.role === PlayerRole.GHOST && p.health > 0 && !p.isTeleporting) {
            const d = Math.sqrt((p.pos.x - b.pos.x)**2 + (p.pos.y - b.pos.y)**2);
            if (d < PLAYER_RADIUS) {
              b.active = false;
              if (!p.isVisible && p.blinkTimer <= 0) {
                p.isVisible = true; p.revealTimer = REVEAL_DURATION;
              } else {
                p.health -= DAMAGE_PER_HIT;
              }
            }
          }
        });
      });

      // --- IMPROVED POSSESSION LOGIC ---
      newPlayers.forEach(ghost => {
        if (ghost.role === PlayerRole.GHOST && ghost.health > 0 && ghost.abilityPoints > 0 && !ghost.isTeleporting) {
          for (let hunter of newPlayers) {
            if (hunter.role === PlayerRole.HUNTER && hunter.lives > 0 && hunter.stunTimer <= 0) {
              const dx = hunter.pos.x - ghost.pos.x;
              const dy = hunter.pos.y - ghost.pos.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < POSSESS_DIST) {
                let angleToGhost = Math.atan2(ghost.pos.y - hunter.pos.y, ghost.pos.x - hunter.pos.x);
                let diff = (angleToGhost - hunter.angle) * (180 / Math.PI);
                while (diff < -180) diff += 360;
                while (diff > 180) diff -= 360;
                
                if (Math.abs(diff) > 180 - (POSSESS_ANGLE / 2)) {
                  hunter.lives -= 1;
                  hunter.stunTimer = STUN_DURATION;
                  ghost.abilityPoints -= 1;
                  if (ghost.abilityPoints <= 0) break; 
                }
              }
            }
          }
        }
      });

      const huntersWin = !newPlayers.some(p => p.role === PlayerRole.GHOST && p.health > 0);
      const ghostsWin = !newPlayers.some(p => p.role === PlayerRole.HUNTER && p.lives > 0);
      
      state.players = newPlayers;
      state.bullets = newBullets.filter(b => b.active);
      if (huntersWin) { state.status = GameStatus.FINISHED; state.winner = PlayerRole.HUNTER; }
      else if (ghostsWin) { state.status = GameStatus.FINISHED; state.winner = PlayerRole.GHOST; }

      setGameState({ ...state });
    };

    const draw = () => {
      const state = gameStateRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = COLORS.FLOOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const userPlayer = state.players.find(p => !p.isBot);

      if (userRole === PlayerRole.GHOST) {
        state.portals.forEach((p, idx) => {
          ctx.save();
          let portalColor = (userPlayer?.role === PlayerRole.GHOST && userPlayer?.teleportCooldown && userPlayer.teleportCooldown > 0) ? '#ef4444' : '#22c55e';
          ctx.globalAlpha = 0.8;
          const grad = ctx.createRadialGradient(p.pos.x, p.pos.y, 5, p.pos.x, p.pos.y, PORTAL_RADIUS);
          grad.addColorStop(0, portalColor);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(p.pos.x, p.pos.y, PORTAL_RADIUS, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1.0; ctx.fillStyle = portalColor; ctx.font = 'bold 10px Roboto Mono'; ctx.textAlign = 'center';
          ctx.fillText(`SECTOR ${idx + 1}`, p.pos.x, p.pos.y - PORTAL_RADIUS - 5);
          ctx.restore();
        });
      }

      state.walls.forEach(w => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(w.x, w.y, w.width, w.height + 15);
        ctx.fillStyle = w.color;
        ctx.fillRect(w.x, w.y, w.width, w.height);
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.strokeRect(w.x, w.y, w.width, w.height);
      });

      ctx.fillStyle = COLORS.BULLET;
      state.bullets.forEach(b => {
        ctx.beginPath(); ctx.arc(b.pos.x, b.pos.y, 4, 0, Math.PI * 2); ctx.fill();
      });

      state.players.forEach(p => {
        if ((p.role === PlayerRole.HUNTER && p.lives <= 0) || (p.role === PlayerRole.GHOST && p.health <= 0) || p.isTeleporting) return;
        
        const isSelf = !p.isBot;
        const shouldDraw = p.role === PlayerRole.HUNTER || p.isVisible || p.blinkTimer > 0 || userRole === PlayerRole.GHOST || isSelf;
        if (!shouldDraw) return;

        ctx.save();
        ctx.translate(p.pos.x, p.pos.y);

        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Roboto Mono'; ctx.textAlign = 'center';
        ctx.fillText(p.isBot ? `[AI] ${p.name}` : p.name, 0, -35);
        const barWidth = 40; const barHeight = 4;
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-barWidth/2, -30, barWidth, barHeight);
        const hpPerc = p.role === PlayerRole.HUNTER ? (p.lives / INITIAL_HUNTER_LIVES) : (p.health / INITIAL_GHOST_HEALTH);
        ctx.fillStyle = p.role === PlayerRole.HUNTER ? COLORS.HUNTER : COLORS.GHOST;
        ctx.fillRect(-barWidth/2, -30, barWidth * Math.max(0, hpPerc), barHeight);

        // ABILITY PIPS FOR GHOSTS
        if (p.role === PlayerRole.GHOST) {
          for (let i = 0; i < p.abilityPoints; i++) {
            ctx.fillStyle = '#fuchsia';
            ctx.beginPath();
            ctx.arc(-15 + (i * 10), -40, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        let alpha = 1;
        if (p.role === PlayerRole.GHOST) {
          if (!p.isVisible && p.blinkTimer <= 0) alpha = 0.3;
          else if (p.blinkTimer > 0) alpha = Math.sin(performance.now() * 0.02) * 0.5 + 0.5;
        }
        ctx.globalAlpha = alpha;

        ctx.rotate(p.angle);
        ctx.fillStyle = p.color; ctx.beginPath();
        if (p.role === PlayerRole.HUNTER) {
          ctx.moveTo(PLAYER_RADIUS, 0); ctx.lineTo(-PLAYER_RADIUS, -PLAYER_RADIUS); ctx.lineTo(-PLAYER_RADIUS, PLAYER_RADIUS);
        } else {
          ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.fillStyle = '#fff'; ctx.beginPath();
        if (p.role === PlayerRole.HUNTER) { ctx.arc(8, -6, 4, 0, Math.PI * 2); ctx.arc(8, 6, 4, 0, Math.PI * 2); }
        else { ctx.arc(6, -6, 5, 0, Math.PI * 2); ctx.arc(6, 6, 5, 0, Math.PI * 2); }
        ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath();
        if (p.role === PlayerRole.HUNTER) { ctx.arc(10, -6, 2, 0, Math.PI * 2); ctx.arc(10, 6, 2, 0, Math.PI * 2); }
        else { ctx.arc(8, -6, 2, 0, Math.PI * 2); ctx.arc(8, 6, 2, 0, Math.PI * 2); }
        ctx.fill();
        ctx.restore();

        if (p.stunTimer > 0) {
          ctx.save();
          ctx.strokeStyle = '#ff0'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(p.pos.x, p.pos.y, PLAYER_RADIUS + 5, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        }
      });
    };

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      update(dt, time);
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [userRole, userName, controlType, mouseAimEnabled, speedSetting]);

  const selectTeleportExit = (portalId: string) => {
    const state = gameStateRef.current;
    const ghost = state.players.find(p => p.role === PlayerRole.GHOST && p.isTeleporting && !p.isBot);
    if (ghost) {
      const target = state.portals.find(p => p.id === portalId);
      if (target) {
        ghost.pos = { ...target.pos }; 
        ghost.isTeleporting = false; 
        ghost.teleportCooldown = TELEPORT_COOLDOWN;
      }
    }
  };

  const currentUser = gameState.players.find(p => !p.isBot);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden" 
         onTouchStart={controlType === 'MOBILE' ? handleJoystickStart : undefined}
         onTouchMove={controlType === 'MOBILE' ? handleJoystickMove : undefined}
         onTouchEnd={controlType === 'MOBILE' ? handleJoystickEnd : undefined}>
      
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex justify-between items-start z-10 pointer-events-none">
        <div className="bg-slate-900/80 border border-slate-700 p-3 sm:p-4 rounded-lg flex items-center space-x-4 sm:space-x-6 backdrop-blur-sm shadow-2xl">
          {userRole === PlayerRole.GHOST ? (
            <div className="flex flex-col space-y-1 sm:space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-[8px] sm:text-[10px] text-fuchsia-400 font-bold font-mono tracking-widest uppercase">Ability Points</span>
                <div className="flex space-x-1">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 sm:w-3 sm:h-3 rounded-sm transform rotate-45 border border-fuchsia-400 ${i < (currentUser?.abilityPoints || 0) ? 'bg-fuchsia-500' : 'bg-transparent'}`}></div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[8px] sm:text-[10px] text-fuchsia-400 font-bold font-mono tracking-widest uppercase">Ghost Essence</span>
                <div className="w-20 sm:w-32 h-1 sm:h-2 bg-slate-800 rounded-full border border-slate-700 overflow-hidden">
                  <div className="h-full bg-fuchsia-500 transition-all duration-300" style={{ width: `${currentUser?.health || 0}%` }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[10px] text-cyan-400 font-bold font-mono tracking-widest uppercase mb-1">Combat Vitality</span>
              <div className="flex space-x-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <i key={i} className={`fas fa-heart text-sm sm:text-lg ${i < (currentUser?.lives || 0) ? 'text-cyan-400 animate-pulse' : 'text-slate-700'}`}></i>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={onGameOver}
          className="pointer-events-auto bg-slate-900/80 border border-red-900/50 hover:bg-red-900/40 text-red-500 font-orbitron px-4 sm:px-6 py-1 sm:py-2 rounded-lg backdrop-blur-sm transition-all flex items-center space-x-2 shadow-lg text-xs sm:text-sm"
        >
          <i className="fas fa-power-off"></i> 
          <span>ABORT</span>
        </button>
      </div>

      <canvas ref={canvasRef} width={WORLD_WIDTH} height={WORLD_HEIGHT} className="max-w-full max-h-[85vh] object-contain border-2 border-slate-800 rounded-2xl shadow-2xl bg-[#0a0a10]" />

      {currentUser?.isTeleporting && (
        <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 pointer-events-none">
          <div className="bg-slate-900/95 border border-fuchsia-500/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border-2 pointer-events-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex flex-col items-center">
              <span className="text-fuchsia-400 font-orbitron text-[10px] tracking-[0.3em] font-bold mb-6">VOID EXTRACTION IN PROGRESS</span>
              <div className="flex space-x-6 sm:space-x-12">
                {gameState.portals.map((p, idx) => (
                  <button key={p.id} onClick={() => selectTeleportExit(p.id)} className="group relative flex flex-col items-center space-y-2 sm:space-y-4">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-800 border-2 border-fuchsia-500/30 rounded-2xl sm:rounded-3xl flex items-center justify-center group-hover:bg-fuchsia-500/40 group-hover:border-fuchsia-400 transition-all transform group-active:scale-90 shadow-2xl">
                      <i className={`fas ${idx === 0 ? 'fa-map-marker-alt' : idx === 1 ? 'fa-location-arrow' : 'fa-crosshairs'} text-fuchsia-400 text-xl sm:text-3xl`}></i>
                    </div>
                    <span className="text-[9px] sm:text-[11px] font-mono text-slate-200 font-bold uppercase">SEC {idx + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {controlType === 'MOBILE' && (
        <>
          <div className="absolute bottom-8 sm:bottom-10 left-8 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/5 border-2 border-white/20 pointer-events-none">
            {joystickRef.current.active && (
              <div className="absolute w-8 h-8 sm:w-12 sm:h-12 bg-white/40 rounded-full" 
                   style={{ left: `calc(50% + ${Math.min(joystickRef.current.current.x - joystickRef.current.start.x, 50)}px - 16px)`, 
                            top: `calc(50% + ${Math.min(joystickRef.current.current.y - joystickRef.current.start.y, 50)}px - 16px)` }} />
            )}
          </div>
          {userRole === PlayerRole.HUNTER && (currentUser?.lives || 0) > 0 && (
            <button onPointerDown={() => keysRef.current['KeyF'] = true} onPointerUp={() => keysRef.current['KeyF'] = false} className="absolute bottom-8 sm:bottom-10 right-8 sm:right-10 w-20 h-20 sm:w-24 sm:h-24 bg-cyan-600/50 border-4 border-cyan-400 rounded-full text-white flex items-center justify-center text-2xl sm:text-3xl active:scale-90 transition-transform pointer-events-auto">
              <i className="fas fa-crosshairs"></i>
            </button>
          )}
        </>
      )}

      {gameState.status === GameStatus.FINISHED && (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50 animate-in fade-in duration-700 backdrop-blur-xl p-4 text-center">
          <h2 className={`text-4xl sm:text-7xl font-orbitron font-bold mb-4 uppercase tracking-tighter ${gameState.winner === PlayerRole.HUNTER ? 'text-cyan-400' : 'text-fuchsia-500'}`}>
            {gameState.winner}S DOMINATE
          </h2>
          <button onClick={onGameOver} className="px-8 sm:px-12 py-3 sm:py-4 bg-white text-black font-bold font-orbitron hover:bg-slate-200 transition-all pointer-events-auto shadow-2xl">
            RE-INITIALIZE SECTOR
          </button>
        </div>
      )}
    </div>
  );
};

export default GameView;
