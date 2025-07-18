import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useChatbotStore } from '../store';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { QuickActions } from './quick-actions';
import { useSendChatMessage, useCreateSupportSession, useGetChatHistory, useGetUserConversations, type ChatbotContext, ChatContextType } from '../api/chatbot';

export const PageHelpInterface: React.FC = () => {
  const queryClient = useQueryClient();
  const { 
    pageContext, 
    pageMessages, 
    pageQuickActions, 
    addPageMessage, 
    setSupportSession,
    isLoading, 
    setLoading, 
    setActiveMode,
    startNewConversation,
    convertAPIMessagesToChatMessages,
    setCurrentConversation,
    setPageMessages,
    currentConversation,
    generateContextKey,
    createConversationForContext,
    loadConversationForContext,
    currentContextKey
  } = useChatbotStore();

  const sendChatMessage = useSendChatMessage();
  const createSupportSession = useCreateSupportSession();
  const { data: chatHistory, refetch: refetchHistory } = useGetChatHistory(currentConversation?.id || '', 1, 50);
  const { data: userConversations } = useGetUserConversations();

  // Sync user conversations from API with store
  useEffect(() => {
    if (userConversations) {
      useChatbotStore.setState((state) => ({
        allConversations: userConversations
      }));
    }
  }, [userConversations]);

  // Load conversation history when currentConversation changes
  useEffect(() => {
    if (currentConversation?.id) {
      // Invalidate any existing cache for this conversation
      queryClient.invalidateQueries({ queryKey: ['chatbot', 'conversation', currentConversation.id] });
      
      // Trigger refetch
      refetchHistory();
    }
  }, [currentConversation?.id, queryClient, refetchHistory]);

  // Update messages when chatHistory changes
  useEffect(() => {
    if (chatHistory?.messages) {
      const apiMessages = convertAPIMessagesToChatMessages(chatHistory.messages);
      setPageMessages(apiMessages);
      setLoading(false);
    }
  }, [chatHistory, convertAPIMessagesToChatMessages, setPageMessages, setLoading]);

  // Load or create conversation for current context
  useEffect(() => {
    const contextKey = generateContextKey(pageContext);
    
    if (contextKey !== currentContextKey) {
      // Context has changed, load or create conversation
      const existingConversation = useChatbotStore.getState().conversationsByContext[contextKey];
      
      if (existingConversation) {
        loadConversationForContext(contextKey);
      } else {
        // Create new conversation for this context
        createConversationForContext(contextKey, pageContext);
      }
    }
  }, [pageContext, generateContextKey, currentContextKey, loadConversationForContext, createConversationForContext]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Check if user is requesting support
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('contact support') || lowerContent.includes('live support') || lowerContent.includes('human support')) {
      // Add user message
      addPageMessage({
        content,
        sender: 'user',
      });
      
      await handleRequestSupport();
      return;
    }

    // Add user message
    addPageMessage({
      content,
      sender: 'user',
    });

    setLoading(true);

    try {
      // Ensure we have a conversation for the current context
      if (!currentConversation) {
        const contextKey = generateContextKey(pageContext);
        createConversationForContext(contextKey, pageContext);
      }

      // Send to regular chatbot API
      const chatRequest = {
        message: content,
        context: {
          type: pageContext.type,
          customerId: pageContext.customerId,
          analysisId: pageContext.analysisId,
          routePath: pageContext.routePath,
        },
        conversationId: currentConversation?.id || undefined,
      };
      
      const response = await sendChatMessage.mutateAsync(chatRequest);

      // Update conversation ID if we got a new one from the API
      if (response.conversationId && response.conversationId !== currentConversation?.id) {
        const contextKey = generateContextKey(pageContext);
        const updatedConversation = {
          id: response.conversationId,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          lastMessage: typeof response.message.content === 'string' 
            ? response.message.content 
            : (response.message.content && typeof response.message.content === 'object' && 'content' in response.message.content)
              ? (response.message.content as any).content
              : JSON.stringify(response.message.content),
          lastMessageAt: new Date().toISOString(),
          messageCount: pageMessages.length + 2, // +2 for user message and bot response
          createdAt: new Date().toISOString(),
        };
        
        // Update the store with the new conversation ID
        setCurrentConversation(updatedConversation);
        
        // Update the conversation in the context mapping
        useChatbotStore.setState((state) => ({
          conversationsByContext: {
            ...state.conversationsByContext,
            [contextKey]: updatedConversation,
          },
          allConversations: state.allConversations.map(c => 
            c.id === currentConversation?.id ? updatedConversation : c
          ),
        }));
      }

      // Add the bot's response message
      addPageMessage({
        content: response.message.content,
        sender: 'bot',
      });

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['chatbot', 'conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chatbot', 'conversation', response.conversationId] });
      
      // Refetch current conversation history
      if (currentConversation?.id) {
        refetchHistory();
      }
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
          type: pageContext.type,
          routePath: pageContext.routePath,
          customerId: pageContext.customerId,
          analysisId: pageContext.analysisId,
          additionalContext: {}
        },
        currentContext: {
          type: pageContext.type,
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
      case ChatContextType.CustomerDetail:
        return 'Customer Analysis Help';
      case ChatContextType.Dashboard:
        return 'Dashboard Assistance';
      case ChatContextType.Segments:
        return 'Segmentation Help';
      case ChatContextType.Analytics:
        return 'Analytics Support';
      case ChatContextType.Integrations:
        return 'Integrations Support';
      case ChatContextType.Import:
        return 'Import Support';
      case ChatContextType.General:
      default:
        return 'General Support';
    }
  };

  const getContextTitle = () => {
    switch (pageContext.type) {
      case ChatContextType.CustomerDetail:
        return `Customer ${pageContext.customerId} Assistant`;
      case ChatContextType.Dashboard:
        return 'Dashboard Assistant';
      case ChatContextType.Segments:
        return 'Segmentation Assistant';
      case ChatContextType.Analytics:
        return 'Analytics Assistant';
      case ChatContextType.Integrations:
        return 'Integrations Assistant';
      case ChatContextType.Import:
        return 'Import Assistant';
      case ChatContextType.General:
      default:
        return 'PulseAI Assistant';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Context Header */}
      <div className="px-4 py-2 border-b border-border-primary bg-surface-secondary">
        <h4 className="font-medium text-text-primary text-sm">{getContextTitle()}</h4>
        <p className="text-xs text-text-muted">
          {pageContext.type !== ChatContextType.General ? 'Context-aware assistant' : 'General support'}
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 min-h-0">
        <ChatMessages 
          messages={pageMessages} 
          isTyping={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions actions={pageQuickActions} onActionClick={handleQuickAction} />


      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={
          pageContext.type === ChatContextType.CustomerDetail
            ? 'Ask about this customer...'
            : pageContext.type === ChatContextType.Dashboard
            ? 'Ask about your metrics...'
            : 'How can I help you?'
        }
      />
    </div>
  );
};