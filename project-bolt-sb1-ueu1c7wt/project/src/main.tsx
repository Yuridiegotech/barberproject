import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize the admin user for the application
import { supabase } from './lib/supabase';

async function initializeAdminUser() {
  try {
    const adminEmail = 'yuridiego17@gmail.com';
    const adminPassword = 'yuri1234';

    // First try to sign in as admin
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    let userId: string | undefined;

    // If sign in fails because user doesn't exist, create the user
    if (signInError && signInError.message === 'Invalid login credentials') {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            role: 'admin'
          }
        }
      });

      if (signUpError) {
        console.error('Error creating admin user:', signUpError);
        return;
      }

      userId = signUpData.user?.id;
    } else if (signInError) {
      console.error('Error signing in as admin:', signInError);
      return;
    } else {
      userId = signInData.user?.id;
    }

    if (userId) {
      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        console.error('Error checking admin profile:', profileCheckError);
        return;
      }

      // Create profile if it doesn't exist
      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: adminEmail,
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
          });

        if (profileError) {
          console.error('Error creating admin profile:', profileError);
          return;
        }
      }

      // Initialize reward settings if they don't exist
      const { data: existingSettings, error: settingsError } = await supabase
        .from('reward_settings')
        .select('*')
        .maybeSingle();

      if (settingsError) {
        console.error('Error checking reward settings:', settingsError);
        return;
      }

      if (!existingSettings) {
        const { error: createSettingsError } = await supabase
          .from('reward_settings')
          .insert({
            services_for_reward: 5,
          });

        if (createSettingsError) {
          console.error('Error creating reward settings:', createSettingsError);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}

// Call the initialization function
initializeAdminUser();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);