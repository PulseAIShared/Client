import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreateFlow } from '@/features/recovery/api/recovery';
import { useNotifications } from '@/components/ui/notifications/notifications-store';
import { CreateFlowRequest, RecoveryFlowStep } from '@/types/recovery';

interface CreateFlowModalProps {
  onClose: () => void;
  template?: {
    name: string;
    trigger: string;
    steps: RecoveryFlowStep[];
  };
}

export const CreateFlowModal: React.FC<CreateFlowModalProps> = ({ onClose, template }) => {
  const createFlowMutation = useCreateFlow();
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState<CreateFlowRequest>({
    name: template?.name || '',
    trigger: template?.trigger || '',
    type: 'Automated',
    steps: template?.steps || [
      { step: 1, type: 'email', delay: '1 hour', subject: '', template: '' }
    ],
    status: 'Draft'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createFlowMutation.mutateAsync(formData);
      addNotification({ type: 'success', title: 'Flow created successfully' });
      onClose();
      setFormData({
        name: '',
        trigger: '',
        type: 'Automated',
        steps: [{ step: 1, type: 'email', delay: '1 hour', subject: '', template: '' }],
        status: 'Draft'
      });
    } catch (error) {
      addNotification({ type: 'error', title: 'Failed to create flow' });
    }
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { 
        step: prev.steps.length + 1, 
        type: 'email', 
        delay: '24 hours', 
        subject: '',
        template: ''
      } as RecoveryFlowStep]
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
              steps: prev.steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, step: i + 1 } as RecoveryFlowStep))
    }));
  };

  const updateStep = (index: number, field: keyof RecoveryFlowStep, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-bg-primary/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-surface-primary/95 backdrop-blur-xl rounded-2xl border border-border-primary/30 shadow-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border-primary/30">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                {template ? `Create Flow from ${template.name}` : 'Create Recovery Flow'}
              </h2>
              <p className="text-sm text-text-muted mt-1">Design an automated sequence to recover missed payments</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Flow Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-secondary/50 border border-border-primary/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                    placeholder="e.g., Payment Recovery Flow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Trigger</label>
                  <input
                    type="text"
                    required
                    value={formData.trigger}
                    onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-secondary/50 border border-border-primary/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                    placeholder="e.g., Payment Failed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-secondary/50 border border-border-primary/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                  >
                    <option value="Automated">Automated</option>
                    <option value="AI-Generated">AI-Generated</option>
                    <option value="Behavioral">Behavioral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-secondary/50 border border-border-primary/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>

              {/* Flow Steps */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Flow Steps</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addStep}>
                    Add Step
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.steps.map((step, index) => (
                    <div key={index} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-text-primary">Step {index + 1}</h4>
                        {formData.steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="p-1 text-error hover:bg-error/10 rounded transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-text-muted mb-1">Type</label>
                          <select
                            value={step.type}
                            onChange={(e) => updateStep(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/30 text-text-primary text-sm"
                          >
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="phone">Phone</option>
                            <option value="in-app">In-App</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-muted mb-1">Delay</label>
                          <input
                            type="text"
                            value={step.delay}
                            onChange={(e) => updateStep(index, 'delay', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/30 text-text-primary text-sm"
                            placeholder="e.g., 1 hour"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-muted mb-1">Template</label>
                          <input
                            type="text"
                            value={step.template || ''}
                            onChange={(e) => updateStep(index, 'template', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/30 text-text-primary text-sm"
                            placeholder="Template ID"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-text-muted mb-1">Subject/Message</label>
                          <input
                            type="text"
                            required
                            value={step.subject}
                            onChange={(e) => updateStep(index, 'subject', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/30 text-text-primary text-sm"
                            placeholder="e.g., Payment Update Required"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border-primary/30 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                isLoading={createFlowMutation.isPending}
                className="bg-gradient-to-r from-accent-primary to-accent-secondary"
              >
                Create Flow
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
