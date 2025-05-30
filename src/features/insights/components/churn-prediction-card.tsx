import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const predictionData = [
  { month: 'Jan', predicted: 8.2, actual: 7.9 },
  { month: 'Feb', predicted: 7.8, actual: 8.1 },
  { month: 'Mar', predicted: 6.5, actual: 6.8 },
  { month: 'Apr', predicted: 9.1, actual: 8.9 },
  { month: 'May', predicted: 8.2, actual: null },
  { month: 'Jun', predicted: 7.6, actual: null },
];

const riskFactors = [
  { factor: 'Payment Failures', impact: 'High', percentage: 85, color: 'text-red-400' },
  { factor: 'Low Engagement', impact: 'High', percentage: 78, color: 'text-red-400' },
  { factor: 'Support Tickets', impact: 'Medium', percentage: 62, color: 'text-orange-400' },
  { factor: 'Feature Usage', impact: 'Medium', percentage: 56, color: 'text-orange-400' },
  { factor: 'Login Frequency', impact: 'Low', percentage: 34, color: 'text-yellow-400' },
];

export const ChurnPredictionCard = () => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">AI Churn Prediction</h2>
          <p className="text-sm text-slate-400">Real-time analysis of customer retention risk</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-cyan-400">8.2%</div>
          <div className="text-sm text-slate-400">Current month prediction</div>
        </div>
      </div>
      
      {/* Prediction Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={predictionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              domain={[0, 12]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#06b6d4" 
              strokeWidth={3}
              name="Predicted Churn"
              dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Actual Churn"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Factors */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Top Risk Factors</h3>
        {riskFactors.map((factor, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                factor.impact === 'High' ? 'bg-red-500' :
                factor.impact === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500'
              }`} />
              <span className="text-white font-medium">{factor.factor}</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                factor.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                factor.impact === 'Medium' ? 'bg-orange-500/20 text-orange-400' : 
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {factor.impact}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 bg-slate-600/50 rounded-full h-2">
                <div 
                  className={`h-full rounded-full ${
                    factor.impact === 'High' ? 'bg-red-500' :
                    factor.impact === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${factor.percentage}%` }}
                />
              </div>
              <span className={`font-semibold ${factor.color}`}>{factor.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-green-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>87.3% prediction accuracy</span>
          </div>
          <div className="text-slate-400">
            Model updated: 5 mins ago
          </div>
        </div>
      </div>
    </div>
  );
};