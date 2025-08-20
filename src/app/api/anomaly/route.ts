import { NextRequest, NextResponse } from 'next/server';
import {
  getAnomalyDashboardData,
  getRegionDistribution,
  getCategoryDistribution,
  getSegmentSummary,
  getTimeSeriesDaily,
  getRiskAlerts,
  getForecasts,
} from '@/lib/anomaly-data';
import { AnomalyFilters } from '@/types/anomaly';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filter parameters from URL
    const filters: AnomalyFilters = {};

    // Parse severity levels
    const severityLevelsParam = searchParams.get('severityLevels');
    if (severityLevelsParam) {
      try {
        filters.severityLevels = JSON.parse(severityLevelsParam);
      } catch {
        // Fallback to default if parsing fails
        filters.severityLevels = [1, 2, 3, 4, 5];
      }
    }

    // Parse regions
    const regionsParam = searchParams.get('regions');
    if (regionsParam) {
      try {
        filters.regions = JSON.parse(regionsParam);
      } catch {
        // Ignore if parsing fails
      }
    }

    // Parse date range
    const dateRangeParam = searchParams.get('dateRange');
    if (dateRangeParam) {
      try {
        filters.dateRange = JSON.parse(dateRangeParam);
      } catch {
        // Ignore if parsing fails
      }
    }

    // Parse minimum score
    const minScoreParam = searchParams.get('minScore');
    if (minScoreParam) {
      const minScore = parseFloat(minScoreParam);
      if (!isNaN(minScore)) {
        filters.minScore = minScore;
      }
    }

    // Parse minimum severity
    const minSeverityParam = searchParams.get('minSeverity');
    if (minSeverityParam) {
      const minSeverity = parseInt(minSeverityParam);
      if (!isNaN(minSeverity)) {
        filters.minSeverity = minSeverity;
      }
    }

    // Fetch main dashboard data
    const data = await getAnomalyDashboardData(filters);

    // Fetch additional data for complete dashboard
    const [regionDist, categoryDist, segmentSummary, tsData, alerts, forecasts] =
      await Promise.all([
        getRegionDistribution(filters),
        getCategoryDistribution(filters),
        getSegmentSummary(filters),
        getTimeSeriesDaily(30),
        getRiskAlerts(10),
        getForecasts(),
      ]);

    const result = {
      ...data,
      regionDistribution: regionDist,
      categoryDistribution: categoryDist,
      segmentSummary,
      timeSeriesData: tsData,
      riskAlerts: alerts,
      forecasts,
      appliedFilters: filters,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching anomaly data:', error);
    
    // Return fallback data structure
    const fallbackData = {
      anomalies: [],
      severityDistribution: [],
      featureContributions: [],
      kpis: {
        anomalyRate: 0,
        anomalyRateTrend: 0,
        highSeverityCount: 0,
        topAnomalousFeature: 'None',
        meanAnomalyScore: 0,
        meanAnomalyScoreTrend: 0,
        newAnomalies24h: 0,
      },
      regionDistribution: [],
      categoryDistribution: [],
      segmentSummary: [],
      timeSeriesData: [],
      riskAlerts: [],
      forecasts: { overview: [], perCustomer: [] },
      appliedFilters: {},
    };

    return NextResponse.json(fallbackData, { status: 500 });
  }
}
