import React, { useState } from 'react';
import { useChatbotStore } from '../store';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { QuickActions } from './quick-actions';
import { useSendContactRequest, ChatContextType } from '../api/chatbot';

interface SupportContactFormProps {
  onSubmit: (email: string, message: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const SupportContactForm: React.FC<SupportContactFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && message.trim()) {
      onSubmit(email.trim(), message.trim());
    }
  };

  return (
    <div className="p-4 border-t border-border-primary bg-surface-secondary">
      <h4 className="font-medium text-text-primary mb-3">Contact Support</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="support-email" className="block text-sm font-medium text-text-secondary mb-1">
            Email Address
          </label>
          <input
            id="support-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-border-primary rounded-lg bg-surface-primary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
            placeholder="your@email.com"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="support-message" className="block text-sm font-medium text-text-secondary mb-1">
            Message
          </label>
          <textarea
            id="support-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-border-primary rounded-lg bg-surface-primary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent resize-none"
            placeholder="How can we help you?"
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading || !email.trim() || !message.trim()}
            className="flex-1 bg-accent-primary hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-primary rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export const LandingHelpInterface: React.FC = () => {
  const { 
    localConversations,
    pageQuickActions, 
    addLocalMessage,
    isLoading, 
    setLoading,
    getMessagesForCurrentRoute
  } = useChatbotStore();

  const [showSupportForm, setShowSupportForm] = useState(false);
  const sendContactRequest = useSendContactRequest();

  const messages = getMessagesForCurrentRoute();

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    addLocalMessage({
      content,
      sender: 'user',
    });

    // Check if user is requesting support
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('support') || lowerContent.includes('help') || lowerContent.includes('contact')) {
      setShowSupportForm(true);
      addLocalMessage({
        content: 'I\'d be happy to connect you with our support team! Please provide your email and describe how we can help you.',
        sender: 'bot',
      });
      return;
    }

    setLoading(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate hardcoded responses based on content
    let response = '';
    if (lowerContent.includes('demo') || lowerContent.includes('trial')) {
      response = 'Great! You can book a free demo directly through our website. During the demo, we\'ll show you how PulseAI can help reduce customer churn and increase retention. Would you like me to help you schedule one?';
    } else if (lowerContent.includes('pricing') || lowerContent.includes('cost') || lowerContent.includes('price')) {
      response = 'Our pricing is designed to scale with your business. We offer flexible plans based on the number of customers and features you need. You can view our current pricing on our website or contact our sales team for a custom quote.';
    } else if (lowerContent.includes('feature') || lowerContent.includes('what') || lowerContent.includes('how')) {
      response = 'PulseAI helps you:\n\n• Predict customer churn with AI\n• Segment customers automatically\n• Track engagement metrics\n• Trigger targeted retention playbooks\n• Analyze customer lifetime value\n\nWhat specific feature interests you most?';
    } else if (lowerContent.includes('integration') || lowerContent.includes('connect')) {
      response = 'PulseAI integrates with popular platforms like:\n\n• HubSpot\n• Salesforce\n• Stripe\n• Shopify\n• And many more\n\nWe also offer API access for custom integrations. Which platform are you looking to connect?';
    } else if (lowerContent.includes('data') || lowerContent.includes('import')) {
      response = 'You can easily import your customer data through:\n\n• CSV upload\n• Direct integrations\n• API connections\n• Webhook sync\n\nWe support all major data formats and provide migration assistance.';
    } else {
      response = 'Thanks for your interest in PulseAI! I\'m here to help answer questions about our customer retention platform. You can ask me about features, pricing, integrations, or schedule a demo. What would you like to know?';
    }

    addLocalMessage({
      content: response,
      sender: 'bot',
    });

    setLoading(false);
  };

  const handleQuickAction = async (action: any) => {
    // Add user message for quick action
    addLocalMessage({
      content: action.label,
      sender: 'user',
      type: 'quick_action',
    });

    if (action.action === 'contact_support') {
      setShowSupportForm(true);
      addLocalMessage({
        content: 'I\'d be happy to connect you with our support team! Please provide your email and describe how we can help you.',
        sender: 'bot',
      });
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    let response = '';
    switch (action.action) {
      case 'book_demo':
        response = 'Perfect! You can schedule a free demo at your convenience. Our team will show you exactly how PulseAI can help reduce churn for your specific business. Visit our website to pick a time that works for you, or I can connect you with our sales team directly.';
        break;
      case 'pricing_info':
        response = 'Our pricing scales with your needs:\n\n• Starter: Perfect for small teams\n• Professional: Advanced features for growing businesses\n• Enterprise: Custom solutions for large organizations\n\nEach plan includes core churn prediction, customer segmentation, and analytics. Would you like to discuss which plan fits your needs?';
        break;
      case 'feature_overview':
        response = 'Here\'s what makes PulseAI powerful:\n\n🎯 **Churn Prediction**: AI identifies at-risk customers\n📊 **Smart Segmentation**: Automatic customer grouping\n📈 **Analytics**: Deep insights into customer behavior\n🧠 **Playbooks**: Targeted retention actions\n🔗 **Integrations**: Connect your existing tools\n\nWhat would you like to explore first?';
        break;
      default:
        response = `I'll help you with "${action.label}". Could you provide more specific details about what you need?`;
    }

    addLocalMessage({
      content: response,
      sender: 'bot',
    });

    setLoading(false);
  };

  const handleSupportSubmit = async (email: string, message: string) => {
    setLoading(true);
    
    try {
      await sendContactRequest.mutateAsync({
        email,
        message,
        context: {
          type: ChatContextType.General,
          routePath: window.location.pathname,
        },
      });

      addLocalMessage({
        content: `✅ Thank you! Your message has been sent to our support team. We'll get back to you at ${email} within 24 hours.`,
        sender: 'bot',
        type: 'system_message',
      });

      setShowSupportForm(false);
    } catch (error) {
      console.error('Failed to send contact request:', error);
      addLocalMessage({
        content: '❌ Sorry, there was an issue sending your message. Please try again or email us directly at support@pulseltv.com.',
        sender: 'bot',
        type: 'system_message',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-2 border-b border-border-primary bg-surface-secondary">
        <h4 className="font-medium text-text-primary text-sm">PulseAI Assistant</h4>
        <p className="text-xs text-text-muted">Ask about features, pricing, or book a demo</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 min-h-0">
        <ChatMessages 
          messages={messages} 
          isTyping={isLoading}
        />
      </div>

      {/* Support Contact Form */}
      {showSupportForm && (
        <SupportContactForm
          onSubmit={handleSupportSubmit}
          onCancel={() => setShowSupportForm(false)}
          isLoading={isLoading}
        />
      )}

      {/* Quick Actions */}
      {!showSupportForm && <QuickActions actions={pageQuickActions} onActionClick={handleQuickAction} />}

      {/* Chat Input */}
      {!showSupportForm && (
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="Ask about PulseAI features, pricing, or demos..."
        />
      )}
    </div>
  );
};
