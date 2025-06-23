import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useGetChurnPredictionData } from '@/features/insights/api/insights';
import { RiskFactor } from '@/types/api';

export const ChurnPredictionCard = () => {
  const { data, isLoading, error } = useGetChurnPredictionData();

  if (isLoading) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-surface-secondary rounded w-48"></div>
            <div className="h-4 bg-surface-secondary rounded w-32"></div>
          </div>
          <div className="text-right space-y-2">
            <div className="h-8 bg-surface-secondary rounded w-16"></div>
            <div className="h-4 bg-surface-secondary rounded w-24"></div>
          </div>
        </div>
        
        <div className="h-64 bg-surface-secondary rounded mb-6"></div>
        
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 bg-surface-secondary rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-error-muted mb-2">Failed to load churn prediction data</div>
          <div className="text-text-muted text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  const { data: predictionData, riskFactors } = data;

  return (
    <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-1">AI Churn Prediction</h2>
          <p className="text-sm text-text-muted">Real-time analysis of customer retention risk</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-info-muted">8.2%</div>
          <div className="text-sm text-text-muted">Current month prediction</div>
        </div>
      </div>
      
      {/* Prediction Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={predictionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" />
            <XAxis 
              dataKey="month" 
              stroke="rgb(var(--text-muted))"
              fontSize={12}
            />
            <YAxis 
              stroke="rgb(var(--text-muted))"
              fontSize={12}
              domain={[0, 12]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgb(var(--surface-secondary))', 
                border: '1px solid rgb(var(--border-primary))',
                borderRadius: '8px',
                color: 'rgb(var(--text-primary))'
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

      {/* Risk Factors */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Top Risk Factors</h3>

        {riskFactors.map((factor: RiskFactor, index: number) => (
          <div key={index} className="flex items-center justify-between p-3 bg-surface-secondary/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                factor.impact === 'High' ? 'bg-error' :
                factor.impact === 'Medium' ? 'bg-warning' : 'bg-warning-muted'
              }`} />
              <span className="text-text-primary font-medium">{factor.factor}</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                factor.impact === 'High' ? 'bg-error/20 text-error-muted' :
                factor.impact === 'Medium' ? 'bg-warning/20 text-warning-muted' : 
                'bg-warning-muted/20 text-warning-muted'
              }`}>
                {factor.impact}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 bg-border-primary/50 rounded-full h-2">
                <div 
                  className={`h-full rounded-full ${
                    factor.impact === 'High' ? 'bg-error' :
                    factor.impact === 'Medium' ? 'bg-warning' : 'bg-warning-muted'
                  }`}
                  style={{ width: `${factor.percentage}%` }}
                />
              </div>
              <span className={`font-semibold ${factor.color}`}>{factor.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border-primary/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-success-muted">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>87.3% prediction accuracy</span>
          </div>
          <div className="text-text-muted">
            Model updated: 5 mins ago
          </div>
        </div>
      </div>
    </div>
  );
};