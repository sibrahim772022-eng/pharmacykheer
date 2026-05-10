/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Try to use Supabase env variables if they exist
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
    console.warn('Supabase configuration missing or invalid. Check your environment variables.');
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
}

export const supabase = supabaseClient;

