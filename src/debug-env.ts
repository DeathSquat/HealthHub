// Debug script to check environment variables
console.log('Environment Variables Debug:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '***' : 'MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '***' : 'MISSING');
console.log('Import Meta Env:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
