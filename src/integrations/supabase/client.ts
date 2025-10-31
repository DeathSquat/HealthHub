import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Hardcoded Supabase configuration
const SUPABASE_URL = 'https://askyhriemixsuaagfgw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFza3locmllbWlzeHVhb2FnZmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTcyMDQsImV4cCI6MjA3NzM3MzIwNH0.wh1Iq2DqcOYTiiSxWezCldtf0Ax6OFJCHaD_CxxoNQA';

console.log('Initializing Supabase client with hardcoded configuration');

// Clean up any old Supabase auth keys from previous projects
try {
  const projectId = new URL(SUPABASE_URL).hostname.split('.')[0];
  const keysToRemove = [];
  
  // First, collect all keys to remove
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
      if (!key.includes(projectId)) {
        keysToRemove.push(key);
      }
    }
  }
  
  // Then remove them
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  if (keysToRemove.length > 0) {
    console.log(`Cleaned up ${keysToRemove.length} old auth keys`);
  }
} catch (error) {
  console.warn('Error cleaning up auth keys:', error);
}

// Initialize Supabase client
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY
    }
  }
});

// Test the connection
(async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Supabase auth check warning:', error.message);
    } else {
      console.log('Supabase connected successfully', 
        session ? 'with existing session' : '(no active session)');
    }
  } catch (error) {
    console.warn('Supabase connection test warning:', error);
  }
})();

export { supabase };