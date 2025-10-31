import { supabase as supabaseClient } from '@/config/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';

// Re-export the supabase client
export const supabase = supabaseClient;

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

// Log the Supabase client for debugging
console.log('Supabase client initialized:', !!supabase);

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: email.split('@')[0]
          }
        }
      });

      return {
        user: data.user,
        session: data.session,
        error: error
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return {
        user: null,
        session: null,
        error: error.message || 'Failed to sign up'
      };
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return {
        user: data.user,
        session: data.session,
        error: error
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        user: null,
        session: null,
        error: error.message || 'Failed to sign in'
      };
    }
  },

  // Sign out
  async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  // Handle password reset
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      return { error };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { error };
    }
  }
};
