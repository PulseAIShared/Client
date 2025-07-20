import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../store';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping?: boolean;
}

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 md:mb-3`}>
      <div
        className={`
          max-w-[90%] md:max-w-[85%] px-2 md:px-3 py-2 rounded-lg
          ${isUser 
            ? 'bg-accent-primary text-white rounded-br-sm' 
            : 'bg-surface-secondary text-text-primary rounded-bl-sm'
          }
        `}
      >
        <div className="text-sm md:text-sm leading-relaxed whitespace-pre-wrap break-words">
          {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
        </div>
        <div 
          className={`
            text-xs mt-1 opacity-70
            ${isUser ? 'text-white/70' : 'text-text-muted'}
          `}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start mb-4">
    <div className="bg-surface-secondary text-text-primary p-3 rounded-lg rounded-bl-sm">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs text-text-muted ml-2">AI is typing...</span>
      </div>
    </div>
  </div>
);

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isTyping }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="h-full px-2 md:px-3 py-2 overflow-y-auto bg-bg-primary">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-accent-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-medium text-text-primary mb-2">
              Welcome to PulseAI Assistant
            </h3>
            <p className="text-text-muted text-xs md:text-sm">
              I'm here to help you with analytics, customer insights, and platform features.
              <br className="hidden md:block" />
              <span className="md:hidden"> </span>
              Ask me anything or use the quick actions below!
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};