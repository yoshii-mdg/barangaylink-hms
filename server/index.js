/**
 * server/index.js — Production Express + Supabase backend
 *
 * Fixes & improvements applied:
 *  1. Added `express-rate-limit` to protect all API routes from abuse.
 *  2. Added `helmet` for standard security headers.
 *  3. CORS origin is validated strictly — no wildcard fallback in production.
 *  4. requireSuperAdmin now returns proper HTTP errors instead of leaking
 *     internal details.
 *  5. Role-change endpoint prevents assigning 'superadmin' via a normal role
 *     change — superadmin promotion requires an explicit separate endpoint
 *     to prevent privilege escalation via mass assignment.
 *  6. Input sanitization added to all body fields.
 *  7. Added /api/health endpoint for uptime monitoring.
 *  8. app.listen callback removed console.log (production builds should use
 *     a proper logger — swap for winston/pino as needed).
 *  9. All async route handlers are wrapped so unhandled promise rejections
 *     are caught and forwarded to the error middleware.
 * 10. Global error handler added at the bottom.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// ── Validate required env vars at startup ────────────────────────────────
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLIENT_ORIGIN, PORT } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[server] FATAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const CLIENT_ORIGIN_RESOLVED = CLIENT_ORIGIN || 'http://localhost:5173';

// ── App setup ────────────────────────────────────────────────────────────
const app = express();

// Security headers
app.use(helmet());

// Strict CORS — only allow the configured client origin
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin) only in development
      if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
      if (origin === CLIENT_ORIGIN_RESOLVED) return callback(null, true);
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '16kb' })); // Prevent large payload attacks

// ── Rate limiting ────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Stricter limiter for sensitive operations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

app.use('/api/', apiLimiter);
app.use('/api/admin/invite', authLimiter);

// ── Supabase admin client (service role — NEVER exposed to frontend) ─────
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ── Middleware: require authenticated superadmin ──────────────────────────
/**
 * Verifies the Bearer token from the Authorization header and ensures the
 * calling user has the 'superadmin' role in users_tbl.
 *
 * Attaches `req.adminUser` (Supabase user object) on success.
 */
async function requireSuperAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Validate the JWT with Supabase — this hits the auth server
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }

    // Check the role in our users_tbl (source of truth — not user_metadata)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users_tbl')
      .select('role, is_active')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (profile.role !== 'superadmin') {
      return res.status(403).json({ error: 'Superadmin access required.' });
    }

    if (!profile.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated.' });
    }

    req.adminUser = user;
    next();
  } catch (err) {
    next(err);
  }
}

// ── Utility: wrap async route handlers ───────────────────────────────────
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ── Health check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── List users ───────────────────────────────────────────────────────────
app.get(
  '/api/admin/users',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('users_tbl')
      .select('user_id, role, first_name, middle_name, last_name, is_active, invited_by, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch emails from auth.users (requires service role)
    const { data: { users: authUsers }, error: authError } =
      await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    if (authError) throw authError;

    const emailMap = new Map((authUsers ?? []).map((u) => [u.id, u.email]));

    res.json(
      (profiles ?? []).map((p) => ({ ...p, email: emailMap.get(p.user_id) ?? '' }))
    );
  })
);

// ── Invite staff ─────────────────────────────────────────────────────────
app.post(
  '/api/admin/invite',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const email = (req.body.email ?? '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: { role: 'staff', invited_by: req.adminUser.id },
        redirectTo: `${CLIENT_ORIGIN_RESOLVED}/accept-invitation`,
      }
    );

    if (inviteError) throw inviteError;

    if (data?.user?.id) {
      await supabaseAdmin.from('users_tbl').upsert(
        {
          user_id: data.user.id,
          role: 'staff',
          is_active: false,
          first_name: '',
          middle_name: null,
          last_name: '',
          invited_by: req.adminUser.id,
        },
        { onConflict: 'user_id' }
      );
    }

    res.json({ ok: true });
  })
);

// ── Change user role ──────────────────────────────────────────────────────
app.patch(
  '/api/admin/users/:userId/role',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const role = (req.body.role ?? '').trim();

    // Superadmin role can only be granted/revoked through a deliberate separate
    // flow — NOT through a generic role-change endpoint (prevents privilege
    // escalation via e.g. CSRF or compromised admin sessions).
    const allowedRoles = ['staff', 'resident'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Allowed values: ${allowedRoles.join(', ')}.`,
      });
    }

    // Prevent self-demotion
    if (userId === req.adminUser.id) {
      return res.status(400).json({ error: 'You cannot change your own role.' });
    }

    const { error } = await supabaseAdmin
      .from('users_tbl')
      .update({ role })
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ ok: true });
  })
);

// ── Deactivate user ───────────────────────────────────────────────────────
app.patch(
  '/api/admin/users/:userId/deactivate',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (userId === req.adminUser.id) {
      return res.status(400).json({ error: 'You cannot deactivate your own account.' });
    }

    const { error } = await supabaseAdmin
      .from('users_tbl')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (error) throw error;

    // Also revoke all active sessions for the deactivated user
    await supabaseAdmin.auth.admin.signOut(userId, 'others').catch(() => {
      // Non-fatal — best effort session revocation
    });

    res.json({ ok: true });
  })
);

// ── Reactivate user ───────────────────────────────────────────────────────
app.patch(
  '/api/admin/users/:userId/reactivate',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const { error } = await supabaseAdmin
      .from('users_tbl')
      .update({ is_active: true })
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ ok: true });
  })
);

// ── Activate invited user's own profile ──────────────────────────────────
/**
 * Called by AcceptInvitation AFTER updatePassword().
 * The invited user authenticates with their own (fresh) JWT — NO superadmin
 * check — they are activating their own account only.
 */
app.patch(
  '/api/admin/users/:userId/activate',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const authHeader = req.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Validate token and ensure it belongs to the userId in the URL
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }
    if (user.id !== userId) {
      return res.status(403).json({ error: 'You can only activate your own account.' });
    }

    // Validate and sanitize name fields
    const first_name = (req.body.first_name ?? '').trim();
    const middle_name = (req.body.middle_name ?? '').trim() || null;
    const last_name = (req.body.last_name ?? '').trim();

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required.' });
    }

    const { error } = await supabaseAdmin
      .from('users_tbl')
      .update({ is_active: true, first_name, middle_name, last_name })
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ ok: true });
  })
);

// ── Global error handler ──────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log internally but never expose raw error messages to clients in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('[server error]', err);
  }
  const status = err.status ?? err.statusCode ?? 500;
  res.status(status).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred.'
        : err.message ?? 'Internal server error',
  });
});

// ── Start ─────────────────────────────────────────────────────────────────
const port = parseInt(PORT || '5000', 10);
app.listen(port);