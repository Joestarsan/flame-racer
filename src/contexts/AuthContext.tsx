import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  nickname: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUpWithNickname: (nickname: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  saveGameScore: (score: number, speed: number, timePlayed: number) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithNickname = async (nickname: string) => {
    try {
      // Create anonymous user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${Date.now()}@anonymous.flame-racer.local`,
        password: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile with nickname
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: authData.user.id,
              nickname: nickname
            }
          ]);

        if (profileError) {
          // If profile creation fails, clean up the user
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw profileError;
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    setProfile(null);
  };

  const saveGameScore = async (score: number, speed: number, timePlayed: number) => {
    if (!user || !profile) {
      return { error: new Error('User not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('game_scores')
        .insert([
          {
            user_id: user.id,
            nickname: profile.nickname,
            score: Math.floor(score),
            speed: Number(speed.toFixed(2)),
            time_played: Number(timePlayed.toFixed(2))
          }
        ]);

      return { error };
    } catch (error: any) {
      console.error('Error saving game score:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUpWithNickname,
    signOut,
    saveGameScore
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};