// src/app/routes/app/customers/customers.tsx (updated)
import React, { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { CustomersTable } from '@/features/customers/components';
import { CustomerImportModal } from '@/features/customers/components/customer-import-modal';
import { useNotifications } from '@/components/ui/notifications';

export const CustomersRoute = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const { addNotification } = useNotifications();

  const handleImportComplete = (count: number) => {
    addNotification({
      type: 'success',
      title: 'Import completed',
      message: `Successfully imported ${count} customers. The data will be processed and analyzed for churn risk.`
    });
    
    // In real app, you might want to refetch the customers data here
    // refetch();
  };

  return (
    <ContentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-200">Customer Management</span>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                  Customers Overview
                </h1>
                <p className="text-slate-300">
                  Monitor customer behavior, churn risk, and lifetime value
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium text-sm border border-slate-600/50">
                  Export Data
                </button>
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Import Customers
                </button>
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
            onImportComplete={handleImportComplete}
          />
        )}
      </div>
    </ContentLayout>
  );
};