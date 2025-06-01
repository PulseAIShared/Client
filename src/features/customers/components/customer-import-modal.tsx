// src/features/customers/components/customer-import-modal.tsx (enhanced)
import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';
import { generateImportInsights } from '@/utils/data-processor';


interface ImportedCustomer {
  name: string;
  email: string;
  plan: string;
  monthlyRevenue: number;
  subscriptionStartDate: string;
  lastActivity: string;
  companyName?: string;
  phoneNumber?: string;
}

interface CustomerImportModalProps {
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

type ImportMode = 'pulse-template' | 'hubspot' | 'salesforce' | 'pipedrive' | 'csv-mapping';

// Define CRM field mappings
const CRM_TEMPLATES = {
  'pulse-template': {
    name: 'Pulse AI Template',
    description: 'Our standard customer import format',
    fields: {
      name: 'name',
      email: 'email', 
      plan: 'plan',
      monthlyRevenue: 'monthlyRevenue',
      subscriptionStartDate: 'subscriptionStartDate',
      lastActivity: 'lastActivity',
      companyName: 'companyName',
      phoneNumber: 'phoneNumber'
    },
    requiredFields: ['name', 'email', 'plan', 'monthlyRevenue', 'subscriptionStartDate', 'lastActivity'],
    defaultMappings: {}
  },
  'hubspot': {
    name: 'HubSpot Contacts Export',
    description: 'Standard HubSpot contacts CSV export format',
    fields: {
      name: 'Full Name', // HubSpot combines first + last
      email: 'Email',
      plan: 'Subscription Type', // Custom property
      monthlyRevenue: 'Monthly Recurring Revenue', // Custom property
      subscriptionStartDate: 'Subscription Start Date', // Custom property
      lastActivity: 'Last Activity Date',
      companyName: 'Company name',
      phoneNumber: 'Phone Number'
    },
    requiredFields: ['Full Name', 'Email'],
    defaultMappings: {
      plan: 'Pro', // Default if not mapped
      monthlyRevenue: '99' // Default if not mapped
    }
  },
  'salesforce': {
    name: 'Salesforce Contacts Export', 
    description: 'Standard Salesforce contacts report format',
    fields: {
      name: 'Name', // or 'Full Name'
      email: 'Email',
      plan: 'Subscription_Type__c', // Custom field
      monthlyRevenue: 'Monthly_ARR__c', // Custom field
      subscriptionStartDate: 'Subscription_Start_Date__c', // Custom field
      lastActivity: 'LastActivityDate',
      companyName: 'Account.Name',
      phoneNumber: 'Phone'
    },
    requiredFields: ['Name', 'Email'],
    defaultMappings: {
      plan: 'Pro',
      monthlyRevenue: '99'
    }
  },
  'pipedrive': {
    name: 'Pipedrive Persons Export',
    description: 'Standard Pipedrive persons export format',
    fields: {
      name: 'Name',
      email: 'Email',
      plan: 'Subscription Plan', // Custom field
      monthlyRevenue: 'Monthly Value', // Custom field
      subscriptionStartDate: 'Start Date', // Custom field
      lastActivity: 'Last activity date',
      companyName: 'Organization',
      phoneNumber: 'Phone'
    },
    requiredFields: ['Name', 'Email'],
    defaultMappings: {
      plan: 'Pro',
      monthlyRevenue: '99'
    }
  },
  'csv-mapping': {
    name: 'CSV Mapping',
    description: 'Custom CSV mapping format',
    fields: {
      name: 'name',
      email: 'email',
      plan: 'plan',
      monthlyRevenue: 'monthlyRevenue',
      subscriptionStartDate: 'subscriptionStartDate',
      lastActivity: 'lastActivity',
      companyName: 'companyName',
      phoneNumber: 'phoneNumber'
    },
    requiredFields: ['name', 'email'],
    defaultMappings: {}
  }
};

export const CustomerImportModal: React.FC<CustomerImportModalProps> = ({ 
  onClose, 
  onImportComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [importMode, setImportMode] = useState<ImportMode>('pulse-template');
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ImportedCustomer[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<ImportedCustomer[]>([]);

  const [rawCsvData, setRawCsvData] = useState<Record<string, string>[]>([]);
  const [validationResult, setValidationResult] = useState<{
    duplicateEmails: string[];
    invalidData: Array<{ index: number; errors: string[] }>;
  } | null>(null);
  
  const { addNotification } = useNotifications();

  // Calculate insights for the import data
  interface ImportInsights {
    averageRevenue: number;
    averageTenure: number;
    newCustomers: number;
    riskDistribution: {
      high: number;
    };
  }
  
  const importInsights = useMemo<ImportInsights | null>(() => {
      if (parsedData.length === 0) return null;
      return generateImportInsights(parsedData) as ImportInsights;
    }, [parsedData]);

  const parseCSV = useCallback((csvText: string, mode: ImportMode): Record<string, string>[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        continue; // Skip malformed rows
      }

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      data.push(row);
    }

    return data;
  }, []);

  const mapDataToCustomers = useCallback((rawData: Record<string, string>[], mode: ImportMode): ImportedCustomer[] => {
    const template = CRM_TEMPLATES[mode];
    const customers: ImportedCustomer[] = [];
    const parseErrors: string[] = [];

    rawData.forEach((row, index) => {
      try {
        const customer: Partial<ImportedCustomer> = {};

        // Map fields according to template
        Object.entries(template.fields).forEach(([pulseField, sourceField]) => {
          const value = row[sourceField] || ('defaultMappings' in template ? (template.defaultMappings as Record<string, string>)[sourceField] : undefined);
          
          switch (pulseField) {
            case 'name':
              customer.name = value || `Customer ${index + 1}`;
              break;
            case 'email':
              customer.email = value;
              break;
            case 'plan':
              customer.plan = value || 'Pro';
              break;
            case 'monthlyRevenue': {
              let defaultRevenue = '99';
              if (template.defaultMappings && 'monthlyRevenue' in template.defaultMappings) {
                defaultRevenue = template.defaultMappings.monthlyRevenue;
              }
              const revenue = parseFloat(value ?? defaultRevenue);
              customer.monthlyRevenue = isNaN(revenue) ? 99 : revenue;
              break;
            }
            case 'subscriptionStartDate':
              customer.subscriptionStartDate = value || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              break;
            case 'lastActivity':
              customer.lastActivity = value || new Date().toISOString().split('T')[0];
              break;
            case 'companyName':
              customer.companyName = value;
              break;
            case 'phoneNumber':
              customer.phoneNumber = value;
              break;
          }
        });

        // Validate required fields
        if (!customer.email) {
          parseErrors.push(`Row ${index + 2}: Email is required`);
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customer.email)) {
          parseErrors.push(`Row ${index + 2}: Invalid email format "${customer.email}"`);
          return;
        }

        customers.push(customer as ImportedCustomer);
      } catch (_error) {
        parseErrors.push(`Row ${index + 2}: ${_error instanceof Error ? _error.message : 'Parse error'}`);
      }
    });

    if (parseErrors.length > 0) {
      throw new Error(`Parse errors:\n${parseErrors.join('\n')}`);
    }

    return customers;
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      addNotification({
        type: 'error',
        title: 'Invalid file type',
        message: 'Please select a CSV file'
      });
      return;
    }

    setCsvFile(file);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const rawData = parseCSV(csvText, importMode);
        const mappedCustomers = mapDataToCustomers(rawData, importMode);
        
        setRawCsvData(rawData);
        setParsedData(mappedCustomers);
        setPreviewData(mappedCustomers.slice(0, 5));
        setCurrentStep(3); // Skip to preview step
      } catch (_error) {
        setErrors([_error instanceof Error ? _error.message : 'Failed to parse CSV']);
      }
    };
    reader.readAsText(file);
  };

  const handleValidation = async () => {
    setIsValidating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const existingEmails = ['existing@example.com']; 
      const duplicateEmails = parsedData
        .map(c => c.email)
        .filter(email => existingEmails.includes(email));
      
      setValidationResult({
        duplicateEmails,
        invalidData: []
      });
      
      if (duplicateEmails.length === 0) {
        await handleImport();
      }
    } catch {
        addNotification({
          type: 'error',
          title: 'Validation failed',
          message: 'Failed to validate customer data. Please try again.'
        });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async (skipDuplicates = false) => {
    setIsUploading(true);
    try {
      let customersToImport = parsedData;
      
      if (skipDuplicates && validationResult?.duplicateEmails) {
        customersToImport = parsedData.filter(
          customer => !validationResult.duplicateEmails.includes(customer.email)
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const importedCount = customersToImport.length;
      const skippedCount = parsedData.length - importedCount;
      
      addNotification({
        type: 'success',
        title: 'Import successful',
        message: `Successfully imported ${importedCount} customers${skippedCount > 0 ? `, skipped ${skippedCount} duplicates` : ''}`
      });
      
      onImportComplete(importedCount);
      onClose();
    } catch {
      addNotification({
        type: 'error',
        title: 'Import failed',
        message: 'Failed to import customers. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = (mode: ImportMode) => {
    const template = CRM_TEMPLATES[mode];
    const headers = Object.values(template.fields);
    
    let csvContent = '';
    if (mode === 'pulse-template') {
      csvContent = [
        headers.join(','),
        'John Smith,john.smith@company.com,Pro,149.00,2023-01-15,2024-05-30,Acme Corp,+1-555-0123',
        'Jane Doe,jane.doe@startup.io,Enterprise,299.00,2022-06-01,2024-05-29,Startup Inc,+1-555-0124',
        'Mike Johnson,mike.j@techfirm.com,Basic,49.00,2023-08-20,2024-05-28,TechFirm LLC,+1-555-0125'
      ].join('\n');
    } else {
      // For CRM templates, just provide headers with one example row
      const exampleRow = headers.map(header => {
        if (header.toLowerCase().includes('email')) return 'example@company.com';
        if (header.toLowerCase().includes('name')) return 'John Smith';
        if (header.toLowerCase().includes('phone')) return '+1-555-0123';
        if (header.toLowerCase().includes('company') || header.toLowerCase().includes('organization')) return 'Acme Corp';
        if (header.toLowerCase().includes('date')) return '2024-01-15';
        if (header.toLowerCase().includes('revenue') || header.toLowerCase().includes('value')) return '149.00';
        if (header.toLowerCase().includes('plan') || header.toLowerCase().includes('type')) return 'Pro';
        return 'Sample Data';
      });
      
      csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode}-import-template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Choose Import Method
              </h3>
              <p className="text-slate-400">
                Select your data source to get the right import format
              </p>
            </div>

            {/* Import Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(CRM_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => setImportMode(key as ImportMode)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    importMode === key
                      ? 'border-blue-500 bg-blue-600/20'
                      : 'border-slate-600/50 hover:border-slate-500/50 bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      importMode === key ? 'bg-blue-500' : 'bg-slate-500'
                    }`} />
                    <div>
                      <h4 className="text-white font-medium mb-1">{template.name}</h4>
                      <p className="text-slate-400 text-sm">{template.description}</p>
                      <div className="mt-2 text-xs text-slate-500">
                        Required: {template.requiredFields.join(', ')}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Upload Your CSV File
              </h3>
              <p className="text-slate-400">
                Upload a {CRM_TEMPLATES[importMode].name} format CSV file
              </p>
            </div>

            {/* Download Template */}
     {/* Download Template */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg p-6 rounded-xl border border-blue-500/30 shadow-lg">
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            </div>
            <div className="flex-1">
            <h4 className="text-blue-400 font-semibold mb-2 text-lg">Need a template?</h4>
            <p className="text-blue-300 text-sm mb-4 leading-relaxed">
                Download our {CRM_TEMPLATES[importMode].name} template to ensure your data is formatted correctly and includes all required fields.
            </p>
            <Button 
                onClick={() => downloadTemplate(importMode)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
                Download {CRM_TEMPLATES[importMode].name} Template
            </Button>
            </div>
        </div>
        </div>

            {/* Expected Columns */}
            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50">
              <h4 className="text-white font-medium mb-3">Expected Columns</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {Object.entries(CRM_TEMPLATES[importMode].fields).map(([pulseField, sourceField]) => (
                  <div key={pulseField} className="flex items-center gap-2">
                    <svg className={`w-4 h-4 ${
                      CRM_TEMPLATES[importMode].requiredFields.includes(sourceField) 
                        ? 'text-green-400' 
                        : 'text-yellow-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        CRM_TEMPLATES[importMode].requiredFields.includes(sourceField)
                          ? "M5 13l4 4L19 7"
                          : "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      } />
                    </svg>
                    <span className="text-slate-300">{sourceField}</span>
                    {!CRM_TEMPLATES[importMode].requiredFields.includes(sourceField) && (
                      <span className="text-xs text-slate-500">(optional)</span>
                    )}
                  </div>
                ))}
              </div>
              
              {CRM_TEMPLATES[importMode].defaultMappings && (
                <div className="mt-4 p-3 bg-yellow-600/20 rounded border border-yellow-500/30">
                  <h5 className="text-yellow-400 font-medium text-sm mb-2">Default Values</h5>
                  <div className="text-xs text-yellow-300">
                    {Object.entries((CRM_TEMPLATES[importMode] as { defaultMappings?: Record<string, string> }).defaultMappings || {}).map(([field, value]) => (
                      <div key={field}>Missing {field} will default to: {value}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-white font-medium mb-2">
                  Click to upload your {CRM_TEMPLATES[importMode].name} CSV file
                </div>
                <div className="text-slate-400 text-sm">
                  Or drag and drop your file here
                </div>
              </label>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-600/20 p-4 rounded-lg border border-red-500/30">
                <h4 className="text-red-400 font-medium mb-2">Errors found:</h4>
                <div className="space-y-1 text-sm text-red-300 max-h-32 overflow-y-auto">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Preview Import Data
              </h3>
              <p className="text-slate-400">
                Review the parsed data before importing {parsedData.length} customers
              </p>
            </div>

            {/* Import Insights */}
            {importInsights && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 text-center">
                  <div className="text-lg font-bold text-green-400">
                    ${importInsights.averageRevenue.toFixed(0)}
                  </div>
                  <div className="text-sm text-slate-400">Avg Revenue</div>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {importInsights.averageTenure.toFixed(1)}mo
                  </div>
                  <div className="text-sm text-slate-400">Avg Tenure</div>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 text-center">
                  <div className="text-lg font-bold text-orange-400">
                    {importInsights.newCustomers}
                  </div>
                  <div className="text-sm text-slate-400">New (&lt;3mo)</div>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 text-center">
                  <div className="text-lg font-bold text-red-400">
                    {importInsights.riskDistribution.high}
                  </div>
                  <div className="text-sm text-slate-400">High Risk</div>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-600/20 p-4 rounded-lg border border-green-500/30 text-center">
                <div className="text-2xl font-bold text-green-400">{parsedData.length}</div>
                <div className="text-sm text-green-300">Total Customers</div>
              </div>
              <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30 text-center">
                <div className="text-2xl font-bold text-blue-400">{CRM_TEMPLATES[importMode].name}</div>
                <div className="text-sm text-blue-300">Source Format</div>
              </div>
              <div className="bg-purple-600/20 p-4 rounded-lg border border-purple-500/30 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round((csvFile?.size || 0) / 1024)}KB
                </div>
                <div className="text-sm text-purple-300">File Size</div>
              </div>
            </div>

            {/* Duplicate Warnings */}
            {validationResult && validationResult.duplicateEmails.length > 0 && (
              <div className="bg-yellow-600/20 p-4 rounded-lg border border-yellow-500/30">
                <h4 className="text-yellow-400 font-medium mb-2">
                  Duplicate Customers Found
                </h4>
                <p className="text-yellow-300 text-sm mb-3">
                  {validationResult.duplicateEmails.length} customers already exist in your database:
                </p>
                <div className="space-y-1 text-sm text-yellow-200 max-h-32 overflow-y-auto">
                  {validationResult.duplicateEmails.map((email, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {email}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleImport(true)}
                    disabled={isUploading}
                    className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors text-sm border border-yellow-500/30"
                  >
                    Skip Duplicates & Import
                  </button>
                  <button
                    onClick={() => handleImport(false)}
                    disabled={isUploading}
                    className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm border border-red-500/30"
                  >
                    Import All (Update Existing)
                  </button>
                </div>
              </div>
            )}

            {/* Data Preview */}
            <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 overflow-hidden">
              <div className="p-4 border-b border-slate-600/50">
                <h4 className="text-white font-medium">Data Preview (First 5 rows)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600/50">
                      <th className="text-left p-3 text-sm font-medium text-slate-300">Name</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-300">Email</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-300">Plan</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-300">Revenue</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-300">Start Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((customer, index) => (
                      <tr key={index} className="border-b border-slate-600/30">
                        <td className="p-3 text-white">{customer.name}</td>
                        <td className="p-3 text-slate-300">{customer.email}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
                            {customer.plan}
                          </span>
                        </td>
                        <td className="p-3 text-green-400">${customer.monthlyRevenue.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">
                          {new Date(customer.subscriptionStartDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 5 && (
                <div className="p-3 text-center text-slate-400 text-sm border-t border-slate-600/50">
                  ... and {parsedData.length - 5} more customers
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Import Customers</h2>
              <p className="text-sm text-slate-400">Bulk import from CSV or CRM exports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center gap-3 ${index < 2 ? 'flex-1' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep > step
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStep === step
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-400'
                  }`}>
                    {currentStep > step ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{step}</span>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div className={`text-sm font-medium ${
                      currentStep >= step ? 'text-white' : 'text-slate-400'
                    }`}>
                      {step === 1 ? 'Choose Source' : step === 2 ? 'Upload CSV' : 'Review & Import'}
                    </div>
                  </div>
                </div>
                {index < 2 && (
                  <div className={`hidden sm:block flex-1 h-px mx-4 ${
                    currentStep > step ? 'bg-green-500' : 'bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700/50">
          <Button
            variant="outline"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
            className="border-slate-600/50 hover:border-slate-500/50"
          >
            {currentStep > 1 ? 'Previous' : 'Cancel'}
          </Button>

          <div className="flex gap-3">
            {currentStep === 1 && (
              <Button
                onClick={() => setCurrentStep(2)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continue
              </Button>
            )}
            {currentStep === 3 && !validationResult && (
              <Button
                onClick={handleValidation}
                disabled={isValidating || parsedData.length === 0}
                isLoading={isValidating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isValidating ? 'Validating...' : `Validate & Import ${parsedData.length} Customers`}
              </Button>
            )}
            {currentStep === 3 && validationResult && validationResult.duplicateEmails.length === 0 && (
              <Button
                onClick={() => handleImport()}
                disabled={isUploading}
                isLoading={isUploading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isUploading ? 'Importing...' : `Import ${parsedData.length} Customers`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};