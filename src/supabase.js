import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Mismo proyecto Supabase que la PWA: las cuentas y los datos son los mismos.
// La llave "anon" es pública por diseño; la seguridad la dan las reglas RLS.
const SUPABASE_URL = 'https://lxenslqgcmkonkhbvfhl.supabase.co';
const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4ZW5zbHFnY21rb25raGJ2ZmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MDcyMjQsImV4cCI6MjA5Njk4MzIyNH0.w062y4j9GPUdAGAIh8x8vXX6EYBTKknY0c5_MhyP5OI';

export const GEMINI_PROXY = 'https://axolofit.vercel.app/api/gemini';

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Renueva la sesión solo mientras la app está en pantalla.
AppState.addEventListener('change', (state) => {
  if (state === 'active') sb.auth.startAutoRefresh();
  else sb.auth.stopAutoRefresh();
});

export const hoyLocal = (d = new Date()) =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
