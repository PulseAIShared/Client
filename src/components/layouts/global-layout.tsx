import React from 'react';
import { Outlet } from 'react-router-dom';
import { ChatbotProvider, ChatbotButton, ChatbotModal, SupportProvider } from '@/features/chatbot';
import { ScrollToTop } from '@/components/scroll-to-top';

export const GlobalLayout: React.FC = () => {
  return (
    <ChatbotProvider>
      <SupportProvider>
        <ScrollToTop />
        <ChatbotButton />
        <ChatbotModal />
        <Outlet />
      </SupportProvider>
    </ChatbotProvider>
  );
};