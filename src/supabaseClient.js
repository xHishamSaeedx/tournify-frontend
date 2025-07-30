import { createClient } from '@supabase/supabase-js';

// Use the VITE_ env variables defined in your .env file
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;
