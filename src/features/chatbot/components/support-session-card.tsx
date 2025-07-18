import React, { useState } from 'react';
import type { SupportSession } from '../api/chatbot';

interface AdminInfo {
  id: string;
  name: string;
  isOnline: boolean;
}

interface SupportSessionCardProps {
  session: SupportSession;
  onPickup: () => void;
  onAssign: (adminId: string) => void;
  onEscalate: (reason: string, level: number) => void;
  onViewChat: () => void;
  onlineAdmins: AdminInfo[];
  isSelected?: boolean;
}

export const SupportSessionCard: React.FC<SupportSessionCardProps> = ({
  session,
  onPickup,
  onAssign,
  onEscalate,
  onViewChat,
  onlineAdmins,
  isSelected = false,
}) => {
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showEscalateMenu, setShowEscalateMenu] = useState(false);

  const getPriorityColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'Critical': return 'bg-error text-white';
      case 'High': return 'bg-warning text-warning-muted';
      case 'Medium': return 'bg-info text-info-muted';
      default: return 'bg-surface-secondary text-text-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-warning';
      case 'AiActive': return 'text-info';
      case 'AdminActive': return 'text-success';
      case 'Closed': return 'text-text-muted';
      case 'TimedOut': return 'text-error';
      default: return 'text-text-primary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return 'Waiting for Admin';
      case 'AiActive': return 'AI Assistant Active';
      case 'AdminActive': return 'With Admin';
      case 'Closed': return 'Closed';
      case 'TimedOut': return 'Timed Out';
      default: return status;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div
      className={`
        p-4 hover:bg-surface-secondary transition-colors cursor-pointer
        ${isSelected ? 'bg-accent-primary/5 border-l-4 border-accent-primary' : ''}
      `}
      onClick={onViewChat}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-medium text-text-primary truncate">
              {session.topic}
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(session.customerRiskLevel)}`}>
              {session.customerRiskLevel || 'Normal'}
            </span>
            {session.escalationLevel > 0 && (
              <span className="px-2 py-1 bg-error/10 text-error rounded-full text-xs font-medium">
                Level {session.escalationLevel}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-text-muted mb-3">
            <span>{session.customerEmail}</span>
            <span className={getStatusColor(session.status)}>
              {getStatusText(session.status)}
            </span>
            <span>{formatTimeAgo(session.createdAt)}</span>
          </div>
          
          <p className="text-sm text-text-muted line-clamp-2 mb-3">
            {session.initialMessage}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Route: {session.originalContext?.routePath}</span>
            {session.aiInteractionCount > 0 && (
              <span>• AI Interactions: {session.aiInteractionCount}</span>
            )}
            {session.assignedAdminName && (
              <span>• Admin: {session.assignedAdminName}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {session.status === 'Pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPickup();
              }}
              className="px-3 py-1 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-secondary transition-colors"
            >
              Pick Up
            </button>
          )}
          
          {session.status !== 'Closed' && session.status !== 'TimedOut' && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAssignMenu(!showAssignMenu);
                }}
                className="px-3 py-1 bg-surface-secondary text-text-primary rounded-lg text-sm hover:bg-surface-primary transition-colors"
              >
                Assign
              </button>
              
              {showAssignMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-surface-primary border border-border-primary rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    {onlineAdmins.map((admin) => (
                      <button
                        key={admin.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssign(admin.id);
                          setShowAssignMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
                      >
                        {admin.name}
                      </button>
                    ))}
                    {onlineAdmins.length === 0 && (
                      <p className="px-3 py-2 text-sm text-text-muted">
                        No admins online
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEscalateMenu(!showEscalateMenu);
              }}
              className="px-3 py-1 bg-warning/10 text-warning rounded-lg text-sm hover:bg-warning/20 transition-colors"
            >
              Escalate
            </button>
            
            {showEscalateMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-surface-primary border border-border-primary rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEscalate('Manual escalation to Level 2', 2);
                      setShowEscalateMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
                  >
                    Level 2 - Complex Issue
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEscalate('Manual escalation to Level 3', 3);
                      setShowEscalateMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
                  >
                    Level 3 - Critical Issue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};