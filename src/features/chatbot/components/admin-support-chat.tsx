import React, { useState, useEffect, useRef } from 'react';
import { useSupportStore } from '../support-store';
import { useGetSupportMessages, useSendSupportMessage } from '../api/chatbot';
import type { SupportSession, SupportMessage } from '../api/chatbot';

interface AdminSupportChatProps {
  session: SupportSession;
  onClose: () => void;
}

export const AdminSupportChat: React.FC<AdminSupportChatProps> = ({ session, onClose }) => {
  const { messages, typingUsers, joinSession, setTyping, sendMessage } = useSupportStore();
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | undefined>(undefined);

  const { data: apiMessages } = useGetSupportMessages(session.id);
  const sendSupportMessage = useSendSupportMessage();

  const sessionMessages = messages[session.id] || [];
  const sessionTypingUsers = typingUsers[session.id] || [];

  useEffect(() => {
    joinSession(session.id);
  }, [session.id, joinSession]);

  useEffect(() => {
    scrollToBottom();
  }, [sessionMessages, sessionTypingUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      await sendSupportMessage.mutateAsync({
        sessionId: session.id,
        request: { content, type: 'Text' }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optionally show error toast
    }
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      setTyping(session.id, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(session.id, false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-warning';
      case 'AiActive': return 'text-info';
      case 'AdminActive': return 'text-success';
      case 'Closed': return 'text-text-muted';
      case 'TimedOut': return 'text-error';
      default: return 'text-text-primary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return 'Waiting for Admin';
      case 'AiActive': return 'AI Assistant Active';
      case 'AdminActive': return 'With Admin';
      case 'Closed': return 'Closed';
      case 'TimedOut': return 'Timed Out';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const MessageBubble = ({ message }: { message: SupportMessage }) => {
    const isAdmin = message.isFromAdmin;
    const isUser = message.isFromUser;
    const isSystem = !isAdmin && !isUser;

    if (isSystem) {
      return (
        <div className="flex justify-center my-4">
          <div className="bg-surface-secondary text-text-muted px-4 py-2 rounded-lg text-sm">
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className="flex items-start gap-3 max-w-[80%]">
          {!isAdmin && (
            <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white text-sm font-medium">
              {session.customerEmail.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div
            className={`
              p-3 rounded-lg
              ${isAdmin 
                ? 'bg-accent-primary text-white rounded-br-sm' 
                : 'bg-surface-secondary text-text-primary rounded-bl-sm'
              }
            `}
          >
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
            <div 
              className={`
                text-xs mt-1 opacity-70
                ${isAdmin ? 'text-white/70' : 'text-text-muted'}
              `}
            >
              {formatTime(message.sentAt)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white text-sm font-medium">
          {session.customerEmail.charAt(0).toUpperCase()}
        </div>
        <div className="bg-surface-secondary text-text-primary p-3 rounded-lg rounded-bl-sm">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-text-muted">User is typing...</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-surface-primary border border-border-primary rounded-lg flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-primary">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center text-white font-medium">
            {session.customerEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-text-primary">{session.topic}</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-muted">{session.customerEmail}</span>
              <span className={getStatusColor(session.status)}>
                • {getStatusText(session.status)}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Session Context */}
      <div className="px-4 py-3 bg-surface-secondary border-b border-border-primary">
        <div className="text-sm text-text-muted">
          <span>Started from: {session.originalContext?.routePath}</span>
          {session.originalContext?.customerId && (
            <span className="ml-3">• Customer: {session.originalContext.customerId}</span>
          )}
          {session.escalationLevel > 0 && (
            <span className="ml-3 text-warning">• Escalation Level: {session.escalationLevel}</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        {sessionMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-text-muted">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {sessionMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {sessionTypingUsers.length > 0 && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border-primary">
        <div className="flex gap-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            disabled={session.status === 'Closed' || session.status === 'TimedOut'}
            className="flex-1 px-4 py-2 border border-border-primary rounded-lg bg-bg-primary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || session.status === 'Closed' || session.status === 'TimedOut'}
            className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};