import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SupportSession, SupportMessage } from './api/chatbot';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'admin' | 'system';
  timestamp: Date;
  type?: 'text' | 'quick_action' | 'contact_request' | 'system_message';
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

type ChatbotMode = 'page_help' | 'support_session';

interface ChatbotState {
  // UI State
  isOpen: boolean;
  isMinimized: boolean;
  activeMode: ChatbotMode;
  
  // Page Context (changes with navigation)
  pageContext: ChatbotContext;
  pageMessages: ChatMessage[];
  pageQuickActions: QuickAction[];
  
  // Support Session Context (persistent)
  supportSession: SupportSession | null;
  supportMessages: SupportMessage[];
  
  // General State
  isLoading: boolean;
  isTyping: boolean;
  conversationId?: string;
}

interface ChatbotActions {
  // UI Actions
  openChat: () => void;
  closeChat: () => void;
  toggleMinimized: () => void;
  setActiveMode: (mode: ChatbotMode) => void;
  
  // Page Context Actions
  updatePageContext: (context: Partial<ChatbotContext>) => void;
  setPageQuickActions: (actions: QuickAction[]) => void;
  addPageMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearPageMessages: () => void;
  
  // Support Session Actions
  setSupportSession: (session: SupportSession | null) => void;
  addSupportMessage: (message: SupportMessage) => void;
  setSupportMessages: (messages: SupportMessage[]) => void;
  updateSupportSession: (updates: Partial<SupportSession>) => void;
  clearSupportSession: () => void;
  
  // General Actions
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  startNewConversation: () => void;
}

export const useChatbotStore = create<ChatbotState & ChatbotActions>()(
  persist(
    (set) => ({
      // UI State
      isOpen: false,
      isMinimized: false,
      activeMode: 'page_help',
      
      // Page Context
      pageContext: {
        type: 'general',
        routePath: '/',
      },
      pageMessages: [],
      pageQuickActions: [],
      
      // Support Session Context
      supportSession: null,
      supportMessages: [],
      
      // General State
      isLoading: false,
      isTyping: false,
      conversationId: undefined,

      // UI Actions
      openChat: () => set({ isOpen: true, isMinimized: false }),
      closeChat: () => set({ isOpen: false }),
      toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized })),
      setActiveMode: (mode) => set({ activeMode: mode }),

      // Page Context Actions
      updatePageContext: (newContext) =>
        set((state) => ({
          pageContext: { ...state.pageContext, ...newContext },
        })),
      
      setPageQuickActions: (actions) => set({ pageQuickActions: actions }),
      
      addPageMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };
        set((state) => ({
          pageMessages: [...state.pageMessages, newMessage],
        }));
      },
      
      clearPageMessages: () => set({ pageMessages: [] }),

      // Support Session Actions
      setSupportSession: (session) => {
        set({ 
          supportSession: session,
          activeMode: session ? 'support_session' : 'page_help'
        });
      },
      
      addSupportMessage: (message) => {
        set((state) => ({
          supportMessages: [...state.supportMessages, message],
        }));
      },
      
      setSupportMessages: (messages) => set({ supportMessages: messages }),
      
      updateSupportSession: (updates) => {
        set((state) => ({
          supportSession: state.supportSession 
            ? { ...state.supportSession, ...updates }
            : null,
        }));
      },
      
      clearSupportSession: () => {
        set({ 
          supportSession: null,
          supportMessages: [],
          activeMode: 'page_help'
        });
      },

      // General Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setTyping: (typing) => set({ isTyping: typing }),

      startNewConversation: () => {
        const conversationId = crypto.randomUUID();
        set({
          pageMessages: [],
          conversationId,
          isLoading: false,
          isTyping: false,
        });
      },
    }),
    {
      name: 'chatbot-store',
      partialize: (state) => ({
        pageMessages: state.pageMessages,
        conversationId: state.conversationId,
        supportSession: state.supportSession,
        supportMessages: state.supportMessages,
      }),
    }
  )
);