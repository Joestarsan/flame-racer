import { Button } from "@/components/ui/button";

interface GameOverlayProps {
  score: number;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverlay = ({ score, onRestart, onMenu }: GameOverlayProps) => {
  const shareScore = () => {
    const text = encodeURIComponent(
      `I scored ${score} in Flame Racer — a FogoChain mini runner. Play now:`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
      />
      
      <div className="relative w-full max-w-md mx-4 p-6 rounded-2xl game-surface">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-flame-hot">
            💀 Game Over
          </h2>
          
          <div className="mb-6 p-4 bg-white/5 border border-flame-core/30 rounded-xl">
            <p className="text-lg mb-2 text-muted-foreground">Your Score:</p>
            <p className="text-4xl font-bold flame-text">{score}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={shareScore}
              className="w-full bg-gradient-to-r from-flame-ember to-flame-hot hover:from-flame-hot hover:to-flame-warm text-primary-foreground font-bold rounded-xl"
            >
              🐦 Share on X
            </Button>
            
            <div className="flex gap-3">
              <Button
                onClick={onRestart}
                variant="outline"
                className="flex-1 border-white/20 hover:border-flame-core/50 hover:bg-flame-core/10"
              >
                🔄 Try Again (R)
              </Button>
              
              <Button
                onClick={onMenu}
                variant="outline"
                className="flex-1 border-white/20 hover:border-flame-core/50 hover:bg-flame-core/10"
              >
                🏠 Main Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};