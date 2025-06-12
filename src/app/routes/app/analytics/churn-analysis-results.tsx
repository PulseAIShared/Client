import { useParams } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useGetChurnAnalysisResults } from '@/features/analytics/api/churn-analysis';
import { ChurnAnalysisResultResponse, CustomerChurnResultResponse } from '@/types/api';

const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel.toLowerCase()) {
    case 'critical':
      return 'text-red-400 bg-red-500/20 border-red-500/50';
    case 'high':
      return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
    case 'medium':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
    case 'low':
      return 'text-green-400 bg-green-500/20 border-green-500/50';
    default:
      return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

const AnalysisOverview = ({ analysis }: { analysis: ChurnAnalysisResultResponse }) => (
  <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
    <h2 className="text-xl font-semibold mb-6 text-white">Analysis Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="group relative bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <p className="text-sm text-slate-300 font-medium uppercase tracking-wider mb-2">Status</p>
          <p className="text-lg font-bold text-cyan-400">{analysis.status}</p>
        </div>
      </div>
      <div className="group relative bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <p className="text-sm text-slate-300 font-medium uppercase tracking-wider mb-2">Progress</p>
          <p className="text-lg font-bold text-green-400">{analysis.progressPercentage.toFixed(1)}%</p>
          <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-2">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${analysis.progressPercentage}%` }}></div>
          </div>
        </div>
      </div>
      <div className="group relative bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <p className="text-sm text-slate-300 font-medium uppercase tracking-wider mb-2">Total Customers</p>
          <p className="text-lg font-bold text-purple-400">{analysis.totalCustomers.toLocaleString()}</p>
        </div>
      </div>
      <div className="group relative bg-gradient-to-br from-orange-600/20 to-yellow-600/20 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-yellow-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <p className="text-sm text-slate-300 font-medium uppercase tracking-wider mb-2">Processed</p>
          <p className="text-lg font-bold text-orange-400">{analysis.processedCustomers.toLocaleString()}</p>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Timeline</h3>
        <div className="text-sm text-slate-400 space-y-1">
          <p>Created: {formatDate(analysis.createdAt)}</p>
          {analysis.startedAt && (
            <p>Started: {formatDate(analysis.startedAt)}</p>
          )}
          {analysis.completedAt && (
            <p>Completed: {formatDate(analysis.completedAt)}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Details</h3>
        <div className="text-sm text-slate-400 space-y-1">
          <p>Model Version: {analysis.modelVersion}</p>
          <p>Requested by: {analysis.requestedBy.name}</p>
        </div>
      </div>
    </div>
    
    {analysis.errorMessage && (
      <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl">
        <p className="text-red-400 font-medium mb-1">Error:</p>
        <p className="text-red-300">{analysis.errorMessage}</p>
      </div>
    )}
  </div>
);

const ResultsSummary = ({ results }: { results: any }) => (
  <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
    <h2 className="text-xl font-semibold mb-6 text-white">Analysis Results</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="group relative bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <p className="text-sm text-slate-300 font-medium uppercase tracking-wider mb-3">Overall Churn Rate</p>
            <p className="text-3xl font-bold text-red-400 group-hover:scale-105 transition-transform duration-300">{formatPercentage(results.overallChurnRate)}</p>
          </div>
        </div>
        <div className="group relative bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <p className="text-sm text-slate-300 font-medium uppercase tracking-wider mb-3">Average Risk Score</p>
            <p className="text-3xl font-bold text-cyan-400 group-hover:scale-105 transition-transform duration-300">{results.averageRiskScore.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Risk Distribution</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-red-500/20 rounded-xl border border-red-500/30">
            <span className="text-red-400 font-medium">Critical Risk</span>
            <span className="text-red-300 font-bold text-lg">{results.riskDistribution.criticalRisk}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
            <span className="text-orange-400 font-medium">High Risk</span>
            <span className="text-orange-300 font-bold text-lg">{results.riskDistribution.highRisk}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
            <span className="text-yellow-400 font-medium">Medium Risk</span>
            <span className="text-yellow-300 font-bold text-lg">{results.riskDistribution.mediumRisk}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-500/20 rounded-xl border border-green-500/30">
            <span className="text-green-400 font-medium">Low Risk</span>
            <span className="text-green-300 font-bold text-lg">{results.riskDistribution.lowRisk}</span>
          </div>
        </div>
      </div>
    </div>
    
    {results.keyInsights && results.keyInsights.length > 0 && (
      <div className="mt-8">
        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Key Insights</h3>
        <div className="space-y-3">
          {results.keyInsights.map((insight: string, index: number) => (
            <div key={index} className="flex items-start p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <span className="text-slate-300 leading-relaxed">{insight}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    
    {results.recommendations && results.recommendations.length > 0 && (
      <div className="mt-8">
        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Recommendations</h3>
        <div className="space-y-3">
          {results.recommendations.map((recommendation: string, index: number) => (
            <div key={index} className="flex items-start p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <span className="text-slate-300 leading-relaxed">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const CustomerResults = ({ customers }: { customers: CustomerChurnResultResponse[] }) => (
  <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
    <h2 className="text-xl font-semibold mb-6 text-white">Customer Results ({customers.length})</h2>
    
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-600/50">
            <th className="text-left py-4 px-4 font-medium text-slate-300 uppercase tracking-wider">Customer</th>
            <th className="text-left py-4 px-4 font-medium text-slate-300 uppercase tracking-wider">Risk Score</th>
            <th className="text-left py-4 px-4 font-medium text-slate-300 uppercase tracking-wider">Risk Level</th>
            <th className="text-left py-4 px-4 font-medium text-slate-300 uppercase tracking-wider">Analyzed At</th>
            <th className="text-left py-4 px-4 font-medium text-slate-300 uppercase tracking-wider">Top Risk Factors</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.customerId} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-200">
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium text-white">{customer.customerName}</p>
                  <p className="text-slate-400 text-sm">{customer.customerEmail}</p>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden max-w-[80px]">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        customer.churnRiskScore >= 0.8 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        customer.churnRiskScore >= 0.6 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                        customer.churnRiskScore >= 0.4 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                      style={{ width: `${customer.churnRiskScore * 100}%` }}
                    />
                  </div>
                  <span className="font-semibold text-white">{customer.churnRiskScore.toFixed(2)}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(customer.riskLevel)}`}>
                  {customer.riskLevel}
                </span>
              </td>
              <td className="py-4 px-4 text-slate-400 text-sm">
                {formatDate(customer.analyzedAt)}
              </td>
              <td className="py-4 px-4">
                <div className="text-xs space-y-1">
                  {Object.entries(customer.riskFactors)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([factor, value]) => (
                      <div key={factor} className="flex justify-between items-center bg-slate-700/30 px-2 py-1 rounded">
                        <span className="text-slate-400">{factor}:</span>
                        <span className="font-medium text-slate-300">{formatPercentage(value)}</span>
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
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-slate-300">Loading analysis results...</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700/50">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Analysis</h2>
            <p className="text-slate-400">
              {error instanceof Error ? error.message : 'Failed to load churn analysis results'}
            </p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (!analysis) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700/50">
            <div className="text-slate-400 text-6xl mb-4">📄</div>
            <h2 className="text-xl font-semibold text-white mb-2">Analysis Not Found</h2>
            <p className="text-slate-400">The requested churn analysis could not be found.</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 mb-4">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-200">Churn Analysis</span>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                  Analysis Results
                </h1>
                <p className="text-slate-300">Analysis ID: {analysis?.analysisId}</p>
              </div>
              
              {analysis?.status === 'Processing' && (
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                  <Spinner size="sm" />
                  <span className="font-medium text-blue-300">Analysis in progress...</span>
                </div>
              )}
            </div>
          </div>
        </div>

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
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Spinner size="sm" />
              <div>
                <p className="font-medium text-blue-300 mb-1">Analysis in Progress</p>
                <p className="text-blue-400 text-sm">
                  {analysis?.processedCustomers?.toLocaleString()} of {analysis?.totalCustomers?.toLocaleString()} customers processed 
                  ({analysis?.progressPercentage?.toFixed(1)}%)
                </p>
                <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2 max-w-md">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${analysis?.progressPercentage || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};