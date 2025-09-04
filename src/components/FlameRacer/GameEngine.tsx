import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";
import { Player } from "./Player";
import { Obstacle } from "./Obstacle";
import { Bonus } from "./Bonus";
import { HUD } from "./HUD";
import { GameMenu } from "./GameMenu";
import { GameOverlay } from "./GameOverlay";
import { useIsMobile } from "@/hooks/use-mobile";

interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'obstacle' | 'bonus';
  obstacleType?: 'spam' | 'latency' | 'mev' | 'reorg' | 'fee';
  dead?: boolean;
  speed: number;
}

interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  showMenu: boolean;
  showGameOver: boolean;
  score: number;
  bestScore: number;
  speed: number;
  time: number;
  playerX: number;
  entities: Entity[];
}

const LANE_COUNT = 5;
const BASE_SCROLL_SPEED = 300;
const PLAYER_SPEED_X = 720;
const MIN_VERTICAL_GAP = 120;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

export const GameEngine = () => {
  const { saveGameResult } = useGame();
  const gameRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    isPaused: false,
    showMenu: true,
    showGameOver: false,
    score: 0,
    bestScore: parseInt(localStorage.getItem('flameRacer.bestScore') || '0'),
    speed: BASE_SCROLL_SPEED,
    time: 0,
    playerX: 0,
    entities: []
  });

  const [input, setInput] = useState({ left: false, right: false });
  const isMobile = useIsMobile();
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const safeLaneRef = useRef<number>(Math.floor(LANE_COUNT / 2));

  // Responsive game dimensions based on viewport (keeps 3:2 aspect ratio)
 const { gameWidth, gameHeight, laneWidth } = useMemo(() => {
  const isPortrait = viewport.h > viewport.w;  // Detect orientation
  const padding = isMobile ? 0 : 16;  // Reduced for more room
  const maxW = Math.max(320, Math.min(1200, viewport.w - padding));  // Higher cap
  const maxH = Math.max(220, Math.min(1600, viewport.h - padding));  // Much higher for tall screens
  let width, height;
  if (isPortrait) {
    // Portrait: Taller ratio (2:3, height-driven)
    height = Math.min(maxH, Math.floor(maxW * 3 / 2));
    width = Math.floor(height * 2 / 3);
  } else {
    // Landscape: Original 3:2 (width-driven)
    width = Math.min(maxW, Math.floor(maxH * 3 / 2));
    height = Math.floor(width * 2 / 3);
  }
  return { gameWidth: width, gameHeight: height, laneWidth: width / LANE_COUNT };
}, [viewport.w, viewport.h, isMobile]);

  const clamp = (value: number, min: number, max: number) => 
    Math.min(Math.max(value, min), max);

  const checkCollision = (a: any, b: any) => 
    a.x < b.x + b.width && 
    a.x + a.width > b.x && 
    a.y < b.y + b.height && 
    a.y + a.height > b.y;

  const spawnWave = useCallback(() => {
    const corridor = gameState.time < 20 ? 2 : 1;
    const delta = Math.floor(Math.random() * 3) - 1;
    const nextSafe = clamp(safeLaneRef.current + delta, 0, LANE_COUNT - corridor);
    
    // Mark safe lanes (guaranteed passage)
    const freeLanes = new Array(LANE_COUNT).fill(true);
    for (let i = 0; i < corridor; i++) {
      freeLanes[nextSafe + i] = false;
    }

    const newEntities: Entity[] = [];
    
    // Always single obstacles for consistent gameplay
    const maxObstacles = 1; // Always just 1 obstacle per wave
    let placed = 0;
    
    // Get available lanes for obstacles (excluding safe corridor)
    const availableLanes = [];
    for (let i = 0; i < LANE_COUNT; i++) {
      if (freeLanes[i]) {
        availableLanes.push(i);
      }
    }
    
    // Shuffle available lanes for random distribution
    for (let i = availableLanes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableLanes[i], availableLanes[j]] = [availableLanes[j], availableLanes[i]];
    }
    
    // Place obstacles with spacing
    for (let i = 0; i < Math.min(maxObstacles, availableLanes.length) && placed < maxObstacles; i++) {
      const lane = availableLanes[i];
      
      // Always single-width obstacles
      const canDouble = false;
      const width = 1;
      
      // Skip if would overlap with other obstacles
      let canPlace = true;
      for (let k = 0; k < width; k++) {
        if (!freeLanes[lane + k]) {
          canPlace = false;
          break;
        }
      }
      
      if (!canPlace) continue;

      const obstacleTypes = ['spam', 'latency', 'mev', 'reorg', 'fee'] as const;
      const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

      newEntities.push({
        id: `obstacle-${Date.now()}-${lane}`,
        x: lane * laneWidth + 5,
        y: -60,
        width: laneWidth * width - 40, // Narrower obstacles
        height: 70 + Math.random() * 40, // Taller obstacles (70-110px)
        type: 'obstacle',
        obstacleType,
        speed: gameState.speed
      });

      // Mark used lanes
      for (let k = 0; k < width; k++) {
        freeLanes[lane + k] = false;
      }

      placed++;
    }

    // Add bonus with higher chance in safe corridor
    if (Math.random() < 0.4) {
      const bonusLane = nextSafe + (corridor > 1 && Math.random() < 0.5 ? 1 : 0);
      newEntities.push({
        id: `bonus-${Date.now()}`,
        x: bonusLane * laneWidth + (laneWidth - 26) / 2,
        y: -26,
        width: 26,
        height: 26,
        type: 'bonus',
        speed: gameState.speed * 0.9
      });
    }

    safeLaneRef.current = nextSafe;
    return newEntities;
  }, [gameState.speed, gameState.time]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isRunning: true,
      showMenu: false,
      showGameOver: false,
      score: 0,
      speed: BASE_SCROLL_SPEED,
      time: 0,
      playerX: gameWidth * 0.5 - 21,
      entities: []
    }));
    
    spawnTimerRef.current = 0;
    safeLaneRef.current = Math.floor(LANE_COUNT / 2);
    lastTimeRef.current = performance.now();
  }, []);

  const gameOver = useCallback(async () => {
    const finalScore = Math.floor(gameState.score);
    const finalSpeed = gameState.speed / BASE_SCROLL_SPEED;
    const finalTime = gameState.time;

    setGameState(prev => {
      const newBest = Math.max(prev.bestScore, finalScore);
      localStorage.setItem('flameRacer.bestScore', newBest.toString());
      
      return {
        ...prev,
        isRunning: false,
        showGameOver: true,
        bestScore: newBest
      };
    });

    // Save score to database in background without blocking
    setTimeout(async () => {
      try {
        const { error } = await saveGameResult(finalScore, finalSpeed, finalTime);
        if (error) {
          console.error('Error saving score:', error);
          toast.error('Failed to save result');
        } else {
          toast.success(`Score saved! Points: ${finalScore.toLocaleString()}`);
        }
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }, 0);
  }, [gameState.score, gameState.speed, gameState.time, saveGameResult]);

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.isRunning) return;

    const deltaMs = currentTime - lastTimeRef.current;
    // Skip frame if too little time has passed (throttle to target FPS)
    if (deltaMs < FRAME_TIME - 1) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    let deltaTime = Math.min(deltaMs / 1000, 0.033); // Cap at ~30fps minimum
    if (!Number.isFinite(deltaTime) || deltaTime <= 0) {
      deltaTime = 1 / 60;
    }
    lastTimeRef.current = currentTime;

    // Batch all state updates into single setState call
    setGameState(prev => {
      const newTime = prev.time + deltaTime;
      const newScore = prev.score + deltaTime * 60;
      const newSpeed = BASE_SCROLL_SPEED * (1 + Math.min(newTime * 0.06, 5.2));

      // Update player position
      const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const newPlayerX = clamp(
        prev.playerX + direction * PLAYER_SPEED_X * deltaTime,
        0,
        gameWidth - 42
      );

      // Update entities in single pass
      const speedDelta = newSpeed * deltaTime;
      let collisionDetected = false;
      let scoreBonus = 0;
      const playerRect = { x: newPlayerX, y: gameHeight - 110, width: 42, height: 60 };
      
      const filteredEntities = [];
      for (const entity of prev.entities) {
        const updatedY = entity.y + speedDelta;
        
        // Filter out entities that are off-screen
        if (updatedY >= gameHeight + 100 || entity.dead) continue;
        
        const updatedEntity = { ...entity, y: updatedY };
        
        // Check collisions
        if (entity.type === 'obstacle' && checkCollision(playerRect, updatedEntity)) {
          collisionDetected = true;
        } else if (entity.type === 'bonus' && !entity.dead && checkCollision(playerRect, updatedEntity)) {
          scoreBonus += 50;
          updatedEntity.dead = true;
        }
        
        if (!updatedEntity.dead) {
          filteredEntities.push(updatedEntity);
        }
      }

      if (collisionDetected) {
        setTimeout(gameOver, 0);
        return prev;
      }

      // Handle spawning in same update
      spawnTimerRef.current -= deltaTime;
      let finalEntities = filteredEntities;
      
      if (spawnTimerRef.current <= 0) {
        const newEntities = spawnWave();
        finalEntities = [...filteredEntities, ...newEntities];
        
        const baseInterval = 1.2 + Math.random() * 0.8;
        const speedMultiplier = 1 + Math.min(newTime * 0.015, 1.2);
        const nextInterval = baseInterval / speedMultiplier;
        const minGapTime = MIN_VERTICAL_GAP * 1.5 / newSpeed;
        
        spawnTimerRef.current = Math.max(nextInterval, minGapTime);
      }

      return {
        ...prev,
        time: newTime,
        score: newScore + scoreBonus,
        speed: newSpeed,
        playerX: newPlayerX,
        entities: finalEntities
      };
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isRunning, input, spawnWave, gameOver]);

  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setInput(prev => ({ ...prev, left: true }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setInput(prev => ({ ...prev, right: true }));
          break;
        case 'Enter':
          if (gameState.showMenu) startGame();
          break;
        case 'r':
        case 'R':
          if (gameState.showGameOver) {
            setGameState(prev => ({ ...prev, showGameOver: false }));
            startGame();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setInput(prev => ({ ...prev, left: false }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setInput(prev => ({ ...prev, right: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.showMenu, gameState.showGameOver, startGame]);

  // Game loop
  useEffect(() => {
    if (gameState.isRunning) {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isRunning, gameLoop]);

    return (
      <div className="min-h-screen flex items-center justify-center p-2 md:p-4">
        <div 
      ref={gameRef}
      className="relative mx-auto rounded-3xl game-surface overflow-hidden"
      style={{
        width: `${gameWidth}px`,
        height: `${gameHeight}px`,
        touchAction: 'none'
      }}
      tabIndex={0}
      role="application"
      aria-label="Flame Racer Game"
      onContextMenu={(e) => e.preventDefault()}
        >
        {/* Simple blue gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, hsl(240 60% 15%), hsl(240 80% 8%))'
            }}
          />
        </div>


        {isMobile && gameState.isRunning && (
          <div className="absolute inset-0 z-40 flex select-none">
            <div
              className="flex-1 h-full"
              onTouchStart={(e) => { e.preventDefault(); setInput((p) => ({ ...p, left: true })); }}
              onTouchEnd={() => setInput({ left: false, right: false })}
              onTouchCancel={() => setInput({ left: false, right: false })}
              onPointerDown={(e) => { e.preventDefault(); setInput((p) => ({ ...p, left: true })); }}
              onPointerUp={() => setInput({ left: false, right: false })}
            />
            <div
              className="flex-1 h-full"
              onTouchStart={(e) => { e.preventDefault(); setInput((p) => ({ ...p, right: true })); }}
              onTouchEnd={() => setInput({ left: false, right: false })}
              onTouchCancel={() => setInput({ left: false, right: false })}
              onPointerDown={(e) => { e.preventDefault(); setInput((p) => ({ ...p, right: true })); }}
              onPointerUp={() => setInput({ left: false, right: false })}
            />
          </div>
        )}

        {/* Game entities */}
        <div className="absolute inset-0 z-10">
          <Player x={gameState.playerX} y={gameHeight - 110} />
          
          {gameState.entities.map(entity => (
            entity.type === 'obstacle' ? (
              <Obstacle
                key={entity.id}
                x={entity.x}
                y={entity.y}
                width={entity.width}
                height={entity.height}
                type={entity.obstacleType!}
              />
            ) : (
              <Bonus
                key={entity.id}
                x={entity.x}
                y={entity.y}
              />
            )
          ))}
        </div>

        <HUD
          score={Math.floor(gameState.score)}
          speed={gameState.speed / BASE_SCROLL_SPEED}
          bestScore={gameState.bestScore}
        />

        {gameState.showMenu && (
          <GameMenu
            bestScore={gameState.bestScore}
            onStart={startGame}
          />
        )}

        {gameState.showGameOver && (
          <GameOverlay
            score={Math.floor(gameState.score)}
            onRestart={startGame}
            onMenu={() => setGameState(prev => ({ 
              ...prev, 
              showGameOver: false, 
              showMenu: true 
            }))}
          />
        )}
      </div>
    </div>
  );
};