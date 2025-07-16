import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick_action' | 'contact_request';
}

export interface ChatbotContext {
  type: 'general' | 'customer_detail' | 'dashboard' | 'segments' | 'insights' | 'settings' | 'analytics';
  customerId?: string;
  analysisId?: string;
  importJobId?: string;
  userId?: string;
  routePath: string;
}

export interface QuickAction {
  id: string;
  label: string;
  action: string;
  icon?: string;
}

interface ChatbotState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: ChatMessage[];
  context: ChatbotContext;
  quickActions: QuickAction[];
  isLoading: boolean;
  isTyping: boolean;
  conversationId?: string;
}

interface ChatbotActions {
  openChat: () => void;
  closeChat: () => void;
  toggleMinimized: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateContext: (context: Partial<ChatbotContext>) => void;
  setQuickActions: (actions: QuickAction[]) => void;
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  clearMessages: () => void;
  startNewConversation: () => void;
}

export const useChatbotStore = create<ChatbotState & ChatbotActions>()(
  persist(
    (set) => ({
      isOpen: false,
      isMinimized: false,
      messages: [],
      context: {
        type: 'general',
        routePath: '/',
      },
      quickActions: [],
      isLoading: false,
      isTyping: false,
      conversationId: undefined,

      openChat: () => set({ isOpen: true, isMinimized: false }),
      closeChat: () => set({ isOpen: false }),
      toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized })),

      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      updateContext: (newContext) =>
        set((state) => ({
          context: { ...state.context, ...newContext },
        })),

      setQuickActions: (actions) => set({ quickActions: actions }),
      setLoading: (loading) => set({ isLoading: loading }),
      setTyping: (typing) => set({ isTyping: typing }),

      clearMessages: () => set({ messages: [] }),

      startNewConversation: () => {
        const conversationId = crypto.randomUUID();
        set({
          messages: [],
          conversationId,
          isLoading: false,
          isTyping: false,
        });
      },
    }),
    {
      name: 'chatbot-store',
      partialize: (state) => ({
        messages: state.messages,
        conversationId: state.conversationId,
      }),
    }
  )
);