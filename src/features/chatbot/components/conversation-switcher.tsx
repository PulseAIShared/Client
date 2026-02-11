import React, { useState } from 'react';
import { useChatbotStore } from '../store';
import { useNavigate } from 'react-router-dom';
import type { ChatConversation } from '../api/chatbot';

export const ConversationSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const {
    allConversations,
    currentConversation,
    currentContextKey,
    switchToConversation,
  } = useChatbotStore();

  const handleConversationSwitch = (conversation: ChatConversation) => {
    // Always switch to the conversation directly, no navigation required
    switchToConversation(conversation);
    setIsOpen(false);
  };

  const getCurrentContextConversations = () => {
    const state = useChatbotStore.getState();
    const currentConv = state.conversationsByContext[currentContextKey];
    return currentConv ? [currentConv] : [];
  };

  const getOtherConversations = () => {
    const state = useChatbotStore.getState();
    const currentConv = state.conversationsByContext[currentContextKey];
    return allConversations.filter(conv => conv.id !== currentConv?.id);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getConversationOrigin = (conversation: ChatConversation) => {
    const state = useChatbotStore.getState();
    const contextKey = Object.keys(state.conversationsByContext).find(
      key => state.conversationsByContext[key].id === conversation.id
    );
    
    if (!contextKey) return 'Unknown';
    
    if (contextKey.startsWith('customer:')) {
      return 'Customer Detail';
    } else if (contextKey.startsWith('analytics:') || contextKey === 'analytics') {
      return 'Analytics';
    } else if (contextKey.startsWith('segments:')) {
      return 'Segments';
    } else if (contextKey.startsWith('import:')) {
      return 'Import';
    } else if (contextKey === 'dashboard') {
      return 'Dashboard';
    } else if (contextKey.startsWith('integrations')) {
      return 'Integrations';
    } else if (contextKey.startsWith('campaigns')) {
      return 'Playbooks';
    } else if (contextKey.startsWith('general:')) {
      return 'General';
    } else {
      return 'General';
    }
  };

  const currentContextConversations = getCurrentContextConversations();
  const otherConversations = getOtherConversations();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 text-text-muted hover:text-text-primary transition-colors text-sm"
        aria-label="Switch conversation"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Conversations</span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-80 bg-surface-primary border border-border-primary rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-text-primary text-sm">Active Conversations</h4>
              <button
                onClick={() => navigate('/app/conversations')}
                className="text-xs text-accent-primary hover:text-accent-secondary"
              >
                View All →
              </button>
            </div>

            {/* Current Context Conversations */}
            {currentContextConversations.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-medium text-text-secondary mb-2">
                  🟢 Current Context
                </h5>
                {currentContextConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-2 rounded-lg mb-2 cursor-pointer transition-colors ${
                      currentConversation?.id === conversation.id
                        ? 'bg-accent-primary/10 border border-accent-primary/20'
                        : 'hover:bg-surface-secondary'
                    }`}
                    onClick={() => handleConversationSwitch(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h6 className="font-medium text-text-primary text-sm truncate">
                          {conversation.title}
                        </h6>
                        <p className="text-xs text-text-muted truncate">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      <div className="text-xs text-text-muted ml-2">
                        {formatTimeAgo(conversation.lastMessageAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Other Conversations */}
            {otherConversations.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-text-secondary mb-2">
                  Other Conversations
                </h5>
                {otherConversations.slice(0, 5).map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-2 rounded-lg mb-2 cursor-pointer hover:bg-surface-secondary transition-colors"
                    onClick={() => handleConversationSwitch(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h6 className="font-medium text-text-primary text-sm truncate">
                          {conversation.title}
                        </h6>
                        <p className="text-xs text-text-muted truncate">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-accent-primary">📍 {getConversationOrigin(conversation)}</span>
                        </div>
                      </div>
                      <div className="text-xs text-text-muted ml-2">
                        {formatTimeAgo(conversation.lastMessageAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {allConversations.length === 0 && (
              <div className="text-center py-4">
                <p className="text-text-muted text-sm">No conversations yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
