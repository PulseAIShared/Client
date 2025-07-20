import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useChatbotStore } from '../store';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { QuickActions } from './quick-actions';
import { useSendChatMessage, useCreateSupportSession, useGetChatHistory, useGetUserConversations, type ChatbotContext, ChatContextType } from '../api/chatbot';

const generateConversationTitle = (message: string, context: ChatbotContext): string => {
  // Just use the context name as the title - much simpler and clearer
  switch (context.type) {
    case ChatContextType.Dashboard:
      return 'Dashboard';
    case ChatContextType.CustomerDetail:
      return `Customer ${context.customerId}`;
    case ChatContextType.Customers:
      return 'Customers';
    case ChatContextType.Campaigns:
      return 'Campaigns';
    case ChatContextType.Analytics:
      return 'Analytics';
    case ChatContextType.Segments:
      return 'Segments';
    case ChatContextType.Integrations:
      return 'Settings';
    case ChatContextType.Import:
      return 'Import';
    case ChatContextType.Support:
      return 'Support';
    case ChatContextType.General:
    default:
      return 'General';
  }
};

export const PageHelpInterface: React.FC = () => {
  const queryClient = useQueryClient();
  const { 
    pageContext, 
    pageMessages, 
    pageQuickActions, 
    addPageMessage, 
    setSupportSession,
    supportSession,
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

  // Load or create conversation for current context (only for app routes)
  useEffect(() => {
    const contextKey = generateContextKey(pageContext);
    
    if (contextKey !== currentContextKey) {
      // For app routes, don't use local storage - let server manage conversations
      // Just track the current context for API calls
      useChatbotStore.setState({ currentContextKey: contextKey });
      
      // Only clear messages if we don't already have a current conversation
      // (to prevent clearing when restoring from conversations page)
      if (!currentConversation) {
        setPageMessages([]);
        setCurrentConversation(undefined);
      }
    }
  }, [pageContext, generateContextKey, currentContextKey, setPageMessages, setCurrentConversation, currentConversation]);

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
      // Send to regular chatbot API (server manages conversations)
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

      // Update conversation from server response
      if (response.conversationId) {
        const updatedConversation = {
          id: response.conversationId,
          title: generateConversationTitle(content, pageContext),
          lastMessage: typeof response.message.content === 'string' 
            ? response.message.content 
            : (response.message.content && typeof response.message.content === 'object' && 'content' in response.message.content)
              ? (response.message.content as any).content
              : JSON.stringify(response.message.content),
          lastMessageAt: new Date().toISOString(),
          messageCount: pageMessages.length + 2, // +2 for user message and bot response
          createdAt: new Date().toISOString(),
        };
        
        // Update the current conversation (no localStorage persistence)
        setCurrentConversation(updatedConversation);
      }

      // Add the bot's response message
      addPageMessage({
        content: response.message.content,
        sender: 'bot',
      });

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['chatbot', 'conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chatbot', 'conversation', response.conversationId] });
      
      // Refetch current conversation history if available
      if (response.conversationId) {
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

    // Send quick action to server like a regular message
    await handleSendMessage(action.label);
  };

  const handleRequestSupport = async () => {
    // Check if user already has an active support session
    if (supportSession && supportSession.status !== 'Closed' && supportSession.status !== 'TimedOut') {
      addPageMessage({
        content: '⚠️ You already have an active support session. Please close your current session before starting a new one.',
        sender: 'bot',
        type: 'system_message',
      });
      return;
    }

    // First show a connecting message
    addPageMessage({
      content: '🔄 Trying to connect you to a member of our support team...',
      sender: 'bot',
      type: 'system_message',
    });

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
      
      // Invalidate support session queries to update admin UI
      queryClient.invalidateQueries({ queryKey: ['support', 'admin', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'admin', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'active-session'] });
      
      // Show success message before switching modes
      addPageMessage({
        content: '✅ Great! I\'ve created a support session for you. Our team will be in contact with you via email shortly. In the meantime, you can continue chatting here for immediate assistance.',
        sender: 'bot',
        type: 'system_message',
      });
    } catch (error) {
      console.error('Failed to create support session:', error);
      
      // Show fallback message
      addPageMessage({
        content: '❌ I apologize, but I\'m unable to connect you to live support right now. However, our team will be in contact with you via email within 24 hours. For urgent matters, please contact us directly at support@pulseai.com.',
        sender: 'bot',
        type: 'system_message',
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
      case ChatContextType.Customers:
        return 'Customer Management Help';
      case ChatContextType.Campaigns:
        return 'Campaign Management Help';
      case ChatContextType.Segments:
        return 'Segmentation Help';
      case ChatContextType.Analytics:
        return 'Analytics Support';
      case ChatContextType.Integrations:
        return 'Integrations Support';
      case ChatContextType.Import:
        return 'Import Support';
      case ChatContextType.Support:
        return 'Live Support Request';
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
      case ChatContextType.Customers:
        return 'Customer Management Assistant';
      case ChatContextType.Campaigns:
        return 'Campaign Management Assistant';
      case ChatContextType.Segments:
        return 'Segmentation Assistant';
      case ChatContextType.Analytics:
        return 'Analytics Assistant';
      case ChatContextType.Integrations:
        return 'Integrations Assistant';
      case ChatContextType.Import:
        return 'Import Assistant';
      case ChatContextType.Support:
        return 'Live Support';
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
            : pageContext.type === ChatContextType.Customers
            ? 'Ask about customer management...'
            : pageContext.type === ChatContextType.Campaigns
            ? 'Ask about campaigns...'
            : 'How can I help you?'
        }
      />
    </div>
  );
};