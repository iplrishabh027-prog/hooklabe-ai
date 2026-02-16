import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Access environment variables directly for static replacement compatibility
const envUrl = process.env.SUPABASE_URL;
const envKey = process.env.SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient;

const isValidString = (str: any): str is string => typeof str === 'string' && str.trim().length > 0;

if (isValidString(envUrl) && isValidString(envKey)) {
  try {
    supabaseInstance = createClient(envUrl, envKey);
  } catch (e) {
    console.warn('Supabase client initialization failed, falling back to mock mode.', e);
    supabaseInstance = createMockClient();
  }
} else {
  console.warn('Supabase URL or Key missing or invalid. Authentication features are disabled.');
  supabaseInstance = createMockClient();
}

function createMockClient(): SupabaseClient {
  return {
    auth: {
      signUp: async () => ({ 
        data: { user: null, session: null }, 
        error: { message: 'Supabase credentials are not configured in environment variables.' } 
      }),
      signInWithPassword: async () => ({ 
        data: { user: null, session: null }, 
        error: { message: 'Supabase credentials are not configured in environment variables.' } 
      }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ 
        data: { subscription: { unsubscribe: () => {} } } 
      }),
    }
  } as unknown as SupabaseClient;
}

export const supabase = supabaseInstance;

