// src/features/segments/components/segment-creator.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';

type SegmentType = 'behavioral' | 'demographic' | 'geographic' | 'ai-generated';
type CriteriaField = 'age' | 'ltv' | 'churn_risk' | 'plan_type' | 'login_frequency' | 'feature_usage' | 'payment_status' | 'support_tickets';
type CriteriaOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';

interface Criteria {
  id: string;
  field: CriteriaField;
  operator: CriteriaOperator;
  value: string | number;
}

const availableFields = [
  { value: 'age', label: 'Age', type: 'number' },
  { value: 'ltv', label: 'Lifetime Value', type: 'number' },
  { value: 'churn_risk', label: 'Churn Risk %', type: 'number' },
  { value: 'plan_type', label: 'Subscription Plan', type: 'select', options: ['Trial', 'Basic', 'Pro', 'Enterprise'] },
  { value: 'login_frequency', label: 'Weekly Logins', type: 'number' },
  { value: 'feature_usage', label: 'Feature Usage %', type: 'number' },
  { value: 'payment_status', label: 'Payment Status', type: 'select', options: ['active', 'failed', 'cancelled'] },
  { value: 'support_tickets', label: 'Support Tickets', type: 'number' },
];

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'contains', label: 'Contains' },
  { value: 'in', label: 'Is one of' },
];

const segmentTemplates = [
  {
    name: 'High-Value Customers',
    description: 'Customers with high LTV and low churn risk',
    type: 'behavioral' as const,
    criteria: [
      { field: 'ltv', operator: 'greater_than', value: 500 },
      { field: 'churn_risk', operator: 'less_than', value: 20 }
    ]
  },
  {
    name: 'At-Risk Trial Users',
    description: 'Trial users with low engagement',
    type: 'behavioral' as const,
    criteria: [
      { field: 'plan_type', operator: 'equals', value: 'Trial' },
      { field: 'login_frequency', operator: 'less_than', value: 2 },
      { field: 'feature_usage', operator: 'less_than', value: 30 }
    ]
  },
  {
    name: 'Enterprise Power Users',
    description: 'Enterprise customers with high engagement',
    type: 'behavioral' as const,
    criteria: [
      { field: 'plan_type', operator: 'equals', value: 'Enterprise' },
      { field: 'feature_usage', operator: 'greater_than', value: 70 },
      { field: 'login_frequency', operator: 'greater_than', value: 10 }
    ]
  },
  {
    name: 'Payment Recovery Needed',
    description: 'Customers with recent payment failures',
    type: 'behavioral' as const,
    criteria: [
      { field: 'payment_status', operator: 'equals', value: 'failed' },
      { field: 'churn_risk', operator: 'greater_than', value: 60 }
    ]
  }
];

export const SegmentCreator = () => {
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  const [segmentType, setSegmentType] = useState<SegmentType>('behavioral');
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);

  const addCriteria = () => {
    const newCriteria: Criteria = {
      id: Date.now().toString(),
      field: 'age',
      operator: 'greater_than',
      value: ''
    };
    setCriteria([...criteria, newCriteria]);
  };

  const updateCriteria = (id: string, field: keyof Criteria, value: string | number) => {
    setCriteria(criteria.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const removeCriteria = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const loadTemplate = (template: typeof segmentTemplates[0]) => {
    setSegmentName(template.name);
    setSegmentDescription(template.description);
    setSegmentType(template.type);
    setCriteria(template.criteria.map((c, index) => ({
      id: Date.now().toString() + index,
      field: c.field as CriteriaField,
      operator: c.operator as CriteriaOperator,
      value: c.value
    })));
    // Simulate size estimation
    setEstimatedSize(Math.floor(Math.random() * 5000) + 500);
  };

  const generateAISegment = () => {
    // Simulate AI generation
    setSegmentName('AI Generated: ' + aiPrompt.slice(0, 30) + '...');
    setSegmentDescription('AI-generated segment based on: ' + aiPrompt);
    setSegmentType('ai-generated');
    // Add some mock criteria
    setCriteria([
      {
        id: '1',
        field: 'churn_risk',
        operator: 'greater_than',
        value: 40
      },
      {
        id: '2',
        field: 'ltv',
        operator: 'less_than',
        value: 200
      }
    ]);
    setEstimatedSize(Math.floor(Math.random() * 3000) + 200);
  };

  const estimateSegmentSize = () => {
    // Simulate API call to estimate segment size
    setEstimatedSize(Math.floor(Math.random() * 5000) + 100);
  };

  return (
    <div className="space-y-8">
      {/* Creation Mode Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsAIMode(false)}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            !isAIMode
              ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-400 border border-blue-500/30'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
          }`}
        >
          Manual Creation
        </button>
        <button
          onClick={() => setIsAIMode(true)}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isAIMode
              ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-400 border border-purple-500/30'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
          }`}
        >
          AI-Powered Creation
        </button>
      </div>

      {isAIMode ? (
        /* AI Creation Mode */
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/30 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">AI Segment Builder</h3>
            <p className="text-purple-200 max-w-2xl mx-auto">
              Describe the type of customers you want to target, and our AI will automatically create the perfect segment criteria for you.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">Describe Your Target Segment</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
                placeholder="e.g., 'Find customers who are likely to churn within the next 30 days but have high lifetime value' or 'Identify trial users who are highly engaged and ready to upgrade'"
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all h-24 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={generateAISegment}
                disabled={!aiPrompt.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Generate AI Segment
              </Button>
              <Button variant="outline" className="border-slate-600/50 hover:border-purple-500/50 hover:text-purple-400">
                View Examples
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-purple-500/30">
            <div className="text-center text-sm text-purple-200">
              💡 <strong>Pro Tip:</strong> Be specific about behavior patterns, timeframes, and customer characteristics for best results
            </div>
          </div>
        </div>
      ) : (
        /* Manual Creation Mode */
        <div className="space-y-8">
          {/* Templates */}
          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Start Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {segmentTemplates.map((template, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 cursor-pointer"
                  onClick={() => loadTemplate(template)}
                >
                  <h4 className="text-white font-semibold mb-2">{template.name}</h4>
                  <p className="text-slate-300 text-sm mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
                      {template.type}
                    </span>
                    <span className="text-slate-400 text-xs">{template.criteria.length} criteria</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Segment Details */}
          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-6">Segment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input
                label="Segment Name"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                registration={{ name: 'segmentName' }}
                placeholder="e.g., High-Value Enterprise Customers"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Segment Type</label>
                <select
                  value={segmentType}
                  onChange={(e) => setSegmentType(e.target.value as SegmentType)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="behavioral">Behavioral</option>
                  <option value="demographic">Demographic</option>
                  <option value="geographic">Geographic</option>
                  <option value="ai-generated">AI Generated</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={segmentDescription}
                onChange={(e) => setSegmentDescription(e.target.value)}
                placeholder="Describe the characteristics and purpose of this segment..."
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all h-20 resize-none"
              />
            </div>
          </div>

          {/* Criteria Builder */}
          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Segment Criteria</h3>
              <Button onClick={addCriteria} variant="outline" className="border-slate-600/50 hover:border-blue-500/50 hover:text-blue-400">
                Add Criteria
              </Button>
            </div>

            {criteria.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-slate-400 mb-2">No criteria defined yet</div>
                <div className="text-sm text-slate-500">Add criteria to define who should be included in this segment</div>
              </div>
            ) : (
              <div className="space-y-4">
                {criteria.map((criterion, index) => (
                  <div key={criterion.id} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    {index > 0 && (
                      <div className="text-blue-400 font-medium text-sm">AND</div>
                    )}
                    
                    <select
                      value={criterion.field}
                      onChange={(e) => updateCriteria(criterion.id, 'field', e.target.value)}
                      className="bg-slate-600/50 border border-slate-500/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {availableFields.map(field => (
                        <option key={field.value} value={field.value}>{field.label}</option>
                      ))}
                    </select>

                    <select
                      value={criterion.operator}
                      onChange={(e) => updateCriteria(criterion.id, 'operator', e.target.value)}
                      className="bg-slate-600/50 border border-slate-500/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {operators.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>

                    {(() => {
                      const field = availableFields.find(f => f.value === criterion.field);
                      if (field?.type === 'select' && field.options) {
                        return (
                          <select
                            value={criterion.value}
                            onChange={(e) => updateCriteria(criterion.id, 'value', e.target.value)}
                            className="bg-slate-600/50 border border-slate-500/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          >
                            <option value="">Select value...</option>
                            {field.options.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        );
                      } else {
                        return (
                          <input
                            type={field?.type === 'number' ? 'number' : 'text'}
                            value={criterion.value}
                            onChange={(e) => updateCriteria(criterion.id, 'value', field?.type === 'number' ? Number(e.target.value) : e.target.value)}
                            placeholder="Enter value..."
                            className="bg-slate-600/50 border border-slate-500/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-400"
                          />
                        );
                      }
                    })()}

                    <button
                      onClick={() => removeCriteria(criterion.id)}
                      className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {criteria.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <Button 
                    onClick={estimateSegmentSize}
                    variant="outline" 
                    className="border-slate-600/50 hover:border-blue-500/50 hover:text-blue-400"
                  >
                    Estimate Segment Size
                  </Button>
                  {estimatedSize && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">{estimatedSize.toLocaleString()}</div>
                      <div className="text-sm text-slate-400">estimated customers</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" className="border-slate-600/50 hover:border-slate-500/50">
          Save as Draft
        </Button>
        <Button 
          disabled={!segmentName || criteria.length === 0}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Create Segment
        </Button>
      </div>
    </div>
  );
};