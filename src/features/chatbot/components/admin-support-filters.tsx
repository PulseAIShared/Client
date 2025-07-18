import React from 'react';

interface AdminSupportFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const AdminSupportFilters: React.FC<AdminSupportFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="bg-surface-primary border border-border-primary rounded-lg p-4">
      <h3 className="text-lg font-medium text-text-primary mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic or email..."
              className="w-full pl-10 pr-4 py-2 border border-border-primary rounded-lg bg-bg-primary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-border-primary rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Waiting for Admin</option>
            <option value="AiActive">AI Assistant Active</option>
            <option value="AdminActive">With Admin</option>
            <option value="Closed">Closed</option>
            <option value="TimedOut">Timed Out</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 border border-border-primary rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => {
            setStatusFilter('Pending');
            setPriorityFilter('');
          }}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            statusFilter === 'Pending' 
              ? 'bg-accent-primary text-white' 
              : 'bg-surface-secondary text-text-primary hover:bg-surface-primary'
          }`}
        >
          Needs Attention
        </button>
        <button
          onClick={() => {
            setStatusFilter('');
            setPriorityFilter('Critical');
          }}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            priorityFilter === 'Critical' 
              ? 'bg-error text-white' 
              : 'bg-surface-secondary text-text-primary hover:bg-surface-primary'
          }`}
        >
          Critical Priority
        </button>
        <button
          onClick={() => {
            setStatusFilter('AdminActive');
            setPriorityFilter('');
          }}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            statusFilter === 'AdminActive' 
              ? 'bg-success text-white' 
              : 'bg-surface-secondary text-text-primary hover:bg-surface-primary'
          }`}
        >
          Active Chats
        </button>
        <button
          onClick={() => {
            setStatusFilter('');
            setPriorityFilter('');
            setSearchQuery('');
          }}
          className="px-3 py-1 rounded-full text-sm bg-surface-secondary text-text-primary hover:bg-surface-primary transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};