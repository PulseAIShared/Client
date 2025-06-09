import { ContentLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/components/ui/notifications";
import { useCheckChurnDataCompleteness, useRunChurnAnalysis } from "@/features/analytics/api/churn-analysis";
import { CompletenessDataResponse } from "@/types/api";
import { useEffect, useState } from "react";

export const RunChurnAnalysisRoute = () => {
  const [step, setStep] = useState<'loading' | 'selection' | 'started'>('loading');
  const [completenessData, setCompletenessData] = useState<CompletenessDataResponse | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [analysisStarted, setAnalysisStarted] = useState(false);
  
  const { addNotification } = useNotifications();

  const checkCompleteness = useCheckChurnDataCompleteness({
    mutationConfig: {
      onSuccess: (data) => {
        setCompletenessData(data);
        setStep('selection');
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Failed to check data completeness',
          message: error instanceof Error ? error.message : 'Please try again'
        });
      }
    }
  });

  const runAnalysis = useRunChurnAnalysis({
    mutationConfig: {
      onSuccess: (data) => {
        setAnalysisStarted(true);
        setStep('started');
        addNotification({
          type: 'success',
          title: 'Churn Analysis Started',
          message: `Analysis is processing ${selectedCustomers.size} customers. You'll receive a notification when complete.`
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Failed to start churn analysis',
          message: error instanceof Error ? error.message : 'Please try again'
        });
      }
    }
  });

  useEffect(() => {
    // Automatically start checking completeness when component mounts
    checkCompleteness.mutate({ customerIds: [] }); // Empty array to check all customers
  }, []);

  const handleCustomerToggle = (customerId: string) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const handleSelectAllEligible = () => {
    if (!completenessData) return;
    
    const allEligibleIds = new Set(completenessData.eligibleCustomers.map(c => c.customerId));
    setSelectedCustomers(allEligibleIds);
  };

  const handleDeselectAll = () => {
    setSelectedCustomers(new Set());
  };

  const handleStartAnalysis = () => {
    if (selectedCustomers.size === 0) {
      addNotification({
        type: 'warning',
        title: 'No customers selected',
        message: 'Please select at least one customer for analysis'
      });
      return;
    }

    runAnalysis.mutate({
      customerIds: Array.from(selectedCustomers),
      includeRecommendations: true,
      includeRiskFactors: true
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  if (step === 'loading') {
    return (
      <ContentLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
            
            <div className="relative bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                
                <div>
                  <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-400/30 mb-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-200">AI Analysis</span>
                  </div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Checking Data Completeness
                  </h1>
                  <p className="text-slate-300 mt-1">
                    Analyzing customer data quality for churn prediction accuracy
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Evaluating Customer Data</h3>
              <p className="text-slate-300 mb-6">
                Our AI is analyzing the completeness and quality of your customer data to ensure accurate churn predictions.
              </p>
              
              <div className="space-y-3 text-sm text-slate-400 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Checking core profile data</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Analyzing payment and subscription history</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>Evaluating engagement metrics</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span>Reviewing support interactions</span>
                </div>
              </div>

              {checkCompleteness.isPending && (
                <div className="text-blue-400 font-medium">This may take a moment...</div>
              )}
            </div>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (step === 'started') {
    return (
      <ContentLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-2xl blur-3xl"></div>
            
            <div className="relative bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div>
                  <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-green-400/30 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-200">Analysis Started</span>
                  </div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
                    Churn Analysis in Progress
                  </h1>
                  <p className="text-slate-300 mt-1">
                    AI is analyzing {selectedCustomers.size} customers for churn risk
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Success Content */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-lg p-8 rounded-2xl border border-green-500/30 shadow-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                Churn Analysis Successfully Started
              </h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Our advanced AI algorithms are now analyzing the selected customers to predict churn risk and identify key intervention opportunities.
              </p>

              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{selectedCustomers.size}</div>
                    <div className="text-sm text-slate-400">Customers Analyzing</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">AI</div>
                    <div className="text-sm text-slate-400">Advanced Modeling</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">Real-time</div>
                    <div className="text-sm text-slate-400">Progress Updates</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-300 mb-8">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Real-time notifications will keep you updated on progress</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Analysis results will include detailed risk scores and recommendations</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>You can continue working - we'll notify you when complete</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.history.back()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Continue Working
                </Button>
                <Button 
                  variant="outline"
                  className="border-slate-600/50 hover:border-blue-500/50 hover:text-blue-400"
                >
                  View Analytics Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                
                <div>
                  <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-purple-200">AI Churn Analysis</span>
                  </div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Select Customers for Analysis
                  </h1>
                  <p className="text-slate-300 mt-1">
                    Choose customers with sufficient data quality for accurate predictions
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {selectedCustomers.size > 0 && (
                  <Button
                    onClick={handleStartAnalysis}
                    disabled={runAnalysis.isPending}
                    isLoading={runAnalysis.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {runAnalysis.isPending ? 'Starting Analysis...' : `Analyze ${selectedCustomers.size} Customers`}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {completenessData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 shadow-lg">
              <div className="text-2xl font-bold text-white">{completenessData.summary.totalCustomers}</div>
              <div className="text-sm text-slate-400">Total Customers</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 shadow-lg">
              <div className="text-2xl font-bold text-green-400">{completenessData.summary.eligibleCustomersCount}</div>
              <div className="text-sm text-slate-400">Eligible for Analysis</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 shadow-lg">
              <div className="text-2xl font-bold text-red-400">{completenessData.summary.ineligibleCustomersCount}</div>
              <div className="text-sm text-slate-400">Need Data Improvement</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg p-4 rounded-2xl border border-slate-700/50 shadow-lg">
              <div className="text-2xl font-bold text-blue-400">{Math.round(completenessData.summary.averageCompletenessScore)}%</div>
              <div className="text-sm text-slate-400">Avg. Data Quality</div>
            </div>
          </div>
        )}

        {/* Eligible Customers */}
        {completenessData && completenessData.eligibleCustomers.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    Eligible Customers ({completenessData.eligibleCustomers.length})
                  </h2>
                  <p className="text-slate-400 text-sm">
                    These customers have sufficient data quality for accurate churn prediction
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {selectedCustomers.size > 0 && (
                    <span className="text-sm text-blue-400">
                      {selectedCustomers.size} selected
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectedCustomers.size === completenessData.eligibleCustomers.length ? handleDeselectAll : handleSelectAllEligible}
                    className="border-slate-600/50 hover:border-blue-500/50"
                  >
                    {selectedCustomers.size === completenessData.eligibleCustomers.length ? 'Deselect All' : 'Select All Eligible'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.size === completenessData.eligibleCustomers.length && completenessData.eligibleCustomers.length > 0}
                        onChange={selectedCustomers.size === completenessData.eligibleCustomers.length ? handleDeselectAll : handleSelectAllEligible}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-slate-300 uppercase tracking-wider">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-300 uppercase tracking-wider">Overall Score</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-300 uppercase tracking-wider">Core Profile</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-300 uppercase tracking-wider">Payment Data</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-300 uppercase tracking-wider">Engagement</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-300 uppercase tracking-wider">Support Data</th>
                  </tr>
                </thead>
                <tbody>
                  {completenessData.eligibleCustomers.map((customer) => (
                    <tr 
                      key={customer.customerId}
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.has(customer.customerId)}
                          onChange={() => handleCustomerToggle(customer.customerId)}
                          className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-white">{customer.customerName}</div>
                          <div className="text-sm text-slate-400">{customer.customerEmail}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(customer.overallCompletenessScore)}`}>
                          {Math.round(customer.overallCompletenessScore)}%
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-300">{Math.round(customer.categoryScores.coreProfile)}%</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-300">{Math.round(customer.categoryScores.paymentData)}%</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-300">{Math.round(customer.categoryScores.engagementData)}%</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-300">{Math.round(customer.categoryScores.supportData)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ineligible Customers */}
        {completenessData && completenessData.ineligibleCustomers.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    Customers Needing Data Improvement ({completenessData.ineligibleCustomers.length})
                  </h2>
                  <p className="text-slate-400 text-sm">
                    These customers need additional data to ensure accurate predictions
                  </p>
                </div>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium border border-red-500/30">
                  Not Eligible
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {completenessData.ineligibleCustomers.map((customer) => (
                  <div 
                    key={customer.customerId}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium text-white">{customer.customerName}</div>
                        <div className="text-sm text-slate-400">{customer.customerEmail}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(customer.overallCompletenessScore)}`}>
                        {Math.round(customer.overallCompletenessScore)}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Missing Data Categories:</h4>
                        <div className="flex flex-wrap gap-2">
                          {customer.missingDataCategories.map((category, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs border border-red-500/30"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Recommended Actions:</h4>
                        <div className="space-y-1">
                          {customer.recommendedActions.slice(0, 3).map((action, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                              <span className="text-slate-300">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {completenessData && completenessData.recommendedActions.length > 0 && (
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-lg p-6 rounded-2xl border border-orange-500/30 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Recommendations to Improve Data Quality
            </h3>
            
            <div className="space-y-3">
              {completenessData.recommendedActions.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">{action}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button 
                variant="outline"
                className="border-orange-500/50 text-orange-400 hover:border-orange-400/50 hover:bg-orange-600/10"
              >
                View Data Quality Guide
              </Button>
              <Button 
                variant="outline"
                className="border-slate-600/50 hover:border-blue-500/50 hover:text-blue-400"
              >
                Connect More Data Sources
              </Button>
            </div>
          </div>
        )}

        {/* No Eligible Customers Message */}
        {completenessData && completenessData.eligibleCustomers.length === 0 && (
          <div className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700/50 shadow-lg text-center">
            <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Customers Ready for Analysis</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              All customers need additional data to ensure accurate churn predictions. Follow the recommendations above to improve data quality before running analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Import More Data
              </Button>
              <Button 
                variant="outline"
                className="border-slate-600/50 hover:border-blue-500/50 hover:text-blue-400"
              >
                Connect Integrations
              </Button>
            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};