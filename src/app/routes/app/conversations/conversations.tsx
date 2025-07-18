import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatbotStore } from '@/features/chatbot/store';
import { ChatContextType, useDeleteConversation, useClearConversationMessages } from '@/features/chatbot/api/chatbot';
import { useQueryClient } from '@tanstack/react-query';

export const ConversationsRoute: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'messages'>('recent');
  const [filterContext, setFilterContext] = useState<ChatContextType | 'all'>('all');

  const {
    allConversations,
    searchConversations,
    conversationsByContext,
    switchToConversation,
    openChat,
  } = useChatbotStore();

  const deleteConversationMutation = useDeleteConversation();
  const clearMessagesMutation = useClearConversationMessages();

  const handleConversationClick = (conversation: any) => {
    // Switch to conversation and open chat directly, no navigation required
    switchToConversation(conversation);
    openChat();
  };

  const navigateToContext = (contextKey: string) => {
    if (contextKey.startsWith('customer-')) {
      const customerId = contextKey.split('-')[1];
      navigate(`/app/customers/${customerId}`);
    } else if (contextKey.startsWith('analytics-')) {
      const analysisId = contextKey.split('-')[1];
      navigate(`/app/analytics/churn-analysis/${analysisId}`);
    } else if (contextKey === 'dashboard') {
      navigate('/app/dashboard');
    } else if (contextKey === 'integrations') {
      navigate('/app/settings');
    } else if (contextKey.startsWith('segments-')) {
      navigate('/app/segments');
    } else {
      navigate('/app/dashboard');
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      try {
        await deleteConversationMutation.mutateAsync(conversationId);
        
        // Update local store by removing the conversation
        useChatbotStore.setState((state) => ({
          allConversations: state.allConversations.filter(c => c.id !== conversationId),
          conversationsByContext: Object.fromEntries(
            Object.entries(state.conversationsByContext).filter(([key, conv]) => conv.id !== conversationId)
          ),
          messagesByContext: Object.fromEntries(
            Object.entries(state.messagesByContext).filter(([key, conv]) => 
              state.conversationsByContext[key]?.id !== conversationId
            )
          ),
          currentConversation: state.currentConversation?.id === conversationId ? undefined : state.currentConversation,
        }));
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['chatbot', 'conversations'] });
        queryClient.invalidateQueries({ queryKey: ['chatbot', 'conversation', conversationId] });
        
        // Remove from selected conversations
        setSelectedConversations(prev => prev.filter(id => id !== conversationId));
      } catch (error) {
        console.error('Failed to delete conversation:', error);
        // You could add a toast notification here
      }
    }
  };

  const handleClearMessages = async (conversationId: string) => {
    if (window.confirm('Are you sure you want to clear all messages from this conversation? This action cannot be undone.')) {
      try {
        await clearMessagesMutation.mutateAsync(conversationId);
        
        // Update local store by clearing messages for this conversation
        const contextKey = Object.keys(conversationsByContext).find(
          key => conversationsByContext[key].id === conversationId
        );
        
        if (contextKey) {
          useChatbotStore.setState((state) => ({
            messagesByContext: {
              ...state.messagesByContext,
              [contextKey]: [],
            },
            pageMessages: state.currentConversation?.id === conversationId ? [] : state.pageMessages,
          }));
        }
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['chatbot', 'conversation', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['chatbot', 'conversations'] });
      } catch (error) {
        console.error('Failed to clear messages:', error);
        // You could add a toast notification here
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedConversations.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedConversations.length} conversation(s)? This action cannot be undone.`)) {
      try {
        // Delete all selected conversations
        await Promise.all(
          selectedConversations.map(conversationId => 
            deleteConversationMutation.mutateAsync(conversationId)
          )
        );
        
        // Update local store by removing all selected conversations
        useChatbotStore.setState((state) => ({
          allConversations: state.allConversations.filter(c => !selectedConversations.includes(c.id)),
          conversationsByContext: Object.fromEntries(
            Object.entries(state.conversationsByContext).filter(([key, conv]) => !selectedConversations.includes(conv.id))
          ),
          messagesByContext: Object.fromEntries(
            Object.entries(state.messagesByContext).filter(([key, conv]) => 
              !selectedConversations.includes(state.conversationsByContext[key]?.id || '')
            )
          ),
          currentConversation: selectedConversations.includes(state.currentConversation?.id || '') ? undefined : state.currentConversation,
        }));
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['chatbot', 'conversations'] });
        selectedConversations.forEach(conversationId => {
          queryClient.invalidateQueries({ queryKey: ['chatbot', 'conversation', conversationId] });
        });
        
        setSelectedConversations([]);
      } catch (error) {
        console.error('Failed to delete conversations:', error);
        // You could add a toast notification here
      }
    }
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

  const getContextIcon = (contextKey: string) => {
    if (contextKey.startsWith('customer-')) return '👤';
    if (contextKey.startsWith('analytics-')) return '📊';
    if (contextKey.startsWith('segments-')) return '🎯';
    if (contextKey === 'dashboard') return '🏠';
    if (contextKey === 'integrations') return '🔗';
    return '💬';
  };

  const getContextType = (contextKey: string): ChatContextType => {
    if (contextKey.startsWith('customer-')) return ChatContextType.CustomerDetail;
    if (contextKey.startsWith('analytics-')) return ChatContextType.Analytics;
    if (contextKey.startsWith('segments-')) return ChatContextType.Segments;
    if (contextKey === 'dashboard') return ChatContextType.Dashboard;
    if (contextKey === 'integrations') return ChatContextType.Integrations;
    return ChatContextType.General;
  };

  const filteredConversations = searchQuery
    ? searchConversations(searchQuery)
    : allConversations;

  const sortedConversations = [...filteredConversations]
    .filter(conversation => {
      if (filterContext === 'all') return true;
      const contextKey = Object.keys(conversationsByContext).find(
        key => conversationsByContext[key].id === conversation.id
      );
      return contextKey && getContextType(contextKey) === filterContext;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'messages':
          return b.messageCount - a.messageCount;
        default:
          return 0;
      }
    });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Conversation History</h1>
            <p className="text-text-muted">
              Manage and revisit your AI conversations across different contexts
            </p>
          </div>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-surface-secondary hover:bg-surface-primary border border-border-primary rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-surface-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="recent">Recent</option>
              <option value="title">Title</option>
              <option value="messages">Messages</option>
            </select>
            <select
              value={filterContext}
              onChange={(e) => setFilterContext(e.target.value as typeof filterContext)}
              className="px-3 py-2 bg-surface-primary border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="all">All Contexts</option>
              <option value={ChatContextType.Dashboard}>Dashboard</option>
              <option value={ChatContextType.CustomerDetail}>Customers</option>
              <option value={ChatContextType.Analytics}>Analytics</option>
              <option value={ChatContextType.Segments}>Segments</option>
              <option value={ChatContextType.Integrations}>Integrations</option>
              <option value={ChatContextType.General}>General</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedConversations.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-surface-secondary rounded-lg border border-border-primary mb-4">
            <span className="text-sm text-text-muted">
              {selectedConversations.length} conversation(s) selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-error text-white rounded hover:bg-error-muted transition-colors text-sm"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedConversations([])}
              className="px-3 py-1 bg-surface-primary border border-border-primary rounded hover:bg-surface-secondary transition-colors text-sm"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {sortedConversations.length === 0 ? (
          <div className="text-center py-12 bg-surface-secondary rounded-lg border border-border-primary">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No conversations found</h3>
            <p className="text-text-muted">
              {searchQuery ? 'Try adjusting your search or filters' : 'Start a conversation to see it here'}
            </p>
          </div>
        ) : (
          sortedConversations.map((conversation) => {
            const contextKey = Object.keys(conversationsByContext).find(
              key => conversationsByContext[key].id === conversation.id
            );
            const contextIcon = contextKey ? getContextIcon(contextKey) : '💬';
            const isSelected = selectedConversations.includes(conversation.id);

            return (
              <div
                key={conversation.id}
                className={`p-6 bg-surface-primary border rounded-lg transition-all hover:shadow-md ${
                  isSelected ? 'border-accent-primary bg-accent-primary/5' : 'border-border-primary'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedConversations([...selectedConversations, conversation.id]);
                        } else {
                          setSelectedConversations(selectedConversations.filter(id => id !== conversation.id));
                        }
                      }}
                      className="mt-1 w-4 h-4 text-accent-primary bg-surface-secondary border-border-primary rounded focus:ring-accent-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{contextIcon}</span>
                        <h3 className="text-lg font-medium text-text-primary hover:text-accent-primary cursor-pointer">
                          {conversation.title}
                        </h3>
                      </div>
                      <p className="text-text-muted mb-3 line-clamp-2">
                        {(() => {
                          if (typeof conversation.lastMessage === 'string') {
                            return conversation.lastMessage;
                          } else if (conversation.lastMessage && typeof conversation.lastMessage === 'object' && 'content' in conversation.lastMessage) {
                            return (conversation.lastMessage as any).content;
                          } else {
                            return 'No messages yet';
                          }
                        })()}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        <span>💬 {conversation.messageCount} messages</span>
                        <span>⏰ {formatTimeAgo(conversation.lastMessageAt)}</span>
                        <span>📅 Created {formatTimeAgo(conversation.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleConversationClick(conversation)}
                      className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors text-sm"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() => handleClearMessages(conversation.id)}
                      className="px-3 py-2 bg-warning text-white rounded-lg hover:bg-warning-muted transition-colors text-sm"
                    >
                      Clear Messages
                    </button>
                    <button
                      onClick={() => handleDeleteConversation(conversation.id)}
                      className="px-3 py-2 bg-error text-white rounded-lg hover:bg-error-muted transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};