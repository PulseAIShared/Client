# Chatbot Storage Strategy Updates

## ✅ **Fixed: Conversations Page API Integration**

### **Problem Identified**
The conversations page (`/app/conversations`) was reading from local Zustand store (`allConversations`) instead of calling the server API endpoint `/api/chatbot/conversations`.

### **Root Cause**
When we updated the storage strategy to remove localStorage for app routes, the conversations page was still relying on the local store data that no longer persists conversations for app routes.

### **Solution Implemented**

#### **1. Updated Conversations Page API Integration**
- ✅ Added `useGetUserConversations()` hook to fetch from server
- ✅ Replaced local store data with server API response
- ✅ Added proper loading and error states
- ✅ Updated all conversation operations to work with server data

#### **2. Fixed Conversation Management**
```typescript
// Before: Using local store
const { allConversations, searchConversations } = useChatbotStore();

// After: Using server API
const { data: conversations = [], isLoading, error } = useGetUserConversations();
```

#### **3. Updated CRUD Operations**
- **Delete**: Now properly invalidates server queries instead of updating local store
- **Clear Messages**: Invalidates queries to refetch from server
- **Bulk Delete**: Simplified to work with server-managed data

#### **4. Enhanced Backend Requirements**

Added comprehensive API documentation in `BACKEND_API_REQUIREMENTS.md`:

```http
GET /api/chatbot/conversations
DELETE /api/chatbot/conversations/{id}
DELETE /api/chatbot/conversations/{id}/messages
GET /api/chatbot/history/{id}?page=1&pageSize=20
```

## **Storage Strategy Overview**

### **App Routes (`/app/*`)**
```
✅ NO localStorage persistence
✅ Server-managed conversations
✅ API calls for all conversation operations
✅ Context-aware AI responses
✅ Real-time data fetching
```

### **Non-App Routes (Landing pages)**
```
✅ localStorage persistence for chat history
✅ Hardcoded responses in frontend
✅ Support contact form for human help
✅ Minimal API usage (only for support requests)
```

## **API Flow for App Routes**

### **Chat Message Flow**
```
1. User sends message → POST /api/chatbot/send
2. Server processes with context data
3. AI (Gemini) generates response
4. Response saved to server database
5. Frontend receives AI response
6. No localStorage persistence
```

### **Conversations List Flow**
```
1. Page loads → GET /api/chatbot/conversations
2. Server returns all user conversations
3. Frontend displays with proper context icons
4. User actions (delete/clear) → API calls
5. Queries invalidated → Fresh data fetched
```

### **Conversation History Flow**
```
1. User opens conversation → GET /api/chatbot/history/{id}
2. Server returns paginated message history
3. Frontend displays messages
4. Continuation uses existing conversation ID
```

## **Key Benefits**

### **🔄 Real-time Data Sync**
- Conversations always reflect server state
- No stale data from localStorage
- Consistent across devices/sessions

### **🎯 Context-Aware Responses**
- AI responses use live page data
- Dashboard context = actual dashboard metrics
- Customer context = real customer analytics

### **📊 Proper Analytics**
- All conversations tracked server-side
- Usage analytics and monitoring
- Better insights into user behavior

### **🔒 Enhanced Security**
- No sensitive data in browser storage
- Proper authentication for all operations
- Server-side rate limiting and validation

## **Frontend Changes Made**

### **Store Updates (`store.ts`)**
```typescript
// Added storage strategy flags
isAppRoute: boolean
localConversations: ChatMessage[]

// Updated persistence to exclude app route data
partialize: (state) => ({
  localConversations: state.localConversations,
  supportSession: state.supportSession,
  supportMessages: state.supportMessages,
})
```

### **Context Provider (`context.tsx`)**
```typescript
// Auto-detect app routes
const isApp = location.pathname.startsWith('/app');
setIsAppRoute(isApp);
```

### **Interface Split**
- **`PageHelpInterface`**: App routes - server-powered
- **`LandingHelpInterface`**: Non-app routes - local storage

### **Conversations Page (`conversations.tsx`)**
```typescript
// Before
const { allConversations } = useChatbotStore();

// After  
const { data: conversations, isLoading, error } = useGetUserConversations();
```

## **Backend Requirements**

### **Required Endpoints**
1. ✅ `GET /api/chatbot/conversations` - List user conversations
2. ✅ `POST /api/chatbot/send` - Send message with context
3. ✅ `GET /api/chatbot/history/{id}` - Get conversation history
4. ✅ `DELETE /api/chatbot/conversations/{id}` - Delete conversation
5. ✅ `DELETE /api/chatbot/conversations/{id}/messages` - Clear messages
6. ✅ `POST /api/chatbot/contact` - Support contact (non-app routes)

### **Database Schema**
```sql
ChatConversations: id, userId, title, contextType, contextData, lastMessage, messageCount, createdAt
ChatMessages: id, conversationId, content, sender, type, timestamp, metadata
```

### **AI Integration**
- Context-aware prompts based on page data
- Gemini API integration with contextual information
- Intelligent response generation using live application data

## **Testing Checklist**

### **App Routes**
- [ ] Navigate to `/app/dashboard` → Chat should work, no localStorage
- [ ] Send messages → Should call API, get AI responses
- [ ] Switch contexts → Should maintain server conversations
- [ ] Visit `/app/conversations` → Should show server data with loading states

### **Non-App Routes**  
- [ ] Navigate to landing page → Chat should use localStorage
- [ ] Send messages → Should get hardcoded responses
- [ ] Request support → Should show contact form
- [ ] Submit support → Should call contact API

### **API Integration**
- [ ] Network tab shows `/api/chatbot/conversations` call
- [ ] Message sending shows `/api/chatbot/send` calls
- [ ] Delete operations call proper delete endpoints
- [ ] No localStorage data for app route conversations

This update ensures the chatbot system properly separates server-managed (app routes) and client-managed (non-app routes) conversations, with the conversations page correctly fetching data from the API instead of relying on localStorage.