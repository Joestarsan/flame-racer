import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Player } from "./Player";
import { Obstacle } from "./Obstacle";
import { Bonus } from "./Bonus";
import { HUD } from "./HUD";
import { GameMenu } from "./GameMenu";
import { GameOverlay } from "./GameOverlay";
import { EmberEffect } from "./EmberEffect";

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

const GAME_WIDTH = 900;
const GAME_HEIGHT = 600;
const LANE_COUNT = 5;
const LANE_WIDTH = GAME_WIDTH / LANE_COUNT;
const BASE_SCROLL_SPEED = 220;
const PLAYER_SPEED_X = 520;
const MIN_VERTICAL_GAP = 120;

export const GameEngine = () => {
  const { saveGameScore } = useAuth();
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
    playerX: GAME_WIDTH * 0.5 - 21,
    entities: []
  });

  const [input, setInput] = useState({ left: false, right: false });
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const safeLaneRef = useRef<number>(Math.floor(LANE_COUNT / 2));

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
        x: lane * LANE_WIDTH + 5,
        y: -60,
        width: LANE_WIDTH * width - 40, // Narrower obstacles
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
        x: bonusLane * LANE_WIDTH + (LANE_WIDTH - 26) / 2,
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
      playerX: GAME_WIDTH * 0.5 - 21,
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

    // Save score to database
    try {
      const { error } = await saveGameScore(finalScore, finalSpeed, finalTime);
      if (error) {
        console.error('Error saving score:', error);
        toast.error('Не удалось сохранить результат');
      } else {
        toast.success(`Результат сохранён! Очки: ${finalScore.toLocaleString()}`);
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }, [gameState.score, gameState.speed, gameState.time, saveGameScore]);

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.isRunning) return;

    const deltaMs = currentTime - lastTimeRef.current;
    if (deltaMs < 0 || deltaMs > 1000) {
      console.warn('[FlameRacer] abnormal deltaMs', { deltaMs, currentTime, last: lastTimeRef.current });
    }
    let deltaTime = deltaMs / 1000;
    if (!Number.isFinite(deltaTime) || deltaTime < 0 || deltaTime > 0.5) {
      deltaTime = 1 / 60; // fallback to ~16ms
    }
    deltaTime = Math.min(deltaTime, 0.066);
    lastTimeRef.current = currentTime;

    setGameState(prev => {
      const newTime = Math.max(prev.time + deltaTime, 0);
      const newScore = Math.max(0, prev.score + deltaTime * 60);
      const newSpeed = Math.max(
        BASE_SCROLL_SPEED,
        BASE_SCROLL_SPEED * (1 + Math.min(newTime * 0.03, 2.2))
      );

      // Update player position
      const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const playerVelocity = direction * PLAYER_SPEED_X;
      const newPlayerX = clamp(
        prev.playerX + playerVelocity * deltaTime,
        0,
        GAME_WIDTH - 42
      );

      // Update entities
      const updatedEntities = prev.entities
        .map(entity => ({
          ...entity,
          y: entity.y + entity.speed * deltaTime
        }))
        .filter(entity => entity.y < GAME_HEIGHT + 100 && !entity.dead);

      // Check collisions
      const playerRect = { x: newPlayerX, y: GAME_HEIGHT - 110, width: 42, height: 60 };
      
      let collisionDetected = false;
      let scoreBonus = 0;
      
      const entitiesAfterCollision = updatedEntities.map(entity => {
        if (entity.type === 'obstacle' && checkCollision(playerRect, entity)) {
          collisionDetected = true;
        } else if (entity.type === 'bonus' && !entity.dead && checkCollision(playerRect, entity)) {
          scoreBonus += 50;
          return { ...entity, dead: true };
        }
        return entity;
      }).filter(entity => !entity.dead);

      if (collisionDetected) {
        // End the game on next frame
        setTimeout(gameOver, 0);
        return prev;
      }

      return {
        ...prev,
        time: newTime,
        score: newScore + scoreBonus,
        speed: newSpeed,
        playerX: newPlayerX,
        entities: entitiesAfterCollision
      };
    });

    // Handle spawning
    spawnTimerRef.current -= deltaTime;
    if (spawnTimerRef.current <= 0) {
      const newEntities = spawnWave();
      setGameState(prev => ({
        ...prev,
        entities: [...prev.entities, ...newEntities]
      }));
      
      // Set next spawn time with more breathing room for high-speed gameplay
      const baseInterval = 1.2 + Math.random() * (2.0 - 1.2); // Much longer intervals (1.2-2.0s)
      const speedMultiplier = 1 + Math.min(gameState.time * 0.015, 1.2); // Slower acceleration of frequency
      const nextInterval = baseInterval / speedMultiplier;
      const minGapTime = (MIN_VERTICAL_GAP * 1.8) / gameState.speed; // 80% more gap
      
      spawnTimerRef.current = Math.max(nextInterval, minGapTime);
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isRunning, gameState.time, gameState.speed, input, spawnWave, gameOver]);

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div 
        ref={gameRef}
        className="relative w-[900px] h-[600px] mx-auto rounded-3xl game-surface overflow-hidden"
        style={{
          transform: `scale(${Math.min((window.innerWidth - 32) / 900, (window.innerHeight - 32) / 600)})`
        }}
        tabIndex={0}
        role="application"
        aria-label="Flame Racer Game"
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

        <EmberEffect />

        {/* Game entities */}
        <div className="absolute inset-0 z-10">
          <Player x={gameState.playerX} y={GAME_HEIGHT - 110} />
          
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