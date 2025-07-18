import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SupportSession, SupportMessage, ChatMessage as APIChatMessage, ChatConversation } from './api/chatbot';
import { ChatContextType, MessageSender } from './api/chatbot';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'admin' | 'system';
  timestamp: Date;
  type?: 'text' | 'quick_action' | 'contact_request' | 'system_message';
}

export interface ChatbotContext {
  type: ChatContextType;
  customerId?: string;
  analysisId?: string;
  importJobId?: string;
  userId?: string;
  segmentId?: string;
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
  
  // Context-based Conversation Management
  currentContextKey: string;
  conversationsByContext: Record<string, ChatConversation>; // contextKey -> conversation
  messagesByContext: Record<string, ChatMessage[]>; // contextKey -> messages
  allConversations: ChatConversation[]; // For history page
  currentConversation?: ChatConversation;
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
  setPageMessages: (messages: ChatMessage[]) => void;
  loadConversationHistory: (conversationId: string) => void;
  
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
  
  // Context-based Conversation Actions
  generateContextKey: (context: ChatbotContext) => string;
  switchToContext: (contextKey: string) => void;
  createConversationForContext: (contextKey: string, context: ChatbotContext) => void;
  loadConversationForContext: (contextKey: string) => void;
  switchToConversation: (conversation: ChatConversation) => void;
  deleteConversation: (contextKey: string) => void;
  clearConversationMessages: (contextKey: string) => void;
  getAllConversations: () => ChatConversation[];
  searchConversations: (query: string) => ChatConversation[];
  
  // API Actions
  setConversations: (conversations: ChatConversation[]) => void;
  setCurrentConversation: (conversation: ChatConversation | undefined) => void;
  convertAPIMessagesToChatMessages: (apiMessages: APIChatMessage[]) => ChatMessage[];
}

export const useChatbotStore = create<ChatbotState & ChatbotActions>()(
  persist(
    (set, get) => ({
      // UI State
      isOpen: false,
      isMinimized: false,
      activeMode: 'page_help',
      
      // Page Context
      pageContext: {
        type: ChatContextType.General,
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
      
      // Context-based Conversation Management
      currentContextKey: 'general',
      conversationsByContext: {},
      messagesByContext: {},
      allConversations: [],
      currentConversation: undefined,
      conversationId: undefined,

      // UI Actions
      openChat: () => set({ isOpen: true, isMinimized: false }),
      closeChat: () => set({ isOpen: false }),
      toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized })),
      setActiveMode: (mode) => set({ activeMode: mode }),

      // Page Context Actions
      updatePageContext: (newContext) =>
        set((state) => {
          const updatedContext = { ...state.pageContext, ...newContext };
          const contextKey = get().generateContextKey(updatedContext);
          
          // If context changed, switch to the appropriate conversation
          if (contextKey !== state.currentContextKey) {
            const conversation = state.conversationsByContext[contextKey];
            const messages = state.messagesByContext[contextKey] || [];
            
            return {
              pageContext: updatedContext,
              currentContextKey: contextKey,
              currentConversation: conversation,
              pageMessages: messages,
            };
          }
          
          return {
            pageContext: updatedContext,
          };
        }),
      
      setPageQuickActions: (actions) => set({ pageQuickActions: actions }),
      
      addPageMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
          content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
        };
        
        set((state) => {
          const updatedMessages = [...state.pageMessages, newMessage];
          const contextKey = state.currentContextKey;
          
          // Update conversation metadata
          const conversation = state.conversationsByContext[contextKey];
          if (conversation) {
            const updatedConversation: ChatConversation = {
              ...conversation,
              lastMessage: typeof newMessage.content === 'string' 
                ? newMessage.content 
                : (newMessage.content && typeof newMessage.content === 'object' && 'content' in newMessage.content)
                  ? (newMessage.content as any).content
                  : JSON.stringify(newMessage.content),
              lastMessageAt: new Date().toISOString(),
              messageCount: updatedMessages.length,
            };
            
            return {
              pageMessages: updatedMessages,
              messagesByContext: {
                ...state.messagesByContext,
                [contextKey]: updatedMessages,
              },
              conversationsByContext: {
                ...state.conversationsByContext,
                [contextKey]: updatedConversation,
              },
              allConversations: state.allConversations.map(c => 
                c.id === conversation.id ? updatedConversation : c
              ),
              currentConversation: updatedConversation,
            };
          }
          
          return {
            pageMessages: updatedMessages,
            messagesByContext: {
              ...state.messagesByContext,
              [contextKey]: updatedMessages,
            },
          };
        });
      },
      
      clearPageMessages: () => set({ pageMessages: [] }),
      
      setPageMessages: (messages) => set({ pageMessages: messages }),
      
      loadConversationHistory: (conversationId: string) => {
        // This will be called from components when they need to load history
        // The actual API call will be made in the component using the hook
        set({ conversationId, isLoading: true });
      },

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
        const state = get();
        const contextKey = state.currentContextKey;
        
        // Create a new conversation for the current context
        get().createConversationForContext(contextKey, state.pageContext);
        
        set({
          isLoading: false,
          isTyping: false,
        });
      },
      
      // API Actions
      setConversations: (conversations) => set({ allConversations: conversations }),
      
      setCurrentConversation: (conversation) => set({ 
        currentConversation: conversation,
        conversationId: conversation?.id
      }),
      
      convertAPIMessagesToChatMessages: (apiMessages: APIChatMessage[]) => {
        return apiMessages.map(msg => ({
          id: msg.id,
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
          sender: msg.sender === MessageSender.User ? 'user' as const : 'bot' as const, // 0 = User, 1 = Bot
          timestamp: new Date(msg.timestamp),
          type: 'text' as const
        }));
      },

      // Context-based Conversation Management
      generateContextKey: (context: ChatbotContext) => {
        const { type, customerId, analysisId, importJobId, segmentId } = context;
        
        switch (type) {
          case ChatContextType.CustomerDetail:
            return `customer-${customerId}`;
          case ChatContextType.Analytics:
            return `analytics-${analysisId}`;
          case ChatContextType.Import:
            return `import-${importJobId}`;
          case ChatContextType.Segments:
            return `segments-${segmentId}`;
          case ChatContextType.Dashboard:
            return 'dashboard';
          case ChatContextType.Integrations:
            return 'integrations';
          case ChatContextType.General:
          default:
            return 'general';
        }
      },

      switchToContext: (contextKey: string) => {
        set({ currentContextKey: contextKey });
        
        // Load conversation for this context
        const state = get();
        const conversation = state.conversationsByContext[contextKey];
        const messages = state.messagesByContext[contextKey] || [];
        
        if (conversation) {
          set({ 
            currentConversation: conversation,
            pageMessages: messages
          });
        } else {
          // No conversation exists for this context yet
          set({ 
            currentConversation: undefined,
            pageMessages: []
          });
        }
      },

      createConversationForContext: (contextKey: string, context: ChatbotContext) => {
        const conversationId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        // Generate context display name
        const getContextDisplayName = (context: ChatbotContext) => {
          switch (context.type) {
            case ChatContextType.CustomerDetail:
              return `Customer: ${context.customerId}`;
            case ChatContextType.Analytics:
              return `Analytics: ${context.analysisId}`;
            case ChatContextType.Import:
              return `Import: ${context.importJobId}`;
            case ChatContextType.Segments:
              return `Segments: ${context.segmentId}`;
            case ChatContextType.Dashboard:
              return 'Dashboard';
            case ChatContextType.Integrations:
              return 'Integrations';
            case ChatContextType.General:
            default:
              return 'General';
          }
        };
        
        const conversation: ChatConversation = {
          id: conversationId,
          title: getContextDisplayName(context),
          lastMessage: '',
          lastMessageAt: now,
          messageCount: 0,
          createdAt: now,
        };
        
        set((state) => ({
          conversationsByContext: {
            ...state.conversationsByContext,
            [contextKey]: conversation,
          },
          messagesByContext: {
            ...state.messagesByContext,
            [contextKey]: [],
          },
          allConversations: [...state.allConversations, conversation],
          currentConversation: conversation,
          pageMessages: [],
        }));
      },

      loadConversationForContext: (contextKey: string) => {
        const state = get();
        const conversation = state.conversationsByContext[contextKey];
        const messages = state.messagesByContext[contextKey] || [];
        
        if (conversation) {
          set({ 
            currentConversation: conversation,
            pageMessages: messages,
            currentContextKey: contextKey
          });
        }
      },

      switchToConversation: (conversation: ChatConversation) => {
        // Find the context key for this conversation
        const state = get();
        const contextKey = Object.keys(state.conversationsByContext).find(
          key => state.conversationsByContext[key].id === conversation.id
        );
        
        if (contextKey) {
          const messages = state.messagesByContext[contextKey] || [];
          
          // Generate the context from the contextKey
          const context = (() => {
            if (contextKey.startsWith('customer-')) {
              return {
                type: ChatContextType.CustomerDetail,
                customerId: contextKey.split('-')[1],
                routePath: `/app/customers/${contextKey.split('-')[1]}`
              };
            } else if (contextKey.startsWith('analytics-')) {
              return {
                type: ChatContextType.Analytics,
                analysisId: contextKey.split('-')[1],
                routePath: `/app/analytics/churn-analysis/${contextKey.split('-')[1]}`
              };
            } else if (contextKey.startsWith('segments-')) {
              return {
                type: ChatContextType.Segments,
                segmentId: contextKey.split('-')[1],
                routePath: '/app/segments'
              };
            } else if (contextKey.startsWith('import-')) {
              return {
                type: ChatContextType.Import,
                importJobId: contextKey.split('-')[1],
                routePath: `/app/imports/${contextKey.split('-')[1]}`
              };
            } else if (contextKey === 'dashboard') {
              return {
                type: ChatContextType.Dashboard,
                routePath: '/app/dashboard'
              };
            } else if (contextKey === 'integrations') {
              return {
                type: ChatContextType.Integrations,
                routePath: '/app/settings'
              };
            } else {
              return {
                type: ChatContextType.General,
                routePath: '/'
              };
            }
          })();
          
          set({ 
            currentConversation: conversation,
            pageMessages: messages,
            currentContextKey: contextKey,
            pageContext: context
          });
        }
      },

      deleteConversation: (contextKey: string) => {
        set((state) => {
          const conversation = state.conversationsByContext[contextKey];
          if (!conversation) return state;
          
          const newConversationsByContext = { ...state.conversationsByContext };
          const newMessagesByContext = { ...state.messagesByContext };
          const newAllConversations = state.allConversations.filter(c => c.id !== conversation.id);
          
          delete newConversationsByContext[contextKey];
          delete newMessagesByContext[contextKey];
          
          return {
            conversationsByContext: newConversationsByContext,
            messagesByContext: newMessagesByContext,
            allConversations: newAllConversations,
            currentConversation: state.currentContextKey === contextKey ? undefined : state.currentConversation,
            pageMessages: state.currentContextKey === contextKey ? [] : state.pageMessages,
          };
        });
      },

      clearConversationMessages: (contextKey: string) => {
        set((state) => ({
          messagesByContext: {
            ...state.messagesByContext,
            [contextKey]: [],
          },
          pageMessages: state.currentContextKey === contextKey ? [] : state.pageMessages,
        }));
      },

      getAllConversations: () => {
        const state = get();
        return state.allConversations;
      },

      searchConversations: (query: string) => {
        const state = get();
        const lowercaseQuery = query.toLowerCase();
        
        return state.allConversations.filter(conversation =>
          conversation.title.toLowerCase().includes(lowercaseQuery) ||
          conversation.lastMessage.toLowerCase().includes(lowercaseQuery)
        );
      },
    }),
    {
      name: 'chatbot-store',
      partialize: (state) => ({
        currentContextKey: state.currentContextKey,
        conversationsByContext: state.conversationsByContext,
        messagesByContext: state.messagesByContext,
        allConversations: state.allConversations,
        currentConversation: state.currentConversation,
        supportSession: state.supportSession,
        supportMessages: state.supportMessages,
      }),
    }
  )
);