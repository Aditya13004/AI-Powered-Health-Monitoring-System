// src/lib/supabase.js
// Supabase client initialization for HealthSync
// Uses environment variables for security

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase environment variables not configured. ' +
    'Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'The app will run with simulated demo data.'
  );
}

// Create Supabase client — safe to call even with placeholder values
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Flag to check if Supabase is properly configured
export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder');

export default supabase;
