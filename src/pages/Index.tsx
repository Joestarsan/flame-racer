import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { GameEngine } from "@/components/FlameRacer/GameEngine";
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Index = () => {
  const { currentPlayer, clearPlayer } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentPlayer) {
      navigate('/auth');
    }
  }, [currentPlayer, navigate]);

  const handleSignOut = () => {
    clearPlayer();
    navigate('/auth');
  };

  if (!currentPlayer) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen">
      {/* Header with user info */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
        <div className="flex items-center space-x-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-flame-core/20">
          <User className="h-4 w-4 text-flame-core" />
          <span className="font-medium text-foreground">{currentPlayer}</span>
        </div>
        
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="bg-background/90 backdrop-blur-sm border-flame-core/20 hover:bg-flame-core/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Just the Game - no sidebar */}
      <GameEngine />
    </div>
  );
};

export default Index;
