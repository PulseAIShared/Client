// Main chatbot exports
export { ChatbotProvider } from './context';
export { ChatbotButton, ChatbotModal } from './components';
export { useChatbotStore } from './store';
export type { ChatMessage, ChatbotContext, QuickAction } from './store';

// API exports
export { 
  useSendChatMessage, 
  useSendContactRequest, 
  useGetChatHistory 
} from './api/chatbot';

// Support System exports
export { SupportProvider } from './components';
export { useSupportStore } from './support-store';
export { useSupport, useAdminSupport } from './hooks/useSupport';
export type { SupportSession, SupportMessage } from './api/chatbot';