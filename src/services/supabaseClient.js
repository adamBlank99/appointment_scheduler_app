import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

// Keeps Guest Demo available before local Supabase variables are configured.
export const supabase = createClient(
  supabaseUrl || "http://127.0.0.1:54321",
  supabaseKey || "public-key-not-configured",
)
