import React, { createContext, useContext, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useChatbotStore, ChatbotContext, QuickAction } from './store';
import { useGetActiveSupportSession, ChatContextType } from './api/chatbot';
import { useUser } from '@/lib/auth';
import { getToken } from '@/lib/api-client';

interface ChatbotProviderProps {
  children: React.ReactNode;
}

const ChatbotContextProvider = createContext<{
  updateContextFromRoute: () => void;
} | null>(null);

const getContextFromRoute = (
  pathname: string,
  search: string,
  params: Record<string, string | undefined>,
): {
  context: ChatbotContext;
  quickActions: QuickAction[];
} => {
  const routeSegments = pathname.split('/').filter(Boolean);
  const appSegments = pathname.startsWith('/app') ? routeSegments.slice(1) : routeSegments;
  const defaultPageArea = appSegments[0] ?? 'app';
  const defaultPageName = appSegments[1] ?? appSegments[0] ?? 'home';
  const searchParams = new URLSearchParams(search);
  const analysisId = searchParams.get('analysisId') ?? searchParams.get('jobId') ?? undefined;
  const selectedSegmentId = searchParams.get('segmentId') ?? undefined;

  const buildContext = (
    context: ChatbotContext,
    pageArea: string,
    pageName: string,
    subPage?: string,
    extra: Record<string, string | undefined> = {},
  ): ChatbotContext => ({
    ...context,
    additionalContext: {
      pageArea,
      pageName,
      ...(subPage ? { subPage } : {}),
      ...Object.fromEntries(Object.entries(extra).filter(([, value]) => Boolean(value))) as Record<string, string>,
    },
  });

  if (!pathname.startsWith('/app')) {
    return {
      context: buildContext({
        type: ChatContextType.General,
        routePath: pathname,
      }, 'marketing', routeSegments[0] ?? 'landing'),
      quickActions: [
        { id: 'contact', label: 'Contact Support', action: 'contact_support' },
        { id: 'demo', label: 'Book Demo', action: 'book_demo' },
        { id: 'pricing', label: 'Pricing Info', action: 'pricing_info' },
        { id: 'features', label: 'Feature Overview', action: 'feature_overview' },
      ],
    };
  }

  if (pathname.includes('/admin/support')) {
    return {
      context: buildContext({
        type: ChatContextType.Support,
        routePath: pathname,
      }, 'admin', 'support'),
      quickActions: [
        { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
        { id: 'feature_help', label: 'Feature Help', action: 'feature_assistance' },
        { id: 'getting_started', label: 'Getting Started', action: 'getting_started_guide' },
      ],
    };
  }

  // App routes - authenticated area
  if (pathname.includes('/customers/') && params.customerId) {
    return {
      context: buildContext({
        type: ChatContextType.CustomerDetail,
        customerId: params.customerId,
        routePath: pathname,
      }, 'customers', 'customer_detail'),
      quickActions: [
        { id: 'customer_analytics', label: 'Customer Analytics', action: 'show_customer_analytics' },
        { id: 'churn_risk', label: 'Churn Risk Analysis', action: 'analyze_churn_risk' },
        { id: 'export_data', label: 'Export Customer Data', action: 'export_customer_data' },
        { id: 'contact_history', label: 'Contact History', action: 'show_contact_history' },
      ],
    };
  }

  if (pathname.includes('/dashboard') || pathname === '/app' || pathname === '/app/') {
    return {
      context: buildContext({
        type: ChatContextType.Dashboard,
        segmentId: selectedSegmentId,
        routePath: pathname,
      }, 'dashboard', 'overview'),
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
      context: buildContext({
        type: ChatContextType.Customers,
        segmentId: selectedSegmentId,
        routePath: pathname,
      }, 'customers', 'list'),
      quickActions: [
        { id: 'segment_customers', label: 'Create Segments', action: 'help_create_customer_segments' },
        { id: 'export_customers', label: 'Export Customer Data', action: 'export_customer_list' },
        { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
      ],
    };
  }

  if (pathname.includes('/segments')) {
    const segmentSubPage = params.segmentId
      ? (pathname.endsWith('/edit') ? 'edit' : 'detail')
      : 'list';
    return {
      context: buildContext({
        type: ChatContextType.Segments,
        segmentId: params.segmentId,
        routePath: pathname,
      }, 'segments', 'segments', segmentSubPage),
      quickActions: [
        { id: 'create_segment', label: 'Create Segment', action: 'help_create_segment' },
        { id: 'segment_performance', label: 'Segment Performance', action: 'analyze_segment_performance' },
        { id: 'export_segments', label: 'Export Segments', action: 'export_segment_data' },
      ],
    };
  }

  if (pathname.includes('/playbooks') || pathname.includes('/work-queue')) {
    const playbookSubPage = pathname.includes('/work-queue')
      ? 'work_queue'
      : pathname.includes('/playbooks/create')
        ? 'create'
        : pathname.endsWith('/edit')
          ? 'edit'
          : pathname.endsWith('/runs')
            ? 'runs'
            : params.playbookId
              ? 'detail'
              : 'list';

    return {
      context: buildContext({
        type: ChatContextType.Campaigns,
        routePath: pathname,
      }, 'playbooks', pathname.includes('/work-queue') ? 'work_queue' : 'playbooks', playbookSubPage, {
        playbookId: params.playbookId,
      }),
      quickActions: [
        { id: 'create_playbook', label: 'Create Playbook', action: 'help_create_playbook' },
        { id: 'playbook_analytics', label: 'Playbook Analytics', action: 'analyze_playbook_performance' },
        { id: 'target_audience', label: 'Target Segments', action: 'help_target_segments' },
        { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
      ],
    };
  }

  if (pathname.includes('/insights') || pathname.includes('/impact')) {
    const analyticsPage = pathname.includes('/impact') ? 'impact' : 'insights';
    return {
      context: buildContext({
        type: ChatContextType.Analytics,
        analysisId: analysisId ?? undefined,
        segmentId: selectedSegmentId,
        routePath: pathname,
      }, 'analytics', analyticsPage),
      quickActions: [
        { id: 'ltv_analysis', label: 'LTV Analysis', action: 'explain_ltv_analysis' },
        { id: 'churn_prediction', label: 'Churn Prediction', action: 'explain_churn_prediction' },
        { id: 'demographic_insights', label: 'Demographic Insights', action: 'show_demographic_insights' },
      ],
    };
  }

  if (
    pathname.includes('/settings') ||
    pathname.includes('/integrations') ||
    pathname.includes('/oauth/')
  ) {
    const integrationsPage = pathname.includes('/oauth/')
      ? 'oauth_callback'
      : pathname.includes('/settings/integrations') && pathname.includes('/configure')
        ? 'integration_configure'
        : pathname.includes('/integrations')
          ? 'integrations'
          : 'settings';

    return {
      context: buildContext({
        type: ChatContextType.Integrations,
        routePath: pathname,
      }, 'integrations', integrationsPage, undefined, {
        integrationId: params.integrationId,
      }),
      quickActions: [
        { id: 'integration_help', label: 'Integration Help', action: 'help_with_integrations' },
        { id: 'account_settings', label: 'Account Settings', action: 'explain_account_settings' },
        { id: 'billing_help', label: 'Billing Help', action: 'billing_assistance' },
      ],
    };
  }

  if (pathname.includes('/notifications')) {
    return {
      context: buildContext({
        type: ChatContextType.Dashboard,
        routePath: pathname,
      }, 'dashboard', 'notifications'),
      quickActions: [
        { id: 'explain_metrics', label: 'Explain Metrics', action: 'explain_dashboard_metrics' },
        { id: 'contact_support', label: 'Contact Support', action: 'contact_support' },
        { id: 'feature_help', label: 'Feature Help', action: 'feature_assistance' },
      ],
    };
  }

  // Default app context
  return {
    context: buildContext({
      type: ChatContextType.General,
      routePath: pathname,
    }, defaultPageArea, defaultPageName),
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
  const isAppRoute = location.pathname.startsWith('/app');
  const authUser = useUser({
    enabled: isAppRoute,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  });
  const { 
    updatePageContext, 
    setPageQuickActions, 
    setSupportSession,
    supportSession,
    setIsAppRoute,
    closeChat
  } = useChatbotStore();

  // Load active support session on mount
  const shouldLoadSupportSession = isAppRoute && Boolean(authUser.data) && Boolean(getToken());
  const { data: activeSession } = useGetActiveSupportSession(shouldLoadSupportSession);

  const updateContextFromRoute = React.useCallback(() => {
    const { context, quickActions } = getContextFromRoute(location.pathname, location.search, params);
    updatePageContext(context);
    setPageQuickActions(quickActions);
    
    // Set whether this is an app route or not
    setIsAppRoute(isAppRoute);
    
    // Auto-close chat when visiting conversations page
    if (location.pathname === '/app/conversations') {
      closeChat();
    }
  }, [location.pathname, location.search, params, updatePageContext, setPageQuickActions, setIsAppRoute, isAppRoute, closeChat]);

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
