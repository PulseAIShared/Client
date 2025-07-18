import React, { useState, useEffect } from 'react';
import { useSupportStore } from '../support-store';
import { useClaimSupportSession } from '../api/chatbot';
import { SupportSessionCard } from './support-session-card';
import { AdminSupportFilters } from './admin-support-filters';
import { AdminSupportStats } from './admin-support-stats';
import { AdminSupportChat } from './admin-support-chat';
import type { SupportSession } from '../api/chatbot';

export const AdminSupportDashboard: React.FC = () => {
  const {
    adminSessions: storeAdminSessions,
    pickupSession,
    getActiveSessions,
    isConnected,
  } = useSupportStore();

  const [selectedSession, setSelectedSession] = useState<SupportSession | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  // Note: Admin availability is handled by connection status

  const claimSession = useClaimSupportSession();

  useEffect(() => {
    if (isConnected) {
      getActiveSessions();
    }
  }, [isConnected, getActiveSessions]);

  const sessionsArray = Array.isArray(storeAdminSessions) ? storeAdminSessions : [];
  const filteredSessions = sessionsArray.filter(session => {
    const matchesStatus = !statusFilter || session.status === statusFilter;
    const matchesSearch = !searchQuery || 
      session.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const prioritySessions = sessionsArray.length > 0 ? filteredSessions.sort((a, b) => {
    const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    const aPriority = priorityOrder[a.customerRiskLevel as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.customerRiskLevel as keyof typeof priorityOrder] || 0;
    return bPriority - aPriority;
  }) : [];

  const handlePickupSession = async (sessionId: string) => {
    try {
      await pickupSession(sessionId);
      const session = sessionsArray.find(s => s.id === sessionId);
      if (session) {
        setSelectedSession(session);
      }
    } catch (error) {
      console.error('Failed to pickup session:', error);
    }
  };

  const handleAssignSession = async (sessionId: string, adminId: string) => {
    console.log('Assignment handled automatically by pickup');
  };

  const handleEscalateSession = async (sessionId: string, reason: string, level: number) => {
    console.log('Escalation handled automatically by server');
  };

  const handleCloseChat = () => {
    setSelectedSession(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Main Dashboard */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stats */}
        <AdminSupportStats sessions={sessionsArray} />


        {/* Filters */}
        <AdminSupportFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Sessions List */}
        <div className="bg-surface-primary border border-border-primary rounded-lg">
          <div className="p-4 border-b border-border-primary">
            <h3 className="text-lg font-medium text-text-primary">
              Active Sessions ({filteredSessions.length})
            </h3>
          </div>
          
          <div className="divide-y divide-border-primary max-h-96 overflow-y-auto">
            {prioritySessions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
                  <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-text-primary mb-2">No Active Sessions</h4>
                <p className="text-text-muted">
                  {statusFilter || searchQuery 
                    ? 'No sessions match your current filters'
                    : 'All caught up! No support sessions need attention right now.'
                  }
                </p>
              </div>
            ) : (
              prioritySessions.map((session) => (
                <SupportSessionCard
                  key={session.id}
                  session={session}
                  onPickup={() => handlePickupSession(session.id)}
                  onAssign={(adminId) => handleAssignSession(session.id, adminId)}
                  onEscalate={(reason, level) => handleEscalateSession(session.id, reason, level)}
                  onViewChat={() => setSelectedSession(session)}
                  onlineAdmins={[]}
                  isSelected={selectedSession?.id === session.id}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Chat Panel */}
      <div className="lg:col-span-1">
        {selectedSession ? (
          <AdminSupportChat
            session={selectedSession}
            onClose={handleCloseChat}
          />
        ) : (
          <div className="bg-surface-primary border border-border-primary rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-text-primary mb-2">Select a Session</h4>
            <p className="text-text-muted">
              Choose a support session from the list to start chatting with the user.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};