interface HUDProps {
  score: number;
  speed: number;
  bestScore: number;
}

export const HUD = ({ score, speed, bestScore }: HUDProps) => {
  return (
    <div className="absolute inset-0 p-4 flex justify-between items-start pointer-events-none z-30">
      <div className="flex gap-3">
        <div className="pointer-events-auto px-3 py-2 rounded-xl font-bold text-sm bg-white/10 border border-white/20 backdrop-blur-sm">
          Score: <span className="flame-text">{score}</span>
        </div>
        <div className="pointer-events-auto px-3 py-2 rounded-xl font-bold text-sm bg-white/10 border border-white/20 backdrop-blur-sm">
          Speed: <span className="text-flame-ember">{speed.toFixed(2)}×</span>
        </div>
        <div className="pointer-events-auto px-3 py-2 rounded-xl font-bold text-sm bg-white/10 border border-white/20 backdrop-blur-sm">
          Best: <span className="text-flame-spark">{bestScore}</span>
        </div>
      </div>
      
      <div className="pointer-events-auto px-3 py-2 rounded-xl font-bold text-sm bg-white/10 border border-white/20 backdrop-blur-sm">
        Move: <span className="text-muted-foreground">← → or A D</span>
      </div>
    </div>
  );
};