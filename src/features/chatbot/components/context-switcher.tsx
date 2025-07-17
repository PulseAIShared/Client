import React from 'react';
import { useChatbotStore } from '../store';

export const ContextSwitcher: React.FC = () => {
  const { activeMode, setActiveMode, supportSession } = useChatbotStore();

  // Only show if there's an active support session
  if (!supportSession) return null;

  return (
    <div className="flex border-b border-border-primary">
      <button
        onClick={() => setActiveMode('support_session')}
        className={`
          flex-1 px-4 py-3 text-sm font-medium transition-colors
          ${activeMode === 'support_session' 
            ? 'bg-accent-primary text-white' 
            : 'bg-surface-secondary text-text-primary hover:bg-surface-primary'
          }
        `}
      >
        <div className="flex items-center justify-center gap-2">
          {supportSession.status === 'AdminActive' && <span>👤</span>}
          {supportSession.status === 'AiActive' && <span>🤖</span>}
          {supportSession.status === 'Pending' && <span>⏳</span>}
          Support Chat
        </div>
      </button>
      
      <button
        onClick={() => setActiveMode('page_help')}
        className={`
          flex-1 px-4 py-3 text-sm font-medium transition-colors
          ${activeMode === 'page_help' 
            ? 'bg-accent-primary text-white' 
            : 'bg-surface-secondary text-text-primary hover:bg-surface-primary'
          }
        `}
      >
        <div className="flex items-center justify-center gap-2">
          <span>📄</span>
          Page Help
        </div>
      </button>
    </div>
  );
};