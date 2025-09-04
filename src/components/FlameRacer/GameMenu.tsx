import { Button } from "@/components/ui/button";

interface GameMenuProps {
  bestScore: number;
  onStart: () => void;
}

export const GameMenu = ({ bestScore, onStart }: GameMenuProps) => {
  const highScores = JSON.parse(localStorage.getItem('flameRacer.highscores') || '[]')
    .slice(0, 5);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40">
      <div 
        className="absolute inset-0" 
        style={{
          background: 'radial-gradient(1200px 800px at 70% -10%, hsl(var(--flame-core) / 0.2), rgba(0,0,0,0.4))'
        }}
      />
      
      <div className="relative w-full max-w-2xl mx-4 p-6 rounded-2xl game-surface backdrop-blur-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 flame-text">
            🔥 Flame Racer
          </h1>
          <div className="h-1 w-16 mx-auto mb-4 rounded-full fire-gradient" />
          
          <p className="text-lg mb-6 text-muted-foreground leading-relaxed">
            Be the Fogo flame. Dodge network hazards (Spam Floods, MEV Bots, Latency Spikes), 
            collect sparks, and show why FogoChain is fast.
          </p>

          {highScores.length > 0 && (
            <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="font-bold mb-3 text-flame-ember">🏆 High Scores</h3>
              <ol className="text-left max-h-32 overflow-auto space-y-1">
                {highScores.map((score: number, index: number) => (
                  <li key={index} className="flex justify-between">
                    <span>#{index + 1}</span>
                    <span className="font-mono text-flame-spark">{score}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <Button
            onClick={onStart}
            size="lg"
            className="px-8 py-3 text-lg font-bold bg-gradient-to-r from-flame-ember to-flame-hot hover:from-flame-hot hover:to-flame-warm text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            🔥 Start Game (Enter)
          </Button>
        </div>

        <a
          href="https://x.com/Joestar_sann"
          target="_blank"
          rel="noopener"
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm"
        >
          created by Joestar
        </a>
      </div>
    </div>
  );
};