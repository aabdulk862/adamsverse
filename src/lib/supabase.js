import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  )
}

// If user explicitly signed out, clear Supabase session tokens
// BEFORE createClient reads them from localStorage
const SIGNED_OUT_KEY = 'adverse-signed-out'
if (localStorage.getItem(SIGNED_OUT_KEY)) {
  localStorage.removeItem(SIGNED_OUT_KEY)
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && key.startsWith('sb-')) {
      localStorage.removeItem(key)
    }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
