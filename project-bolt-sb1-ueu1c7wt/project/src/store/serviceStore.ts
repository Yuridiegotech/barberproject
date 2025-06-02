import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Service } from '../types';

interface ServiceState {
  services: Service[];
  loading: boolean;
  error: string | null;
  selectedServices: Service[];
  fetchServices: () => Promise<void>;
  addService: (service: Omit<Service, 'id' | 'created_at'>) => Promise<void>;
  updateService: (id: number, service: Partial<Service>) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
  selectService: (service: Service) => void;
  deselectService: (serviceId: number) => void;
  clearSelectedServices: () => void;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  loading: false,
  error: null,
  selectedServices: [],

  fetchServices: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      set({ services: data || [] });
    } catch (error) {
      console.error('Error fetching services:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addService: async (service) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: service.name,
          price: service.price,
          description: service.description,
          duration: service.duration
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        set((state) => ({
          services: [...state.services, data[0]]
        }));
      }
    } catch (error) {
      console.error('Error adding service:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateService: async (id, service) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('services')
        .update(service)
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        services: state.services.map(s => 
          s.id === id ? { ...s, ...service } : s
        ),
        selectedServices: state.selectedServices.map(s => 
          s.id === id ? { ...s, ...service } : s
        )
      }));
    } catch (error) {
      console.error('Error updating service:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteService: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        services: state.services.filter(s => s.id !== id),
        selectedServices: state.selectedServices.filter(s => s.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting service:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  selectService: (service) => {
    set((state) => ({
      selectedServices: [...state.selectedServices, service]
    }));
  },

  deselectService: (serviceId) => {
    set((state) => ({
      selectedServices: state.selectedServices.filter(s => s.id !== serviceId)
    }));
  },

  clearSelectedServices: () => {
    set({ selectedServices: [] });
  }
}));