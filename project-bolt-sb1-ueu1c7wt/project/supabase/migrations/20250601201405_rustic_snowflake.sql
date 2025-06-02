-- This SQL script creates the schema for the barbershop application

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users (id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  client_name TEXT,
  client_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointment_services junction table
CREATE TABLE IF NOT EXISTS appointment_services (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES appointments (id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services (id) ON DELETE CASCADE
);

-- Create available_slots table for managing available times
CREATE TABLE IF NOT EXISTS available_slots (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  service_count INTEGER NOT NULL DEFAULT 0,
  free_service_available BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reward_settings table
CREATE TABLE IF NOT EXISTS reward_settings (
  id SERIAL PRIMARY KEY,
  services_for_reward INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sample data for services
INSERT INTO services (name, price, description, duration) VALUES
('Corte de Cabelo', 35.00, 'Corte masculino completo com máquina e tesoura', 30),
('Barba', 25.00, 'Modelagem completa da barba com navalha e produtos especiais', 20),
('Corte + Barba', 55.00, 'Combo de corte masculino completo e modelagem de barba', 50),
('Pezinho', 15.00, 'Acabamento na nuca e laterais', 10),
('Sobrancelha', 10.00, 'Design e acabamento das sobrancelhas', 10);

-- Create sample data for available slots
INSERT INTO available_slots (day_of_week, start_time, end_time, is_available) VALUES
(1, '09:00', '10:00', true),
(1, '10:00', '11:00', true),
(1, '11:00', '12:00', true),
(1, '14:00', '15:00', true),
(1, '15:00', '16:00', true),
(1, '16:00', '17:00', true),
(1, '17:00', '18:00', true),
(2, '09:00', '10:00', true),
(2, '10:00', '11:00', true),
(2, '11:00', '12:00', true),
(2, '14:00', '15:00', true),
(2, '15:00', '16:00', true),
(2, '16:00', '17:00', true),
(2, '17:00', '18:00', true),
(3, '09:00', '10:00', true),
(3, '10:00', '11:00', true),
(3, '11:00', '12:00', true),
(3, '14:00', '15:00', true),
(3, '15:00', '16:00', true),
(3, '16:00', '17:00', true),
(3, '17:00', '18:00', true),
(4, '09:00', '10:00', true),
(4, '10:00', '11:00', true),
(4, '11:00', '12:00', true),
(4, '14:00', '15:00', true),
(4, '15:00', '16:00', true),
(4, '16:00', '17:00', true),
(4, '17:00', '18:00', true),
(5, '09:00', '10:00', true),
(5, '10:00', '11:00', true),
(5, '11:00', '12:00', true),
(5, '14:00', '15:00', true),
(5, '15:00', '16:00', true),
(5, '16:00', '17:00', true),
(5, '17:00', '18:00', true),
(6, '09:00', '10:00', true),
(6, '10:00', '11:00', true),
(6, '11:00', '12:00', true),
(6, '14:00', '15:00', true),
(6, '15:00', '16:00', true),
(6, '16:00', '17:00', true);

-- Create reward settings
INSERT INTO reward_settings (services_for_reward) VALUES (5);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: allow users to read their own profile, admins can read all
CREATE POLICY profiles_select_policy ON profiles 
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Profiles: allow users to update their own profile
CREATE POLICY profiles_update_policy ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Services: anyone can read services
CREATE POLICY services_select_policy ON services 
  FOR SELECT USING (true);

-- Services: only admins can modify
CREATE POLICY services_insert_policy ON services 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY services_update_policy ON services 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY services_delete_policy ON services 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Appointments: users can read their own appointments, admins can read all
CREATE POLICY appointments_select_policy ON appointments 
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Appointments: anyone can insert (for guest booking)
CREATE POLICY appointments_insert_policy ON appointments 
  FOR INSERT WITH CHECK (true);

-- Appointments: users can update their own, admins can update all
CREATE POLICY appointments_update_policy ON appointments 
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Appointment services: same rules as appointments
CREATE POLICY appointment_services_select_policy ON appointment_services 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = appointment_services.appointment_id AND 
      (appointments.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );

-- Appointment services: anyone can insert (for guest booking)
CREATE POLICY appointment_services_insert_policy ON appointment_services 
  FOR INSERT WITH CHECK (true);

-- Available slots: anyone can read
CREATE POLICY available_slots_select_policy ON available_slots 
  FOR SELECT USING (true);

-- Available slots: only admins can modify
CREATE POLICY available_slots_insert_policy ON available_slots 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY available_slots_update_policy ON available_slots 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY available_slots_delete_policy ON available_slots 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Rewards: users can read their own, admins can read all
CREATE POLICY rewards_select_policy ON rewards 
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Rewards: only admins can modify
CREATE POLICY rewards_insert_policy ON rewards 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY rewards_update_policy ON rewards 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Reward settings: anyone can read
CREATE POLICY reward_settings_select_policy ON reward_settings 
  FOR SELECT USING (true);

-- Reward settings: only admins can modify
CREATE POLICY reward_settings_update_policy ON reward_settings 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );