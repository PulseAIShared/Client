// src/features/segments/components/segment-creator.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { createSegment, usePreviewSegment, useGenerateSegmentFromPrompt } from '../api/segments';
import { SegmentType, CriteriaOperator, GeneratedSegmentDto } from '@/types/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/components/ui/notifications';
import { X } from 'lucide-react';

type CriteriaField =
  | 'fullname'
  | 'email'
  | 'company'
  | 'job_title'
  | 'country'
  | 'location'
  | 'industry'
  | 'lifecycle_stage'
  | 'age'
  | 'mrr'
  | 'ltv'
  | 'churn_risk'
  | 'login_frequency'
  | 'feature_usage'
  | 'engagement_score'
  | 'deal_count'
  | 'open_tickets'
  | 'csat'
  | 'failed_payments'
  | 'plan_type'
  | 'payment_status';

interface Criteria {
  id: string;
  field: CriteriaField;
  operator: CriteriaOperator;
  value: string;
  label: string;
}

const availableFields = [
  { value: 'fullname', label: 'Full Name', type: 'text' },
  { value: 'email', label: 'Email', type: 'text' },
  { value: 'company', label: 'Company', type: 'text' },
  { value: 'job_title', label: 'Job Title', type: 'text' },
  { value: 'country', label: 'Country', type: 'text' },
  { value: 'location', label: 'Location', type: 'text' },
  { value: 'industry', label: 'Industry', type: 'text' },
  { value: 'lifecycle_stage', label: 'Lifecycle Stage', type: 'text' },
  { value: 'plan_type', label: 'Subscription Plan', type: 'text' },
  { value: 'payment_status', label: 'Payment Status', type: 'text' },
  { value: 'age', label: 'Age', type: 'number' },
  { value: 'mrr', label: 'MRR', type: 'number' },
  { value: 'ltv', label: 'Lifetime Value', type: 'number' },
  { value: 'churn_risk', label: 'Churn Risk %', type: 'number' },
  { value: 'login_frequency', label: 'Monthly Login Frequency', type: 'number' },
  { value: 'feature_usage', label: 'Feature Usage %', type: 'number' },
  { value: 'engagement_score', label: 'Engagement Score', type: 'number' },
  { value: 'deal_count', label: 'Deal Count', type: 'number' },
  { value: 'open_tickets', label: 'Open Tickets', type: 'number' },
  { value: 'csat', label: 'CSAT Score', type: 'number' },
  { value: 'failed_payments', label: 'Failed Payments (30d)', type: 'number' },
];

const operators = [
  { value: CriteriaOperator.Equals, label: 'Equals' },
  { value: CriteriaOperator.NotEquals, label: 'Does not equal' },
  { value: CriteriaOperator.GreaterThan, label: 'Greater than' },
  { value: CriteriaOperator.LessThan, label: 'Less than' },
  { value: CriteriaOperator.Contains, label: 'Contains' },
  { value: CriteriaOperator.In, label: 'Is one of' },
  { value: CriteriaOperator.NotIn, label: 'Is not one of' },
];

const segmentTemplates = [
  {
    id: 'high-value',
    name: 'High-Value Customers',
    description: 'Customers with high LTV and low churn risk',
    type: SegmentType.Behavioral,
    criteria: [
      { field: 'ltv', operator: CriteriaOperator.GreaterThan, value: '500', label: 'LTV > $500' },
      { field: 'churn_risk', operator: CriteriaOperator.LessThan, value: '20', label: 'Churn Risk < 20%' }
    ]
  },
  {
    id: 'at-risk',
    name: 'At-Risk Customers',
    description: 'Customers with elevated churn risk and low engagement',
    type: SegmentType.Behavioral,
    criteria: [
      { field: 'churn_risk', operator: CriteriaOperator.GreaterThan, value: '65', label: 'Churn Risk > 65%' },
      { field: 'login_frequency', operator: CriteriaOperator.LessThan, value: '2', label: 'Monthly Login Frequency < 2' },
      { field: 'feature_usage', operator: CriteriaOperator.LessThan, value: '30', label: 'Feature Usage < 30%' }
    ]
  },
  {
    id: 'power-users',
    name: 'Enterprise Power Users',
    description: 'Enterprise customers with high engagement',
    type: SegmentType.Behavioral,
    criteria: [
      { field: 'plan_type', operator: CriteriaOperator.Equals, value: 'Enterprise', label: 'Plan = Enterprise' },
      { field: 'feature_usage', operator: CriteriaOperator.GreaterThan, value: '70', label: 'Feature Usage > 70%' },
      { field: 'login_frequency', operator: CriteriaOperator.GreaterThan, value: '10', label: 'Monthly Login Frequency > 10' }
    ]
  },
  {
    id: 'payment-recovery',
    name: 'Payment Recovery Needed',
    description: 'Customers with recent payment failures',
    type: SegmentType.Behavioral,
    criteria: [
      { field: 'failed_payments', operator: CriteriaOperator.GreaterThan, value: '0', label: 'Failed Payments > 0' },
      { field: 'churn_risk', operator: CriteriaOperator.GreaterThan, value: '60', label: 'Churn Risk > 60%' }
    ]
  }
];

type SegmentCreatorProps = {
  initialMode?: 'ai' | 'manual';
  initialTemplateId?: string;
};

export const SegmentCreator: React.FC<SegmentCreatorProps> = ({
  initialMode = 'manual',
  initialTemplateId,
}) => {
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  const [segmentType, setSegmentType] = useState<SegmentType>(SegmentType.Behavioral);
  const [segmentColor, setSegmentColor] = useState('#8b5cf6');
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [isAIMode, setIsAIMode] = useState(initialMode === 'ai');
  const [aiPrompt, setAIPrompt] = useState('');
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [previewData, setPreviewData] = useState<{ estimatedCustomerCount: number; averageChurnRate: number; averageLifetimeValue: number; averageRevenue: number; matchingSampleCustomers: string[] } | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const generateAIMutation = useGenerateSegmentFromPrompt({
    mutationConfig: {
      onSuccess: (generated: GeneratedSegmentDto) => {
        // Set name and description from AI response
        setSegmentName(generated.name);
        setSegmentDescription(generated.description);
        setSegmentType(generated.type);

        const supportedFieldValues = new Set(availableFields.map((field) => field.value));

        // Transform AI criteria to our format
        const transformedCriteria = generated.criteria.map((c, idx) => ({
          id: `ai-${idx}`,
          field: supportedFieldValues.has(c.field)
            ? (c.field as CriteriaField)
            : 'churn_risk',
          operator: c.operator,
          value: c.value,
          label: c.label
        }));

        setCriteria(transformedCriteria);
        setAIPrompt('');
        setIsAIMode(false);
        setError('');
        setSourceLabel('AI generated');

        addNotification({
          type: 'success',
          title: 'AI Segment Generated',
          message: `Successfully generated segment: "${generated.name}"`
        });

        // Auto-preview the generated segment
        previewSegmentMutation.mutate({
          criteria: transformedCriteria,
          type: generated.type
        });
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to generate segment with AI. Please try again.';
        setError(errorMessage);
        addNotification({
          type: 'error',
          title: 'AI Generation Failed',
          message: errorMessage
        });
      }
    }
  });
  
  const createSegmentMutation = useMutation({
    mutationFn: createSegment,
    onSuccess: async (newSegment) => {
      addNotification({
        type: 'success',
        title: 'Segment Created',
        message: `Successfully created segment "${newSegment.name}"`
      });
      
      await queryClient.invalidateQueries({ queryKey: ['segments'] });
      navigate('/app/segments');
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create segment. Please try again.'
      });
    }
  });

  const previewSegmentMutation = usePreviewSegment({
    mutationConfig: {
      onSuccess: (data: any) => {
        setPreviewData(data);
        setPreviewError('');
        addNotification({
          type: 'info',
          title: 'Preview Generated',
          message: `Estimated ${data.estimatedCustomerCount.toLocaleString()} customers match your criteria`
        });
      },
      onError: (error: any) => {
        console.error('Preview failed:', error);
        const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to generate preview. Please check your criteria.';
        setPreviewError(errorMessage);
        addNotification({
          type: 'error',
          title: 'Preview Failed',
          message: errorMessage
        });
      }
    }
  });

  const addCriteria = () => {
    const newCriteria: Criteria = {
      id: Date.now().toString(),
      field: 'age',
      operator: CriteriaOperator.Equals,
      value: '',
      label: ''
    };
    setCriteria([...criteria, newCriteria]);
  };

  const updateCriteria = (id: string, field: keyof Criteria, value: string | number | CriteriaOperator) => {
    setCriteria(criteria.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: value };
        // Update label when field or operator changes
        if (field === 'field' || field === 'operator' || field === 'value') {
          const fieldInfo = availableFields.find(f => f.value === updated.field);
          const operatorInfo = operators.find(o => o.value === updated.operator);
          if (fieldInfo && operatorInfo) {
            updated.label = `${fieldInfo.label} ${operatorInfo.label.toLowerCase()} ${updated.value}`;
          }
        }
        return updated;
      }
      return c;
    }));
  };

  const removeCriteria = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const loadTemplate = (template: typeof segmentTemplates[0]) => {
    setSegmentName(template.name);
    setSegmentDescription(template.description);
    setSegmentType(template.type);
    setCriteria(template.criteria.map(c => ({
      id: Date.now().toString() + Math.random(),
      field: c.field as CriteriaField,
      operator: c.operator,
      value: c.value,
      label: c.label
    })));
    setPreviewData(null);
    setSourceLabel(`Template: ${template.name}`);
  };

  useEffect(() => {
    setIsAIMode(initialMode === 'ai');
  }, [initialMode]);

  useEffect(() => {
    if (!initialTemplateId) {
      return;
    }

    const template = segmentTemplates.find((entry) => entry.id === initialTemplateId);
    if (!template) {
      return;
    }

    setIsAIMode(false);
    loadTemplate(template);
  }, [initialTemplateId]);

  const generateAISegment = () => {
    if (!aiPrompt.trim()) {
      setError('Please describe the segment you want to create');
      return;
    }

    setError('');
    generateAIMutation.mutate({ prompt: aiPrompt });
  };

  const estimateSegmentSize = () => {
    if (criteria.length === 0) return;
    
    previewSegmentMutation.mutate({
      criteria: criteria.map(c => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
        label: c.label
      })),
      type: segmentType
    });
  };
  
  const handleCreateSegment = () => {
    if (!segmentName || criteria.length === 0) return;
    
    createSegmentMutation.mutate({
      name: segmentName,
      description: segmentDescription,
      type: segmentType,
      color: segmentColor,
      criteria: criteria.map(c => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
        label: c.label
      }))
    });
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Creation Mode Toggle */}
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAIMode(false)}
            className={`group px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              !isAIMode
                ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30 shadow-lg'
                : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/60 border border-border-primary/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Manual Creation
            </div>
          </button>
          <button
            onClick={() => {
              setIsAIMode(true);
              setSourceLabel(null);
            }}
            className={`group px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              isAIMode
                ? 'bg-gradient-to-r from-accent-secondary/30 to-accent-secondary/40 text-accent-secondary border border-accent-secondary/30 shadow-lg'
                : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/60 border border-border-primary/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI-Powered Creation
            </div>
          </button>
        </div>
      </div>

      {isAIMode ? (
        /* Enhanced AI Creation Mode */
        <div className="bg-gradient-to-r from-accent-secondary/20 to-accent-secondary/30 backdrop-blur-lg p-8 rounded-2xl border border-accent-secondary/30 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent-secondary/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-4">AI Segment Builder</h3>
            <p className="text-accent-secondary max-w-2xl mx-auto">
              Describe the type of customers you want to target, and our AI will automatically create the perfect segment criteria for you.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {error && (
              <div className="p-4 bg-error/10 border border-error/30 rounded-lg text-error">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-text-primary font-medium mb-2">Describe Your Target Segment</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
                placeholder="e.g., 'Find customers who are likely to churn within the next 30 days but have high lifetime value' or 'Identify trial users who are highly engaged and ready to upgrade'"
                className="w-full bg-surface-secondary/50 border border-border-primary/30 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-secondary/50 focus:border-accent-secondary/50 transition-all h-24 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={generateAISegment}
                disabled={!aiPrompt.trim() || generateAIMutation.isPending}
                className="flex-1 bg-gradient-to-r from-accent-secondary to-accent-secondary hover:from-accent-secondary hover:to-accent-secondary"
              >
                {generateAIMutation.isPending ? 'Generating...' : 'Generate AI Segment'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Enhanced Manual Creation Mode */
        <div className="space-y-8">
          {/* Enhanced Templates (optional first step) */}
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">Start from a template (optional)</h3>
              <button
                onClick={() => setSourceLabel(null)}
                className="text-xs text-text-muted hover:text-text-primary"
              >
                Skip
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {segmentTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  className="group text-left p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30 hover:border-accent-primary/30 hover:bg-accent-primary/10 transition-all duration-200"
                >
                  <h4 className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-sm text-text-muted mt-1">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Source indicator */}
          {sourceLabel && (
            <div className="rounded-xl border border-accent-primary/30 bg-accent-primary/10 px-4 py-3 text-sm text-accent-primary">
              {sourceLabel}
            </div>
          )}

          {/* Enhanced Basic Information */}
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
            <h3 className="text-xl font-semibold text-text-primary mb-6">Basic Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-text-primary font-medium mb-2">Segment Name</label>
                <Input
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  placeholder="Enter segment name..."
                  className="flex-1"
                  registration={{ name: 'segmentName' }}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-text-secondary">Type:</label>
                <select
                  value={segmentType}
                  onChange={(e) => setSegmentType(Number(e.target.value) as SegmentType)}
                  className="px-3 py-2 bg-surface-secondary/50 border border-border-primary/30 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50"
                >
                  <option value={SegmentType.Behavioral}>Behavioral</option>
                  <option value={SegmentType.Demographic}>Demographic</option>
                  <option value={SegmentType.Geographic}>Geographic</option>
                  <option value={SegmentType.Psychographic}>Psychographic</option>
                  <option value={SegmentType.AiGenerated}>AI Generated</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-text-primary font-medium mb-2">Description</label>
              <textarea
                value={segmentDescription}
                onChange={(e) => setSegmentDescription(e.target.value)}
                placeholder="Describe what this segment represents..."
                className="w-full bg-surface-secondary/50 border border-border-primary/30 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all h-20 resize-none"
              />
            </div>
          </div>

          {/* Enhanced Criteria Builder */}
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">Segment Criteria</h3>
              <button
                onClick={addCriteria}
                className="px-4 py-2 bg-accent-primary/20 text-accent-primary rounded-xl hover:bg-accent-primary/30 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Criteria
              </button>
            </div>

            {criteria.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-surface-secondary/50 to-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-text-primary mb-2">No criteria added</h4>
                <p className="text-text-muted">Add criteria to define your segment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="bg-surface-secondary/30 p-4 rounded-xl border border-border-primary/30">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-text-primary font-medium mb-2">Field</label>
                        <select
                          value={criterion.field}
                          onChange={(e) => updateCriteria(criterion.id, 'field', e.target.value as CriteriaField)}
                          className="w-full bg-surface-primary/50 border border-border-primary/30 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all"
                        >
                          {availableFields.map((field) => (
                            <option key={field.value} value={field.value}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-text-primary font-medium mb-2">Operator</label>
                        <select
                          value={criterion.operator}
                          onChange={(e) => updateCriteria(criterion.id, 'operator', e.target.value as unknown as CriteriaOperator)}
                          className="px-3 py-2 bg-surface-secondary/50 border border-border-primary/30 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50"
                        >
                          {operators.map(operator => (
                            <option key={operator.value} value={operator.value}>
                              {operator.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex-1">
                        <Input
                          value={criterion.value}
                          onChange={(e) => updateCriteria(criterion.id, 'value', e.target.value)}
                          placeholder="Enter value..."
                          className="w-full"
                          registration={{ name: `criteria-${criterion.id}-value` }}
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeCriteria(criterion.id)}
                          className="h-10 w-10 rounded-lg border border-border-primary/40 text-text-muted hover:text-error hover:border-error/40 hover:bg-error/10 transition-colors flex items-center justify-center"
                          title="Remove criterion"
                          aria-label="Remove criterion"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Preview Error Display */}
          {previewError && (
            <div className="p-4 bg-error/10 border border-error/30 rounded-lg text-error mb-4">
              <p className="font-medium">Validation Error</p>
              <p className="text-sm mt-1">{previewError}</p>
              <p className="text-xs mt-2 text-error-muted">
                Supported fields include fullname, email, company, country, age, mrr, ltv, churn_risk, login_frequency, feature_usage, open_tickets, csat, and failed_payments.
              </p>
            </div>
          )}

          {/* Enhanced Preview */}
          {previewData && (
            <div className="bg-gradient-to-r from-info/20 to-info/30 backdrop-blur-lg p-6 rounded-2xl border border-info/30 shadow-lg">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Segment Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">{previewData.estimatedCustomerCount.toLocaleString()}</div>
                  <div className="text-sm text-text-muted">Estimated Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{previewData.averageChurnRate}%</div>
                  <div className="text-sm text-text-muted">Avg Churn Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">${previewData.averageLifetimeValue.toLocaleString()}</div>
                  <div className="text-sm text-text-muted">Avg LTV</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-primary">${previewData.averageRevenue.toLocaleString()}</div>
                  <div className="text-sm text-text-muted">Avg Revenue</div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={estimateSegmentSize}
              disabled={criteria.length === 0}
              className="flex-1 px-6 py-3 bg-info/20 text-info rounded-xl hover:bg-info/30 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Preview Segment
            </button>
            <button
              onClick={handleCreateSegment}
              disabled={!segmentName || criteria.length === 0 || createSegmentMutation.isPending}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createSegmentMutation.isPending ? 'Creating...' : 'Create Segment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
