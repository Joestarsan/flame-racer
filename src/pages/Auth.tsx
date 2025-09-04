import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Flame } from 'lucide-react';

const Auth = () => {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const { setNickname: saveNickname } = useGame();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim() || nickname.length < 2 || nickname.length > 20) {
      toast.error('Nickname must be 2-20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(nickname)) {
      toast.error('Nickname can only contain letters, numbers, _ and -');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await saveNickname(nickname);
      
      if (error) {
        if (error.message?.includes('duplicate key value')) {
          toast.error('This nickname is already taken!');
        } else {
          toast.error('Error: ' + error.message);
        }
        return;
      }
      
      toast.success('Welcome to Flame Racer!');
      navigate('/');
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, hsl(240 60% 15%), hsl(240 80% 8%))'
      }} />
      
      <Card className="relative z-10 w-full max-w-md game-surface">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Flame className="h-12 w-12 text-flame-core animate-glow" />
          </div>
          <CardTitle className="text-2xl flame-text font-bold">Flame Racer</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your nickname to start playing
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="nickname" className="text-sm font-medium text-foreground">
                Nickname
              </label>
              <Input
                id="nickname"
                type="text"
                placeholder="Enter your nickname..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="bg-background/50 border-flame-core/30 focus:border-flame-core/60"
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground">
                2-20 characters. Letters, numbers, _ and - only
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-flame-hot to-flame-core hover:from-flame-core hover:to-flame-ember transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Start Game'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>All game results will be saved</p>
            <p>and shown in the leaderboard</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;