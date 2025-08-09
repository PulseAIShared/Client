// src/app/routes/app/segments/segments.tsx
import React, { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { 
  SegmentsHeader,
  SegmentsList,
  SegmentCreator,
  SegmentAnalytics,
  SegmentPerformance
} from '@/features/segments/components';

type SegmentTab = 'overview' | 'create';

export const SegmentsRoute = () => {
  const [activeTab, setActiveTab] = useState<SegmentTab>('overview');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const tabs = [
    { 
      id: 'overview' as const, 
      label: 'Segments Overview', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },

    { 
      id: 'create' as const, 
      label: 'Create Segment', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <SegmentPerformance />
            <SegmentsList 
              onSelectSegment={setSelectedSegment} 
              selectedSegment={selectedSegment} 
            />
          </div>
        );
      case 'create':
        return <SegmentCreator />;
      default:
        return (
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <SegmentPerformance />
            <SegmentsList 
              onSelectSegment={setSelectedSegment} 
              selectedSegment={selectedSegment} 
            />
          </div>
        );
    }
  };

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Enhanced Header */}
        <SegmentsHeader />

        {/* Enhanced Navigation Tabs */}
        <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl overflow-hidden">
          <div className="flex flex-wrap border-b border-border-primary/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 sm:py-5 font-medium text-sm sm:text-base transition-all duration-300 border-b-2 relative overflow-hidden ${
                  activeTab === tab.id
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary/30'
                }`}
              >
                {/* Enhanced background effect for active tab */}
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                <div className="relative z-10 flex items-center gap-2 sm:gap-3">
                  <div className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {tab.icon}
                  </div>
                  <span className="whitespace-nowrap">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Enhanced Content Area */}
          <div className="p-6 sm:p-8 lg:p-10">
            {renderContent()}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};