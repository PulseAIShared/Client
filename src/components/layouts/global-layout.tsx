import React from 'react';
import { Outlet } from 'react-router-dom';
import { ChatbotProvider, ChatbotButton, ChatbotModal } from '@/features/chatbot';

export const GlobalLayout: React.FC = () => {
  return (
    <ChatbotProvider>
      <ChatbotButton />
      <ChatbotModal />
      <Outlet />
    </ChatbotProvider>
  );
};