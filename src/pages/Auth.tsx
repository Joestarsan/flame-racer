import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Flame } from 'lucide-react';

const Auth = () => {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUpWithNickname } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim() || nickname.length < 2 || nickname.length > 20) {
      toast.error('Ник должен содержать от 2 до 20 символов');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(nickname)) {
      toast.error('Ник может содержать только буквы, цифры, _ и -');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signUpWithNickname(nickname);
      
      if (error) {
        if (error.message?.includes('duplicate key value')) {
          toast.error('Этот ник уже занят! Выберите другой');
        } else {
          toast.error('Ошибка при создании профиля: ' + error.message);
        }
        return;
      }
      
      toast.success('Добро пожаловать в Flame Racer!');
      navigate('/');
    } catch (error: any) {
      toast.error('Произошла ошибка: ' + error.message);
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
            Введите свой игровой ник для начала игры
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="nickname" className="text-sm font-medium text-foreground">
                Игровой ник
              </label>
              <Input
                id="nickname"
                type="text"
                placeholder="Введите ваш ник..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="bg-background/50 border-flame-core/30 focus:border-flame-core/60"
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground">
                От 2 до 20 символов. Только буквы, цифры, _ и -
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-flame-hot to-flame-core hover:from-flame-core hover:to-flame-ember transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Создание профиля...' : 'Начать игру'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Все результаты игры будут сохраняться</p>
            <p>и отображаться в таблице лидеров</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;