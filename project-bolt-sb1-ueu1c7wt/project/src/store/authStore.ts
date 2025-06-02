import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string, phone: string) => Promise<void>;
  initialize: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    set({ loading: true });
    try {
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) throw profileError;
        
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            firstName: profileData.first_name,
            lastName: profileData.last_name,
            phone: profileData.phone,
            role: profileData.role,
          },
          initialized: true
        });
      } else {
        set({ user: null, initialized: true });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ error: (error as Error).message, initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) throw profileError;
        
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            firstName: profileData.first_name,
            lastName: profileData.last_name,
            phone: profileData.phone,
            role: profileData.role,
          }
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      set({ error: (error as Error).message });
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      console.error('Logout error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  signup: async (email, password, firstName, lastName, phone) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            phone,
            role: 'client',
          });
        
        if (profileError) throw profileError;
        
        // Create initial rewards entry
        const { error: rewardError } = await supabase
          .from('rewards')
          .insert({
            user_id: data.user.id,
            service_count: 0,
            free_service_available: false,
          });
        
        if (rewardError) throw rewardError;
        
        set({
          user: {
            id: data.user.id,
            email,
            firstName,
            lastName,
            phone,
            role: 'client',
          }
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (data) => {
    const user = get().user;
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      set({
        user: {
          ...user,
          ...data,
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));