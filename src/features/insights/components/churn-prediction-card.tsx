import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useGetInsightsData } from '@/features/insights/api/insights';
import { RiskFactor } from '@/types/api';

export const ChurnPredictionCard = () => {
  const { data: insights, isLoading, error } = useGetInsightsData();

  if (isLoading) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-surface-secondary/50 rounded-xl w-48"></div>
            <div className="h-4 bg-surface-secondary/50 rounded-xl w-32"></div>
          </div>
          <div className="text-right space-y-2">
            <div className="h-8 bg-surface-secondary/50 rounded-xl w-16"></div>
            <div className="h-4 bg-surface-secondary/50 rounded-xl w-24"></div>
          </div>
        </div>
        
        <div className="h-64 bg-surface-secondary/50 rounded-xl mb-6"></div>
        
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 bg-surface-secondary/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-error-muted font-medium mb-2">Failed to load churn prediction data</div>
          <div className="text-sm text-text-muted mb-4">Please try refreshing the page</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error-muted transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { predictionData, riskFactors } = insights.churnPrediction;

  return (
    <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">AI Churn Prediction</h2>
          <p className="text-sm sm:text-base text-text-muted">Real-time analysis of customer retention risk</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-info-muted">8.2%</div>
          <div className="text-sm text-text-muted">Current month prediction</div>
        </div>
      </div>
      
      {/* Enhanced Prediction Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={predictionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="rgb(var(--text-muted))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="rgb(var(--text-muted))"
              fontSize={12}
              domain={[0, 12]}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface-primary)', 
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="rgb(var(--info-muted))" 
              strokeWidth={3}
              name="Predicted Churn"
              dot={{ fill: 'rgb(var(--info-muted))', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="rgb(var(--success-muted))" 
              strokeWidth={3}
              name="Actual Churn"
              dot={{ fill: 'rgb(var(--success-muted))', strokeWidth: 2, r: 4 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Risk Factors */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Top Risk Factors</h3>
        {riskFactors.slice(0, 5).map((factor: RiskFactor, index: number) => (
          <div key={index} className="group bg-surface-secondary/30 p-4 rounded-xl border border-border-primary/30 hover:border-border-secondary transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-text-primary">{factor.factor}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                factor.impact === 'High' 
                  ? 'bg-error/20 text-error border border-error/30' 
                  : factor.impact === 'Medium'
                  ? 'bg-warning/20 text-warning border border-warning/30'
                  : 'bg-success/20 text-success border border-success/30'
              }`}>
                {factor.impact}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Risk factor impact</span>
              <span className="text-lg font-bold text-text-primary">{factor.percentage}%</span>
            </div>
            <div className="mt-2 w-full bg-surface-secondary/50 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  factor.impact === 'High' ? 'bg-error' :
                  factor.impact === 'Medium' ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${Math.min(factor.percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};