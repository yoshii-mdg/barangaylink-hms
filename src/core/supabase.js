// src/core/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// No schema option — auth uses public/auth schemas
export const supabase = createClient(supabaseUrl, supabaseAnonKey);