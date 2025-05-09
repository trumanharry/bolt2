import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  setSession: (session: Session | null) => void;
  user: any | null;
  setUser: (user: any | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updatePassword: (password: string) => Promise<{ error: any | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  setSession: (session) => set({ session }),
  user: null,
  setUser: (user) => set({ user }),
  
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  },

  signUp: async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });

    if (!error) {
      // Create user profile
      await supabase.from('users').insert({
        id: (await supabase.auth.getUser()).data.user?.id,
        email,
        full_name: fullName,
      });
    }

    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  },

  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  },
}));