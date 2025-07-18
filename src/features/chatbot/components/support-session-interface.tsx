import React, { useEffect, useState, useRef } from 'react';
import { useChatbotStore } from '../store';
import { useSupportStore } from '../support-store';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { useSendSupportMessage, useCloseSupportSession, useGetSupportMessages } from '../api/chatbot';
import type { SupportSession } from '../api/chatbot';

interface SupportSessionInterfaceProps {
  session: SupportSession;
}

export const SupportSessionInterface: React.FC<SupportSessionInterfaceProps> = ({ session }) => {
  console.log('SupportSessionInterface loaded with session:', session);
  const { supportMessages, addSupportMessage, clearSupportSession, isLoading, setLoading } = useChatbotStore();
  const { 
    connect, 
    isConnected, 
    joinSession, 
    sendMessage, 
    setTyping, 
    messages, 
    typingUsers,
    setMessages,
    addMessage
  } = useSupportStore();
  
  const sendSupportMessage = useSendSupportMessage();
  const closeSupportSession = useCloseSupportSession();
  
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<number | undefined>(undefined);
  
  // Load existing messages from API
  const { data: apiMessages, isLoading: messagesLoading } = useGetSupportMessages(session.id);

  // Load API messages into support store
  useEffect(() => {
    if (apiMessages && apiMessages.length > 0) {
      console.log('Loading API messages for session:', session.id, apiMessages);
      setMessages(session.id, apiMessages);
    }
  }, [apiMessages, session.id, setMessages]);

  // Initialize support connection on mount
  useEffect(() => {
    const initializeSupport = async () => {
      try {
        await connect();
        if (isConnected) {
          await joinSession(session.id);
        }
      } catch (error) {
        console.error('Failed to connect to support hub:', error);
      }
    };

    initializeSupport();
  }, [connect, joinSession, session.id, isConnected]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setLoading(true);
    
    try {
      if (isConnected) {
        // Use real-time SignalR connection
        await sendMessage(session.id, content);
      } else {
        // Fallback to API call
        const message = await sendSupportMessage.mutateAsync({
          sessionId: session.id,
          request: { content }
        });
        
        // Add to both stores for consistency
        addSupportMessage(message);
        addMessage(session.id, message);
      }
    } catch (error) {
      console.error('Failed to send support message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = (isTypingNow: boolean) => {
    if (isConnected) {
      setTyping(session.id, isTypingNow);
    }
    
    setIsTyping(isTypingNow);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (isTypingNow) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (isConnected) {
          setTyping(session.id, false);
        }
      }, 1000);
    }
  };

  const handleCloseSession = async () => {
    try {
      await closeSupportSession.mutateAsync({
        sessionId: session.id,
        reason: 'User closed session'
      });
      
      clearSupportSession();
    } catch (error) {
      console.error('Failed to close support session:', error);
    }
  };

  const getSessionStatusText = () => {
    switch (session.status) {
      case 'Pending':
        return 'Waiting for support (Level 0)';
      case 'AiActive':
        return `AI Assistant (Level ${session.escalationLevel})`;
      case 'AdminActive':
        return `Chat with ${session.assignedAdminName || 'Admin'}`;
      case 'Closed':
        return 'Session closed';
      case 'TimedOut':
        return 'Session timed out';
      default:
        return 'Support session';
    }
  };

  const getSessionStatusColor = () => {
    switch (session.status) {
      case 'Pending':
        return 'text-yellow-600';
      case 'AiActive':
        return 'text-blue-600';
      case 'AdminActive':
        return 'text-green-600';
      case 'Closed':
        return 'text-gray-600';
      case 'TimedOut':
        return 'text-red-600';
      default:
        return 'text-text-primary';
    }
  };

  // Use real-time messages if available, otherwise fallback to API messages or supportMessages
  const sessionMessages = messages[session.id] || apiMessages || supportMessages;
  const sessionTypingUsers = isConnected ? (typingUsers[session.id] || []) : [];
  
  // Convert support messages to chat messages format
  const chatMessages = sessionMessages.map(msg => {
    let sender: 'user' | 'bot' | 'admin' | 'system';
    if (msg.isFromUser) {
      sender = 'user';
    } else if (msg.isFromAdmin) {
      sender = 'admin';
    } else if (msg.isFromAi) {
      sender = 'bot';
    } else {
      sender = 'system';
    }
    
    return {
      id: msg.id,
      content: msg.content,
      sender,
      timestamp: new Date(msg.sentAt),
      type: (msg.type === 'SystemMessage' ? 'system_message' : 'text') as 'text' | 'quick_action' | 'contact_request' | 'system_message'
    };
  });

  return (
    <div className="flex flex-col h-full">
      {/* Support Session Header */}
      <div className="px-4 py-3 border-b border-border-primary bg-surface-secondary">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-text-primary">{session.topic}</h4>
            <p className={`text-xs ${getSessionStatusColor()}`}>
              {getSessionStatusText()}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {session.status === 'AdminActive' && (
              <div className="text-xs text-text-muted">
                Admin: {session.assignedAdminName}
              </div>
            )}
            
            {session.status !== 'Closed' && session.status !== 'TimedOut' && (
              <button
                onClick={handleCloseSession}
                className="text-xs text-text-muted hover:text-error-muted transition-colors"
              >
                End Session
              </button>
            )}
          </div>
        </div>
        
        {/* Escalation Level Indicator */}
        {session.escalationLevel > 0 && (
          <div className="mt-2 text-xs text-text-muted">
            Escalation Level: {session.escalationLevel}
            {session.aiEscalationReason && (
              <span className="ml-2">({session.aiEscalationReason})</span>
            )}
          </div>
        )}
      </div>

      {/* Original Context Information */}
      <div className="px-4 py-2 bg-surface-primary border-b border-border-primary">
        <div className="text-xs text-text-muted">
          Started from: {session.originalContext?.routePath}
          {session.originalContext?.customerId && (
            <span className="ml-2">• Customer: {session.originalContext?.customerId}</span>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 min-h-0">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-2"></div>
              <p className="text-text-muted text-sm">Loading messages...</p>
            </div>
          </div>
        ) : (
          <ChatMessages 
            messages={chatMessages} 
            isTyping={isLoading}
          />
        )}
      </div>

      {/* Real-time Connection Status */}
      {!isConnected && (
        <div className="px-4 py-2 bg-warning-bg border-t border-warning text-warning-muted text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Connecting to real-time support...</span>
          </div>
        </div>
      )}

      {/* Admin Typing Indicator */}
      {sessionTypingUsers.length > 0 && (
        <div className="px-4 py-2 bg-surface-secondary border-t border-border-primary">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
            <span>
              {sessionTypingUsers.map(user => user.userName).join(', ')} 
              {sessionTypingUsers.length === 1 ? ' is typing...' : ' are typing...'}
            </span>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={isLoading || session.status === 'Closed' || session.status === 'TimedOut'}
        placeholder={
          session.status === 'Pending' 
            ? 'Waiting for support...' 
            : session.status === 'AiActive'
            ? 'Message AI Assistant...'
            : session.status === 'AdminActive'
            ? `Message ${session.assignedAdminName || 'Admin'}...`
            : 'Session ended'
        }
      />

      {/* Timeout Warning */}
      {session.status === 'Pending' && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
          <div className="text-xs text-yellow-700">
            If no admin responds within 5 minutes, you'll be connected to our AI assistant.
          </div>
        </div>
      )}
    </div>
  );
};