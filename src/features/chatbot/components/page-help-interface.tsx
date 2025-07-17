import React from 'react';
import { useChatbotStore } from '../store';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { QuickActions } from './quick-actions';
import { useSendChatMessage, useCreateSupportSession, type ChatbotContext } from '../api/chatbot';

export const PageHelpInterface: React.FC = () => {
  const { 
    pageContext, 
    pageMessages, 
    pageQuickActions, 
    addPageMessage, 
    setSupportSession,
    isLoading, 
    setLoading, 
    setActiveMode,
    conversationId, 
    startNewConversation 
  } = useChatbotStore();

  const sendChatMessage = useSendChatMessage();
  const createSupportSession = useCreateSupportSession();

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    addPageMessage({
      content,
      sender: 'user',
    });

    setLoading(true);

    try {
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        startNewConversation();
        currentConversationId = conversationId;
      }

      // Send to regular chatbot API
      const response = await sendChatMessage.mutateAsync({
        message: content,
        context: {
          type: pageContext.type,
          customerId: pageContext.customerId,
          analysisId: pageContext.analysisId,
          routePath: pageContext.routePath,
        },
        conversationId: currentConversationId,
      });

      addPageMessage({
        content: response.message,
        sender: 'bot',
      });
    } catch (error) {
      console.warn('API call failed, using fallback response:', error);
      
      // Fallback response
      addPageMessage({
        content: 'I apologize, but I\'m having trouble responding right now. Would you like to contact our support team for assistance?',
        sender: 'bot',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: any) => {
    // Add user message for quick action
    addPageMessage({
      content: action.label,
      sender: 'user',
      type: 'quick_action',
    });

    if (action.action === 'contact_support') {
      await handleRequestSupport();
      return;
    }

    setLoading(true);

    try {
      // Mock response for quick actions
      await new Promise(resolve => setTimeout(resolve, 1000));

      let response = '';
      switch (action.action) {
        case 'book_demo':
          response = 'Great! I can help you schedule a demo. You can book one directly at our website or I can connect you with our sales team. What would you prefer?';
          break;
        case 'show_customer_analytics':
          response = `Here's what I can show you about customer ${pageContext.customerId}:\n\n• Engagement metrics\n• Purchase history\n• Churn risk score\n• Behavioral patterns\n\nWhich area would you like to explore first?`;
          break;
        case 'explain_dashboard_metrics':
          response = 'Your dashboard shows key metrics including:\n\n• Total Revenue\n• Active Customers\n• Churn Rate\n• Customer Lifetime Value\n\nWhich metric would you like me to explain in detail?';
          break;
        default:
          response = `I'll help you with "${action.label}". Could you provide more specific details about what you need?`;
      }

      addPageMessage({
        content: response,
        sender: 'bot',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSupport = async () => {
    setLoading(true);

    try {
      const supportSession = await createSupportSession.mutateAsync({
        topic: getTopicFromContext(pageContext),
        initialMessage: 'User requested live support',
        originalContext: {
          type: pageContext.type as any,
          routePath: pageContext.routePath,
          customerId: pageContext.customerId,
          analysisId: pageContext.analysisId,
          additionalContext: {}
        },
        currentContext: {
          type: pageContext.type as any,
          routePath: pageContext.routePath,
          customerId: pageContext.customerId,
          analysisId: pageContext.analysisId,
          additionalContext: {}
        }
      });

      setSupportSession(supportSession);
      setActiveMode('support_session');
    } catch (error) {
      console.error('Failed to create support session:', error);
      
      // Fallback message
      addPageMessage({
        content: 'I apologize, but I\'m unable to connect you to support right now. Please try again later or contact us directly at support@pulseai.com.',
        sender: 'bot',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTopicFromContext = (context: any): string => {
    switch (context.type) {
      case 'customer_detail':
        return 'Customer Analysis Help';
      case 'dashboard':
        return 'Dashboard Assistance';
      case 'segments':
        return 'Segmentation Help';
      case 'insights':
        return 'Insights Support';
      case 'settings':
        return 'Settings Configuration';
      case 'analytics':
        return 'Analytics Support';
      default:
        return 'General Support';
    }
  };

  const getContextTitle = () => {
    switch (pageContext.type) {
      case 'customer_detail':
        return `Customer ${pageContext.customerId} Assistant`;
      case 'dashboard':
        return 'Dashboard Assistant';
      case 'segments':
        return 'Segmentation Assistant';
      case 'insights':
        return 'Insights Assistant';
      case 'analytics':
        return 'Analytics Assistant';
      case 'settings':
        return 'Settings Assistant';
      default:
        return 'PulseAI Assistant';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Context Header */}
      <div className="px-4 py-3 border-b border-border-primary bg-surface-secondary">
        <h4 className="font-medium text-text-primary">{getContextTitle()}</h4>
        <p className="text-xs text-text-muted">
          {pageContext.type !== 'general' ? 'Context-aware assistant' : 'General support'}
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages 
          messages={pageMessages} 
          isTyping={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions actions={pageQuickActions} onActionClick={handleQuickAction} />

      {/* Support Request Button */}
      <div className="px-4 py-3 border-t border-border-primary bg-surface-primary">
        <button
          onClick={handleRequestSupport}
          disabled={isLoading}
          className="
            w-full px-4 py-2 text-sm font-medium
            bg-accent-primary hover:bg-accent-secondary
            text-white rounded-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          Contact Live Support
        </button>
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={
          pageContext.type === 'customer_detail'
            ? 'Ask about this customer...'
            : pageContext.type === 'dashboard'
            ? 'Ask about your metrics...'
            : 'How can I help you?'
        }
      />
    </div>
  );
};