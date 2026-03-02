import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function request(method, path, body) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Request failed: ${res.status}`);
  return json;
}

// ── Admin API calls ──────────────────────────────────────────────────────────

export const adminApi = {
  /** Fetch all users with emails merged in */
  listUsers: () => request('GET', '/api/admin/users'),

  /** Invite a staff member by email */
  inviteStaff: (email) => request('POST', '/api/admin/invite', { email }),

  /** Change a user's role */
  changeRole: (userId, role) => request('PATCH', `/api/admin/users/${userId}/role`, { role }),

  /** Deactivate a user */
  deactivateUser: (userId) => request('PATCH', `/api/admin/users/${userId}/deactivate`),

  /** Reactivate a user */
  reactivateUser: (userId) => request('PATCH', `/api/admin/users/${userId}/reactivate`),

  /**
   * Activate own profile after accepting invitation.
   * Called by the invited user themselves — no superadmin check.
   * Optionally pass name fields to update the profile row at the same time.
   */
  activateProfile: (userId, nameData) =>
    request('PATCH', `/api/admin/users/${userId}/activate`, nameData ?? {}),
};