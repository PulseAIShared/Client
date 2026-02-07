import { useParams } from 'react-router-dom';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useGetChurnAnalysisResults } from '@/features/analytics/api/churn-analysis';
import { ChurnAnalysisResultResponse, CustomerChurnResultResponse } from '@/types/api';

const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel.toLowerCase()) {
    case 'critical':
      return 'text-error-muted bg-error/20 border-error/30';
    case 'high':
      return 'text-warning-muted bg-warning/20 border-warning/30';
    case 'medium':
      return 'text-warning-muted bg-warning/20 border-warning/30';
    case 'low':
      return 'text-success-muted bg-success/20 border-success/30';
    default:
      return 'text-text-muted bg-surface-secondary/20 border-border-primary/30';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

const AnalysisOverview = ({ analysis }: { analysis: ChurnAnalysisResultResponse }) => (
  <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
    <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-6 sm:mb-8">Analysis Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div className="group relative bg-gradient-to-br from-accent-primary/20 to-info/20 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:border-accent-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-info/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <p className="text-sm text-text-secondary font-medium uppercase tracking-wider mb-2">Status</p>
          <p className="text-lg sm:text-xl font-bold text-info-muted">{analysis.status}</p>
        </div>
      </div>
      <div className="group relative bg-gradient-to-br from-success/20 to-success-muted/20 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:border-success/50 transition-all duration-300 shadow-lg hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success-muted/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <p className="text-sm text-text-secondary font-medium uppercase tracking-wider mb-2">Progress</p>
          <p className="text-lg sm:text-xl font-bold text-success-muted">{analysis.progressPercentage.toFixed(1)}%</p>
          <div className="w-full bg-surface-secondary/50 rounded-full h-2 mt-3">
            <div className="bg-gradient-to-r from-success to-success-muted h-2 rounded-full transition-all duration-1000 ease-out shadow-lg" style={{ width: `${analysis.progressPercentage}%` }}></div>
          </div>
        </div>
      </div>
      <div className="group relative bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:border-accent-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <p className="text-sm text-text-secondary font-medium uppercase tracking-wider mb-2">Total Customers</p>
          <p className="text-lg sm:text-xl font-bold text-accent-primary">{analysis.totalCustomers.toLocaleString()}</p>
        </div>
      </div>
      <div className="group relative bg-gradient-to-br from-warning/20 to-warning-muted/20 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:border-warning/50 transition-all duration-300 shadow-lg hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-warning-muted/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <p className="text-sm text-text-secondary font-medium uppercase tracking-wider mb-2">Processed</p>
          <p className="text-lg sm:text-xl font-bold text-warning-muted">{analysis.processedCustomers.toLocaleString()}</p>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Timeline</h3>
        <div className="text-sm text-text-muted space-y-2">
          <p>Created: {formatDate(analysis.createdAt)}</p>
          {analysis.startedAt && (
            <p>Started: {formatDate(analysis.startedAt)}</p>
          )}
          {analysis.completedAt && (
            <p>Completed: {formatDate(analysis.completedAt)}</p>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Details</h3>
        <div className="text-sm text-text-muted space-y-2">
          <p>Model Version: {analysis.modelVersion}</p>
          <p>Requested by: {analysis.requestedBy.name}</p>
        </div>
      </div>
    </div>
    
    {analysis.errorMessage && (
      <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-error/20 border border-error/30 rounded-2xl">
        <p className="text-error-muted font-semibold mb-2">Error:</p>
        <p className="text-red-300">{analysis.errorMessage}</p>
      </div>
    )}
  </div>
);

const ResultsSummary = ({ results }: { results: any }) => (
  <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
    <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-6 sm:mb-8">Analysis Results</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      <div className="space-y-4 sm:space-y-6">
        <div className="group relative bg-gradient-to-br from-error/20 to-error-muted/20 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 hover:border-error/50 transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-error/5 to-error-muted/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <p className="text-sm text-text-secondary font-semibold uppercase tracking-wider mb-3">Overall Churn Rate</p>
            <p className="text-3xl sm:text-4xl font-bold text-error-muted group-hover:scale-105 transition-transform duration-300">{formatPercentage(results.overallChurnRate)}</p>
          </div>
        </div>
        <div className="group relative bg-gradient-to-br from-accent-primary/20 to-info/20 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 hover:border-accent-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-info/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <p className="text-sm text-text-secondary font-semibold uppercase tracking-wider mb-3">Average Risk Score</p>
            <p className="text-3xl sm:text-4xl font-bold text-info-muted group-hover:scale-105 transition-transform duration-300">{results.averageRiskScore.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 sm:mb-6">Risk Distribution</h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center p-4 sm:p-5 bg-error/20 rounded-xl border border-error/30 hover:bg-error/30 transition-all duration-300">
            <span className="text-error-muted font-semibold">Critical Risk</span>
            <span className="text-red-300 font-bold text-lg sm:text-xl">{results.riskDistribution.criticalRisk}</span>
          </div>
          <div className="flex justify-between items-center p-4 sm:p-5 bg-warning/20 rounded-xl border border-warning/30 hover:bg-warning/30 transition-all duration-300">
            <span className="text-warning-muted font-semibold">High Risk</span>
            <span className="text-orange-300 font-bold text-lg sm:text-xl">{results.riskDistribution.highRisk}</span>
          </div>
          <div className="flex justify-between items-center p-4 sm:p-5 bg-warning/20 rounded-xl border border-warning/30 hover:bg-warning/30 transition-all duration-300">
            <span className="text-yellow-400 font-semibold">Medium Risk</span>
            <span className="text-yellow-300 font-bold text-lg sm:text-xl">{results.riskDistribution.mediumRisk}</span>
          </div>
          <div className="flex justify-between items-center p-4 sm:p-5 bg-success/20 rounded-xl border border-success/30 hover:bg-success/30 transition-all duration-300">
            <span className="text-success-muted font-semibold">Low Risk</span>
            <span className="text-green-300 font-bold text-lg sm:text-xl">{results.riskDistribution.lowRisk}</span>
          </div>
        </div>
      </div>
    </div>
    
    {results.keyInsights && results.keyInsights.length > 0 && (
      <div className="mt-8 sm:mt-10">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 sm:mb-6">Key Insights</h3>
        <div className="space-y-3 sm:space-y-4">
          {results.keyInsights.map((insight: string, index: number) => (
            <div key={index} className="flex items-start p-4 sm:p-5 bg-surface-secondary/30 rounded-xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300">
              <div className="w-2 h-2 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <span className="text-text-secondary leading-relaxed">{insight}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    
    {results.recommendations && results.recommendations.length > 0 && (
      <div className="mt-8 sm:mt-10">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 sm:mb-6">Recommendations</h3>
        <div className="space-y-3 sm:space-y-4">
          {results.recommendations.map((recommendation: string, index: number) => (
            <div key={index} className="flex items-start p-4 sm:p-5 bg-success/10 rounded-xl border border-success/20 hover:bg-success/20 transition-all duration-300">
              <div className="w-2 h-2 bg-gradient-to-r from-success to-success-muted rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <span className="text-text-secondary leading-relaxed">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const CustomerResults = ({ customers }: { customers: CustomerChurnResultResponse[] }) => (
  <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
    <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-6 sm:mb-8">Customer Results ({customers.length})</h2>
    
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-primary/50">
            <th className="text-left py-4 px-4 font-semibold text-text-secondary uppercase tracking-wider">Customer</th>
            <th className="text-left py-4 px-4 font-semibold text-text-secondary uppercase tracking-wider">Risk Score</th>
            <th className="text-left py-4 px-4 font-semibold text-text-secondary uppercase tracking-wider">Risk Level</th>
            <th className="text-left py-4 px-4 font-semibold text-text-secondary uppercase tracking-wider">Analyzed At</th>
            <th className="text-left py-4 px-4 font-semibold text-text-secondary uppercase tracking-wider">Top Risk Factors</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.customerId} className="border-b border-border-primary/30 hover:bg-surface-secondary/30 transition-all duration-300">
              <td className="py-4 px-4">
                <div>
                  <p className="font-semibold text-text-primary">{customer.customerName}</p>
                  <p className="text-text-muted text-sm">{customer.customerEmail}</p>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-secondary/50 rounded-full h-2 overflow-hidden max-w-[80px]">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                        customer.churnRiskScore >= 0.8 ? 'bg-gradient-to-r from-error to-error-muted' :
                        customer.churnRiskScore >= 0.6 ? 'bg-gradient-to-r from-warning to-warning-muted' :
                        customer.churnRiskScore >= 0.4 ? 'bg-gradient-to-r from-warning-muted to-warning' :
                        'bg-gradient-to-r from-success to-success-muted'
                      }`}
                      style={{ width: `${customer.churnRiskScore * 100}%` }}
                    />
                  </div>
                  <span className="font-bold text-text-primary">{customer.churnRiskScore.toFixed(2)}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskLevelColor(customer.riskLevel)}`}>
                  {customer.riskLevel}
                </span>
              </td>
              <td className="py-4 px-4 text-text-muted text-sm">
                {formatDate(customer.analyzedAt)}
              </td>
              <td className="py-4 px-4">
                <div className="text-xs space-y-1">
                  {Object.entries(customer.riskFactors)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([factor, value]) => (
                      <div key={factor} className="flex justify-between items-center bg-surface-secondary/30 px-2 py-1 rounded hover:bg-surface-secondary/50 transition-all duration-300">
                        <span className="text-text-muted">{factor}:</span>
                        <span className="font-semibold text-text-secondary">{formatPercentage(value)}</span>
                      </div>
                    ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const ChurnAnalysisResultsRoute = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  
  const { data: analysis, isLoading, error } = useGetChurnAnalysisResults(analysisId!);

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="relative">
              <Spinner size="xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <p className="text-text-secondary font-medium">Loading analysis results...</p>
            <p className="text-text-muted text-sm">Preparing your churn analysis data</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-surface-primary/80 backdrop-blur-xl p-8 rounded-3xl border border-border-primary/50 shadow-2xl max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Error Loading Analysis</h2>
            <p className="text-text-muted mb-4">
              {error instanceof Error ? error.message : 'Failed to load churn analysis results'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (!analysis) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-surface-primary/80 backdrop-blur-xl p-8 rounded-3xl border border-border-primary/50 shadow-2xl max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-surface-secondary/50 to-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Analysis Not Found</h2>
            <p className="text-text-muted">The requested churn analysis could not be found.</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <AppPageHeader
          title="Analysis Results"
          description={`Comprehensive churn analysis results and insights for your customer base. Analysis ID: ${analysis?.analysisId}`}
          actions={
            analysis?.status === 'Processing'
              ? (
                <div className="flex items-center gap-4 rounded-2xl border border-accent-primary/30 bg-accent-primary/20 px-6 py-4">
                  <Spinner size="sm" />
                  <div>
                    <p className="mb-1 font-semibold text-accent-primary">Analysis in progress...</p>
                    <p className="text-sm text-accent-primary/80">
                      {analysis?.processedCustomers?.toLocaleString()} of {analysis?.totalCustomers?.toLocaleString()} customers processed
                      {' '}
                      ({analysis?.progressPercentage?.toFixed(1)}%)
                    </p>
                  </div>
                </div>
                )
              : (
                <span className="px-3 py-1 bg-surface-secondary/40 text-text-secondary rounded-full text-sm font-medium border border-border-primary/30">
                  {analysis?.status}
                </span>
                )
          }
        />

        {analysis && <AnalysisOverview analysis={analysis} />}

        {analysis?.results && (
          <>
            <ResultsSummary results={analysis.results} />
            
            {analysis.results?.customerResults && analysis.results.customerResults.length > 0 && (
              <CustomerResults customers={analysis.results.customerResults} />
            )}
          </>
        )}

        {analysis?.status === 'Processing' && (
          <div className="bg-accent-primary/20 border border-accent-primary/30 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <Spinner size="sm" />
              <div className="flex-1">
                <p className="font-semibold text-accent-primary mb-2">Analysis in Progress</p>
                <p className="text-accent-primary/80 text-sm mb-3">
                  {analysis?.processedCustomers?.toLocaleString()} of {analysis?.totalCustomers?.toLocaleString()} customers processed 
                  ({analysis?.progressPercentage?.toFixed(1)}%)
                </p>
                <div className="w-full bg-surface-secondary/50 rounded-full h-3 max-w-md">
                  <div className="bg-gradient-to-r from-accent-primary to-info h-3 rounded-full transition-all duration-1000 ease-out shadow-lg" style={{ width: `${analysis?.progressPercentage || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};
