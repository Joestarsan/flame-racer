-- Drop existing tables and start fresh with simple approach
DROP TABLE IF EXISTS public.game_scores CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create simple players table without auth complexity
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL UNIQUE,
  best_score INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT nickname_length CHECK (length(nickname) >= 2 AND length(nickname) <= 20),
  CONSTRAINT nickname_valid CHECK (nickname ~ '^[a-zA-Z0-9_-]+$'),
  CONSTRAINT best_score_positive CHECK (best_score >= 0)
);

-- Create game results table  
CREATE TABLE public.game_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  speed DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  time_played DECIMAL(8,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT score_positive CHECK (score >= 0),
  CONSTRAINT speed_positive CHECK (speed >= 1.0),
  CONSTRAINT time_positive CHECK (time_played >= 0.0)
);

-- Enable Row Level Security (but make it public for simplicity)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

-- Allow public access for simple usage
CREATE POLICY "Allow public access to players" ON public.players FOR ALL USING (true);
CREATE POLICY "Allow public access to game_results" ON public.game_results FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_players_nickname ON public.players(nickname);
CREATE INDEX idx_players_best_score ON public.players(best_score DESC);
CREATE INDEX idx_game_results_nickname ON public.game_results(nickname);
CREATE INDEX idx_game_results_score ON public.game_results(score DESC);
CREATE INDEX idx_game_results_created_at ON public.game_results(created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();