import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Reward, RewardSettings } from '../types';

interface RewardState {
  userReward: Reward | null;
  rewardSettings: RewardSettings | null;
  loading: boolean;
  error: string | null;
  
  fetchUserReward: (userId: string) => Promise<void>;
  fetchRewardSettings: () => Promise<void>;
  updateRewardSettings: (servicesForReward: number) => Promise<void>;
  grantFreeService: (userId: string) => Promise<void>;
  useFreeService: (userId: string) => Promise<void>;
}

export const useRewardStore = create<RewardState>((set) => ({
  userReward: null,
  rewardSettings: null,
  loading: false,
  error: null,

  fetchUserReward: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      set({
        userReward: data ? {
          id: data.id,
          userId: data.user_id,
          serviceCount: data.service_count,
          freeServiceAvailable: data.free_service_available,
          updatedAt: data.updated_at,
        } : null
      });
    } catch (error) {
      console.error('Error fetching user reward:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchRewardSettings: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('reward_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      
      set({
        rewardSettings: data ? {
          id: data.id,
          servicesForReward: data.services_for_reward,
          updatedAt: data.updated_at,
        } : null
      });
    } catch (error) {
      console.error('Error fetching reward settings:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateRewardSettings: async (servicesForReward) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('reward_settings')
        .update({
          services_for_reward: servicesForReward,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1) // Assuming there's only one settings record
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        set({
          rewardSettings: {
            id: data[0].id,
            servicesForReward: data[0].services_for_reward,
            updatedAt: data[0].updated_at,
          }
        });
      }
    } catch (error) {
      console.error('Error updating reward settings:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  grantFreeService: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('rewards')
        .update({
          free_service_available: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      set((state) => ({
        userReward: state.userReward ? {
          ...state.userReward,
          freeServiceAvailable: true,
          updatedAt: new Date().toISOString(),
        } : null
      }));
    } catch (error) {
      console.error('Error granting free service:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  useFreeService: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('rewards')
        .update({
          free_service_available: false,
          service_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      set((state) => ({
        userReward: state.userReward ? {
          ...state.userReward,
          freeServiceAvailable: false,
          serviceCount: 0,
          updatedAt: new Date().toISOString(),
        } : null
      }));
    } catch (error) {
      console.error('Error using free service:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  }
}));