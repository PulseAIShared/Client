import React from 'react';
import { useLocation } from 'react-router-dom';
import { useChatbotStore } from '../store';

export const ChatbotButton: React.FC = () => {
  const location = useLocation();
  const { isOpen, openChat, closeChat, supportSession } = useChatbotStore();

  // Hide on conversations page
  if (location.pathname === '/app/conversations') {
    return null;
  }

  const handleToggle = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        fixed z-40 rounded-full
        bg-accent-primary hover:bg-accent-secondary
        text-white shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        flex items-center justify-center group
        ${isOpen ? 'scale-95' : 'scale-100 hover:scale-105'}
        
        /* Mobile: Smaller, positioned for thumb access */
        bottom-4 right-4 w-12 h-12
        
        /* Desktop: Larger, more spacing */
        md:bottom-6 md:right-6 md:w-14 md:h-14
        
        /* Ensure above mobile keyboards */
        ${isOpen ? 'bottom-4 md:bottom-6' : ''}
      `}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      <svg
        className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        )}
      </svg>
      
      {/* Support session indicators */}
      {supportSession && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center">
          {supportSession.status === 'AdminActive' && (
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">👤</span>
            </div>
          )}
          {supportSession.status === 'AiActive' && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🤖</span>
            </div>
          )}
          {supportSession.status === 'Pending' && (
            <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-xs">⏳</span>
            </div>
          )}
        </div>
      )}
      
      {/* Default notification dot for new messages */}
      {!supportSession && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-0 scale-0 transition-all duration-200" />
      )}
    </button>
  );
};