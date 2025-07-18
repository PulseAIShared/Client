import React from 'react';
import { Outlet } from 'react-router-dom';
import { ChatbotProvider, ChatbotButton, ChatbotModal, SupportProvider } from '@/features/chatbot';

export const GlobalLayout: React.FC = () => {
  return (
    <ChatbotProvider>
      <SupportProvider>
        <ChatbotButton />
        <ChatbotModal />
        <Outlet />
      </SupportProvider>
    </ChatbotProvider>
  );
};