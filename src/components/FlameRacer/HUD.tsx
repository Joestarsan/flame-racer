import { memo } from 'react';

interface HUDProps {
  score: number;
  speed: number;
  bestScore: number;
}

export const HUD = memo(({ score, speed, bestScore }: HUDProps) => {
  return (
    <div className="absolute inset-0 p-4 flex justify-between items-start pointer-events-none z-30">
      <div className="flex gap-3">
        <div className="px-3 py-2 rounded-xl font-bold text-sm bg-black/20 border border-white/20">
          Score: <span className="text-orange-400">{score}</span>
        </div>
        <div className="px-3 py-2 rounded-xl font-bold text-sm bg-black/20 border border-white/20">
          Speed: <span className="text-yellow-400">{speed.toFixed(1)}×</span>
        </div>
        <div className="px-3 py-2 rounded-xl font-bold text-sm bg-black/20 border border-white/20">
          Best: <span className="text-green-400">{bestScore}</span>
        </div>
      </div>
      
        <div className="px-3 py-2 rounded-xl font-bold text-sm bg-black/20 border border-white/20">
          <span className="text-gray-300">Tap left/right or ← →</span>
        </div>
    </div>
  );
});