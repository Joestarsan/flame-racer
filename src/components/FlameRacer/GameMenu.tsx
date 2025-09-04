import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface GameMenuProps {
  bestScore: number;
  onStart: () => void;
}

interface GameResult {
  id: string;
  nickname: string;
  score: number;
  speed: number;
  time_played: number;
  created_at: string;
}

export const GameMenu = ({ bestScore, onStart }: GameMenuProps) => {
  const [highScores, setHighScores] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHighScores = async () => {
    try {
      // Get best score for each unique nickname
      const { data, error } = await supabase
        .from('game_results')
        .select('nickname, score, speed, time_played, created_at')
        .order('score', { ascending: false });

      if (error) throw error;
      
      // Group by nickname and keep only the best score for each
      const uniqueResults = new Map<string, GameResult>();
      
      (data || []).forEach((result: GameResult) => {
        const existing = uniqueResults.get(result.nickname);
        if (!existing || result.score > existing.score) {
          uniqueResults.set(result.nickname, result);
        }
      });
      
      // Convert back to array and sort by score, take top 5
      const topResults = Array.from(uniqueResults.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      
      setHighScores(topResults);
    } catch (error) {
      console.error('Error fetching high scores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighScores();
    
    // Set up real-time subscription for high scores
    const subscription = supabase
      .channel('game_results_menu')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'game_results' },
        () => {
          fetchHighScores(); // Refresh when new score is added
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

          <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
            <h3 className="font-bold mb-3 text-flame-ember">🏆 High Scores</h3>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-background/20 rounded"></div>
                  </div>
                ))}
              </div>
            ) : highScores.length > 0 ? (
              <ol className="text-left max-h-32 overflow-auto space-y-1">
                {highScores.map((result, index) => (
                  <li key={result.id} className="flex justify-between items-center">
                    <span className="flex items-center space-x-2">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <span className="font-medium">{result.nickname}</span>
                    </span>
                    <span className="font-mono text-flame-spark font-bold">{result.score.toLocaleString()}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted-foreground text-sm">No scores yet. Be the first!</p>
            )}
          </div>

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