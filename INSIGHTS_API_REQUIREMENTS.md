# Insights API Requirements

This document outlines the exact data structures needed for the insights route to replace all mock data. All data would come from a single endpoint `/insights` that returns a comprehensive insights response.

## Overview

The insights route (`/app/insights`) displays:
- **InsightsHeader**: Static header with prediction accuracy and revenue saved metrics
- **AnalyticsOverview**: KPI cards and revenue analytics chart
- **ChurnPredictionCard**: AI churn prediction chart and risk factors
- **LTVAnalytics**: Lifetime value analytics by segment and cohort analysis
- **DemographicInsights**: Customer demographics pie chart and behavioral insights
- **RecoveryFlows**: Recovery flow campaigns and templates
- **AI Recommendations**: Static recommendations section with hardcoded alerts

## Required C# Data Models

### 1. Main Insights Response

```csharp
public class InsightsResponse
{
    public InsightsHeaderData Header { get; set; }
    public AnalyticsOverviewData AnalyticsOverview { get; set; }
    public ChurnPredictionData ChurnPrediction { get; set; }
    public LTVAnalyticsData LTVAnalytics { get; set; }
    public DemographicInsightsData DemographicInsights { get; set; }
    public RecoveryFlowsData RecoveryFlows { get; set; }
    public AIRecommendationsData AIRecommendations { get; set; }
}
```

### 2. Header Data

```csharp
public class InsightsHeaderData
{
    public decimal PredictionAccuracy { get; set; } // e.g., 87.3 (for 87.3%)
    public string RevenueSaved { get; set; } // e.g., "$4.2M"
}
```

### 3. Analytics Overview Data

```csharp
public class AnalyticsOverviewData
{
    public List<KPIData> KpiData { get; set; }
    public List<RevenueData> RevenueData { get; set; }
}

public class KPIData
{
    public string Metric { get; set; } // e.g., "Monthly Recurring Revenue"
    public string Value { get; set; } // e.g., "$58,000"
    public string Change { get; set; } // e.g., "+12.3%"
    public string Trend { get; set; } // "up" or "down"
}

public class RevenueData
{
    public string Month { get; set; } // e.g., "Jan", "Feb", etc.
    public decimal Revenue { get; set; } // e.g., 45000
    public decimal Recovered { get; set; } // e.g., 8200
    public decimal Churn { get; set; } // e.g., 12000
}
```

### 4. Churn Prediction Data

```csharp
public class ChurnPredictionData
{
    public List<ChurnPredictionPoint> PredictionData { get; set; }
    public List<RiskFactor> RiskFactors { get; set; }
}

public class ChurnPredictionPoint
{
    public string Month { get; set; } // e.g., "Jan", "Feb", etc.
    public decimal Predicted { get; set; } // e.g., 8.2
    public decimal? Actual { get; set; } // null for future months
}

public class RiskFactor
{
    public string Factor { get; set; } // e.g., "Payment Failures"
    public string Impact { get; set; } // "High", "Medium", or "Low"
    public int Percentage { get; set; } // e.g., 85 (for 85%)
    public string Color { get; set; } // CSS color class, e.g., "text-red-400"
}
```

### 5. LTV Analytics Data

```csharp
public class LTVAnalyticsData
{
    public List<LTVSegmentData> LTVData { get; set; }
    public List<CohortData> CohortData { get; set; }
}

public class LTVSegmentData
{
    public string Segment { get; set; } // e.g., "Premium", "Pro", "Basic"
    public decimal Current { get; set; } // e.g., 280
    public decimal Previous { get; set; } // e.g., 245
    public decimal Growth { get; set; } // e.g., 14.3 (for 14.3%)
}

public class CohortData
{
    public string Month { get; set; } // e.g., "Jan Cohort", "Feb Cohort"
    public int Retention { get; set; } // e.g., 92 (for 92%)
    public decimal LTV { get; set; } // e.g., 156
}
```

### 6. Demographic Insights Data

```csharp
public class DemographicInsightsData
{
    public List<DemographicSegment> DemographicData { get; set; }
    public List<BehaviorInsight> BehaviorInsights { get; set; }
}

public class DemographicSegment
{
    public string Name { get; set; } // e.g., "Women 35+", "Men 25-34"
    public int Value { get; set; } // percentage, e.g., 35 (for 35%)
    public decimal LTV { get; set; } // e.g., 185
    public string Color { get; set; } // hex color, e.g., "#8b5cf6"
}

public class BehaviorInsight
{
    public string Insight { get; set; } // e.g., "Women aged 35+ have 30% higher LTV than men of the same age group"
    public string Impact { get; set; } // "High", "Medium", or "Low"
    public string Action { get; set; } // e.g., "Target marketing campaigns towards this demographic"
    public string Metric { get; set; } // e.g., "+30% LTV"
}
```

### 7. Recovery Flows Data

```csharp
public class RecoveryFlowsData
{
    public List<RecoveryFlow> Flows { get; set; }
    public List<FlowTemplate> Templates { get; set; }
}

public class RecoveryFlow
{
    public string Id { get; set; } // e.g., "payment-failed"
    public string Name { get; set; } // e.g., "Payment Recovery Flow"
    public string Status { get; set; } // "Active", "Paused", or "Draft"
    public string Type { get; set; } // "Automated", "AI-Generated", or "Behavioral"
    public string Trigger { get; set; } // e.g., "Payment Failed"
    public List<string> Channels { get; set; } // e.g., ["Email", "SMS"]
    public int SuccessRate { get; set; } // e.g., 73 (for 73%)
    public string RecoveredRevenue { get; set; } // e.g., "$18,420"
    public List<FlowStep> Steps { get; set; }
}

public class FlowStep
{
    public int Step { get; set; } // e.g., 1, 2, 3, etc.
    public string Type { get; set; } // "email", "sms", "phone", "in-app"
    public string Delay { get; set; } // e.g., "1 hour", "24 hours", "3 days"
    public string Subject { get; set; } // e.g., "Payment Update Required"
    public int? OpenRate { get; set; } // nullable, e.g., 68 (for 68%)
    public int? ResponseRate { get; set; } // nullable, e.g., 45 (for 45%)
    public int? ClickRate { get; set; } // nullable, e.g., 28 (for 28%)
    public int? Conversion { get; set; } // nullable, e.g., 35 (for 35%)
}

public class FlowTemplate
{
    public string Name { get; set; } // e.g., "Winback Campaign"
    public string Trigger { get; set; } // e.g., "Cancelled subscription"
    public int SuccessRate { get; set; } // e.g., 28 (for 28%)
}
```

### 8. AI Recommendations Data

```csharp
public class AIRecommendationsData
{
    public List<AIRecommendation> Recommendations { get; set; }
}

public class AIRecommendation
{
    public string Type { get; set; } // "High-Risk Alert", "Upsell Opportunity", "Feature Adoption"
    public string Title { get; set; } // e.g., "High-Risk Alert"
    public string Description { get; set; } // e.g., "23 customers entering critical churn risk zone"
    public string ActionText { get; set; } // e.g., "Launch Intervention"
    public string IconType { get; set; } // "error", "success", "info" for determining icon and colors
    public int Count { get; set; } // e.g., 23 (customers affected)
}
```

## API Endpoint

### GET `/api/insights`

Returns a single `InsightsResponse` object containing all the data needed for the insights page.

**Response Example:**
```json
{
  "header": {
    "predictionAccuracy": 87.3,
    "revenueSaved": "$4.2M"
  },
  "analyticsOverview": {
    "kpiData": [
      {
        "metric": "Monthly Recurring Revenue",
        "value": "$58,000",
        "change": "+12.3%",
        "trend": "up"
      }
    ],
    "revenueData": [
      {
        "month": "Jan",
        "revenue": 45000,
        "recovered": 8200,
        "churn": 12000
      }
    ]
  },
  "churnPrediction": {
    "predictionData": [
      {
        "month": "Jan",
        "predicted": 8.2,
        "actual": 7.9
      }
    ],
    "riskFactors": [
      {
        "factor": "Payment Failures",
        "impact": "High",
        "percentage": 85,
        "color": "text-red-400"
      }
    ]
  }
  // ... rest of the data
}
```

## Notes

1. **Current Mock Data**: All components currently use mock data from `src/features/insights/api/insights.ts`
2. **Data Refresh**: The frontend expects real-time or near real-time data updates
3. **Error Handling**: Components handle loading states and errors gracefully
4. **Chart Data**: Revenue and churn prediction charts expect arrays of monthly data points
5. **Colors**: Demographic data includes hex color codes for pie chart visualization
6. **Percentages**: Most percentage values are stored as integers (e.g., 85 for 85%)
7. **Currency**: Revenue values are stored as decimals but displayed as formatted strings

## Integration Points

- Replace mock functions in `src/features/insights/api/insights.ts`
- Update the API client to call the new endpoint
- Ensure data types match the TypeScript interfaces in `src/types/api.ts`
- Test with real data to ensure charts render correctly