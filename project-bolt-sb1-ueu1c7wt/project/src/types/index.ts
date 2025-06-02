export type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: 'client' | 'admin';
};

export type Service = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  duration: number;
  created_at: string;
};

export type Appointment = {
  id: number;
  userId?: string | null;
  date: string;
  status: 'booked' | 'completed' | 'cancelled';
  created_at: string;
  clientName: string | null;
  clientPhone: string | null;
  services: Service[];
};

export type AvailableSlot = {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export type TimeSlot = {
  id: string;
  date: Date;
  time: string;
  available: boolean;
};

export type Reward = {
  id: number;
  userId: string;
  serviceCount: number;
  freeServiceAvailable: boolean;
  updatedAt: string;
};

export type RewardSettings = {
  id: number;
  servicesForReward: number;
  updatedAt: string;
};