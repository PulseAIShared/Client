import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../api/campaigns';
import { useGetSegments } from '@/features/segments/api/segments';
import { ContentLayout } from '@/components/layouts';

interface SimpleCampaignFormProps {
  segmentId?: string;
  onSuccess?: () => void;
}

export const SimpleCampaignForm = ({ segmentId, onSuccess }: SimpleCampaignFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    segmentId: segmentId || '',
    type: 'Email' as const,
    subject: '',
    content: '',
  });

  const { data: segments = [], isLoading: segmentsLoading } = useGetSegments();
  const selectedSegment = segments.find(s => s.id === formData.segmentId);

  const createCampaignMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: (campaign) => {
      alert(`Campaign "${campaign.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onSuccess?.();
      navigate('/app/campaigns');
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message || 'Failed to create campaign'}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Campaign name is required');
      return;
    }
    if (!formData.segmentId) {
      alert('Please select a segment');
      return;
    }
    if (!formData.content.trim()) {
      alert('Campaign content is required');
      return;
    }

    const campaignData = {
      ...formData,
      trigger: 'manual',
      steps: [
        {
          stepOrder: 1,
          type: formData.type,
          delay: '0',
          subject: formData.subject || formData.name,
          content: formData.content,
        },
      ],
    };

    createCampaignMutation.mutate(campaignData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const emailTemplates = [
    {
      id: 'retention',
      name: 'Customer Retention',
      subject: 'We Value Your Partnership - Let\'s Discuss Your Success',
      content: `Hi there,

We noticed you might be experiencing some challenges with our platform. As a valued customer, your success is our priority.

Our customer success team has identified some optimization opportunities that could help you get more value from your subscription:

• Personalized onboarding session
• Advanced feature training  
• Priority customer support

Would you like to schedule a 15-minute call to discuss how we can better support your goals?

Best regards,
The PulseAI Team`,
    },
    {
      id: 'winback',
      name: 'Win-Back Campaign',
      subject: 'We Miss You - Special Offer Inside',
      content: `Hi there,

We noticed you haven't been active lately and wanted to reach out.

To show our appreciation for your past business, we'd like to offer you:

• 20% off your next month
• Free migration assistance
• Dedicated account manager

This offer expires in 7 days. Ready to give us another try?

Best regards,
The PulseAI Team`,
    },
  ];

  const handleUseTemplate = (template: typeof emailTemplates[0]) => {
    updateField('subject', template.subject);
    updateField('content', template.content);
  };

  if (segmentsLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Campaign</h1>
          {selectedSegment && (
            <p className="text-slate-400">
              Creating campaign for segment: <span className="text-white font-medium">{selectedSegment.name}</span>
              {' '}({selectedSegment.customerCount.toLocaleString()} customers)
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="InApp">In-App Notification</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what this campaign aims to achieve"
              />
            </div>
          </div>

          {/* Segment Selection */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">Target Segment</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Segment *
              </label>
              <select
                value={formData.segmentId}
                onChange={(e) => updateField('segmentId', e.target.value)}
                disabled={!!segmentId}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                required
              >
                <option value="">Select a segment</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name} ({segment.customerCount.toLocaleString()} customers)
                  </option>
                ))}
              </select>
            </div>

            {selectedSegment && (
              <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                <h3 className="font-medium text-white mb-2">{selectedSegment.name}</h3>
                <p className="text-slate-400 text-sm mb-3">{selectedSegment.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-300">
                    <span className="font-medium">{selectedSegment.customerCount.toLocaleString()}</span> customers
                  </span>
                  <span className="text-slate-300">
                    <span className="font-medium">{selectedSegment.churnRate}%</span> churn rate
                  </span>
                  <span className="text-slate-300">
                    <span className="font-medium">${selectedSegment.avgLTV}</span> avg LTV
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Email Templates */}
          {formData.type === 'Email' && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold text-white mb-6">Email Templates</h2>
              <p className="text-slate-400 text-sm mb-4">Choose a template to get started quickly:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {emailTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleUseTemplate(template)}
                    className="p-4 rounded-lg border-2 border-slate-600/50 bg-slate-700/30 hover:border-slate-500/50 text-left transition-all"
                  >
                    <h3 className="font-medium text-white mb-2">{template.name}</h3>
                    <p className="text-slate-400 text-sm">{template.subject}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Campaign Content */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">Campaign Content</h2>
            
            {formData.type === 'Email' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => updateField('content', e.target.value)}
                rows={12}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your campaign content..."
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={createCampaignMutation.isPending}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </ContentLayout>
  );
};