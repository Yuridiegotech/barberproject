import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Appointment, TimeSlot } from '../types';
import { format, addDays } from 'date-fns';

interface AppointmentState {
  appointments: Appointment[];
  availableSlots: TimeSlot[];
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  loading: boolean;
  error: string | null;
  
  fetchAppointments: () => Promise<void>;
  fetchUserAppointments: (userId: string) => Promise<void>;
  fetchAvailableSlots: (date: Date) => Promise<void>;
  createAppointment: (appointment: Partial<Appointment>, withAccount: boolean) => Promise<boolean>;
  cancelAppointment: (id: number) => Promise<void>;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTimeSlot: (slot: TimeSlot | null) => void;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  availableSlots: [],
  selectedDate: null,
  selectedTimeSlot: null,
  loading: false,
  error: null,

  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          appointment_services (
            service_id
          )
        `)
        .order('date');
      
      if (error) throw error;
      
      // Process and format the data
      const appointments: Appointment[] = await Promise.all((data || []).map(async (appointment) => {
        // For each appointment, get the services
        const serviceIds = appointment.appointment_services.map((as: any) => as.service_id);
        
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .in('id', serviceIds);
        
        if (servicesError) throw servicesError;
        
        return {
          id: appointment.id,
          userId: appointment.user_id,
          date: appointment.date,
          status: appointment.status,
          created_at: appointment.created_at,
          clientName: appointment.client_name,
          clientPhone: appointment.client_phone,
          services: servicesData || [],
        };
      }));
      
      set({ appointments });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserAppointments: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          appointment_services (
            service_id
          )
        `)
        .eq('user_id', userId)
        .order('date');
      
      if (error) throw error;
      
      // Process and format the data
      const appointments: Appointment[] = await Promise.all((data || []).map(async (appointment) => {
        // For each appointment, get the services
        const serviceIds = appointment.appointment_services.map((as: any) => as.service_id);
        
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .in('id', serviceIds);
        
        if (servicesError) throw servicesError;
        
        return {
          id: appointment.id,
          userId: appointment.user_id,
          date: appointment.date,
          status: appointment.status,
          created_at: appointment.created_at,
          clientName: appointment.client_name,
          clientPhone: appointment.client_phone,
          services: servicesData || [],
        };
      }));
      
      set({ appointments });
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchAvailableSlots: async (date: Date) => {
    set({ loading: true, error: null, selectedDate: date });
    
    try {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // 1. Get available slots for the day of the week
      const { data: availableSlotsData, error: availableSlotsError } = await supabase
        .from('available_slots')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);
      
      if (availableSlotsError) throw availableSlotsError;
      
      const formattedDate = format(date, 'yyyy-MM-dd');
      const nextDay = addDays(date, 1);
      const nextDayFormatted = format(nextDay, 'yyyy-MM-dd');
      
      // 2. Get booked appointments for the date using proper date range filtering
      const { data: bookedAppointments, error: bookedError } = await supabase
        .from('appointments')
        .select('date')
        .gte('date', `${formattedDate} 00:00:00`)
        .lt('date', `${nextDayFormatted} 00:00:00`)
        .neq('status', 'cancelled');
      
      if (bookedError) throw bookedError;
      
      // 3. Convert available slots to time slots
      const timeSlots: TimeSlot[] = (availableSlotsData || []).map(slot => {
        const startTime = slot.start_time;
        
        // Check if this time is already booked
        const isBooked = (bookedAppointments || []).some(
          app => format(new Date(app.date), 'HH:mm:ss') === startTime
        );
        
        return {
          id: `${formattedDate}-${startTime}`,
          date,
          time: startTime,
          available: !isBooked
        };
      });
      
      set({ availableSlots: timeSlots });
    } catch (error) {
      console.error('Error fetching available slots:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createAppointment: async (appointment, withAccount) => {
    set({ loading: true, error: null });
    
    try {
      const { selectedTimeSlot, selectedDate } = get();
      
      if (!selectedTimeSlot || !selectedDate) {
        throw new Error('No time slot selected');
      }
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      // Fixed: Remove the extra ":00" since selectedTimeSlot.time already includes seconds
      const dateTimeString = `${formattedDate} ${selectedTimeSlot.time}`;
      
      // 1. Create the appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: withAccount ? appointment.userId : null,
          date: dateTimeString,
          status: 'booked',
          client_name: appointment.clientName,
          client_phone: appointment.clientPhone,
        })
        .select();
      
      if (appointmentError) throw appointmentError;
      
      if (!appointmentData || appointmentData.length === 0) {
        throw new Error('Failed to create appointment');
      }
      
      const newAppointmentId = appointmentData[0].id;
      
      // 2. Add services to the appointment
      const serviceEntries = appointment.services?.map(service => ({
        appointment_id: newAppointmentId,
        service_id: service.id
      })) || [];
      
      if (serviceEntries.length > 0) {
        const { error: serviceError } = await supabase
          .from('appointment_services')
          .insert(serviceEntries);
        
        if (serviceError) throw serviceError;
      }
      
      // 3. If the user is logged in, update their rewards
      if (withAccount && appointment.userId) {
        const { data: rewardData, error: rewardError } = await supabase
          .from('rewards')
          .select('*')
          .eq('user_id', appointment.userId)
          .single();
        
        if (rewardError && rewardError.code !== 'PGRST116') throw rewardError;
        
        if (rewardData) {
          // Get reward settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('reward_settings')
            .select('*')
            .single();
          
          if (settingsError) throw settingsError;
          
          const newCount = rewardData.service_count + 1;
          const freeServiceAvailable = 
            newCount >= settingsData.services_for_reward || 
            rewardData.free_service_available;
          
          // Update rewards
          const { error: updateError } = await supabase
            .from('rewards')
            .update({
              service_count: freeServiceAvailable ? 0 : newCount,
              free_service_available: freeServiceAvailable,
            })
            .eq('user_id', appointment.userId);
          
          if (updateError) throw updateError;
        }
      }
      
      // 4. Refresh available slots
      if (selectedDate) {
        await get().fetchAvailableSlots(selectedDate);
      }
      
      return true;
    } catch (error) {
      console.error('Error creating appointment:', error);
      set({ error: (error as Error).message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  cancelAppointment: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        appointments: state.appointments.map(app => 
          app.id === id ? { ...app, status: 'cancelled' } : app
        )
      }));
    } catch (error) {
      console.error('Error canceling appointment:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date, selectedTimeSlot: null });
    if (date) {
      get().fetchAvailableSlots(date);
    }
  },

  setSelectedTimeSlot: (slot) => {
    set({ selectedTimeSlot: slot });
  }
}));