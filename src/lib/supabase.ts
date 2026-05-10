/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Try to use Supabase env variables if they exist
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a singleton mock or active client
let supabaseClient: SupabaseClient | null = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    // Only attempt if it looks at least a little bit like a URL to avoid createClient throwing
    if (supabaseUrl.startsWith('http')) {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } else {
      console.warn('VITE_SUPABASE_URL must start with http or https');
    }
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
}

export const supabase = supabaseClient;

