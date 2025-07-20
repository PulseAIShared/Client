import React, { createContext, useContext, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useChatbotStore, ChatbotContext, QuickAction } from './store';
import { useGetActiveSupportSession, ChatContextType } from './api/chatbot';

interface ChatbotProviderProps {
  children: React.ReactNode;
}

const ChatbotContextProvider = createContext<{
  updateContextFromRoute: () => void;
} | null>(null);

const getContextFromRoute = (pathname: string, params: Record<string, string | undefined>): {
  context: ChatbotContext;
  quickActions: QuickAction[];
} => {
  if (!pathname.startsWith('/app')) {
    return {
      context: {
        type: ChatContextType.General,
        routePath: pathname,
      },
      quickActions: [
        { id: 'contact', label: 'Contact Support', action: 'contact_support' },
        { id: 'demo', label: 'Book Demo', action: 'book_demo' },
        { id: 'pricing', label: 'Pricing Info', action: 'pricing_info' },
        { id: 'features', label: 'Feature Overview', action: 'feature_overview' },
      ],
    };
  }

  // App routes - authenticated area
  if (pathname.includes('/customers/') && params.customerId) {
    return {
      context: {
        type: ChatContextType.CustomerDetail,
        customerId: params.customerId,
        routePath: pathname,
      },
      quickActions: [
        { id: 'customer_analytics', label: 'Customer Analytics', action: 'show_customer_analytics' },
        { id: 'churn_risk', label: 'Churn Risk Analysis', action: 'analyze_churn_risk' },
        { id: 'export_data', label: 'Export Customer Data', action: 'export_customer_data' },
        { id: 'contact_history', label: 'Contact History', action: 'show_contact_history' },
      ],
    };
  }

  if (pathname.includes('/analytics/churn-analysis/') && params.analysisId) {
    return {
      context: {
        type: ChatContextType.Analytics,
        analysisId: params.analysisId,
        routePath: pathname,
      },
      quickActions: [
        { id: 'explain_results', label: 'Explain Results', action: 'explain_analysis_results' },
        { id: 'export_analysis', label: 'Export Analysis', action: 'export_analysis' },
        { id: 'create_segment', label: 'Create Segment', action: 'create_segment_from_analysis' },
      ],
    };
  }

  if (pathname.includes('/imports/') && params.importJobId) {
    return {
      context: {
        type: ChatContextType.Import,
        importJobId: params.importJobId,
        routePath: pathname,
      },
      quickActions: [
        { id: 'import_status', label: 'Import Status', action: 'check_import_status' },
        { id: 'fix_errors', label: 'Fix Import Errors', action: 'help_fix_import_errors' },
        { id: 'data_mapping', label: 'Data Mapping Help', action: 'data_mapping_help' },
      ],
    };
  }

  // Other app routes
  if (pathname.includes('/dashboard') || pathname === '/app' || pathname === '/app/') {
    return {
      context: {
        type: ChatContextType.Dashboard,
        routePath: pathname,
      },
      quickActions: [
        { id: 'explain_metrics', label: 'Explain Metrics', action: 'explain_dashboard_metrics' },
        { id: 'run_analysis', label: 'Run Analysis', action: 'run_new_analysis' },
        { id: 'export_report', label: 'Export Report', action: 'export_dashboard_report' },
        { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
      ],
    };
  }

  if (pathname.includes('/customers') && !params.customerId) {
    return {
      context: {
        type: ChatContextType.Customers,
        routePath: pathname,
      },
      quickActions: [
        { id: 'import_customers', label: 'Import Customers', action: 'help_import_customers' },
        { id: 'segment_customers', label: 'Create Segments', action: 'help_create_customer_segments' },
        { id: 'export_customers', label: 'Export Customer Data', action: 'export_customer_list' },
        { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
      ],
    };
  }

  if (pathname.includes('/campaigns')) {
    return {
      context: {
        type: ChatContextType.Campaigns,
        routePath: pathname,
      },
      quickActions: [
        { id: 'create_campaign', label: 'Create Campaign', action: 'help_create_campaign' },
        { id: 'campaign_analytics', label: 'Campaign Analytics', action: 'analyze_campaign_performance' },
        { id: 'target_audience', label: 'Target Audience', action: 'help_target_audience' },
        { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
      ],
    };
  }

  if (pathname.includes('/segments')) {
    return {
      context: {
        type: ChatContextType.Segments,
        routePath: pathname,
      },
      quickActions: [
        { id: 'create_segment', label: 'Create Segment', action: 'help_create_segment' },
        { id: 'segment_performance', label: 'Segment Performance', action: 'analyze_segment_performance' },
        { id: 'export_segments', label: 'Export Segments', action: 'export_segment_data' },
      ],
    };
  }

  if (pathname.includes('/insights')) {
    return {
      context: {
        type: ChatContextType.Analytics,
        routePath: pathname,
      },
      quickActions: [
        { id: 'ltv_analysis', label: 'LTV Analysis', action: 'explain_ltv_analysis' },
        { id: 'churn_prediction', label: 'Churn Prediction', action: 'explain_churn_prediction' },
        { id: 'demographic_insights', label: 'Demographic Insights', action: 'show_demographic_insights' },
      ],
    };
  }

  if (pathname.includes('/settings')) {
    return {
      context: {
        type: ChatContextType.Integrations,
        routePath: pathname,
      },
      quickActions: [
        { id: 'integration_help', label: 'Integration Help', action: 'help_with_integrations' },
        { id: 'account_settings', label: 'Account Settings', action: 'explain_account_settings' },
        { id: 'billing_help', label: 'Billing Help', action: 'billing_assistance' },
      ],
    };
  }

  // Default app context
  return {
    context: {
      type: ChatContextType.General,
      routePath: pathname,
    },
    quickActions: [
      { id: 'getting_started', label: 'Getting Started', action: 'getting_started_guide' },
      { id: 'feature_help', label: 'Feature Help', action: 'feature_assistance' },
      { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
    ],
  };
};

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const location = useLocation();
  const params = useParams();
  const { 
    updatePageContext, 
    setPageQuickActions, 
    setSupportSession,
    supportSession,
    setIsAppRoute,
    closeChat
  } = useChatbotStore();

  // Load active support session on mount
  const { data: activeSession } = useGetActiveSupportSession();

  const updateContextFromRoute = React.useCallback(() => {
    const { context, quickActions } = getContextFromRoute(location.pathname, params);
    updatePageContext(context);
    setPageQuickActions(quickActions);
    
    // Set whether this is an app route or not
    const isApp = location.pathname.startsWith('/app');
    setIsAppRoute(isApp);
    
    // Auto-close chat when visiting conversations page
    if (location.pathname === '/app/conversations') {
      closeChat();
    }
  }, [location.pathname, params, updatePageContext, setPageQuickActions, setIsAppRoute, closeChat]);

  // Update page context when route changes
  useEffect(() => {
    updateContextFromRoute();
  }, [updateContextFromRoute]);

  // Update support session when API data changes
  useEffect(() => {
    if (activeSession && !supportSession) {
      setSupportSession(activeSession);
    } else if (!activeSession && supportSession) {
      setSupportSession(null);
    }
  }, [activeSession, supportSession, setSupportSession]);

  return (
    <ChatbotContextProvider.Provider value={{ updateContextFromRoute }}>
      {children}
    </ChatbotContextProvider.Provider>
  );
};

export const useChatbotContext = () => {
  const context = useContext(ChatbotContextProvider);
  if (!context) {
    throw new Error('useChatbotContext must be used within a ChatbotProvider');
  }
  return context;
};