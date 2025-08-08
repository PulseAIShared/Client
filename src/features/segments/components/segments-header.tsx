// src/features/segments/components/segments-header.tsx
import React from 'react';

export const SegmentsHeader = () => {
  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>
      
      <div className="relative bg-surface-secondary/50 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-border-primary/50 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
              Customer Segments
            </h1>
            <p className="text-text-secondary text-sm sm:text-base lg:text-lg">
              AI-powered customer segmentation for targeted retention strategies
            </p>
          </div>
          
          {/* Mobile: Quick stats in a responsive grid */}
          <div className="lg:hidden grid grid-cols-2 gap-3 mt-3">
            <div className="bg-surface-primary/30 p-3 rounded-lg border border-border-primary/30 text-center">
              <div className="text-lg sm:text-xl font-bold text-success-muted">-34%</div>
              <div className="text-xs text-text-muted">churn reduction</div>
            </div>
            <div className="bg-surface-primary/30 p-3 rounded-lg border border-border-primary/30 text-center">
              <div className="text-lg sm:text-xl font-bold text-accent-primary">12</div>
              <div className="text-xs text-text-muted">active segments</div>
            </div>
          </div>
          
          {/* Desktop: Quick stats in sidebar format */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-success-muted">-34%</div>
              <div className="text-sm text-text-muted">avg churn reduction</div>
            </div>
            <div className="w-px h-12 bg-border-primary"></div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent-primary">12</div>
              <div className="text-sm text-text-muted">active segments</div>
            </div>
          </div>
        </div>
        
        {/* Quick action buttons - responsive layout */}
        <div className="mt-4 sm:mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <button className="w-full px-4 py-2.5 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Create AI Segment</span>
              <span className="sm:hidden">Create</span>
            </button>
            <button className="w-full px-4 py-2.5 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-primary/50 transition-colors font-medium text-sm border border-border-primary/50 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span className="hidden sm:inline">Import Segments</span>
              <span className="sm:hidden">Import</span>
            </button>
            <button className="w-full px-4 py-2.5 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-primary/50 transition-colors font-medium text-sm border border-border-primary/50 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export Analysis</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};