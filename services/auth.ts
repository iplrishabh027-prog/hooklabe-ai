import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'An error occurred during sign up' };
  }
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'An error occurred during login' };
  }
};

export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch {
    return null;
  }
};

