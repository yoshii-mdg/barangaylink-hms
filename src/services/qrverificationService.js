/**
 * Abstracted Supabase queries for verification_logs_tbl.
 * Uses the correct schema: residents_tbl column is `qr_code` (not `qr_code_data`).
 * `qr_code_data` belongs to eid_tbl.
 */
import { supabase } from '../core/supabase';

/**
 * Look up a resident by their qr_code value.
 * Returns full resident details needed for the Verification page display.
 * Maps DB columns to the shape expected by the UI (full_name, address, sex, etc.)
 */
export async function verifyQrCode(code, verifiedByUserId = null, scanMethod = 'manual') {
  // 1. Fetch resident
  const { data: resident, error } = await supabase
    .from('residents_tbl')
    .select(
      `id, first_name, middle_name, last_name, suffix,
       gender, birthdate, contact_number, status,
       house_no, street, barangay, city, province,
       purok_id, photo_url, is_archived`
    )
    .eq('qr_code', code)
    .eq('is_archived', false)
    .maybeSingle();

  if (error) throw error;

  const isValid = !!resident && resident.status === 'Active';

  // 2. Log the verification attempt (non-blocking — best-effort)
  try {
    await supabase.from('verification_logs_tbl').insert({
      resident_id: resident?.id ?? null,
      scanned_code: code,
      scan_method: scanMethod,
      verified_by: verifiedByUserId,
      is_valid: isValid,
      failure_reason: !resident
        ? 'No resident found for this QR code'
        : !isValid
        ? `Resident status is ${resident.status}`
        : null,
    });
  } catch {
    // Silently ignore log insertion failures; don't block UX
  }

  if (!resident) return null;

  // 3. Map DB columns → UI shape
  const fullName = [
    resident.last_name,
    resident.first_name,
    resident.middle_name,
    resident.suffix,
  ]
    .filter(Boolean)
    .join(', ');

  const address = [
    resident.house_no,
    resident.street,
    resident.barangay,
    resident.city,
    resident.province,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    id: resident.id,
    full_name: fullName,
    address,
    contact_number: resident.contact_number ?? '—',
    birthdate: resident.birthdate
      ? new Date(resident.birthdate).toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '—',
    sex: resident.gender ?? '—',
    status: resident.status,
    photo_url: resident.photo_url ?? null,
  };
}

/**
 * Fetch recent verification history for the sidebar.
 */
export async function fetchVerificationHistory(limit = 10) {
  const { data, error } = await supabase
    .from('verification_logs_tbl')
    .select(
      `id, scanned_code, scan_method, is_valid, failure_reason, created_at,
       residents_tbl ( first_name, middle_name, last_name, suffix, status )`
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((log) => {
    const r = log.residents_tbl;
    const name = r
      ? [r.last_name, r.first_name, r.middle_name, r.suffix].filter(Boolean).join(', ')
      : log.scanned_code;
    return {
      id: log.id,
      name,
      status: r?.status ?? (log.is_valid ? 'Active' : 'Unknown'),
      time: new Date(log.created_at).toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isValid: log.is_valid,
    };
  });
}