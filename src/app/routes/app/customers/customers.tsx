// src/app/routes/app/customers/customers.tsx
import React from 'react';
import { ContentLayout } from '@/components/layouts';
import { CustomersTable } from '@/features/customers/components';

export const CustomersRoute = () => {
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
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm">
                  Export Data
                </button>
                <button className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium text-sm border border-slate-600/50">
                  Add Customer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Table - Now handles its own data fetching and filtering */}
        <CustomersTable />
      </div>
    </ContentLayout>
  );
};