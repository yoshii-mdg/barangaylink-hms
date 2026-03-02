import { useState, useEffect, useCallback } from 'react';
import {
  fetchAnalyticsSummary,
  fetchPopulationByAgeGroup,
  fetchGenderDistribution,
  fetchHouseholdsPerPurok,
  fetchActiveVsInactive,
  fetchNewResidentsPerYear,
  fetchResidentsTransferredOut,
  fetchPopulationGrowth,
  fetchEidRenewalStats,
} from '../services/analyticsService';

export function useAnalytics() {
  const [data, setData] = useState({
    summary: null,
    populationByAge: [],
    genderDistribution: [],
    householdsPerPurok: [],
    activeVsInactive: [],
    newResidentsPerYear: [],
    residentsTransferredOut: [],
    populationGrowth: [],
    eidRenewalStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        summary,
        populationByAge,
        genderDistribution,
        householdsPerPurok,
        activeVsInactive,
        newResidentsPerYear,
        residentsTransferredOut,
        populationGrowth,
        eidRenewalStats,
      ] = await Promise.all([
        fetchAnalyticsSummary().catch(() => null),
        fetchPopulationByAgeGroup().catch(() => []),
        fetchGenderDistribution().catch(() => []),
        fetchHouseholdsPerPurok().catch(() => []),
        fetchActiveVsInactive().catch(() => []),
        fetchNewResidentsPerYear().catch(() => []),
        fetchResidentsTransferredOut().catch(() => []),
        fetchPopulationGrowth().catch(() => []),
        fetchEidRenewalStats().catch(() => []),
      ]);

      setData({
        summary,
        populationByAge,
        genderDistribution,
        householdsPerPurok,
        activeVsInactive,
        newResidentsPerYear,
        residentsTransferredOut,
        populationGrowth,
        eidRenewalStats,
      });
    } catch (err) {
      setError(err.message ?? 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}