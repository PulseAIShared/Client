import React, { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useChatbotStore } from '@/features/chatbot/store';
import { useGetUserConversations, useDeleteConversation, useClearConversationMessages, ChatContextType, type ChatConversation } from '@/features/chatbot/api/chatbot';
import { useQueryClient } from '@tanstack/react-query';

export const ConversationsRoute: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'messages'>('recent');
  const [filterContext, setFilterContext] = useState<ChatContextType | 'all'>('all');

  const {
    openChat,
  } = useChatbotStore();

  // Fetch conversations from server
  const { data: conversations = [], isLoading, error } = useGetUserConversations();
  const deleteConversationMutation = useDeleteConversation();
  const clearMessagesMutation = useClearConversationMessages();

  const getQuickActionsForContext = (contextType: ChatContextType) => {
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
          { id: 'create_playbook', label: 'Create Playbook', action: 'help_create_playbook' },
          { id: 'playbook_analytics', label: 'Playbook Analytics', action: 'analyze_playbook_performance' },
          { id: 'target_audience', label: 'Target Segments', action: 'help_target_segments' },
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
      default:
        return [
          { id: 'getting_started', label: 'Getting Started', action: 'getting_started_guide' },
          { id: 'feature_help', label: 'Feature Help', action: 'feature_assistance' },
          { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
        ];
    }
  };

  const handleConversationClick = (conversation: unknown) => {
    // Debug: Log the conversation data to see what we're getting
    console.log('🔍 Conversation data:', conversation);
    console.log('🔍 Context Type:', (conversation as { contextType?: ChatContextType }).contextType);
    console.log('🔍 Context Data:', (conversation as { contextData?: unknown }).contextData);

    // Create context from conversation data
    const conversationContext = {
      type: (conversation as { contextType?: ChatContextType }).contextType || ChatContextType.General,
      routePath: (conversation as { contextPath?: string; contextData?: { routePath?: string } }).contextPath || (conversation as { contextData?: { routePath?: string } }).contextData?.routePath || '/app',
      customerId: (conversation as { contextData?: { customerId?: string } }).contextData?.customerId,
      analysisId: (conversation as { contextData?: { analysisId?: string } }).contextData?.analysisId,
      segmentId: (conversation as { contextData?: { segmentId?: string } }).contextData?.segmentId,
    };

    console.log('🔍 Generated context:', conversationContext);

    // Get the appropriate quick actions for this context
    const quickActions = getQuickActionsForContext(conversationContext.type);

    console.log('🔍 Generated quick actions:', quickActions);

    // Set the current conversation, context, and quick actions in the store
    useChatbotStore.setState({ 
      currentConversation: conversation as unknown as ChatConversation,
      conversationId: (conversation as { id?: string }).id || '',
      pageMessages: [], // Will be loaded from server when chat opens
      pageContext: conversationContext, // Set the proper context from the conversation
      pageQuickActions: quickActions, // Set the proper quick actions for the context
    });
    
    console.log('🔍 Store updated, opening chat...');
    openChat();
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

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative">
              <Spinner size="xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <p className="text-text-secondary font-medium">Loading conversations...</p>
            <p className="text-text-muted text-sm">Preparing your chat history</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-surface-primary/80 backdrop-blur-xl p-8 rounded-3xl border border-border-primary/50 shadow-2xl max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Failed to Load Conversations</h2>
            <p className="text-text-muted mb-4">
              {error instanceof Error ? error.message : 'Unable to load conversation history'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Enhanced Header */}
        <div className="relative group">
          {/* Enhanced background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-accent-secondary/5 to-accent-primary/5 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
          
          <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div className="flex-1 space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary mb-2">
                  Conversation History
                </h1>
                <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-2xl">
                  Manage and revisit your AI conversations across different contexts and features
                </p>
              </div>
              
              {/* Enhanced Mobile: Quick stats in a responsive grid */}
              <div className="lg:hidden grid grid-cols-2 gap-4 mt-6">
                <div className="bg-surface-primary/50 backdrop-blur-lg p-4 rounded-2xl border border-border-primary/30 text-center shadow-lg">
                  <div className="text-xl sm:text-2xl font-bold text-accent-primary">{conversations.length}</div>
                  <div className="text-xs sm:text-sm text-text-muted">total conversations</div>
                </div>
                <div className="bg-surface-primary/50 backdrop-blur-lg p-4 rounded-2xl border border-border-primary/30 text-center shadow-lg">
                  <div className="text-xl sm:text-2xl font-bold text-success-muted">
                    {conversations.reduce((acc, conv) => acc + conv.messageCount, 0).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-text-muted">total messages</div>
                </div>
              </div>
              
              {/* Enhanced Desktop: Quick stats in sidebar format */}
              <div className="hidden lg:flex items-center gap-6">
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent-primary">{conversations.length}</div>
                  <div className="text-sm text-text-muted">total conversations</div>
                </div>
                <div className="w-px h-12 bg-border-primary/30"></div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-success-muted">
                    {conversations.reduce((acc, conv) => acc + conv.messageCount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-text-muted">total messages</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border-primary/30 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Search Conversations</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
                />
                <svg className="absolute right-3 top-3.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
              >
                <option value="recent">Most Recent</option>
                <option value="title">Title A-Z</option>
                <option value="messages">Most Messages</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Context Filter</label>
              <select
                value={filterContext}
                onChange={(e) => setFilterContext(e.target.value as typeof filterContext)}
                className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
              >
                <option value="all">All Contexts</option>
                <option value={ChatContextType.Dashboard}>Dashboard</option>
                <option value={ChatContextType.CustomerDetail}>Customer Detail</option>
                <option value={ChatContextType.Customers}>Customers</option>
                <option value={ChatContextType.Campaigns}>Playbooks</option>
                <option value={ChatContextType.Analytics}>Analytics</option>
                <option value={ChatContextType.Segments}>Segments</option>
                <option value={ChatContextType.Integrations}>Integrations</option>
                <option value={ChatContextType.General}>General</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSortBy('recent');
                  setFilterContext('all');
                }}
                className="w-full px-4 py-3 bg-surface-secondary/50 hover:bg-surface-secondary/80 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-text-primary border border-border-primary/30 rounded-xl font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Bulk Actions */}
        {selectedConversations.length > 0 && (
          <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 backdrop-blur-xl p-6 rounded-2xl border border-accent-primary/30 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {selectedConversations.length} conversation(s) selected
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-error text-white rounded-xl hover:bg-error-muted hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedConversations([])}
                  className="px-4 py-2 bg-surface-secondary/50 text-text-primary border border-border-primary/30 rounded-xl hover:bg-surface-primary/50 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Conversations List */}
        <div className="space-y-6">
          {sortedConversations.length === 0 ? (
            <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-12 border border-border-primary/30 shadow-xl text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-surface-secondary/50 to-surface-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </h3>
              <p className="text-text-muted mb-8 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  : 'Start a conversation with our AI assistant to see it appear here.'
                }
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => openChat()}
                  className="inline-block px-8 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold"
                >
                  Start Your First Conversation
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {sortedConversations.map((conversation) => {
                const contextIcon = getContextIcon(conversation.contextType || ChatContextType.General);
                const isSelected = selectedConversations.includes(conversation.id);

                return (
                  <div
                    key={conversation.id}
                    className={`group bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                      isSelected 
                        ? 'border-accent-primary/50 bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5' 
                        : 'border-border-primary/30 hover:border-accent-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 sm:gap-6 flex-1">
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
                          className="mt-1 w-5 h-5 text-accent-primary bg-surface-secondary border-border-primary rounded focus:ring-accent-primary/30 focus:ring-2 transition-all duration-200"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                              <span className="text-xl">{contextIcon}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg sm:text-xl font-semibold text-text-primary hover:text-accent-primary cursor-pointer transition-colors">
                                {conversation.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-text-muted mt-1">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  {conversation.messageCount} messages
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {formatTimeAgo(conversation.lastMessageAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-text-muted mb-4 line-clamp-2">
                            {(() => {
                              const lastMessage = (conversation as { lastMessage?: string | { content?: string } }).lastMessage;
                              if (typeof lastMessage === 'string') {
                                return lastMessage;
                              } else if (lastMessage && typeof lastMessage === 'object' && 'content' in lastMessage) {
                                return (lastMessage as { content?: string }).content || 'No messages yet';
                              } else {
                                return 'No messages yet';
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleConversationClick(conversation)}
                          className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium"
                        >
                          Continue
                        </button>
                        <button
                          onClick={() => handleClearMessages(conversation.id)}
                          className="px-3 py-2 bg-warning/20 text-warning border border-warning/30 rounded-xl hover:bg-warning/30 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => handleDeleteConversation(conversation.id)}
                          className="px-3 py-2 bg-error/20 text-error border border-error/30 rounded-xl hover:bg-error/30 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};
