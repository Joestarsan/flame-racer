import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GameEngine } from "@/components/FlameRacer/GameEngine";
import { Leaderboard } from "@/components/FlameRacer/Leaderboard";
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      navigate('/auth');
    }
  }, [user, profile, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flame-core mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen">
      {/* Header with user info */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
        <div className="flex items-center space-x-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-flame-core/20">
          <User className="h-4 w-4 text-flame-core" />
          <span className="font-medium text-foreground">{profile.nickname}</span>
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

      {/* Game and Leaderboard Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Game Area */}
        <div className="flex-1 flex items-center justify-center p-4">
          <GameEngine />
        </div>
        
        {/* Leaderboard Sidebar */}
        <div className="lg:w-80 p-4 lg:overflow-y-auto">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

export default Index;
