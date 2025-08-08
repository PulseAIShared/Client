import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createCampaign } from '@/features/campaigns/api/campaigns';
import { useGetSegments } from '@/features/segments/api/segments';
import { ContentLayout } from '@/components/layouts';
import { CampaignCreateHeader } from '@/features/campaigns/components';

export const CampaignCreateRoute = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const segmentId = searchParams.get('segmentId') || undefined;
  
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
The PulseLTV Team`,
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
The PulseLTV Team`,
    },
  ];

  const handleUseTemplate = (template: typeof emailTemplates[0]) => {
    updateField('subject', template.subject);
    updateField('content', template.content);
  };

  if (segmentsLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <p className="text-text-secondary font-medium">Loading segments...</p>
            <p className="text-text-muted text-sm">Preparing campaign builder</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <CampaignCreateHeader selectedSegment={selectedSegment} />
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Enhanced Basic Information */}
          <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border-primary/30 shadow-xl">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Campaign Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="InApp">In-App Notification</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
                placeholder="Describe what this campaign aims to achieve"
              />
            </div>
          </div>

          {/* Enhanced Segment Selection */}
          <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border-primary/30 shadow-xl">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-6">Target Segment</h2>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Select Segment *
              </label>
              <select
                value={formData.segmentId}
                onChange={(e) => updateField('segmentId', e.target.value)}
                disabled={!!segmentId}
                className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200 disabled:opacity-50"
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
          </div>

          {/* Enhanced Email Templates */}
          <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border-primary/30 shadow-xl">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-6">Email Templates</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emailTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleUseTemplate(template)}
                  className="group text-left p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30 hover:border-accent-primary/30 hover:bg-accent-primary/10 transition-all duration-200"
                >
                  <h3 className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">{template.subject}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Campaign Content */}
          <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border-primary/30 shadow-xl">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-6">Campaign Content</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
                  placeholder="Enter email subject line"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
                  placeholder="Enter your campaign content..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Enhanced Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createCampaignMutation.isPending}
              className="px-8 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {createCampaignMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Campaign...
                </div>
              ) : (
                'Create Campaign'
              )}
            </button>
          </div>
        </form>
      </div>
    </ContentLayout>
  );
};