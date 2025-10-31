import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug environment variables
console.log('Environment Variables Debug:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '***' : 'MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '***' : 'MISSING');
console.log('Available Vite Env Vars:', 
  Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
);

// Check if we're in development mode
if (import.meta.env.DEV) {
  console.log('Running in development mode');
  console.log('Environment variables should be loaded from .env file');
}

createRoot(document.getElementById("root")!).render(<App />);
