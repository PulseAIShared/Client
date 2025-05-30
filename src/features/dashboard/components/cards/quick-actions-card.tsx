
export const QuickActionsCard = () => {
  return (
    <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-2xl border border-blue-500/30">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Quick Actions</h3>
          <p className="text-slate-300">Take immediate action on your highest risk customers</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium">
            Send Recovery Campaign
          </button>
          <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};