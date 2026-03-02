/**
 * auditService.js
 * Writes to audit_logs_tbl.  
 * All authenticated users can INSERT (RLS policy: al_insert_authenticated).
 */
import { supabase } from '../core/supabase';

/**
 * Log an action to audit_logs_tbl.
 * Non-blocking — callers should not await this if they don't want to delay UX.
 *
 * @param {object} opts
 * @param {string} opts.actorId     - users_tbl.id of the performing user
 * @param {string} opts.action      - audit_action_enum value
 * @param {string} opts.targetTable - e.g. 'residents_tbl'
 * @param {string} [opts.targetId]  - PK of the affected row
 * @param {object} [opts.oldValues]
 * @param {object} [opts.newValues]
 * @param {string} [opts.description] - Human-readable summary
 */
export async function logAudit({
  actorId,
  action,
  targetTable,
  targetId,
  oldValues,
  newValues,
  description,
}) {
  try {
    await supabase.from('audit_logs_tbl').insert({
      actor_id: actorId ?? null,
      action,
      target_table: targetTable ?? null,
      target_id: targetId ?? null,
      old_values: oldValues ?? null,
      new_values: newValues ?? null,
      description: description ?? null,
    });
  } catch (err) {
    // Silently swallow — audit failures must not break user flows
    if (import.meta.env.DEV) {
      console.warn('[auditService] Failed to write audit log:', err);
    }
  }
}