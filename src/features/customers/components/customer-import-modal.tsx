// src/features/customers/components/customer-import-modal.tsx
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';
import { useUploadImport } from '@/features/customers/api/import';
import { useRealTimeImportUpdates } from '@/hooks/useRealTimeNotifications';

interface CustomerImportModalProps {
  onClose: () => void;
  onImportStarted: () => void;
}

type ImportMode = 'pulse-template' | 'hubspot' | 'salesforce' | 'pipedrive' | 'csv-mapping';

// Define CRM field mappings
const CRM_TEMPLATES = {
  'pulse-template': {
    name: 'Pulse AI Template',
    description: 'Our standard customer import format',
    requiredFields: ['name', 'email', 'plan', 'monthlyRevenue', 'subscriptionStartDate', 'lastActivity'],
  },
  'hubspot': {
    name: 'HubSpot Contacts Export',
    description: 'Standard HubSpot contacts CSV export format',
    requiredFields: ['Full Name', 'Email'],
  },
  'salesforce': {
    name: 'Salesforce Contacts Export', 
    description: 'Standard Salesforce contacts report format',
    requiredFields: ['Name', 'Email'],
  },
  'pipedrive': {
    name: 'Pipedrive Persons Export',
    description: 'Standard Pipedrive persons export format',
    requiredFields: ['Name', 'Email'],
  },
  'csv-mapping': {
    name: 'CSV Mapping',
    description: 'Custom CSV mapping format',
    requiredFields: ['name', 'email'],
  }
};

export const CustomerImportModal: React.FC<CustomerImportModalProps> = ({ 
  onClose, 
  onImportStarted 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [importMode, setImportMode] = useState<ImportMode>('pulse-template');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importJobId, setImportJobId] = useState<string | null>(null);
  
  const { addNotification } = useNotifications();
  const uploadImport = useUploadImport();

  // Hook to receive real-time import updates
  useRealTimeImportUpdates(importJobId || undefined);

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
    setCurrentStep(3); // Skip preview for now, go straight to upload
  };

  const handleUpload = async (skipDuplicates = false) => {
    if (!csvFile) {
      addNotification({
        type: 'error',
        title: 'No file selected',
        message: 'Please select a file to upload'
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('importSource', importMode);
      formData.append('skipDuplicates', skipDuplicates.toString());

      const result = await uploadImport.mutateAsync(formData);
      
      setImportJobId(result.importJobId);
      setCurrentStep(4);
      
      addNotification({
        type: 'info',
        title: 'Import Started',
        message: 'Your file is being processed. Real-time updates will show progress automatically.'
      });

      onImportStarted();

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Upload failed',
        message: error instanceof Error ? error.message : 'Failed to upload file'
      });
    }
  };

  const downloadTemplate = (mode: ImportMode) => {
    const template = CRM_TEMPLATES[mode];
    let csvContent = '';
    
    if (mode === 'pulse-template') {
      csvContent = [
        'name,email,plan,monthlyRevenue,subscriptionStartDate,lastActivity,companyName,phoneNumber',
        'John Smith,john.smith@company.com,Pro,149.00,2023-01-15,2024-05-30,Acme Corp,+1-555-0123',
        'Jane Doe,jane.doe@startup.io,Enterprise,299.00,2022-06-01,2024-05-29,Startup Inc,+1-555-0124',
        'Mike Johnson,mike.j@techfirm.com,Basic,49.00,2023-08-20,2024-05-28,TechFirm LLC,+1-555-0125'
      ].join('\n');
    } else {
      // Generic template for other modes
      csvContent = [
        'Full Name,Email,Company,Plan,Monthly Revenue,Start Date,Last Activity',
        'John Smith,john@example.com,Acme Corp,Pro,149.00,2023-01-15,2024-05-30',
        'Jane Doe,jane@example.com,Startup Inc,Enterprise,299.00,2022-06-01,2024-05-29'
      ].join('\n');
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
                    Download our {CRM_TEMPLATES[importMode].name} template to ensure your data is formatted correctly.
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Ready to Import
              </h3>
              <p className="text-slate-400">
                File selected: {csvFile?.name}
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
              <h4 className="text-white font-medium mb-4">Import Settings</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <div className="text-white font-medium">Skip Duplicates</div>
                    <div className="text-sm text-slate-400">Skip customers that already exist based on email (if this is off, then this will update the existing users) </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
                  <h5 className="text-blue-400 font-medium mb-2">What happens next?</h5>
                  <div className="text-blue-300 text-sm space-y-1">
                    <p>• File will be validated for format and data quality</p>
                    <p>• Real-time progress updates via notifications</p>
                    <p>• Customer data refreshes automatically when complete</p>
                    <p>• You can continue working - no need to wait</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Import Started Successfully
              </h3>
              <p className="text-slate-400">
                Your import is being processed with real-time updates
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-lg p-8 rounded-xl border border-green-500/30 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h4 className="text-xl font-bold text-white mb-2">Import Job Created</h4>
              <p className="text-slate-300 mb-4">
                Your file has been uploaded and processing is starting automatically.
              </p>
              
              {importJobId && (
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Import Job ID:</span>
                    <code className="text-blue-400 bg-slate-800/50 px-2 py-1 rounded font-mono">
                      {importJobId}
                    </code>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>File uploaded and validation started</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Real-time updates enabled - you'll see progress instantly</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Customer data will refresh automatically when complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Notifications will show progress and completion status</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30">
              <h5 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Real-Time Updates
              </h5>
              <div className="text-blue-300 text-sm space-y-1">
                <p>• Progress updates appear instantly via SignalR</p>
                <p>• Customer data refreshes automatically on completion</p>
                <p>• No need to manually refresh or check status</p>
                <p>• Notifications will alert you of important milestones</p>
              </div>
            </div>

            <div className="bg-purple-600/20 p-4 rounded-lg border border-purple-500/30">
              <h5 className="text-purple-400 font-medium mb-2">What's happening now?</h5>
              <div className="text-purple-300 text-sm space-y-1">
                <p>• File is being validated for data quality and format</p>
                <p>• Duplicate detection is running based on your settings</p>
                <p>• Processing will begin automatically after validation</p>
                <p>• You can safely close this modal - updates continue in the background</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { id: 1, title: 'Choose Source', description: 'Select import format' },
    { id: 2, title: 'Upload File', description: 'Upload your CSV' },
    { id: 3, title: 'Configure', description: 'Set import options' },
    { id: 4, title: 'Processing', description: 'Import in progress' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
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
              <p className="text-sm text-slate-400">Bulk import with real-time processing</p>
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
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep > step.id
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-400'
                  }`}>
                    {currentStep > step.id ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-white' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-slate-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block flex-1 h-px mx-4 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-slate-600'
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
            onClick={() => {
              if (currentStep === 4) {
                onClose();
              } else if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              } else {
                onClose();
              }
            }}
            className="border-slate-600/50 hover:border-slate-500/50"
          >
            {currentStep === 4 ? 'Close' : currentStep > 1 ? 'Previous' : 'Cancel'}
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
            {currentStep === 3 && (
              <Button
                onClick={() => handleUpload(false)}
                disabled={uploadImport.isPending || !csvFile}
                isLoading={uploadImport.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {uploadImport.isPending ? 'Starting Import...' : 'Start Import'}
              </Button>
            )}
            {currentStep === 4 && (
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Continue Working
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};