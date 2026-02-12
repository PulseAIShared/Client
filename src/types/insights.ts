// Active Insights contracts used by the redesigned Insights page.

export type InsightsRiskBucketCode = 'Minimal' | 'Low' | 'Medium' | 'High' | 'Critical';

export type InsightsPaymentHealthCode =
  | 'Healthy'
  | 'Watch'
  | 'AtRisk'
  | 'PastDue'
  | 'Failed'
  | 'Cancelled'
  | 'Unknown';

export type InsightsRangeFilter = '7d' | '30d' | '90d' | '12m' | 'custom';

export interface InsightsQueryFilters {
  from?: string;
  to?: string;
  range?: InsightsRangeFilter;
  riskBucket?: InsightsRiskBucketCode | 'minimal' | 'low' | 'medium' | 'high' | 'critical';
  planTier?: string;
  lifecycleStage?: string;
  acquisitionChannel?: string;
  companySize?: string;
  geo?: string;
  paymentStatus?: string;
}

// ==========================================
// Overview Response - GET /insights/overview
// ==========================================
export interface InsightsOverviewResponse {
  timestamp: string;
  kpis: OverviewCommandCenterKpis;
  riskDistribution: RiskDistributionItem[];
  churnTrend: ChurnTrendPoint[];
  topAtRiskCustomers: OverviewAtRiskCustomer[];
  dataAvailability: OverviewDataAvailability;
  emptyStateHints: OverviewEmptyStateHint[];
}

export interface OverviewCommandCenterKpis {
  mrrAtRisk: number;
  customersAtRisk: number;
  customersAtRiskPercent: number;
  predictedChurn30d: number;
  currentChurnRate: number;
  riskTrendChangePercent: number;
  riskTrendDirection: 'up' | 'down' | 'stable';
  riskTrendSparkline: number[];
}

export interface OverviewAtRiskCustomer {
  customerId: string;
  customerName: string;
  accountName?: string | null;
  riskScore: number;
  riskBucket: InsightsRiskBucketCode;
  riskBucketLabel: string;
  primaryDriver: string;
  lastActivityAt?: string | null;
  paymentHealth: InsightsPaymentHealthCode;
  paymentHealthLabel: string;
  mrr: number;
}

export interface OverviewDataAvailability {
  scoredCustomers: number;
  hasChurnLabels: boolean;
  hasEngagementEvents: boolean;
  hasStripeConnected: boolean;
  hasPaymentData: boolean;
}

export interface OverviewEmptyStateHint {
  code: string;
  title: string;
  description: string;
}

export interface RiskDistributionItem {
  bucket: InsightsRiskBucketCode;
  bucketLabel: string;
  level: string;
  count: number;
  mrr: number;
  percentage: number;
}

export interface ChurnTrendPoint {
  month: string;
  predictedChurnRate: number;
  actualChurnRate: number;
  accuracy: number;
}

// ==========================================
// Drivers Response - GET /insights/drivers
// ==========================================
export interface DriversInsightsResponse {
  topDrivers: DriverSummaryItem[];
  velocitySignals: VelocitySignalSummaryItem[];
  coverage: DriversCoverageSummary;
}

export interface DriverSummaryItem {
  driverKey: string;
  driverName: string;
  definition: string;
  suggestedAction: string;
  contributionPercent: number;
  affectedCustomers: number;
  mrrAtRisk: number;
  trendDeltaPercent: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface VelocitySignalSummaryItem {
  signalKey: string;
  signalName: string;
  definition: string;
  suggestedAction: string;
  triggeredCustomers: number;
  triggeredMrr: number;
  changePercent: number | null;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface DriversCoverageSummary {
  scoredCustomers: number;
  hasPaymentSignals: boolean;
  hasEngagementSignals: boolean;
  hasSupportSignals: boolean;
}

// ==========================================
// Drivers Detail - GET /insights/drivers/{driverKey}
// ==========================================
export interface DriverInsightsDetailResponse {
  driverKey: string;
  driverName: string;
  definition: string;
  thresholds: string[];
  suggestedAction: string;
  contributionPercent: number;
  affectedCustomers: number;
  mrrAtRisk: number;
  segmentBreakdown: DriverSegmentBreakdownItem[];
  correlatedBehaviors: DriverCorrelatedBehaviorMetric[];
  affectedCustomerPreview: DriverAffectedCustomerItem[];
}

export interface DriverSegmentBreakdownItem {
  dimension: string;
  segment: string;
  customers: number;
  avgRiskScore: number;
  mrrAtRisk: number;
}

export interface DriverCorrelatedBehaviorMetric {
  metricKey: string;
  metricLabel: string;
  affectedValue: number;
  baselineValue: number;
  deltaPercent: number;
  interpretation: string;
}

export interface DriverAffectedCustomerItem {
  customerId: string;
  customerName: string;
  accountName?: string | null;
  riskScore: number;
  riskBucket: InsightsRiskBucketCode;
  riskBucketLabel: string;
  mrr: number;
}

// ==========================================
// Model Quality Response - GET /insights/model-quality
// ==========================================
export interface AccuracyInsightsResponse {
  currentPeriod: CurrentPeriodAccuracy;
  coverage: ModelQualityCoverage;
  trustSummary: ModelTrustSummary;
  avgRiskScores: AvgRiskScores;
  historicalTrend: HistoricalAccuracyPoint[];
  byRiskLevel: AccuracyByRiskLevel[];
  recommendations: string[];
}

export interface CurrentPeriodAccuracy {
  periodStart: string;
  periodEnd: string;
  modelVersion: string | null;
  totalPredictions: number;
  labeledOutcomes: number;
  metrics: AccuracyMetricsDetail;
  confusionMatrix: ConfusionMatrixData;
  isConfusionMatrixAvailable: boolean;
  minimumLabeledOutcomesForConfusionMatrix: number;
  confusionMatrixStatusMessage: string | null;
  optimalThreshold: number | null;
}

export interface AccuracyMetricsDetail {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  aucRoc: number | null;
}

export interface ModelQualityCoverage {
  customersInScope: number;
  customersScored: number;
  customersWithLabels: number;
  scoringCoveragePercent: number;
  labelCoveragePercent: number;
}

export interface ModelTrustSummary {
  trustLevel: 'high' | 'medium' | 'low';
  calibrationGap: number;
  riskSeparation: number;
  summary: string;
}

export interface ConfusionMatrixData {
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
}

export interface AvgRiskScores {
  churned: number;
  retained: number;
  separation: number;
}

export interface HistoricalAccuracyPoint {
  period: string;
  accuracy: number;
  precision: number;
  recall: number;
}

export interface AccuracyByRiskLevel {
  bucket: InsightsRiskBucketCode;
  bucketLabel: string;
  level: string;
  predictions: number;
  actualChurns: number;
  accuracy: number;
}

// ==========================================
// Segments Response - GET /insights/segments
// ==========================================
export interface SegmentInsightsResponse {
  segmentType: string;
  segments: SegmentDetail[];
  comparisons: SegmentComparisons;
  insights: string[];
  distribution: SegmentDistribution;
}

export interface SegmentDetail {
  name: string;
  customerCount: number;
  mrr: number;
  mrrAtRisk: number;
  avgMrr: number;
  predictedChurn30d: number;
  actualChurnRate: number;
  churnRate: number;
  avgRiskScore: number;
  paymentFailureRate: number;
  engagementHealth: number;
  avgLtv: number;
  healthScore: number;
  geoSource?: string | null;
  topDrivers: string[];
  trends: SegmentTrends;
}

export interface SegmentTrends {
  mrrChange: number;
  churnChange: number;
  customerChange: number;
}

export interface SegmentComparisons {
  bestRetention: string | null;
  highestGrowth: string | null;
  mostAtRisk: string | null;
}

export interface SegmentDistribution {
  byCustomerCount: DistributionItem[];
  byMrr: DistributionItem[];
}

export interface DistributionItem {
  segment: string;
  percentage: number;
}

// ==========================================
// Query Parameters
// ==========================================
export interface SegmentQueryParams extends InsightsQueryFilters {
  segment?: 'plan_tier' | 'lifecycle_stage' | 'company_size' | 'acquisition_channel' | 'geo';
}

// ==========================================
// Data Health Response - GET /insights/data-health
// ==========================================
export interface DataHealthInsightsResponse {
  timestamp: string;
  scope: DataHealthScope;
  keyChecks: DataHealthIntegrationCheck[];
  integrations: DataHealthIntegrationItem[];
  coverage: DataHealthCoverageMetric[];
  topMissingFields: DataHealthMissingFieldItem[];
  recommendations: string[];
}

export interface DataHealthScope {
  fromUtc: string;
  toUtc: string;
  customersInScope: number;
}

export interface DataHealthIntegrationCheck {
  key: string;
  label: string;
  isConnected: boolean;
  status: 'connected' | 'warning' | 'disconnected';
  detail: string;
  lastUpdatedAt: string | null;
  dailyEventRate: number | null;
}

export interface DataHealthIntegrationItem {
  provider: string;
  category: string;
  isConnected: boolean;
  status: 'healthy' | 'connected' | 'syncing' | 'warning' | 'error' | 'disconnected';
  lastSyncedAt: string | null;
  syncedRecordCount: number;
  recentErrorCount: number;
  lastError: string | null;
}

export interface DataHealthCoverageMetric {
  key: string;
  label: string;
  coveredCustomers: number;
  missingCustomers: number;
  coveragePercent: number;
  description: string;
}

export interface DataHealthMissingFieldItem {
  fieldKey: string;
  fieldLabel: string;
  missingCustomers: number;
  missingPercent: number;
  impact: string;
  suggestedAction: string;
}
