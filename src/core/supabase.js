// src/core/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Client for regular user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for admin operations (requires service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);