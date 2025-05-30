
export interface StatCardProps {
  title: string;
  value: string;
  color?: string;
  bgGradient?: string;
}
export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  color = 'text-white', 
  bgGradient = 'from-slate-700 to-slate-800' 
}) => (
  <div className={`bg-gradient-to-br ${bgGradient} p-6 rounded-2xl border border-slate-600/30 shadow-lg`}>
    <h3 className="text-slate-300 text-sm font-medium mb-2">{title}</h3>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);