import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { useGetCampaigns } from '@/features/campaigns/api/campaigns';
import { CampaignsHeader } from '@/features/campaigns/components';

export const CampaignsRoute = () => {
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
        return 'bg-success/20 text-success border-success/30';
      case 'draft':
        return 'bg-surface-secondary/20 text-text-muted border-text-muted/30';
      case 'paused':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'completed':
        return 'bg-accent-primary/20 text-accent-primary border-accent-primary/30';
      default:
        return 'bg-surface-secondary/20 text-text-secondary border-border-primary/30';
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <p className="text-text-secondary font-medium">Loading campaigns...</p>
            <p className="text-text-muted text-sm">Preparing your campaign data</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <CampaignsHeader />

        {/* Enhanced Filters */}
        <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border-primary/30 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  placeholder="Search campaigns..."
                  className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
                />
                <svg className="absolute right-3 top-3.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
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
                className="w-full px-4 py-3 bg-surface-secondary/50 hover:bg-surface-secondary/80 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-text-primary border border-border-primary/30 rounded-xl font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-12 border border-border-primary/30 shadow-xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-surface-secondary/50 to-surface-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3">No campaigns yet</h3>
            <p className="text-text-muted mb-8 max-w-md mx-auto">
              Create your first campaign to start engaging with your customer segments and drive better retention.
            </p>
            <Link 
              to="/app/campaigns/create"
              className="inline-block px-8 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold"
            >
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="group bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border-primary/30 shadow-xl hover:border-accent-primary/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="p-3 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      {getTypeIcon(campaign.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
                        {campaign.name}
                      </h3>
                      {campaign.description && (
                        <p className="text-text-muted text-sm sm:text-base mb-3">{campaign.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 11h.01m-.01 4h.01M19 7h.01m-.01 4h.01M19 11h.01m-.01 4h.01" />
                          </svg>
                          {campaign.type}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {campaign.trigger}
                        </span>
                        {campaign.segmentId && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Segment ID: {campaign.segmentId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <button className="px-4 py-2 text-sm bg-surface-secondary/50 hover:bg-surface-secondary/80 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-text-primary border border-border-primary/30 rounded-xl font-medium">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Enhanced Campaign Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 sm:gap-6 pt-6 border-t border-border-primary/30">
                  <div className="text-center p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30">
                    <div className="text-lg sm:text-xl font-semibold text-text-primary">
                      {campaign.sentCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-text-muted">Sent</div>
                  </div>
                  <div className="text-center p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30">
                    <div className="text-lg sm:text-xl font-semibold text-text-primary">
                      {campaign.openedCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-text-muted">Opened</div>
                  </div>
                  <div className="text-center p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30">
                    <div className="text-lg sm:text-xl font-semibold text-text-primary">
                      {campaign.clickedCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-text-muted">Clicked</div>
                  </div>
                  <div className="text-center p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30">
                    <div className="text-lg sm:text-xl font-semibold text-text-primary">
                      {campaign.convertedCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-text-muted">Converted</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-success/20 to-success-muted/20 rounded-xl border border-success/30">
                    <div className="text-lg sm:text-xl font-semibold text-success">
                      ${campaign.revenueRecovered.toLocaleString()}
                    </div>
                    <div className="text-xs text-text-muted">Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-xl border border-accent-primary/30">
                    <div className="text-lg sm:text-xl font-semibold text-accent-primary">
                      {campaign.sentCount > 0 ? ((campaign.convertedCount / campaign.sentCount) * 100).toFixed(1) : '0'}%
                    </div>
                    <div className="text-xs text-text-muted">Conversion</div>
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