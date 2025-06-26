// src/app/routes/app/customers/customers.tsx (updated for background import)
import React, { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { CustomersTable } from '@/features/customers/components';
import { CustomerImportModal } from '@/features/customers/components/customer-import-modal';
import { useNotifications } from '@/components/ui/notifications';
import { useGetImportHistory } from '@/features/customers/api/import';
import { ImportHistoryModal } from '@/features/customers/components/import-history-modal';

export const CustomersRoute = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportHistory, setShowImportHistory] = useState(false);
  const { addNotification } = useNotifications();
  
  // Get recent import history
  const { data: importHistory } = useGetImportHistory({ page: 1, pageSize: 5 });
console.log(importHistory);
  const handleImportStarted = () => {
    addNotification({
      type: 'info',
      title: 'Import job started',
      message: 'Your customer import is being processed. You will receive notifications as it progresses.'
    });
    
    // Optionally refresh the import history
    // refetch();
  };

  return (
    <ContentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gradient-from to-gradient-to rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-surface-primary backdrop-blur-lg p-6 rounded-2xl border border-border-primary shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-accent-secondary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-secondary/30 mb-4">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-accent-secondary">Customer Management</span>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
                  Customers Overview
                </h1>
                <p className="text-text-secondary">
                  Monitor customer behavior, churn risk, and lifetime value
                </p>
              </div>
              
              {/* Mobile-First Button Layout */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Primary Action - Always Prominent */}
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="order-1 w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-text-primary rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="hidden sm:inline">Import Customers</span>
                  <span className="sm:hidden">Import</span>
                </button>
                
                {/* Secondary Actions */}
                <div className="order-2 flex flex-row gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowImportHistory(true)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 bg-surface-secondary text-text-primary rounded-lg hover:bg-surface-secondary/80 transition-colors font-medium text-sm border border-border-primary flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="hidden sm:inline">Import History</span>
                    <span className="sm:hidden">History</span>
                  </button>
                  <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 bg-surface-secondary text-text-primary rounded-lg hover:bg-surface-secondary/80 transition-colors font-medium text-sm border border-border-primary flex items-center justify-center gap-2 whitespace-nowrap">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Export Data</span>
                    <span className="sm:hidden">Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

   

        {/* Customers Table */}
        <CustomersTable />

        {/* Import Modal */}
        {showImportModal && (
          <CustomerImportModal
            onClose={() => setShowImportModal(false)}
            onImportStarted={handleImportStarted}
          />
        )}

        {/* Import History Modal */}
        {showImportHistory && (
          <ImportHistoryModal
            onClose={() => setShowImportHistory(false)}
          />
        )}
      </div>
    </ContentLayout>
  );
};

