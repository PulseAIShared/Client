import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

// Types
export interface ChatRequest {
  message: string;
  context: {
    type: string;
    customerId?: string;
    analysisId?: string;
    routePath: string;
  };
  conversationId?: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  suggestions?: string[];
}

export interface ContactRequest {
  email: string;
  message: string;
  context?: {
    type: string;
    routePath: string;
    customerId?: string;
  };
}

export interface ContactResponse {
  success: boolean;
  ticketId?: string;
  message: string;
}

// Support Session Types
export interface SupportSession {
  id: string;
  userId: string;
  userEmail: string;
  topic: string;
  initialMessage: string;
  status: 'Pending' | 'AiActive' | 'AdminActive' | 'Closed' | 'TimedOut';
  createdAt: string;
  closedAt?: string;
  assignedAdminId?: string;
  assignedAdminName?: string;
  adminAssignedAt?: string;
  adminLastSeenAt?: string;
  aiSessionActive: boolean;
  aiSessionStartedAt?: string;
  aiSessionEndedAt?: string;
  aiEscalationReason?: string;
  aiInteractionCount: number;
  lastAiConfidenceScore?: number;
  lastResponseAt?: string;
  escalationLevel: 0 | 1 | 2 | 3;
  hasTimedOut: boolean;
  timeoutOccurredAt?: string;
  customerRiskLevel?: string;
  customerSegment?: string;
  integrationCount: number;
  customerLastActivity?: string;
  originalContext: ChatbotContext;
  currentContext?: ChatbotContext;
  metadata?: Record<string, any>;
}

export interface ChatbotContext {
  type: 'General' | 'Dashboard' | 'CustomerDetail' | 'Analytics' | 'Segments' | 'Integrations' | 'Import';
  routePath: string;
  customerId?: string;
  analysisId?: string;
  importJobId?: string;
  segmentId?: string;
  additionalContext?: Record<string, string>;
}

export interface SupportMessage {
  id: string;
  sessionId: string;
  content: string;
  type: 'Text' | 'SystemMessage' | 'EscalationNotice';
  sentAt: string;
  userId?: string;
  senderName: string;
  isFromUser: boolean;
  isFromAi: boolean;
  isFromAdmin: boolean;
  aiConfidenceScore?: number;
  aiModel?: string;
  wasEscalated: boolean;
  escalationReason?: string;
  isRead: boolean;
  readAt?: string;
  readByUserId?: string;
  metadata?: Record<string, any>;
}

export interface CreateSupportSessionRequest {
  topic: string;
  initialMessage: string;
  customerContext?: string;
  originalContext: ChatbotContext;
  currentContext?: ChatbotContext;
}

export interface SendSupportMessageRequest {
  content: string;
  type?: 'Text' | 'SystemMessage';
}

export interface AdminInfo {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
}

// API Functions
export const sendChatMessage = (request: ChatRequest): Promise<ChatResponse> => {
  return api.post('/chatbot/chat', request);
};

export const sendContactRequest = (request: ContactRequest): Promise<ContactResponse> => {
  return api.post('/chatbot/contact', request);
};

export const getChatHistory = (conversationId: string) => {
  return api.get(`/chatbot/conversations/${conversationId}`);
};

// Support Session API Functions
export const createSupportSession = (request: CreateSupportSessionRequest): Promise<SupportSession> => {
  return api.post('/support/sessions', request);
};

export const getSupportSession = (sessionId: string): Promise<SupportSession> => {
  return api.get(`/support/sessions/${sessionId}`);
};

export const getActiveSupportSession = (): Promise<SupportSession | null> => {
  return api.get('/support/sessions/active');
};

export const sendSupportMessage = (sessionId: string, request: SendSupportMessageRequest): Promise<SupportMessage> => {
  return api.post(`/support/sessions/${sessionId}/messages`, request);
};

export const getSupportMessages = (sessionId: string): Promise<SupportMessage[]> => {
  return api.get(`/support/sessions/${sessionId}/messages`);
};

export const closeSupportSession = (sessionId: string, reason?: string): Promise<SupportSession> => {
  return api.post(`/support/sessions/${sessionId}/close`, { reason });
};

export const assignSupportSession = (sessionId: string, adminId: string): Promise<SupportSession> => {
  return api.post(`/support/sessions/${sessionId}/assign`, { adminId });
};

// Admin Support API Functions
export const getAdminSupportSessions = (status?: string): Promise<SupportSession[]> => {
  const params = status ? `?status=${status}` : '';
  return api.get(`/support/admin/sessions${params}`);
};

export const claimSupportSession = (sessionId: string): Promise<SupportSession> => {
  return api.post(`/support/admin/sessions/${sessionId}/claim`);
};

export const getActiveSupportSessions = (): Promise<SupportSession[]> => {
  return api.get('/support/admin/active');
};

// Query Options
export const getChatHistoryQueryOptions = (conversationId: string) => ({
  queryKey: ['chatbot', 'conversation', conversationId],
  queryFn: () => getChatHistory(conversationId),
  enabled: !!conversationId,
});

// Hooks
export const useSendChatMessage = () => {
  return useMutation({
    mutationFn: sendChatMessage,
    onError: (error) => {
      console.error('Chat message failed:', error);
    },
  });
};

export const useSendContactRequest = () => {
  return useMutation({
    mutationFn: sendContactRequest,
    onSuccess: (data) => {
      if (data.success) {
        console.log('Contact request sent successfully:', data.ticketId);
      }
    },
    onError: (error) => {
      console.error('Contact request failed:', error);
    },
  });
};

export const useGetChatHistory = (conversationId: string) => {
  return useQuery({
    ...getChatHistoryQueryOptions(conversationId),
  });
};

// Support Session Hooks
export const useCreateSupportSession = () => {
  return useMutation({
    mutationFn: createSupportSession,
    onError: (error) => {
      console.error('Failed to create support session:', error);
    },
  });
};

export const useGetActiveSupportSession = () => {
  return useQuery({
    queryKey: ['support', 'active-session'],
    queryFn: getActiveSupportSession,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
};

export const useGetSupportSession = (sessionId: string) => {
  return useQuery({
    queryKey: ['support', 'session', sessionId],
    queryFn: () => getSupportSession(sessionId),
    enabled: !!sessionId,
  });
};

export const useGetSupportMessages = (sessionId: string) => {
  return useQuery({
    queryKey: ['support', 'messages', sessionId],
    queryFn: () => getSupportMessages(sessionId),
    enabled: !!sessionId,
    refetchInterval: 30000, // 30 seconds
  });
};

export const useSendSupportMessage = () => {
  return useMutation({
    mutationFn: ({ sessionId, request }: { sessionId: string; request: SendSupportMessageRequest }) =>
      sendSupportMessage(sessionId, request),
    onError: (error) => {
      console.error('Failed to send support message:', error);
    },
  });
};

export const useCloseSupportSession = () => {
  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason?: string }) =>
      closeSupportSession(sessionId, reason),
    onError: (error) => {
      console.error('Failed to close support session:', error);
    },
  });
};

// Admin Support Hooks
export const useGetAdminSupportSessions = (status?: string) => {
  return useQuery({
    queryKey: ['support', 'admin', 'sessions', status],
    queryFn: () => getAdminSupportSessions(status),
    refetchInterval: 30000, // 30 seconds
  });
};

export const useClaimSupportSession = () => {
  return useMutation({
    mutationFn: claimSupportSession,
    onError: (error) => {
      console.error('Failed to claim support session:', error);
    },
  });
};

export const useGetActiveSupportSessions = () => {
  return useQuery({
    queryKey: ['support', 'admin', 'active'],
    queryFn: getActiveSupportSessions,
    refetchInterval: 30000, // 30 seconds
  });
};