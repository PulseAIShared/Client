import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

// Chat Types
export interface ChatRequest {
  message: string;
  context: {
    type: ChatContextType;
    customerId?: string;
    analysisId?: string;
    routePath: string;
  };
  conversationId?: string;
}

export interface ChatMessageResponse {
  id: string;
  conversationId: string;
  content: string;
  sender: MessageSender;
  type: MessageType;
  timestamp: string;
  metadata?: any;
}

export interface ChatResponse {
  message: ChatMessageResponse;
  conversationId: string;
  suggestions?: string[];
  requiresHumanHandoff?: boolean;
  metadata?: any;
}

export interface ChatMessage {
  id: string;
  content: string;
  isFromUser: boolean;
  timestamp: string;
  conversationId: string;
  sender: MessageSender;
}

export interface ChatConversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
  contextType?: ChatContextType;
  contextPath?: string; // Backend returns this instead of routePath in contextData
  contextData?: {
    customerId?: string;
    analysisId?: string;
    segmentId?: string;
    routePath?: string;
  } | null; // Backend can return null
}

export interface ConversationHistoryResponse {
  conversationId: string;
  messages: ChatMessage[];
  totalMessages: number;
  hasMoreMessages: boolean;
}

export interface ContactRequest {
  email: string;
  message: string;
  context?: {
    type: ChatContextType;
    routePath: string;
    customerId?: string;
  };
}

export interface ContactResponse {
  success: boolean;
  ticketId?: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Support Session Types
export interface SupportSession {
  id: string;
  userId: string;
  customerEmail: string;
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
  type: ChatContextType;
  routePath: string;
  customerId?: string;
  analysisId?: string;
  segmentId?: string;
  additionalContext?: Record<string, string>;
}

export enum ChatContextType {
  General = 0,
  Dashboard = 1,
  CustomerDetail = 2,
  Analytics = 3,
  Segments = 4,
  Integrations = 5,
  Import = 6,
  Customers = 7,
  Campaigns = 8,
  Support = 9
}

export enum MessageSender {
  User = 0,
  Bot = 1,
  Admin = 2
}

export enum MessageType {
  Text = 0,
  QuickAction = 1,
  ContactRequest = 2,
  SystemMessage = 3
}

export enum SupportSessionStatus {
  WaitingForAdmin = 0,
  WithAi = 1,
  WithAdmin = 2,
  EscalatedToEmail = 3,
  Closed = 4
}

export enum SupportPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
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
  return api.post('/chatbot/send', request);
};

export const sendContactRequest = (request: ContactRequest): Promise<ContactResponse> => {
  return api.post('/chatbot/contact', request);
};

export const getChatHistory = (conversationId: string, page: number = 1, pageSize: number = 20): Promise<ConversationHistoryResponse> => {
  return api.get(`/chatbot/history/${conversationId}?page=${page}&pageSize=${pageSize}`);
};

export const getUserConversations = (): Promise<ChatConversation[]> => {
  return api.get('/chatbot/conversations').then((response) => {
    // Handle paginated response - extract items array if present
    const data = response as unknown as PaginatedResponse<ChatConversation> | ChatConversation[];
    return 'items' in data ? data.items : data;
  });
};

export const deleteConversation = (conversationId: string): Promise<void> => {
  return api.delete(`/chatbot/conversations/${conversationId}`);
};

export const clearConversationMessages = (conversationId: string): Promise<void> => {
  return api.delete(`/chatbot/conversations/${conversationId}/messages`);
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
  return api.get(`/support/admin/sessions${params}`).then((response) => {
    // Handle paginated response - extract items array
    const data = response as unknown as PaginatedResponse<SupportSession> | SupportSession[];
    const sessions = 'items' in data ? data.items : data;
    
    // If no specific status filter is provided and this is meant to be "active" sessions,
    // filter out closed sessions as a safety measure (status 4 = Closed)
    if (!status) {
      return sessions.filter(session => 
        (session.status as any) !== SupportSessionStatus.Closed && 
        session.status !== 'Closed'
      );
    }
    
    return sessions;
  });
};

export const claimSupportSession = (sessionId: string): Promise<SupportSession> => {
  return api.post(`/support/admin/sessions/${sessionId}/claim`);
};

export const getActiveSupportSessions = (): Promise<SupportSession[]> => {
  return api.get('/support/admin/active').then((response) => {
    // Handle paginated response - extract items array
    const data = response as unknown as PaginatedResponse<SupportSession> | SupportSession[];
    const sessions = 'items' in data ? data.items : data;
    
    // Filter out closed sessions as a safety measure (status 4 = Closed)
    return sessions.filter(session => 
      (session.status as any) !== SupportSessionStatus.Closed && 
      session.status !== 'Closed'
    );
  });
};

// Query Options
export const getChatHistoryQueryOptions = (conversationId: string, page: number = 1, pageSize: number = 20) => ({
  queryKey: ['chatbot', 'conversation', conversationId, page, pageSize],
  queryFn: () => getChatHistory(conversationId, page, pageSize),
  enabled: !!conversationId,
});

export const getUserConversationsQueryOptions = () => ({
  queryKey: ['chatbot', 'conversations'],
  queryFn: getUserConversations,
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

export const useGetChatHistory = (conversationId: string, page: number = 1, pageSize: number = 20) => {
  return useQuery({
    ...getChatHistoryQueryOptions(conversationId, page, pageSize),
  });
};

export const useGetUserConversations = () => {
  return useQuery({
    ...getUserConversationsQueryOptions(),
  });
};

export const useDeleteConversation = () => {
  return useMutation({
    mutationFn: deleteConversation,
    onError: (error) => {
      console.error('Failed to delete conversation:', error);
    },
  });
};

export const useClearConversationMessages = () => {
  return useMutation({
    mutationFn: clearConversationMessages,
    onError: (error) => {
      console.error('Failed to clear conversation messages:', error);
    },
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