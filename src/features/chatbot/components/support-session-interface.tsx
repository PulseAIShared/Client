import React from 'react';
import { useChatbotStore } from '../store';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { useSendSupportMessage, useCloseSupportSession } from '../api/chatbot';
import type { SupportSession } from '../api/chatbot';

interface SupportSessionInterfaceProps {
  session: SupportSession;
}

export const SupportSessionInterface: React.FC<SupportSessionInterfaceProps> = ({ session }) => {
  const { supportMessages, addSupportMessage, clearSupportSession, isLoading, setLoading } = useChatbotStore();
  const sendSupportMessage = useSendSupportMessage();
  const closeSupportSession = useCloseSupportSession();

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setLoading(true);
    
    try {
      const message = await sendSupportMessage.mutateAsync({
        sessionId: session.id,
        request: { content }
      });
      
      addSupportMessage(message);
    } catch (error) {
      console.error('Failed to send support message:', error);
    } finally {
      setLoading(false);
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

  // Convert support messages to chat messages format
  const chatMessages = supportMessages.map(msg => {
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
      <div className="flex-1 overflow-hidden">
        <ChatMessages 
          messages={chatMessages} 
          isTyping={isLoading}
        />
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
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