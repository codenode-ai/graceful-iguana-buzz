import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL and Anon Key are not defined in .env file. The app will run with mock data, but Supabase features will not work.")
}

// The client will be null if the keys are not provided, preventing errors.
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'sociometria'
  }
}) : null