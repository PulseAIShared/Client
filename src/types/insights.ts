// Types for split insights endpoints
// These match the server-side DTOs in DataTransferObjects/Insights/

// ==========================================
// Overview Response - GET /insights/overview
// ==========================================
export interface InsightsOverviewResponse {
  timestamp: string;
  kpis: OverviewKpis;
  alerts: OverviewAlerts;
  revenueAtRisk: RevenueAtRiskSummary;
  predictionAccuracy: PredictionAccuracySummary;
}

export interface OverviewKpis {
  mrr: KpiMetric;
  activeCustomers: KpiMetric;
  churnRate: KpiMetric;
  avgLtv: KpiMetric;
  healthScore: KpiMetric;
}

export interface KpiMetric {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface OverviewAlerts {
  criticalRisk: number;
  highRisk: number;
  softChurnSignals: number;
  pendingRecommendations: number;
}

export interface RevenueAtRiskSummary {
  critical: number;
  high: number;
  medium: number;
  total: number;
}

export interface PredictionAccuracySummary {
  overall: number;
  precision: number;
  recall: number;
  lastUpdated: string | null;
}

// ==========================================
// Churn Response - GET /insights/churn
// ==========================================
export interface ChurnInsightsResponse {
  summary: ChurnSummary;
  riskDistribution: RiskDistributionItem[];
  riskFactors: RiskFactorAnalysis[];
  trends: ChurnTrendPoint[];
  velocitySignals: VelocitySignalsSummary;
  renewalWindow: RenewalWindowSummary;
}

export interface ChurnSummary {
  totalAtRisk: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  totalMrrAtRisk: number;
  predictedChurns30d: number;
}

export interface RiskDistributionItem {
  level: string;
  count: number;
  mrr: number;
  percentage: number;
}

export interface RiskFactorAnalysis {
  factor: string;
  impact: 'High' | 'Medium' | 'Low';
  affectedCustomers: number;
  avgContribution: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface ChurnTrendPoint {
  month: string;
  predictedChurnRate: number;
  actualChurnRate: number;
  accuracy: number;
}

export interface VelocitySignalsSummary {
  degradingPayment: number;
  decliningEngagement: number;
  improvingHealth: number;
}

export interface RenewalWindowSummary {
  within30Days: number;
  within60Days: number;
  within90Days: number;
  mrrInWindow: number;
}

// ==========================================
// Cohort Response - GET /insights/cohorts
// ==========================================
export interface CohortInsightsResponse {
  cohortType: string;
  period: string;
  cohorts: CohortDetail[];
  retentionMatrix: RetentionMatrixRow[];
  comparisons: CohortComparisons;
  insights: string[];
}

export interface CohortDetail {
  cohortValue: string;
  totalCustomers: number;
  currentCustomers: number;
  churnedCustomers: number;
  churnRate: number;
  retentionRate: number;
  avgRiskScore: number;
  avgDaysToChurn: number | null;
  mrrAtRisk: number;
  mrrLost: number;
  highRiskCustomers: number;
  criticalRiskCustomers: number;
}

export interface RetentionMatrixRow {
  cohort: string;
  month0: number;
  month1: number | null;
  month2: number | null;
  month3: number | null;
  month6: number | null;
  month12: number | null;
}

export interface CohortComparisons {
  bestPerforming: CohortPerformance | null;
  worstPerforming: CohortPerformance | null;
  avgRetentionRate: number;
}

export interface CohortPerformance {
  cohort: string;
  retentionRate: number;
  reason: string | null;
}

// ==========================================
// Feature Response - GET /insights/features
// ==========================================
export interface FeatureInsightsResponse {
  stickyFeatures: StickyFeatureInfo[];
  abandonedFeatures: AbandonedFeatureInfo[];
  usageTrends: FeatureUsageTrend[];
  adoptionFunnel: FeatureAdoptionFunnel;
  recommendations: FeatureRecommendation[];
}

export interface StickyFeatureInfo {
  featureKey: string;
  featureName: string;
  category: string;
  retentionCorrelation: number;
  usersWithFeature: number;
  churnRateWithFeature: number;
  churnRateWithoutFeature: number;
  retentionLift: string;
  avgSessionDuration: number | null;
  recommendation: string | null;
}

export interface AbandonedFeatureInfo {
  featureKey: string;
  featureName: string;
  customersAbandoned30d: number;
  avgUsageBeforeAbandonment: number;
  correlationWithChurn: number;
  riskLevel: string;
}

export interface FeatureUsageTrend {
  featureKey: string;
  featureName: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  activeUsers30d: number;
}

export interface FeatureAdoptionFunnel {
  core: AdoptionTier;
  advanced: AdoptionTier;
  power: AdoptionTier;
}

export interface AdoptionTier {
  adoptedPercent: number;
  avgDaysToAdopt: number;
}

export interface FeatureRecommendation {
  type: 'promote' | 'improve' | 'deprecate';
  feature: string;
  targetSegment: string;
  expectedImpact: string;
  priority: string;
}

// ==========================================
// Recommendations Response - GET /insights/recommendations
// ==========================================
export interface RecommendationInsightsResponse {
  summary: RecommendationSummary;
  byUrgency: RecommendationsByUrgency;
  byCategory: Record<string, CategoryMetrics>;
  outcomes: RecommendationOutcomes;
  topPerforming: TopPerformingRecommendation[];
  recoveryExamples: RecoveryExample[];
  pendingActions: PendingActionItem[];
}

export interface RecommendationSummary {
  totalRecommendations: number;
  pending: number;
  actedUpon: number;
  avgActedUponRate: number;
  avgSuccessRate: number;
}

export interface RecommendationsByUrgency {
  today: UrgencyMetrics;
  thisWeek: UrgencyMetrics;
  thisMonth: UrgencyMetrics;
}

export interface UrgencyMetrics {
  count: number;
  actedRate: number;
  successRate: number;
}

export interface CategoryMetrics {
  count: number;
  successProbability: number;
  avgDaysToOutcome: number | null;
  topRecommendation: string | null;
  recoveredCustomers: number;
}

export interface RecommendationOutcomes {
  retained: number;
  churned: number;
  downgraded: number;
  unknown: number;
}

export interface TopPerformingRecommendation {
  recommendation: string;
  category: string;
  timesActedUpon: number;
  successRate: number;
  avgRiskReduction: number;
}

export interface RecoveryExample {
  summary: string;
  category: string;
  daysToRecovery: number;
}

export interface PendingActionItem {
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  recommendation: string;
  urgency: string;
  category: string;
  riskScore: number;
  mrr: number;
  successProbability: number;
}

// ==========================================
// Early Warnings Response - GET /insights/early-warnings
// ==========================================
export interface EarlyWarningsResponse {
  summary: EarlyWarningSummary;
  byType: IndicatorTypeBreakdown[];
  trends: EarlyWarningTrend[];
  indicators: EarlyWarningIndicator[];
  correlations: IndicatorCorrelations;
}

export interface EarlyWarningSummary {
  totalIndicators: number;
  unacknowledged: number;
  bySeverity: SeverityBreakdown;
}

export interface SeverityBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface IndicatorTypeBreakdown {
  type: string;
  displayName: string;
  count: number;
  avgChangePercent: number | null;
  historicalChurnRate: number;
  mrrAtRisk: number;
}

export interface EarlyWarningTrend {
  week: string;
  newIndicators: number;
  resolvedIndicators: number;
  netChange: number;
}

export interface EarlyWarningIndicator {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  detectedAt: string;
  description: string;
  previousValue: string | null;
  currentValue: string | null;
  changePercent: number | null;
  mrr: number;
  isAcknowledged: boolean;
  suggestedAction: string | null;
}

export interface IndicatorCorrelations {
  usageDeclineToChurn: CorrelationMetric;
  featureAbandonmentToChurn: CorrelationMetric;
  planDowngradeToChurn: CorrelationMetric;
}

export interface CorrelationMetric {
  correlation: number;
  avgDaysToChurn: number | null;
}

// ==========================================
// Accuracy Response - GET /insights/accuracy
// ==========================================
export interface AccuracyInsightsResponse {
  currentPeriod: CurrentPeriodAccuracy;
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
  metrics: AccuracyMetricsDetail;
  confusionMatrix: ConfusionMatrixData;
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
  avgMrr: number;
  churnRate: number;
  avgRiskScore: number;
  avgLtv: number;
  healthScore: number;
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
// Recovery Response - GET /insights/recovery
// ==========================================
export interface RecoveryInsightsResponse {
  kpis: RecoveryInsightsKpis;
  bySegment: RecoveryBySegment[];
  byReason: RecoveryByReason[];
  timeline: DailyRecoveryPoint[];
  flows: RecoveryFlowSummary[];
  outstandingPayments: OutstandingPayment[];
}

export interface RecoveryInsightsKpis {
  missedPayments: PaymentCount;
  recoveredPayments: PaymentCount;
  recoveryRate: number;
  avgRecoveryTimeDays: number;
  outstandingAmount: number;
}

export interface PaymentCount {
  count: number;
  amount: number;
}

export interface RecoveryBySegment {
  segment: string;
  missedCount: number;
  missedAmount: number;
  recoveredCount: number;
  recoveredAmount: number;
  recoveryRate: number;
}

export interface RecoveryByReason {
  reason: string;
  count: number;
  recoveryRate: number;
  avgRecoveryDays: number;
}

export interface DailyRecoveryPoint {
  date: string;
  missed: number;
  recovered: number;
  missedAmount: number;
  recoveredAmount: number;
}

export interface RecoveryFlowSummary {
  flowId: string;
  flowName: string;
  enrolledCustomers: number;
  completedCustomers: number;
  successRate: number;
  avgRevenueRecovered: number;
  steps: FlowStepSummary[];
}

export interface FlowStepSummary {
  stepOrder: number;
  type: string;
  delay: string;
  sent: number;
  opened: number;
  clicked: number;
  recovered: number;
}

export interface OutstandingPayment {
  customerId: string;
  customerName: string;
  amount: number;
  daysPastDue: number;
  attempts: number;
  lastAttempt: string | null;
  reason: string;
  enrolledInFlow: boolean;
  flowStep: number | null;
}

// ==========================================
// Query Parameters
// ==========================================
export interface CohortQueryParams {
  cohortType?: 'signup_month' | 'plan_tier' | 'acquisition_channel';
  period?: string;
}

export interface SegmentQueryParams {
  segment?: 'plan_tier' | 'lifecycle_stage' | 'company_size' | 'acquisition_channel';
}

export interface RecoveryQueryParams {
  period?: string;
}
