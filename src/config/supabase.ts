import { createClient } from '@supabase/supabase-js';

// Direct IP configuration to bypass DNS resolution
// Using direct URL with correct domain
const SUPABASE_URL = 'https://askyhriemisxuaoagfgw.supabase.co';

// Add the host header to make the request work with the IP
const SUPABASE_HEADERS = {
  'Host': 'askyhriemisxuaoagfgw.supabase.co',
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFza3locmllbWlzeHVhb2FnZmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTcyMDQsImV4cCI6MjA3NzM3MzIwNH0.wh1Iq2DqcOYTiiSxWezCldtf0Ax6OFJCHaD_CxxoNQA',
  'Content-Type': 'application/json'
};

console.log('Initializing Supabase client with direct IP connection...');

// Create a custom fetch implementation
const customFetch = (url: string, options: any = {}) => {
  // Replace the hostname with IP but keep the path
  const urlObj = new URL(url);
  const path = urlObj.pathname + urlObj.search;
  const ipUrl = `https://${SUPABASE_URL}${path}`;
  
  // Add required headers
  const headers = {
    ...SUPABASE_HEADERS,
    ...options.headers
  };

  return fetch(ipUrl, {
    ...options,
    headers
  });
};

// Create the Supabase client with the custom fetch
const supabase = createClient(
  SUPABASE_URL,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFza3locmllbWlzeHVhb2FnZmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTcyMDQsImV4cCI6MjA3NzM3MzIwNH0.wh1Iq2DqcOYTiiSxWezCldtf0Ax6OFJCHaD_CxxoNQA',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    },
    global: {
      fetch: customFetch,
      headers: SUPABASE_HEADERS
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('✅ Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    // Additional diagnostic information
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Try accessing this URL in your browser: https://askyhriemixsuaagfgw.supabase.co');
    console.log('3. If using a VPN, try disabling it');
    console.log('4. Check if the Supabase service is up at https://status.supabase.com/');
    
    return false;
  }
};

export { supabase, testConnection };
