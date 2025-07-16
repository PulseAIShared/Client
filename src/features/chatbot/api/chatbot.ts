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