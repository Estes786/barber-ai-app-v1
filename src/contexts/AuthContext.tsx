import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return; 
      }

      setProfile(data);
    } catch (e) {
        console.error("Critical error in loadProfile", e);
    }
  };
  
  // Perbaikan untuk memastikan loading spinner hilang
  useEffect(() => {
    const initializeAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) {
                await loadProfile(session.user.id);
            }
        } catch (error) {
            console.error("Error during initial session load:", error);
        } finally {
            // PENTING: Panggil setLoading(false) di akhir agar loading spinner hilang
            setLoading(false);
        }
    };
    
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    // 🛑 SEMUA DATA PROFIL (full_name, role) DIABAIKAN DI SINI.
    // Tugasnya hanya membuat user di auth.users.
    // Trigger Supabase akan membuat baris di tabel profiles.
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      // Jika Anda ingin menyimpan role, gunakan metadata (tapi lebih rumit)
      // options: {
      //   data: { role: role, full_name: fullName }
      // }
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

