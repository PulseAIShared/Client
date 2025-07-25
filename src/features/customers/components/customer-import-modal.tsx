// src/features/customers/components/customer-import-modal.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';
import { useUploadImport } from '@/features/customers/api/import';
import { useAuthorization } from '@/lib/authorization';
import pulseTemplateUrl from '@/assets/pulse-template.csv?url';
interface CustomerImportModalProps {
  onClose: () => void;
  onImportStarted: () => void;
}

type ImportMode = 'pulse-template' | 'hubspot' | 'salesforce' | 'pipedrive' | 'csv-mapping';

// Define CRM field mappings
const CRM_TEMPLATES = {
  'pulse-template': {
    name: 'PulseLTV Template',
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
  const { checkCompanyPolicy } = useAuthorization();
  
  // Check if user has write permissions for customers
  const canImportCustomers = checkCompanyPolicy('customers:write');
  
  // If user doesn't have permission, show error and close
  React.useEffect(() => {
    if (!canImportCustomers) {
      addNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'You need Staff or Owner permissions to import customers'
      });
      onClose();
    }
  }, [canImportCustomers, addNotification, onClose]);
  
  // Don't render if user doesn't have permission
  if (!canImportCustomers) {
    return null;
  }


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
  if (mode === 'pulse-template') {
    // For pulse template, directly download the file from assets
    const a = document.createElement('a');
    a.href = pulseTemplateUrl;
    a.download = 'pulse-template-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // For other modes, generate CSV content
  const csvContent = [
    'Full Name,Email,Company,Plan,Monthly Revenue,Start Date,Last Activity',
    'John Smith,john@example.com,Acme Corp,Pro,149.00,2023-01-15,2024-05-30',
    'Jane Doe,jane@example.com,Startup Inc,Enterprise,299.00,2022-06-01,2024-05-29'
  ].join('\n');

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
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Choose Import Method
              </h3>
              <p className="text-text-muted">
                Select your data source to get the right import format
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Object.entries(CRM_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => setImportMode(key as ImportMode)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
                    importMode === key
                      ? 'border-accent-primary bg-accent-primary/20 shadow-lg shadow-accent-primary/25'
                      : 'border-border-primary hover:border-accent-primary/30 bg-surface-secondary/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full mt-0.5 flex-shrink-0 ${
                      importMode === key ? 'bg-accent-primary' : 'bg-surface-secondary border-2 border-border-primary'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-text-primary font-semibold mb-1 text-sm sm:text-base">{template.name}</h4>
                      <p className="text-text-muted text-xs sm:text-sm leading-relaxed">{template.description}</p>
                      <div className="mt-2 text-xs text-text-muted bg-surface-primary/50 rounded px-2 py-1">
                        <span className="font-medium">Required:</span> {template.requiredFields.slice(0, 2).join(', ')}{template.requiredFields.length > 2 && '...'}
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
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Upload Your CSV File
              </h3>
              <p className="text-text-muted">
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
            <div className="border-2 border-dashed border-border-primary rounded-lg p-8 text-center hover:border-accent-primary/50 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-text-primary font-medium mb-2">
                  Click to upload your {CRM_TEMPLATES[importMode].name} CSV file
                </div>
                <div className="text-text-muted text-sm">
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
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Ready to Import
              </h3>
              <p className="text-text-muted">
                File selected: {csvFile?.name}
              </p>
            </div>

            <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary shadow-lg">
              <h4 className="text-text-primary font-medium mb-4">Import Settings</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-primary/30 rounded-lg">
                  <div>
                    <div className="text-text-primary font-medium">Skip Duplicates</div>
                    <div className="text-sm text-text-muted">Skip customers that already exist based on email (if this is off, then this will update the existing users) </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-surface-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                  </label>
                </div>

                <div className="p-4 bg-info-bg rounded-lg border border-info/30">
                  <h5 className="text-info font-medium mb-2">What happens next?</h5>
                  <div className="text-info-muted text-sm space-y-1">
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
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Import Started Successfully
              </h3>
              <p className="text-text-muted">
                Your import is being processed with real-time updates
              </p>
            </div>

            <div className="bg-gradient-to-r from-success-bg to-info-bg backdrop-blur-lg p-8 rounded-xl border border-success/30 shadow-lg text-center">
              <div className="w-16 h-16 bg-success/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h4 className="text-xl font-bold text-text-primary mb-2">Import Job Created</h4>
              <p className="text-text-muted mb-4">
                Your file has been uploaded and processing is starting automatically.
              </p>
              
              {importJobId && (
                <div className="bg-surface-secondary/30 p-4 rounded-lg border border-border-primary mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Import Job ID:</span>
                    <code className="text-accent-primary bg-surface-primary/50 px-2 py-1 rounded font-mono">
                      {importJobId}
                    </code>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span>File uploaded and validation started</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-info rounded-full"></div>
                  <span>Real-time updates enabled - you'll see progress instantly</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-secondary rounded-full"></div>
                  <span>Customer data will refresh automatically when complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>Notifications will show progress and completion status</span>
                </div>
              </div>
            </div>

            <div className="bg-info-bg p-4 rounded-lg border border-info/30">
              <h5 className="text-info font-medium mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Real-Time Updates
              </h5>
              <div className="text-info-muted text-sm space-y-1">
                <p>• Progress updates appear instantly via SignalR</p>
                <p>• Customer data refreshes automatically on completion</p>
                <p>• No need to manually refresh or check status</p>
                <p>• Notifications will alert you of important milestones</p>
              </div>
            </div>

            <div className="bg-accent-secondary/20 p-4 rounded-lg border border-accent-secondary/30">
              <h5 className="text-accent-secondary font-medium mb-2">What's happening now?</h5>
              <div className="text-accent-secondary/80 text-sm space-y-1">
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
    <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-surface-primary/95 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-border-primary shadow-2xl w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl h-[95vh] sm:h-auto sm:min-h-[500px] sm:max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-border-primary">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-lg sm:rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary">Import Customers</h2>
              <p className="text-xs sm:text-sm text-text-muted hidden sm:block">Bulk import with real-time processing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps - Fixed Height */}
        <div className="flex-shrink-0 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-border-primary">
          {/* Mobile: Simple dots indicator */}
          <div className="flex sm:hidden items-center justify-center gap-2">
            {steps.map((step) => (
              <div key={step.id} className={`w-2 h-2 rounded-full ${
                currentStep > step.id
                  ? 'bg-success'
                  : currentStep === step.id
                  ? 'bg-accent-primary'
                  : 'bg-surface-secondary'
              }`} />
            ))}
            <span className="ml-3 text-sm text-text-muted">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          
          {/* Desktop: Full progress steps */}
          <div className="hidden sm:flex items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep > step.id
                      ? 'bg-success border-success text-text-primary'
                      : currentStep === step.id
                      ? 'bg-accent-primary border-accent-primary text-text-primary'
                      : 'bg-surface-secondary border-border-primary text-text-muted'
                  }`}>
                    {currentStep > step.id ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-text-primary' : 'text-text-muted'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-text-muted">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${
                    currentStep > step.id ? 'bg-success' : 'bg-border-primary'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer - Always Visible */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 border-t border-border-primary bg-surface-primary/95">
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
            className="border-border-primary hover:border-border-primary/70 order-2 sm:order-1"
          >
            {currentStep === 4 ? 'Close' : currentStep > 1 ? 'Previous' : 'Cancel'}
          </Button>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
            {currentStep === 1 && (
              <Button
                onClick={() => setCurrentStep(2)}
                className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/80 hover:to-accent-secondary/80 w-full sm:w-auto h-10 sm:h-auto"
              >
                Continue
              </Button>
            )}
            {currentStep === 3 && (
              <Button
                onClick={() => handleUpload(false)}
                disabled={uploadImport.isPending || !csvFile || !canImportCustomers}
                isLoading={uploadImport.isPending}
                className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/80 hover:to-accent-secondary/80 w-full sm:w-auto h-10 sm:h-auto"
              >
                {uploadImport.isPending ? 'Starting Import...' : 'Start Import'}
              </Button>
            )}
            {currentStep === 4 && (
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-success to-success-muted hover:from-success/80 hover:to-success-muted/80 w-full sm:w-auto h-10 sm:h-auto"
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