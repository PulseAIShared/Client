// src/features/dashboard/components/charts/churn-risk-chart.tsx

import { ChurnRiskData } from '@/types/api';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';


interface ChurnRiskChartProps {
  data: ChurnRiskData[];
}

export const ChurnRiskChart: React.FC<ChurnRiskChartProps> = ({ data }) => {
  return (
    <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/30 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Churn Risk Predictor</h2>
        <div className="text-3xl font-bold text-cyan-400">8.2%</div>
      </div>
      <div className="h-64">
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
    </div>
  );
};