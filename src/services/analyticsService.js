/**
 * analyticsService.js
 *
 * FIX: fetchAnalyticsSummary used `.single()` which throws HTTP 406 when
 * the view returns 0 rows (e.g. empty database during development / testing).
 * Changed to `.maybeSingle()` which returns { data: null } instead — this
 * prevents the dashboard from crashing when there's no data yet.
 *
 * Callers should handle `data === null` and render appropriate empty states.
 */
import { supabase } from '../core/supabase';

// ─── Summary Cards ────────────────────────────────────────────────────────────

export async function fetchAnalyticsSummary() {
  const { data, error } = await supabase
    .from('v_analytics_summary')
    .select('*')
    .maybeSingle(); // FIX: was .single() — throws 406 on empty view

  if (error) throw error;
  return data; // null if view returns no rows — callers must handle this
}

// ─── Demographic ──────────────────────────────────────────────────────────────

export async function fetchPopulationByAgeGroup() {
  const { data, error } = await supabase
    .from('v_population_by_age_group')
    .select('age_group, count');

  if (error) throw error;
  return data ?? [];
}

export async function fetchGenderDistribution() {
  const { data, error } = await supabase
    .from('v_gender_distribution')
    .select('gender, count, percentage');

  if (error) throw error;
  return data ?? [];
}

// ─── Household ────────────────────────────────────────────────────────────────

export async function fetchHouseholdsPerPurok() {
  const { data, error } = await supabase
    .from('v_households_per_purok')
    .select('purok_name, household_count, resident_count');

  if (error) throw error;
  return data ?? [];
}

// ─── Resident Trends ─────────────────────────────────────────────────────────

export async function fetchActiveVsInactive() {
  const { data, error } = await supabase
    .from('v_active_vs_inactive')
    .select('status, count');

  if (error) throw error;
  return data ?? [];
}

export async function fetchNewResidentsPerYear() {
  const { data, error } = await supabase
    .from('v_new_residents_per_year')
    .select('year, count');

  if (error) throw error;
  return data ?? [];
}

export async function fetchResidentsTransferredOut() {
  const { data, error } = await supabase
    .from('v_residents_transferred_out')
    .select('year, count');

  if (error) throw error;
  return data ?? [];
}

export async function fetchPopulationGrowth() {
  const { data, error } = await supabase
    .from('v_population_growth')
    .select('year, new_residents, cumulative_total');

  if (error) throw error;
  return data ?? [];
}

// ─── eID Renewals ─────────────────────────────────────────────────────────────

export async function fetchEidRenewalStats() {
  const { data, error } = await supabase
    .from('v_eid_renewal_stats')
    .select('month, renewals');

  if (error) throw error;
  return data ?? [];
}