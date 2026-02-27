import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Service role client — stays on the server, never sent to the browser
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Auth middleware ──────────────────────────────────────────────────────────
async function requireSuperAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile } = await supabaseAdmin
    .from('users_tbl')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profile?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden: superadmin only' });
  }

  req.adminUser = user;
  next();
}

// ── Routes ───────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => res.send('Backend running'));

// List all users (profiles + emails merged)
app.get('/api/admin/users', requireSuperAdmin, async (_req, res) => {
  try {
    const [{ data: profiles, error: profileError }, { data: authData, error: authError }] =
      await Promise.all([
        supabaseAdmin
          .from('users_tbl')
          .select('user_id, first_name, middle_name, last_name, role, is_active, invited_by')
          .order('last_name', { ascending: true }),
        supabaseAdmin.auth.admin.listUsers(),
      ]);

    if (profileError) throw profileError;
    if (authError) throw authError;

    const emailMap = Object.fromEntries(
      (authData?.users ?? []).map((u) => [u.id, u.email])
    );

    res.json(
      (profiles ?? []).map((p) => ({ ...p, email: emailMap[p.user_id] ?? '' }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Invite a staff member by email
app.post('/api/admin/invite', requireSuperAdmin, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  try {
    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role: 'staff', invited_by: req.adminUser.id },
      redirectTo: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/accept-invitation`,
    });
    if (inviteError) throw inviteError;

    if (data?.user?.id) {
      await supabaseAdmin
        .from('users_tbl')
        .upsert(
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change a user's role
app.patch('/api/admin/users/:userId/role', requireSuperAdmin, async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const validRoles = ['superadmin', 'staff', 'resident'];

  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

  try {
    const { error } = await supabaseAdmin
      .from('users_tbl')
      .update({ role })
      .eq('user_id', userId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deactivate a user
app.patch('/api/admin/users/:userId/deactivate', requireSuperAdmin, async (req, res) => {
  const { userId } = req.params;
  try {
    const { error } = await supabaseAdmin
      .from('users_tbl')
      .update({ is_active: false })
      .eq('user_id', userId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reactivate a user
app.patch('/api/admin/users/:userId/reactivate', requireSuperAdmin, async (req, res) => {
  const { userId } = req.params;
  try {
    const { error } = await supabaseAdmin
      .from('users_tbl')
      .update({ is_active: true })
      .eq('user_id', userId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Activate a user profile — called by an invited staff member after
 * they set their password. Optionally accepts name fields so the profile
 * is fully populated in a single request.
 *
 * No superadmin check — the invited user calls this themselves using
 * their own session token. We verify the token matches the userId.
 */
app.patch('/api/admin/users/:userId/activate', async (req, res) => {
  const { userId } = req.params;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || user?.id !== userId) return res.status(401).json({ error: 'Unauthorized' });

  const { first_name, middle_name, last_name } = req.body ?? {};

  try {
    const updatePayload = { is_active: true };
    if (first_name !== undefined) updatePayload.first_name = first_name;
    if (middle_name !== undefined) updatePayload.middle_name = middle_name;
    if (last_name !== undefined) updatePayload.last_name = last_name;

    const { error } = await supabaseAdmin
      .from('users_tbl')
      .update(updatePayload)
      .eq('user_id', userId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));