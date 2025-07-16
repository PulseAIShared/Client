import React, { useState } from 'react';
import { useChatbotStore, type QuickAction } from '../store';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { QuickActions } from './quick-actions';
import { useSendChatMessage, useSendContactRequest } from '../api/chatbot';

export const ChatbotModal: React.FC = () => {
  const {
    isOpen,
    isMinimized,
    messages,
    quickActions,
    isLoading,
    isTyping,
    context,
    conversationId,
    closeChat,
    toggleMinimized,
    addMessage,
    setLoading,
    setTyping,
    startNewConversation,
  } = useChatbotStore();

  const [isContactMode, setIsContactMode] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  
  const sendChatMessage = useSendChatMessage();
  const sendContactRequest = useSendContactRequest();

  const handleSendMessage = async (content: string) => {
    // Check if this is contact mode
    if (isContactMode) {
      await handleContactRequest(content);
      return;
    }

    // Add user message
    addMessage({
      content,
      sender: 'user',
    });

    setLoading(true);
    setTyping(true);

    try {
      // Initialize conversation if needed
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        startNewConversation();
        currentConversationId = conversationId;
      }

      // Send to API
      const response = await sendChatMessage.mutateAsync({
        message: content,
        context: {
          type: context.type,
          customerId: context.customerId,
          analysisId: context.analysisId,
          routePath: context.routePath,
        },
        conversationId: currentConversationId,
      });

      addMessage({
        content: response.message,
        sender: 'bot',
      });
    } catch (error) {
      // Fallback to mock responses for development
      console.warn('API call failed, using mock response:', error);
      
      let response = '';
      if (context.type === 'customer_detail') {
        response = `I can help you analyze customer ${context.customerId}. What specific insights would you like to see?`;
      } else if (context.type === 'dashboard') {
        response = 'I can explain your dashboard metrics, help you run new analyses, or export reports. What would you like to know?';
      } else if (content.toLowerCase().includes('contact')) {
        response = 'I\'d be happy to connect you with our support team. Could you please provide your email and a brief description of how we can help?';
        setIsContactMode(true);
      } else {
        response = 'Thank you for your message! I\'m here to help you with PulseAI. Could you provide more details about what you\'d like assistance with?';
      }

      addMessage({
        content: response,
        sender: 'bot',
      });
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const handleContactRequest = async (message: string) => {
    if (!contactEmail) {
      // Ask for email if not provided
      setContactEmail(message);
      addMessage({
        content: message,
        sender: 'user',
      });
      addMessage({
        content: 'Thank you! Now please describe how we can help you, and I\'ll make sure your message gets to our support team.',
        sender: 'bot',
      });
      return;
    }

    // Send contact request
    addMessage({
      content: message,
      sender: 'user',
      type: 'contact_request',
    });

    setLoading(true);

    try {
      const response = await sendContactRequest.mutateAsync({
        email: contactEmail,
        message: message,
        context: {
          type: context.type,
          routePath: context.routePath,
          customerId: context.customerId,
        },
      });

      addMessage({
        content: response.success 
          ? `Perfect! I've forwarded your message to our support team. ${response.ticketId ? `Your ticket ID is ${response.ticketId}.` : ''} Someone will get back to you shortly at ${contactEmail}.`
          : 'I apologize, but there was an issue sending your message. Please try again or contact us directly.',
        sender: 'bot',
      });

      // Reset contact mode
      setIsContactMode(false);
      setContactEmail('');
    } catch {
      addMessage({
        content: 'I apologize, but there was an issue sending your message. Please try again or contact us directly at support@pulseai.com.',
        sender: 'bot',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    addMessage({
      content: action.label,
      sender: 'user',
      type: 'quick_action',
    });

    setLoading(true);
    setTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      let response = '';
      switch (action.action) {
        case 'contact_support':
          response = 'I\'d be happy to connect you with our support team. Please provide your email address and describe how we can help you.';
          setIsContactMode(true);
          break;
        case 'book_demo':
          response = 'Great! I can help you schedule a demo. You can book one directly at our website or I can connect you with our sales team. What would you prefer?';
          break;
        case 'show_customer_analytics':
          response = `Here's what I can show you about customer ${context.customerId}:\n\n• Engagement metrics\n• Purchase history\n• Churn risk score\n• Behavioral patterns\n\nWhich area would you like to explore first?`;
          break;
        case 'explain_dashboard_metrics':
          response = 'Your dashboard shows key metrics including:\n\n• Total Revenue\n• Active Customers\n• Churn Rate\n• Customer Lifetime Value\n\nWhich metric would you like me to explain in detail?';
          break;
        default:
          response = `I'll help you with "${action.label}". Could you provide more specific details about what you need?`;
      }

      addMessage({
        content: response,
        sender: 'bot',
      });
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  if (!isOpen) return null;

  const getContextTitle = () => {
    switch (context.type) {
      case 'customer_detail':
        return `Customer ${context.customerId} Assistant`;
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
    <div
      className={`
        fixed bottom-6 right-6 z-50
        w-96 bg-surface-primary border border-border-primary rounded-lg shadow-2xl
        transition-all duration-300 ease-in-out
        ${isMinimized ? 'h-14' : 'h-[600px]'}
        flex flex-col
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-primary bg-surface-secondary rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-text-primary text-sm">{getContextTitle()}</h3>
            <p className="text-xs text-text-muted">
              {context.type !== 'general' ? 'Context-aware assistant' : 'General support'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMinimized}
            className="p-1 text-text-muted hover:text-text-primary transition-colors"
            aria-label={isMinimized ? 'Expand' : 'Minimize'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMinimized ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
          <button
            onClick={closeChat}
            className="p-1 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <>
          <ChatMessages messages={messages} isTyping={isTyping} />
          <QuickActions actions={quickActions} onActionClick={handleQuickAction} />
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder={
              isContactMode && !contactEmail
                ? 'Please enter your email address...'
                : isContactMode
                ? 'Describe how we can help you...'
                : context.type === 'customer_detail'
                ? 'Ask about this customer...'
                : context.type === 'dashboard'
                ? 'Ask about your metrics...'
                : 'How can I help you?'
            }
          />
        </>
      )}
    </div>
  );
};