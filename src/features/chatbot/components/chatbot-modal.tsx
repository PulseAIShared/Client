import React from 'react';
import { useChatbotStore } from '../store';
import { ContextSwitcher } from './context-switcher';
import { ConversationSwitcher } from './conversation-switcher';
import { SupportSessionInterface } from './support-session-interface';
import { PageHelpInterface } from './page-help-interface';
import { LandingHelpInterface } from './landing-help-interface';

export const ChatbotModal: React.FC = () => {
  const {
    isOpen,
    isMinimized,
    activeMode,
    supportSession,
    isAppRoute,
    closeChat,
    toggleMinimized,
  } = useChatbotStore();

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed z-50 bg-surface-primary border border-border-primary rounded-lg shadow-2xl
        transition-all duration-300 ease-in-out flex flex-col
        ${isMinimized ? 'h-14' : 'h-[600px] md:h-[600px]'}
        
        /* Mobile: Full screen except for safe areas */
        bottom-0 left-0 right-0 mx-4 mb-4
        ${isMinimized ? '' : 'top-16'}
        
        /* Desktop: Fixed size in bottom right */
        md:bottom-6 md:right-6 md:left-auto md:top-auto
        md:w-96 md:max-w-[calc(100vw-3rem)]
        
        /* Ensure it doesn't exceed viewport */
        max-h-[calc(100vh-5rem)] md:max-h-[calc(100vh-6rem)]
      `}
    >
      {/* Header */}
      <div className="border-b border-border-primary bg-surface-secondary rounded-t-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-text-primary text-sm">PulseAI Assistant</h3>
              <p className="text-xs text-text-muted">
                {activeMode === 'support_session' ? 'Support Session' : 'Page Help'}
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
        
        {/* Conversation Switcher - Only show for app routes */}
        {!isMinimized && activeMode === 'page_help' && isAppRoute && <ConversationSwitcher />}
      </div>

      {/* Context Switcher - Only show for app routes */}
      {!isMinimized && isAppRoute && <ContextSwitcher />}

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          {activeMode === 'support_session' && supportSession ? (
            <SupportSessionInterface session={supportSession} />
          ) : isAppRoute ? (
            <PageHelpInterface />
          ) : (
            <LandingHelpInterface />
          )}
        </div>
      )}
    </div>
  );
};