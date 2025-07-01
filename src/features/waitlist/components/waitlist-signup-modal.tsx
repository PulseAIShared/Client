import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWaitlistSignup } from '../api/waitlist';

interface WaitlistSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

export const WaitlistSignupModal: React.FC<WaitlistSignupModalProps> = ({
  isOpen,
  onClose,
  source = 'churn-calculator'
}) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    companyName: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const waitlistSignup = useWaitlistSignup({
    mutationConfig: {
      onSuccess: (response) => {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          setFormData({ email: '', firstName: '', lastName: '', companyName: '' });
        }, 3000);
      },
      onError: (error) => {
        console.error('Waitlist signup failed:', error);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    waitlistSignup.mutate({
      ...formData,
      source
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-surface-primary rounded-2xl shadow-2xl border border-border-primary max-w-md w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {isSuccess ? '🎉 Welcome to the Waitlist!' : 'Join Our Waitlist'}
              </h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  You're on the list!
                </h3>
                <p className="text-text-secondary">
                  We'll notify you as soon as PulseLTV is ready. Get ready to transform your customer retention strategy!
                </p>
              </motion.div>
            ) : (
              <>
                <p className="text-text-secondary mb-6">
                  Be the first to know when PulseLTV launches and get exclusive early access to our AI-powered churn reduction platform.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-text-primary transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-text-primary transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-text-primary transition-all"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-text-primary transition-all"
                      placeholder="Acme Corp"
                    />
                  </div>

                  {waitlistSignup.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">
                        {waitlistSignup.error?.message || 'Something went wrong. Please try again.'}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.email || waitlistSignup.isPending}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
                    >
                      {waitlistSignup.isPending ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Joining...</span>
                        </div>
                      ) : (
                        'Join Waitlist'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};