import React from 'react';
import { Outlet } from 'react-router-dom';
import { ChatbotProvider, ChatbotButton, ChatbotModal } from '@/features/chatbot';
import { ScrollToTop } from '@/components/scroll-to-top';

export const GlobalLayout: React.FC = () => {
  return (
    <ChatbotProvider>
      <ScrollToTop />
      <ChatbotButton />
      <ChatbotModal />
      <Outlet />
    </ChatbotProvider>
  );
};