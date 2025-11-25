import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from '@/lib/mockSupabaseClient';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enable mock mode during development
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let supabase: any;

if (USE_MOCK) {
  console.warn('🔧 Using MOCK DATABASE - No real data will be saved!');
  supabase = mockSupabase;
} else if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration! Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  console.warn('🔧 Falling back to MOCK DATABASE');
  supabase = mockSupabase;
} else {
  console.log('✅ Using REAL Supabase database');
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export { supabase };
