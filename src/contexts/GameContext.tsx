import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Player {
  id: string;
  nickname: string;
  best_score: number;
  games_played: number;
  created_at: string;
  updated_at: string;
}

interface GameResult {
  id: string;
  nickname: string;
  score: number;
  speed: number;
  time_played: number;
  created_at: string;
}

interface GameContextType {
  currentPlayer: string | null;
  setNickname: (nickname: string) => Promise<{ error: any }>;
  saveGameResult: (score: number, speed: number, timePlayed: number) => Promise<{ error: any }>;
  getLeaderboard: () => Promise<GameResult[]>;
  clearPlayer: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);

  useEffect(() => {
    // Load saved nickname from localStorage
    const savedNickname = localStorage.getItem('flame-racer-nickname');
    if (savedNickname) {
      setCurrentPlayer(savedNickname);
    }
  }, []);

  const setNickname = async (nickname: string) => {
    try {
      // Check if nickname already exists
      const { data: existingPlayer, error: checkError } = await supabase
        .from('players')
        .select('nickname')
        .eq('nickname', nickname)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!existingPlayer) {
        // Create new player record
        const { error: insertError } = await supabase
          .from('players')
          .insert([{ nickname }]);

        if (insertError) throw insertError;
      }

      // Save to localStorage and state
      localStorage.setItem('flame-racer-nickname', nickname);
      setCurrentPlayer(nickname);
      
      return { error: null };
    } catch (error: any) {
      console.error('Error setting nickname:', error);
      return { error };
    }
  };

  const saveGameResult = async (score: number, speed: number, timePlayed: number) => {
    if (!currentPlayer) {
      return { error: new Error('No player set') };
    }

    try {
      // Save game result
      const { error: resultError } = await supabase
        .from('game_results')
        .insert([
          {
            nickname: currentPlayer,
            score: Math.floor(score),
            speed: Number(speed.toFixed(2)),
            time_played: Number(timePlayed.toFixed(2))
          }
        ]);

      if (resultError) throw resultError;

      // Update player's best score and games count
      const { data: player, error: fetchError } = await supabase
        .from('players')
        .select('best_score, games_played')
        .eq('nickname', currentPlayer)
        .single();

      if (fetchError) throw fetchError;

      const newBestScore = Math.max(player.best_score, Math.floor(score));
      const newGamesPlayed = player.games_played + 1;

      const { error: updateError } = await supabase
        .from('players')
        .update({
          best_score: newBestScore,
          games_played: newGamesPlayed
        })
        .eq('nickname', currentPlayer);

      if (updateError) throw updateError;

      return { error: null };
    } catch (error: any) {
      console.error('Error saving game result:', error);
      return { error };
    }
  };

  const getLeaderboard = async (): Promise<GameResult[]> => {
    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  };

  const clearPlayer = () => {
    localStorage.removeItem('flame-racer-nickname');
    setCurrentPlayer(null);
  };

  const value = {
    currentPlayer,
    setNickname,
    saveGameResult,
    getLeaderboard,
    clearPlayer
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};