// This file ensures environment variables are properly loaded
// and provides type safety for them

interface Env {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

// Extend the Window interface to include ENV
declare global {
  interface Window {
    __ENV__?: {
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
    };
  }
}

// Get environment variables with fallback to window.__ENV__ for production
export const env: Env = {
  VITE_SUPABASE_URL:
    import.meta.env.VITE_SUPABASE_URL ||
    (typeof window !== 'undefined' ? window.__ENV__?.VITE_SUPABASE_URL : '') ||
    '',
  VITE_SUPABASE_ANON_KEY:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    (typeof window !== 'undefined' ? window.__ENV__?.VITE_SUPABASE_ANON_KEY : '') ||
    '',
};

// Validate required environment variables
const missingVars = Object.entries(env).filter(([_, value]) => !value);

if (missingVars.length > 0 && typeof window !== 'undefined') {
  const errorMessage = `Missing required environment variables:\n${missingVars
    .map(([key]) => `- ${key}`)
    .join('\n')}`;

  console.error(errorMessage);

  // Only show error overlay in development
  if (import.meta.env.DEV) {
    const errorOverlay = document.createElement('div');
    errorOverlay.style.position = 'fixed';
    errorOverlay.style.top = '0';
    errorOverlay.style.left = '0';
    errorOverlay.style.right = '0';
    errorOverlay.style.padding = '1rem';
    errorOverlay.style.background = '#ef4444';
    errorOverlay.style.color = 'white';
    errorOverlay.style.zIndex = '9999';
    errorOverlay.style.fontFamily = 'monospace';
    errorOverlay.style.whiteSpace = 'pre';
    errorOverlay.style.overflowX = 'auto';
    errorOverlay.textContent = errorMessage;
    
    document.body.prepend(errorOverlay);
  }
}

export default env;
