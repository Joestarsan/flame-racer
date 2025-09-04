import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameScore {
  id: string;
  nickname: string;
  score: number;
  speed: number;
  time_played: number;
  created_at: string;
}

export const Leaderboard = () => {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setScores(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('game_scores_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'game_scores' },
        () => {
          fetchLeaderboard(); // Refresh leaderboard when new score is added
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  if (loading) {
    return (
      <Card className="game-surface">
        <CardHeader>
          <CardTitle className="text-center flame-text">🏆 Таблица лидеров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-background/20 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="game-surface">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flame-text">🏆 Лидеры</CardTitle>
          <Button
            onClick={fetchLeaderboard}
            variant="outline"
            size="sm"
            className="bg-background/20 border-flame-core/30 hover:bg-flame-core/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {scores.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Пока нет результатов</p>
            <p className="text-sm">Сыграйте первым!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scores.map((score, index) => (
              <div
                key={score.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg transition-colors
                  ${index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border border-gray-400/30' :
                    index === 2 ? 'bg-gradient-to-r from-orange-600/20 to-orange-700/10 border border-orange-600/30' :
                    'bg-background/20 hover:bg-background/30'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  {getRankIcon(index)}
                  <div>
                    <div className="font-bold text-foreground">{score.nickname}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(score.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-flame-core">{score.score.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {score.speed.toFixed(1)}x • {score.time_played.toFixed(0)}с
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};