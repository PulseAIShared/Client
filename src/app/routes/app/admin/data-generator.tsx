import React, { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import { useGenerateTestData, downloadBlob, GenerateTestDataRequest } from '@/features/admin/api/data-generator';
import { PlatformAuthorization, useAuthorization } from '@/lib/authorization';

const DEFAULT_NAMES = [
  "Ava Carter", "Liam Morgan", "Olivia Hayes", "Noah Brooks", "Emma Turner",
  "Elijah Reed", "Sophia Price", "Lucas Bennett", "Isabella Ward", "Mason Cooper",
  "Mia Sullivan", "Ethan Perry", "Amelia Ross", "James Powell", "Harper Jenkins",
  "Benjamin Grant", "Evelyn Foster", "Henry Kim", "Abigail Flores", "William Rivera",
  "Emily Sanders", "Jack Coleman", "Scarlett Pierce", "Alexander Stone", "Luna Barnes",
  "Michael Boyd", "Grace Holland", "Daniel Abbott", "Victoria Malone", "Jacob Fields",
  "Chloe Cross", "Jackson Keller", "Penelope Watts", "Sebastian Harmon", "Layla Rhodes",
  "Carter Walsh", "Zoe Barrett", "Owen Gibbs", "Nora Fox", "Wyatt Briggs",
  "Lily Pratt", "Leo Mendez", "Hannah Lyons", "Julian Carr", "Ellie Summers",
  "Grayson Tate", "Audrey Knight", "Mateo Drake", "Aria Beck", "Levi Abbott", "Stella Page"
];

export const DataGeneratorRoute = () => {
  const { addNotification } = useNotifications();
  const { checkPlatformPolicy } = useAuthorization();

  const [customerCount, setCustomerCount] = useState(51);
  const [periodCount, setPeriodCount] = useState(9);
  const [outputFormat, setOutputFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [useCustomNames, setUseCustomNames] = useState(false);
  const [customNames, setCustomNames] = useState('');

  const generateMutation = useGenerateTestData({
    mutationConfig: {
      onSuccess: (data) => {
        downloadBlob(data.blob, data.fileName);
        addNotification({
          type: 'success',
          title: 'Data Generated',
          message: `Successfully generated ${data.fileName}`
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Generation Failed',
          message: error instanceof Error ? error.message : 'Failed to generate test data'
        });
      }
    }
  });

  const handleGenerate = () => {
    const names = useCustomNames && customNames.trim()
      ? customNames.split('\n').map(n => n.trim()).filter(n => n.length > 0)
      : undefined;

    const request: GenerateTestDataRequest = {
      customerCount,
      periodCount,
      customerNames: names,
      outputFormat,
    };

    generateMutation.mutate(request);
  };

  const handleLoadDefaults = () => {
    setCustomNames(DEFAULT_NAMES.slice(0, customerCount).join('\n'));
    setUseCustomNames(true);
  };

  return (
    <ContentLayout>
      <PlatformAuthorization policyCheck={checkPlatformPolicy('admin:data-generator')} forbiddenFallback={
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-surface-secondary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50">
            <div className="text-error-muted text-6xl mb-4">&#128683;</div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Access Denied</h2>
            <p className="text-text-muted">
              You need Admin platform role to access the data generator.
            </p>
          </div>
        </div>
      }>
        <div className="space-y-8">
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>

            <div className="relative bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 bg-accent-primary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-primary/30 mb-4">
                    <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-accent-primary">Admin Tool</span>
                  </div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
                    Test Data Generator
                  </h1>
                  <p className="text-text-secondary">
                    Generate synthetic customer data for testing imports and analytics
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Generator Form */}
          <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Customer Count */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Number of Customers
                </label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={customerCount}
                  onChange={(e) => setCustomerCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                />
                <p className="mt-1 text-xs text-text-muted">1-1000 customers</p>
              </div>

              {/* Period Count */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Number of Periods (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={periodCount}
                  onChange={(e) => setPeriodCount(Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                />
                <p className="mt-1 text-xs text-text-muted">Creates monthly snapshots going back</p>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as 'xlsx' | 'csv')}
                  className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50"
                >
                  <option value="xlsx">Excel (.xlsx) - Multiple sheets per period</option>
                  <option value="csv">CSV (.csv) - Single file with all data</option>
                </select>
              </div>
            </div>

            {/* Custom Names Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomNames}
                    onChange={(e) => setUseCustomNames(e.target.checked)}
                    className="w-4 h-4 rounded border-border-primary bg-surface-primary text-accent-primary focus:ring-accent-primary/50"
                  />
                  Use Custom Customer Names
                </label>
                {useCustomNames && (
                  <button
                    onClick={handleLoadDefaults}
                    className="text-sm text-accent-primary hover:text-accent-secondary transition-colors"
                  >
                    Load Default Names
                  </button>
                )}
              </div>

              {useCustomNames && (
                <div>
                  <textarea
                    value={customNames}
                    onChange={(e) => setCustomNames(e.target.value)}
                    placeholder="Enter customer names (one per line)&#10;Example:&#10;John Smith&#10;Jane Doe&#10;Bob Johnson"
                    rows={8}
                    className="w-full px-4 py-3 bg-surface-primary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-text-muted">
                    {customNames.split('\n').filter(n => n.trim()).length} names entered
                    {customNames.split('\n').filter(n => n.trim()).length < customerCount &&
                      ` (will use defaults for remaining ${customerCount - customNames.split('\n').filter(n => n.trim()).length} customers)`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview & Generate */}
          <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Summary</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-surface-primary/50 p-4 rounded-xl border border-border-primary/30">
                <p className="text-2xl font-bold text-accent-primary">{customerCount}</p>
                <p className="text-sm text-text-muted">Customers</p>
              </div>
              <div className="bg-surface-primary/50 p-4 rounded-xl border border-border-primary/30">
                <p className="text-2xl font-bold text-accent-secondary">{periodCount}</p>
                <p className="text-sm text-text-muted">Monthly Periods</p>
              </div>
              <div className="bg-surface-primary/50 p-4 rounded-xl border border-border-primary/30">
                <p className="text-2xl font-bold text-success-muted">{customerCount * periodCount}</p>
                <p className="text-sm text-text-muted">Total Rows</p>
              </div>
              <div className="bg-surface-primary/50 p-4 rounded-xl border border-border-primary/30">
                <p className="text-2xl font-bold text-warning-muted">{outputFormat.toUpperCase()}</p>
                <p className="text-sm text-text-muted">Format</p>
              </div>
            </div>

            <div className="bg-surface-primary/30 p-4 rounded-xl border border-border-primary/20 mb-6">
              <h3 className="font-medium text-text-primary mb-2">Generated Data Includes:</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>&#8226; Customer identity (email, name, phone, location)</li>
                <li>&#8226; Payment metrics (MRR, LTV, subscription status, payment history)</li>
                <li>&#8226; Engagement metrics (logins, session duration, feature usage)</li>
                <li>&#8226; CRM data (lifecycle stage, deal value, industry)</li>
                <li>&#8226; Time-series data with realistic growth patterns</li>
              </ul>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-primary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {generateMutation.isPending ? (
                <>
                  <Spinner size="sm" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Generate & Download
                </>
              )}
            </button>
          </div>

          {/* Help Section */}
          <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl">
            <h2 className="text-xl font-semibold text-text-primary mb-4">How to Use</h2>
            <div className="space-y-4 text-text-secondary">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent-primary/20 text-accent-primary rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <div>
                  <p className="font-medium text-text-primary">Configure Parameters</p>
                  <p className="text-sm">Set the number of customers and time periods. More periods create richer historical data for churn analysis.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent-primary/20 text-accent-primary rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <div>
                  <p className="font-medium text-text-primary">Generate & Download</p>
                  <p className="text-sm">Click generate to create and download the file. Excel format creates one sheet per month.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent-primary/20 text-accent-primary rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <div>
                  <p className="font-medium text-text-primary">Import to PulseAI</p>
                  <p className="text-sm">Use the Integrations page to import the generated file and test the full customer analytics workflow.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PlatformAuthorization>
    </ContentLayout>
  );
};
