/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Try to use Supabase env variables if they exist
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : '') || 
  '';
const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : '') || 
  '';

// Create a singleton mock or active client
let supabaseClient: SupabaseClient | null = null;

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return url.startsWith('http');
  } catch {
    return false;
  }
};

try {
  if (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)) {
    console.log('Initializing Supabase client with URL:', supabaseUrl);
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true
      }
    });
  } else {
    console.warn('Supabase configuration missing. Check environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
    if (!supabaseUrl) console.warn('VITE_SUPABASE_URL is empty');
    if (!supabaseAnonKey) console.warn('VITE_SUPABASE_ANON_KEY is empty');
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
}

export const supabase = supabaseClient;

