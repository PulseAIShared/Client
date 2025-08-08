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
      formData.append('importMode', importMode);
      formData.append('skipDuplicates', skipDuplicates.toString());

      const response = await uploadImport.mutateAsync(formData);
      
      if (response.importJobId) {
        setImportJobId(response.importJobId);
        onImportStarted();
        setCurrentStep(4);
      } else {
        addNotification({
          type: 'error',
          title: 'Upload failed',
          message: 'Failed to start import job'
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      addNotification({
        type: 'error',
        title: 'Upload failed',
        message: 'An error occurred while uploading the file'
      });
    }
  };

  const downloadTemplate = (mode: ImportMode) => {
    if (mode === 'pulse-template') {
      const link = document.createElement('a');
      link.href = pulseTemplateUrl;
      link.download = 'pulse-customer-template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For other templates, you might want to generate them dynamically
      addNotification({
        type: 'info',
        title: 'Template download',
        message: `Downloading ${CRM_TEMPLATES[mode].name} template...`
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Import Customers</h2>
              <p className="text-text-muted">Choose your import method and get started</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(CRM_TEMPLATES).map(([key, template]) => (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    importMode === key
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-border-primary/30 bg-surface-secondary/30 hover:border-accent-primary/50'
                  }`}
                  onClick={() => setImportMode(key as ImportMode)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-text-primary">{template.name}</h3>
                    {importMode === key && (
                      <div className="w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mb-3">{template.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadTemplate(key as ImportMode);
                    }}
                    className="text-xs text-accent-primary hover:text-accent-secondary transition-colors"
                  >
                    Download template →
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-info/20 to-info-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Upload CSV File</h2>
              <p className="text-text-muted">Select your CSV file to import</p>
            </div>

            <div className="border-2 border-dashed border-border-primary/50 rounded-2xl p-8 text-center hover:border-accent-primary/50 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-surface-secondary/50 to-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Choose CSV file</h3>
                <p className="text-text-muted mb-4">or drag and drop here</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 text-accent-primary rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Browse files
                </div>
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-warning-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Review & Upload</h2>
              <p className="text-text-muted">Review your file and choose upload options</p>
            </div>

            {csvFile && (
              <div className="bg-surface-secondary/30 rounded-2xl p-4 border border-border-primary/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">{csvFile.name}</h3>
                    <p className="text-sm text-text-muted">{(csvFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="skip-duplicates"
                  className="rounded border-border-primary bg-surface-secondary focus:ring-accent-primary"
                />
                <label htmlFor="skip-duplicates" className="text-sm text-text-primary">
                  Skip duplicate customers (based on email)
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-success-muted/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Import Started!</h2>
              <p className="text-text-muted">Your customer import is being processed in the background.</p>
              {importJobId && (
                <p className="text-sm text-text-muted mt-2">Job ID: {importJobId}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface-primary/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary/30">
          <h1 className="text-xl font-bold text-text-primary">Import Customers</h1>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Enhanced Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Enhanced Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border-primary/30">
          <div className="flex gap-2">
            {currentStep > 1 && currentStep < 4 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            {currentStep < 4 && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
            
            {currentStep === 1 && (
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                Continue
              </button>
            )}
            
            {currentStep === 2 && csvFile && (
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                Continue
              </button>
            )}
            
            {currentStep === 3 && (
              <button
                onClick={() => handleUpload(false)}
                disabled={uploadImport.isPending}
                className="px-6 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadImport.isPending ? 'Uploading...' : 'Upload'}
              </button>
            )}
            
            {currentStep === 4 && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};