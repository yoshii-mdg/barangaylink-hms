/**
 * supabase.js — Supabase client initialization
 *
 * ROOT CAUSE OF 500 ERROR:
 * When VITE_SUPABASE_ANON_KEY is missing or empty, the previous code fell back
 * to 'placeholder-anon-key'. Supabase-js dutifully sends that string as the
 * `apikey` header. Supabase's gateway doesn't recognize it and responds with:
 *   {"message":"No API key found in request"}  →  HTTP 500
 *
 * FIX: Throw immediately with a clear developer-facing error. This fails fast
 * during development instead of producing a cryptic 500 in production.
 *
 * HOW TO FIX THE ROOT CAUSE:
 * 1. Create a file named exactly `.env` in your project ROOT (next to package.json)
 * 2. Add these two lines (get values from Supabase Dashboard → Settings → API):
 *
 *      VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
 *      VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * 3. Restart the Vite dev server (Ctrl+C then `npm run dev`)
 *    Vite ONLY reads .env on startup — changes require a restart.
 *
 * COMMON MISTAKES:
 * ❌  .env.local instead of .env  (Vite reads both but order matters)
 * ❌  SUPABASE_URL without VITE_ prefix  (Vite strips non-VITE_ vars from client)
 * ❌  Spaces around = sign:  VITE_SUPABASE_URL = https://...  (invalid)
 * ❌  Quotes around the value:  VITE_SUPABASE_ANON_KEY="eyJ..."  (include the quotes literally — don't)
 * ❌  .env in src/ folder instead of project root
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── Validate env vars before creating the client ──────────────────────────────
// Using a placeholder key causes a cryptic HTTP 500 "No API key found" error.
// Throwing here gives a clear error in the browser console immediately.

const missing = [];
if (!supabaseUrl)     missing.push('VITE_SUPABASE_URL');
if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');

if (missing.length > 0) {
  throw new Error(
    `[BarangayLink] Missing required environment variable(s): ${missing.join(', ')}\n\n` +
    'Create a .env file in the project root (next to package.json) with:\n\n' +
    '  VITE_SUPABASE_URL=https://xxxx.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=eyJhbGciOi...\n\n' +
    'Then restart the dev server: Ctrl+C → npm run dev\n\n' +
    'Get these values from: Supabase Dashboard → Your Project → Settings → API'
  );
}

// ── Validate URL format ───────────────────────────────────────────────────────
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error(
    `[BarangayLink] VITE_SUPABASE_URL looks invalid: "${supabaseUrl}"\n` +
    'Expected format: https://xxxxxxxxxxxxxxxxxxxx.supabase.co'
  );
}

// ── Validate anon key format (JWT starts with "eyJ") ─────────────────────────
if (!supabaseAnonKey.startsWith('eyJ')) {
  throw new Error(
    `[BarangayLink] VITE_SUPABASE_ANON_KEY looks invalid — it should start with "eyJ"\n` +
    'Make sure you copied the "anon public" key from Supabase Dashboard → Settings → API.\n' +
    'Do NOT use the service_role key here.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage so users stay logged in across page refreshes
    persistSession: true,
    // Auto-refresh the JWT before it expires
    autoRefreshToken: true,
    // Detect auth tokens in URL (needed for magic links, password reset)
    detectSessionInUrl: true,
  },
});