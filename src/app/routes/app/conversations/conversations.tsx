import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatbotStore } from '@/features/chatbot/store';
import { ChatContextType, useDeleteConversation, useClearConversationMessages, useGetUserConversations } from '@/features/chatbot/api/chatbot';
import { useQueryClient } from '@tanstack/react-query';

export const ConversationsRoute: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'messages'>('recent');
  const [filterContext, setFilterContext] = useState<ChatContextType | 'all'>('all');

  const {
    searchConversations,
    conversationsByContext,
    switchToConversation,
    openChat,
  } = useChatbotStore();

  // Fetch conversations from server
  const { data: conversations = [], isLoading, error } = useGetUserConversations();
  const deleteConversationMutation = useDeleteConversation();
  const clearMessagesMutation = useClearConversationMessages();

  const getQuickActionsForContext = (contextType: ChatContextType, contextData: any) => {
    switch (contextType) {
      case ChatContextType.Dashboard:
        return [
          { id: 'explain_metrics', label: 'Explain Metrics', action: 'explain_dashboard_metrics' },
          { id: 'run_analysis', label: 'Run Analysis', action: 'run_new_analysis' },
          { id: 'export_report', label: 'Export Report', action: 'export_dashboard_report' },
          { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
        ];
      case ChatContextType.CustomerDetail:
        return [
          { id: 'customer_analytics', label: 'Customer Analytics', action: 'show_customer_analytics' },
          { id: 'churn_risk', label: 'Churn Risk Analysis', action: 'analyze_churn_risk' },
          { id: 'export_data', label: 'Export Customer Data', action: 'export_customer_data' },
          { id: 'contact_history', label: 'Contact History', action: 'show_contact_history' },
        ];
      case ChatContextType.Customers:
        return [
          { id: 'import_customers', label: 'Import Customers', action: 'help_import_customers' },
          { id: 'segment_customers', label: 'Create Segments', action: 'help_create_customer_segments' },
          { id: 'export_customers', label: 'Export Customer Data', action: 'export_customer_list' },
          { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
        ];
      case ChatContextType.Campaigns:
        return [
          { id: 'create_campaign', label: 'Create Campaign', action: 'help_create_campaign' },
          { id: 'campaign_analytics', label: 'Campaign Analytics', action: 'analyze_campaign_performance' },
          { id: 'target_audience', label: 'Target Audience', action: 'help_target_audience' },
          { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
        ];
      case ChatContextType.Analytics:
        return [
          { id: 'ltv_analysis', label: 'LTV Analysis', action: 'explain_ltv_analysis' },
          { id: 'churn_prediction', label: 'Churn Prediction', action: 'explain_churn_prediction' },
          { id: 'demographic_insights', label: 'Demographic Insights', action: 'show_demographic_insights' },
        ];
      case ChatContextType.Segments:
        return [
          { id: 'create_segment', label: 'Create Segment', action: 'help_create_segment' },
          { id: 'segment_performance', label: 'Segment Performance', action: 'analyze_segment_performance' },
          { id: 'export_segments', label: 'Export Segments', action: 'export_segment_data' },
        ];
      case ChatContextType.Integrations:
        return [
          { id: 'integration_help', label: 'Integration Help', action: 'help_with_integrations' },
          { id: 'account_settings', label: 'Account Settings', action: 'explain_account_settings' },
          { id: 'billing_help', label: 'Billing Help', action: 'billing_assistance' },
        ];
      case ChatContextType.Import:
        return [
          { id: 'import_status', label: 'Import Status', action: 'check_import_status' },
          { id: 'fix_errors', label: 'Fix Import Errors', action: 'help_fix_import_errors' },
          { id: 'data_mapping', label: 'Data Mapping Help', action: 'data_mapping_help' },
        ];
      default:
        return [
          { id: 'getting_started', label: 'Getting Started', action: 'getting_started_guide' },
          { id: 'feature_help', label: 'Feature Help', action: 'feature_assistance' },
          { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
        ];
    }
  };

  const handleConversationClick = (conversation: any) => {
    // Debug: Log the conversation data to see what we're getting
    console.log('🔍 Conversation data:', conversation);
    console.log('🔍 Context Type:', conversation.contextType);
    console.log('🔍 Context Data:', conversation.contextData);

    // Create context from conversation data
    const conversationContext = {
      type: conversation.contextType || ChatContextType.General,
      routePath: conversation.contextPath || conversation.contextData?.routePath || '/app',
      customerId: conversation.contextData?.customerId,
      analysisId: conversation.contextData?.analysisId,
      importJobId: conversation.contextData?.importJobId,
      segmentId: conversation.contextData?.segmentId,
    };

    console.log('🔍 Generated context:', conversationContext);

    // Get the appropriate quick actions for this context
    const quickActions = getQuickActionsForContext(
      conversationContext.type, 
      conversation.contextData
    );

    console.log('🔍 Generated quick actions:', quickActions);

    // Set the current conversation, context, and quick actions in the store
    useChatbotStore.setState({ 
      currentConversation: conversation,
      conversationId: conversation.id,
      pageMessages: [], // Will be loaded from server when chat opens
      pageContext: conversationContext, // Set the proper context from the conversation
      pageQuickActions: quickActions, // Set the proper quick actions for the context
    });
    
    console.log('🔍 Store updated, opening chat...');
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
        
        // Clear current conversation if it's the one being deleted
        useChatbotStore.setState((state) => ({
          currentConversation: state.currentConversation?.id === conversationId ? undefined : state.currentConversation,
          pageMessages: state.currentConversation?.id === conversationId ? [] : state.pageMessages,
        }));
        
        // Invalidate queries to refetch conversations from server
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
        
        // Clear messages if it's the current conversation
        useChatbotStore.setState((state) => ({
          pageMessages: state.currentConversation?.id === conversationId ? [] : state.pageMessages,
        }));
        
        // Invalidate queries to refetch from server
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
        
        // Clear current conversation if it's one of the deleted ones
        useChatbotStore.setState((state) => ({
          currentConversation: selectedConversations.includes(state.currentConversation?.id || '') ? undefined : state.currentConversation,
          pageMessages: selectedConversations.includes(state.currentConversation?.id || '') ? [] : state.pageMessages,
        }));
        
        // Invalidate queries to refetch from server
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

  const getContextIcon = (contextType: ChatContextType) => {
    switch (contextType) {
      case ChatContextType.Dashboard:
        return '🏠';
      case ChatContextType.CustomerDetail:
        return '👤';
      case ChatContextType.Customers:
        return '👥';
      case ChatContextType.Campaigns:
        return '📢';
      case ChatContextType.Analytics:
        return '📊';
      case ChatContextType.Segments:
        return '🎯';
      case ChatContextType.Integrations:
        return '🔗';
      case ChatContextType.Import:
        return '📥';
      case ChatContextType.Support:
        return '🆘';
      default:
        return '💬';
    }
  };

  // Use server data instead of local store
  const filteredConversations = searchQuery
    ? conversations.filter(conversation =>
        conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const sortedConversations = [...filteredConversations]
    .filter(conversation => {
      if (filterContext === 'all') return true;
      // Use context type from server data
      return conversation.contextType === filterContext;
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
        {isLoading ? (
          <div className="text-center py-12 bg-surface-secondary rounded-lg border border-border-primary">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-lg font-medium text-text-primary mb-2">Loading conversations...</h3>
            <p className="text-text-muted">Please wait while we fetch your chat history</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-surface-secondary rounded-lg border border-border-primary">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-medium text-text-primary mb-2">Failed to load conversations</h3>
            <p className="text-text-muted">There was an error loading your chat history. Please try refreshing the page.</p>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="text-center py-12 bg-surface-secondary rounded-lg border border-border-primary">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No conversations found</h3>
            <p className="text-text-muted">
              {searchQuery ? 'Try adjusting your search or filters' : 'Start a conversation to see it here'}
            </p>
          </div>
        ) : (
          sortedConversations.map((conversation) => {
            // Use context type from server data for proper icon
            const contextIcon = getContextIcon(conversation.contextType || ChatContextType.General);
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