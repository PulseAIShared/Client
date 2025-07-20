import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signalRConnection } from '@/lib/signalr';
import type { QueryClient } from '@tanstack/react-query';
import type { SupportSession, SupportMessage } from './api/chatbot';

interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface AdminInfo {
  id: string;
  name: string;
  isOnline: boolean;
}

interface SupportState {
  // Connection state
  isConnected: boolean;
  connectionError: string | null;
  
  // Support sessions
  activeSessions: SupportSession[];
  currentSession: SupportSession | null;
  
  // Messages
  messages: Record<string, SupportMessage[]>;
  
  // Admin state
  adminSessions: SupportSession[];
  onlineAdmins: AdminInfo[];
  
  // Typing indicators
  typingUsers: Record<string, TypingUser[]>;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Query client for cache invalidation
  queryClient: QueryClient | null;
}

interface SupportActions {
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setQueryClient: (queryClient: QueryClient) => void;
  
  // Session management
  setCurrentSession: (session: SupportSession | null) => void;
  addSession: (session: SupportSession) => void;
  updateSession: (sessionId: string, updates: Partial<SupportSession>) => void;
  removeSession: (sessionId: string) => void;
  
  // Message management
  addMessage: (sessionId: string, message: SupportMessage) => void;
  setMessages: (sessionId: string, messages: SupportMessage[]) => void;
  
  // Admin management
  setAdminSessions: (sessions: SupportSession[]) => void;
  addAdminSession: (session: SupportSession) => void;
  updateAdminSession: (sessionId: string, updates: Partial<SupportSession>) => void;
  setOnlineAdmins: (admins: AdminInfo[]) => void;
  
  // Typing indicators
  setTypingUser: (sessionId: string, user: TypingUser) => void;
  removeTypingUser: (sessionId: string, userId: string) => void;
  
  // User actions
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: (sessionId: string) => Promise<void>;
  sendMessage: (sessionId: string, content: string) => Promise<void>;
  setTyping: (sessionId: string, isTyping: boolean) => Promise<void>;
  
  // Admin actions
  pickupSession: (sessionId: string) => Promise<void>;
  getActiveSessions: () => Promise<void>;
  
  // Event handlers
  handleMessageReceived: (message: SupportMessage) => void;
  handleAdminPickedUpSession: (data: { AdminId: string; SessionId: string; PickedUpAt: string }) => void;
  handleUserJoinedSession: (data: { UserId: string; SessionId: string; JoinedAt: string }) => void;
  handleUserTyping: (data: { UserId: string; SessionId: string; IsTyping: boolean }) => void;
  handleNewSupportSession: (data: { SessionId: string; Topic: string; CustomerRiskLevel: string; CreatedAt: string }) => void;
  handleSessionAssigned: (data: { SessionId: string; AdminId: string }) => void;
  handleSessionNeedsAttention: (data: { SessionId: string; Topic: string; CustomerRiskLevel: string; MessageCount: number }) => void;
  handleActiveSessions: (sessions: any[]) => void;
  handleAdminOnline: (data: { AdminId: string; ConnectedAt: string }) => void;
  handleAdminOffline: (data: { AdminId: string; DisconnectedAt: string }) => void;
  handleError: (message: string) => void;
  
  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSupportStore = create<SupportState & SupportActions>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      connectionError: null,
      activeSessions: [],
      currentSession: null,
      messages: {},
      adminSessions: [],
      onlineAdmins: [],
      typingUsers: {},
      isLoading: false,
      error: null,
      queryClient: null,

      // Connection management
      connect: async () => {
        try {
          set({ isLoading: true, connectionError: null });
          
          // Don't connect here - let useRealTimeNotifications handle the connection
          // Just register the event handlers
          const state = get();
          // Register all support-related SignalR events
          signalRConnection.on('admin_online', (data: unknown) => 
            state.handleAdminOnline(data as { AdminId: string; ConnectedAt: string })
          );
          signalRConnection.on('admin_offline', (data: unknown) => 
            state.handleAdminOffline(data as { AdminId: string; DisconnectedAt: string })
          );
          signalRConnection.on('new_support_session', (data: unknown) =>
            state.handleNewSupportSession(data as { SessionId: string; Topic: string; CustomerRiskLevel: string; CreatedAt: string })
          );
          signalRConnection.on('session_assigned', (data: unknown) =>
            state.handleSessionAssigned(data as { SessionId: string; AdminId: string })
          );
          signalRConnection.on('message_received', (data: unknown) =>
            state.handleMessageReceived(data as any)
          );
          signalRConnection.on('session_closed', (data: unknown) => {
            const sessionData = data as { SessionId: string; Reason: string };
            state.removeSession(sessionData.SessionId);
            
            // Invalidate queries to update UI
            const { queryClient } = state;
            if (queryClient) {
              queryClient.invalidateQueries({ queryKey: ['support', 'admin', 'sessions'] });
              queryClient.invalidateQueries({ queryKey: ['support', 'admin', 'active'] });
            }
          });
          signalRConnection.on('admin_picked_up_session', (data: unknown) =>
            state.handleAdminPickedUpSession(data as { AdminId: string; SessionId: string; PickedUpAt: string })
          );
          signalRConnection.on('user_joined_session', (data: unknown) =>
            state.handleUserJoinedSession(data as { UserId: string; SessionId: string; JoinedAt: string })
          );
          signalRConnection.on('user_typing', (data: unknown) =>
            state.handleUserTyping(data as { UserId: string; SessionId: string; IsTyping: boolean })
          );
          signalRConnection.on('active_sessions', (data: unknown) =>
            state.handleActiveSessions(data as any[])
          );
          
          set({ isConnected: true, isLoading: false });
        } catch (error) {
          console.warn('Support event registration failed:', error);
          set({ 
            isConnected: false, 
            connectionError: error instanceof Error ? error.message : 'Event registration failed',
            isLoading: false 
          });
        }
      },

      disconnect: async () => {
        // Don't disconnect the shared connection - just clean up event handlers
        set({ isConnected: false, connectionError: null });
      },
      
      setQueryClient: (queryClient: QueryClient) => {
        set({ queryClient });
      },

      // Session management
      setCurrentSession: (session) => set({ currentSession: session }),
      
      addSession: (session) =>
        set((state) => ({
          activeSessions: [...state.activeSessions, session],
        })),
      
      updateSession: (sessionId, updates) =>
        set((state) => ({
          activeSessions: state.activeSessions.map(session =>
            session.id === sessionId ? { ...session, ...updates } : session
          ),
          currentSession: state.currentSession?.id === sessionId 
            ? { ...state.currentSession, ...updates }
            : state.currentSession,
        })),
      
      removeSession: (sessionId) =>
        set((state) => ({
          activeSessions: state.activeSessions.filter(session => session.id !== sessionId),
          currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
        })),

      // Message management
      addMessage: (sessionId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [sessionId]: [...(state.messages[sessionId] || []), message],
          },
        })),
      
      setMessages: (sessionId, messages) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [sessionId]: messages,
          },
        })),

      // Admin management
      setAdminSessions: (sessions) => set({ adminSessions: sessions }),
      
      addAdminSession: (session) =>
        set((state) => ({
          adminSessions: [...state.adminSessions, session],
        })),
      
      updateAdminSession: (sessionId, updates) =>
        set((state) => ({
          adminSessions: state.adminSessions.map(session =>
            session.id === sessionId ? { ...session, ...updates } : session
          ),
        })),
      
      setOnlineAdmins: (admins) => set({ onlineAdmins: admins }),

      // Typing indicators
      setTypingUser: (sessionId, user) =>
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [sessionId]: [
              ...(state.typingUsers[sessionId] || []).filter(u => u.userId !== user.userId),
              user,
            ],
          },
        })),
      
      removeTypingUser: (sessionId, userId) =>
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [sessionId]: (state.typingUsers[sessionId] || []).filter(u => u.userId !== userId),
          },
        })),

      // User actions
      joinSession: async (sessionId) => {
        await signalRConnection.joinSupportSession(sessionId);
      },
      
      leaveSession: async (sessionId) => {
        // Server automatically handles leaving when connection closes
        console.log('Leaving session:', sessionId);
      },
      
      sendMessage: async (sessionId, content) => {
        await signalRConnection.sendMessage(sessionId, content);
      },
      
      setTyping: async (sessionId, isTyping) => {
        await signalRConnection.setTypingIndicator(sessionId, isTyping);
      },

      // Admin actions
      pickupSession: async (sessionId) => {
        await signalRConnection.pickupSupportSession(sessionId);
      },
      
      getActiveSessions: async () => {
        await signalRConnection.getActiveSessions();
      },

      // Event handlers
      handleMessageReceived: (message) => {
        get().addMessage(message.sessionId, message);
      },
      
      handleAdminPickedUpSession: (data) => {
        get().updateSession(data.SessionId, {
          assignedAdminId: data.AdminId,
          status: 'AdminActive',
        });
      },
      
      handleUserJoinedSession: (data) => {
        console.log('User joined session:', data.UserId, 'in session:', data.SessionId);
        // Update UI to show user joined
      },
      
      handleUserTyping: (data) => {
        if (data.IsTyping) {
          get().setTypingUser(data.SessionId, {
            userId: data.UserId,
            userName: 'User',
            isTyping: true,
          });
        } else {
          get().removeTypingUser(data.SessionId, data.UserId);
        }
      },
      
      // Note: Server doesn't send AdminTyping events - remove this handler
      
      handleNewSupportSession: (data) => {
        const session: SupportSession = {
          id: data.SessionId,
          userId: '',
          customerEmail: '',
          userEmail: '',
          topic: data.Topic,
          initialMessage: '',
          status: 'Pending',
          createdAt: data.CreatedAt,
          aiSessionActive: false,
          aiInteractionCount: 0,
          escalationLevel: 0,
          hasTimedOut: false,
          integrationCount: 0,
          originalContext: { type: 0, routePath: '/support' },
        };
        get().addAdminSession(session);
        
        // Invalidate queries to update admin UI immediately
        const { queryClient } = get();
        if (queryClient) {
          queryClient.invalidateQueries({ queryKey: ['support', 'admin', 'sessions'] });
          queryClient.invalidateQueries({ queryKey: ['support', 'admin', 'active'] });
        }
      },
      
      handleSessionAssigned: (data) => {
        get().updateAdminSession(data.SessionId, {
          assignedAdminId: data.AdminId,
          status: 'AdminActive',
        });
        
        // Invalidate queries to update UI
        const { queryClient } = get();
        if (queryClient) {
          queryClient.invalidateQueries({ queryKey: ['support', 'admin', 'sessions'] });
          queryClient.invalidateQueries({ queryKey: ['support', 'admin', 'active'] });
        }
      },
      
      handleSessionNeedsAttention: (data) => {
        console.log('Session needs attention:', data.SessionId, 'Topic:', data.Topic);
        // Update UI to highlight session that needs attention
      },
      
      handleActiveSessions: (sessions) => {
        set({ adminSessions: sessions });
      },
      
      // Note: Server doesn't send SessionEscalated or SessionClosed events
      
      handleAdminOnline: (data) => {
        set((state) => ({
          onlineAdmins: [
            ...state.onlineAdmins.filter(a => a.id !== data.AdminId),
            { id: data.AdminId, name: `Admin ${data.AdminId}`, isOnline: true },
          ],
        }));
      },
      
      handleAdminOffline: (data) => {
        set((state) => ({
          onlineAdmins: state.onlineAdmins.filter(a => a.id !== data.AdminId),
        }));
      },
      
      handleError: (message) => {
        console.error('SignalR Error:', message);
        set({ error: message });
      },

      // Utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'support-store',
      partialize: (state) => ({
        currentSession: state.currentSession,
        messages: state.messages,
      }),
    }
  )
);