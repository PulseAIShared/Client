import { ChurnRiskData } from '@/types/api';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface ChurnRiskChartProps {
  data: ChurnRiskData[];
}

export const ChurnRiskChart: React.FC<ChurnRiskChartProps> = ({ data }) => {
  return (
    <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Churn Risk Predictor</h2>
          <p className="text-sm text-slate-400">AI-powered risk analysis</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-cyan-400">8.2%</div>
          <div className="text-sm text-slate-400">Current risk</div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="week" 
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              domain={[2, 12]}
              tickFormatter={(value) => `${value}%`}
            />
            <Line 
              type="monotone" 
              dataKey="risk" 
              stroke="#06b6d4" 
              strokeWidth={3}
              dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-green-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Trend improving</span>
        </div>
        <div className="text-slate-400">
          Last updated: 2 mins ago
        </div>
      </div>
    </div>
  );
};