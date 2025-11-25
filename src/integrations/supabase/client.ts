import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from '@/lib/mockSupabaseClient';
import type { Database } from './types';

// Log environment variable loading
console.log('🔍 Loading Supabase configuration...');
console.log('Environment variables found:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✅ Present' : '❌ Missing',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing',
  VITE_USE_MOCK: import.meta.env.VITE_USE_MOCK,
  VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enable mock mode during development
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let supabase: any;

if (USE_MOCK) {
  console.warn('🔧 Using MOCK DATABASE - No real data will be saved!');
  supabase = mockSupabase;
} else if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'MISSING');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present but hidden' : 'MISSING');
  console.error('\n💡 Fix: Make sure your .env file has:');
  console.error('VITE_SUPABASE_URL="https://acuenaeeyrziajdbutpy.supabase.co"');
  console.error('VITE_SUPABASE_ANON_KEY="your-anon-key-here"');
  console.error('\n⚠️  IMPORTANT: Restart your dev server after changing .env!');
  console.warn('🔧 Falling back to MOCK DATABASE');
  supabase = mockSupabase;
} else {
  console.log('✅ Using REAL Supabase database');
  console.log('📡 Connecting to:', supabaseUrl);
  console.log('🔑 API Key:', supabaseAnonKey.substring(0, 20) + '...');
  
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'apikey': supabaseAnonKey,
        },
      },
    });
    console.log('✅ Supabase client created successfully');
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
    console.warn('🔧 Falling back to MOCK DATABASE');
    supabase = mockSupabase;
  }
}

export { supabase };
