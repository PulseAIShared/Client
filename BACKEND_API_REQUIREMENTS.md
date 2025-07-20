# .NET Backend API Requirements for Chatbot System

## Overview

The frontend chatbot system now uses a dual-storage strategy:
- **App Routes (`/app/*`)**: Server-managed conversations, AI-powered responses
- **Non-App Routes**: Client-side hardcoded responses, localStorage persistence

This document outlines the backend requirements to support the new chatbot system.

## Storage Strategy

### App Routes (`/app/*`)
- **NO localStorage persistence** for conversations
- All conversations managed by server
- AI responses generated using Gemini with contextual data
- Context-aware responses based on page data

### Non-App Routes (Landing pages, etc.)
- **Client-side only** for regular chat
- Hardcoded responses in frontend
- Server only involved for support contact requests

## API Endpoints Required

### 1. Get User Conversations
```http
GET /api/chatbot/conversations
```

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "lastMessage": "string",
    "lastMessageAt": "2024-01-01T00:00:00Z",
    "messageCount": 5,
    "createdAt": "2024-01-01T00:00:00Z",
    "contextType": 1, // ChatContextType enum
    "contextData": {
      "customerId": "string?",
      "analysisId": "string?",
      "routePath": "string"
    }
  }
]
```

### 2. Chat Message Endpoint
```http
POST /api/chatbot/send
```

**Request:**
```json
{
  "message": "string",
  "context": {
    "type": 0-9, // ChatContextType enum
    "customerId": "string?",
    "analysisId": "string?",
    "routePath": "string",
    "additionalContext": {} // Optional context data
  },
  "conversationId": "string?" // null for new conversations
}
```

**Response:**
```json
{
  "message": {
    "id": "string",
    "conversationId": "string",
    "content": "string", // AI-generated response
    "sender": 1, // MessageSender.Bot
    "type": 0, // MessageType.Text
    "timestamp": "2024-01-01T00:00:00Z",
    "metadata": {}
  },
  "conversationId": "string",
  "suggestions": ["string[]?"], // Optional follow-up suggestions
  "requiresHumanHandoff": false, // If AI determines human support needed
  "metadata": {}
}
```

### 3. Get Conversation History
```http
GET /api/chatbot/history/{conversationId}?page=1&pageSize=20
```

**Response:**
```json
{
  "conversationId": "string",
  "messages": [
    {
      "id": "string",
      "content": "string",
      "isFromUser": true,
      "timestamp": "2024-01-01T00:00:00Z",
      "conversationId": "string",
      "sender": 0 // MessageSender enum
    }
  ],
  "totalMessages": 50,
  "hasMoreMessages": true
}
```

### 4. Delete Conversation
```http
DELETE /api/chatbot/conversations/{conversationId}
```

### 5. Clear Conversation Messages
```http
DELETE /api/chatbot/conversations/{conversationId}/messages
```

### 6. Support Contact Endpoint (for non-app routes)
```http
POST /api/chatbot/contact
```

**Request:**
```json
{
  "email": "string",
  "message": "string",
  "context": {
    "type": 0, // ChatContextType.General
    "routePath": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "ticketId": "string?",
  "message": "We'll get back to you within 24 hours"
}
```

## ChatContextType Enum

```csharp
public enum ChatContextType
{
    General = 0,
    Dashboard = 1,
    CustomerDetail = 2,
    Analytics = 3,
    Segments = 4,
    Integrations = 5,
    Import = 6,
    Customers = 7,
    Campaigns = 8,
    Support = 9
}
```

## Conversation Title Generation

The backend should generate meaningful conversation titles based on the first user message and context. Here's the recommended algorithm:

### Title Generation Logic
```csharp
public static string GenerateConversationTitle(ChatContextType contextType, object contextData)
{
    // Simple context-based titles - much cleaner and more intuitive
    return contextType switch
    {
        ChatContextType.Dashboard => "Dashboard",
        ChatContextType.CustomerDetail => $"Customer {contextData.CustomerId}",
        ChatContextType.Customers => "Customers",
        ChatContextType.Campaigns => "Campaigns",
        ChatContextType.Analytics => "Analytics",
        ChatContextType.Segments => "Segments", 
        ChatContextType.Integrations => "Settings",
        ChatContextType.Import => "Import",
        ChatContextType.Support => "Support",
        _ => "General"
    };
}
```

### Example Generated Titles
- `"Dashboard"` (for any conversation started on dashboard)
- `"Customer C123"` (for conversations about specific customer)
- `"Campaigns"` (for campaign-related conversations)
- `"Analytics"` (for analytics page conversations)

## Context-Aware AI Implementation

### Dashboard Context (`type: 1`)
**Data to include in AI prompt:**
- Current user's dashboard metrics
- Recent activity data
- Key performance indicators
- Trends and insights

**Example AI Context:**
```json
{
  "userMetrics": {
    "totalCustomers": 1250,
    "churnRate": 12.5,
    "avgLifetimeValue": 2850.00,
    "atRiskCustomers": 45
  },
  "recentActivity": [...],
  "trends": [...]
}
```

### Customer Detail Context (`type: 2`)
**Data to include in AI prompt:**
- Specific customer data
- Customer engagement metrics
- Purchase history
- Churn risk analysis
- Behavioral patterns

**Example AI Context:**
```json
{
  "customer": {
    "id": "customer-123",
    "name": "John Doe",
    "churnRisk": 0.75,
    "lifetimeValue": 4200.00,
    "lastActivity": "2024-01-15T10:30:00Z"
  },
  "metrics": {...},
  "history": [...]
}
```

### Customers List Context (`type: 7`)
**Data to include in AI prompt:**
- Customer list summary
- Segmentation data
- Import/export capabilities
- Filtering options

### Campaigns Context (`type: 8`)
**Data to include in AI prompt:**
- Campaign performance data
- Target audience information
- Campaign analytics
- Available actions

### Analytics/Insights Context (`type: 3`)
**Data to include in AI prompt:**
- Current analysis results
- Statistical insights
- Trend data
- Predictive analytics

## AI Integration with Gemini

### Prompt Structure
```
You are PulseAI Assistant, helping users with customer retention analytics.

Context: {contextType}
Current Page: {routePath}
User Data: {contextualData}

User Message: {userMessage}

Provide helpful, specific responses based on the context and data provided. 
Keep responses concise and actionable.
```

### Context-Specific Prompts

#### Dashboard Context
```
You're helping a user understand their dashboard metrics. 
Current metrics: {dashboardData}
Focus on explaining trends, identifying issues, and suggesting actions.
```

#### Customer Detail Context
```
You're helping analyze a specific customer: {customerData}
Focus on churn risk, engagement patterns, and retention strategies.
```

#### Customers List Context
```
You're helping with customer management tasks.
Available data: {customerSummary}
Help with imports, segments, exports, and analysis.
```

#### Campaigns Context
```
You're helping with campaign management and performance.
Campaign data: {campaignData}
Focus on optimization, targeting, and performance analysis.
```

## Support Session System

### When AI Determines Human Support Needed
```json
{
  "requiresHumanHandoff": true,
  "message": {
    "content": "I think this requires human assistance. Let me connect you with our support team."
  }
}
```

### Automatic Support Session Creation
When `requiresHumanHandoff: true` or user explicitly requests support:

1. Create support session
2. Try to connect via SignalR to online admins
3. If no admins online, send email to support@pulseltv.com
4. Update session status accordingly

## Database Schema Requirements

### Conversations Table
```sql
CREATE TABLE ChatConversations (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(200), -- Generated from first message + context
    ContextType INT NOT NULL,
    ContextData NVARCHAR(MAX), -- JSON: customerId, analysisId, routePath
    LastMessage NVARCHAR(1000),
    LastMessageAt DATETIME2,
    MessageCount INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

### Messages Table
```sql
CREATE TABLE ChatMessages (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ConversationId UNIQUEIDENTIFIER NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Sender INT NOT NULL, -- 0=User, 1=Bot, 2=Admin
    Type INT NOT NULL, -- 0=Text, 1=QuickAction, etc.
    Timestamp DATETIME2 DEFAULT GETUTCDATE(),
    Metadata NVARCHAR(MAX), -- JSON
    FOREIGN KEY (ConversationId) REFERENCES ChatConversations(Id)
);
```

## Implementation Steps

### Phase 1: Basic Chat API
1. ✅ Update ChatContextType enum
2. ✅ Create chat message endpoint
3. ✅ Implement basic conversation storage
4. ✅ Add Gemini AI integration

### Phase 2: Context-Aware Responses
1. ✅ Add data context injection for each page type
2. ✅ Create context-specific AI prompts
3. ✅ Implement data retrieval for each context

### Phase 3: Advanced Features
1. ✅ Add conversation history API
2. ✅ Implement conversation management
3. ✅ Add support session integration
4. ✅ Add admin SignalR notifications

## Context Data Sources

### Dashboard Context
- **API**: `/api/dashboard/metrics`
- **Data**: KPIs, trends, recent activity

### Customer Detail Context
- **API**: `/api/customers/{id}/analytics`
- **Data**: Customer profile, metrics, behavior

### Customers List Context
- **API**: `/api/customers/summary`
- **Data**: Total counts, segments, recent imports

### Campaigns Context
- **API**: `/api/campaigns/summary`
- **Data**: Active campaigns, performance, analytics

### Analytics Context
- **API**: `/api/analytics/insights`
- **Data**: Current analysis, predictions, trends

## Error Handling

### AI Service Failures
```json
{
  "message": {
    "content": "I'm experiencing technical difficulties. Please try again or contact support.",
    "type": 3 // SystemMessage
  },
  "requiresHumanHandoff": true
}
```

### Invalid Context
```json
{
  "error": "Invalid context type",
  "code": "INVALID_CONTEXT"
}
```

### Rate Limiting
```json
{
  "error": "Too many requests. Please wait before sending another message.",
  "code": "RATE_LIMITED",
  "retryAfter": 30
}
```

## Security Considerations

1. **Authentication**: All app route requests require valid JWT token
2. **Authorization**: Users can only access their own conversations
3. **Rate Limiting**: Implement per-user rate limiting for AI requests
4. **Input Validation**: Sanitize all user inputs before sending to AI
5. **Data Privacy**: Don't include sensitive customer data in AI context

## Monitoring & Analytics

### Metrics to Track
- Conversations per user per day
- Average conversation length
- AI response accuracy (user feedback)
- Support escalation rate
- Context type usage distribution

### Logging Requirements
- All chat interactions
- AI prompt/response pairs
- Context data provided to AI
- Performance metrics
- Error rates

This implementation provides a robust, context-aware chatbot system that leverages your existing data to provide intelligent, helpful responses while maintaining proper data separation between app and non-app routes.