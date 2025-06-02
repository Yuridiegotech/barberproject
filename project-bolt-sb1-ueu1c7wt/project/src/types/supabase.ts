export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: number
          name: string
          price: number
          description: string | null
          duration: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          price: number
          description?: string | null
          duration: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          price?: number
          description?: string | null
          duration?: number
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: number
          user_id: string | null
          date: string
          status: string
          created_at: string
          client_name: string | null
          client_phone: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          date: string
          status?: string
          created_at?: string
          client_name?: string | null
          client_phone?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          date?: string
          status?: string
          created_at?: string
          client_name?: string | null
          client_phone?: string | null
        }
      }
      appointment_services: {
        Row: {
          id: number
          appointment_id: number
          service_id: number
        }
        Insert: {
          id?: number
          appointment_id: number
          service_id: number
        }
        Update: {
          id?: number
          appointment_id?: number
          service_id?: number
        }
      }
      available_slots: {
        Row: {
          id: number
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean
        }
        Insert: {
          id?: number
          day_of_week: number
          start_time: string
          end_time: string
          is_available?: boolean
        }
        Update: {
          id?: number
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_available?: boolean
        }
      }
      rewards: {
        Row: {
          id: number
          user_id: string
          service_count: number
          free_service_available: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          service_count?: number
          free_service_available?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          service_count?: number
          free_service_available?: boolean
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
        }
      }
      reward_settings: {
        Row: {
          id: number
          services_for_reward: number
          updated_at: string
        }
        Insert: {
          id?: number
          services_for_reward: number
          updated_at?: string
        }
        Update: {
          id?: number
          services_for_reward?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}