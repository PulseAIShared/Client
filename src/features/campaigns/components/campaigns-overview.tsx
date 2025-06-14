import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { useGetCampaigns } from '../api/campaigns';

export const CampaignsOverview = () => {
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    searchTerm: '',
  });

  const { data: campaignsResponse, isLoading } = useGetCampaigns(filters);
  const campaigns = campaignsResponse?.data || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'sms':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5V17z" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Campaigns</h1>
            <p className="text-slate-400 mt-1">
              Manage your customer engagement campaigns
            </p>
          </div>
          <Link 
            to="/app/campaigns/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Campaign
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                placeholder="Search campaigns..."
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in-app">In-App</option>
                <option value="push">Push</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', type: '', searchTerm: '' })}
                className="w-full px-3 py-2 bg-slate-600/50 hover:bg-slate-500/50 text-white border border-slate-600/50 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700/50 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No campaigns yet</h3>
            <p className="text-slate-400 mb-6">
              Create your first campaign to start engaging with your customer segments.
            </p>
            <Link 
              to="/app/campaigns/create"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-700/50 rounded-lg">
                      {getTypeIcon(campaign.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {campaign.name}
                      </h3>
                      {campaign.description && (
                        <p className="text-slate-400 text-sm mb-2">{campaign.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Type: {campaign.type}</span>
                        <span>•</span>
                        <span>Trigger: {campaign.trigger}</span>
                        {campaign.segmentId && (
                          <>
                            <span>•</span>
                            <span>Segment ID: {campaign.segmentId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <button className="px-3 py-1 text-sm bg-slate-600/50 hover:bg-slate-500/50 text-white border border-slate-600/50 rounded transition-colors">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Campaign Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 border-t border-slate-700/50">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">
                      {campaign.sentCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">
                      {campaign.openedCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Opened</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">
                      {campaign.clickedCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Clicked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">
                      {campaign.convertedCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Converted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-400">
                      ${campaign.revenueRecovered.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">
                      {campaign.sentCount > 0 ? ((campaign.convertedCount / campaign.sentCount) * 100).toFixed(1) : '0'}%
                    </div>
                    <div className="text-xs text-slate-400">Conversion</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ContentLayout>
  );
};