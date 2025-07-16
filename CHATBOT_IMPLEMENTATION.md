# Chatbot Implementation Guide

## Overview

This document outlines how to make the PulseAI chatbot more responsive to user questions, particularly for general (non-/app) routes. The chatbot currently provides basic mock responses but can be enhanced with AI integration and smart response systems.

## Current State

- ✅ Context-aware chatbot with route detection
- ✅ Quick action bubbles that change per page
- ✅ Contact support flow with email collection
- ✅ Persistent conversation history
- ⚠️ **Limited responses** - Currently uses mock responses for all queries

## Enhancement Options

### 1. Full AI Integration (Most Responsive)

Connect to an AI service for natural language understanding and dynamic responses.

**Popular AI Services:**
- **OpenAI GPT-4/3.5** - Best for conversational responses
- **Anthropic Claude** - Great for helpful, accurate responses  
- **Google Gemini** - Good balance of cost/performance
- **Azure OpenAI** - Enterprise-focused with data residency

### 2. Rule-Based Responses (Cost-Effective)

Create a smart response system with keyword matching and predefined responses.

**Example Response Rules:**
```javascript
const responseRules = {
  pricing: "Our pricing starts at $99/month for up to 1,000 customers...",
  demo: "I'd love to show you a demo! You can book one at [demo-link]...",
  features: "PulseAI offers customer analytics, churn prediction, segmentation...",
  contact: "I'll connect you with our team. Please provide your email...",
  integrations: "We integrate with HubSpot, Salesforce, Stripe, and more...",
  setup: "Getting started is easy! First, you'll need to connect your data source..."
}
```

### 3. Hybrid Approach (Recommended)

Combine rule-based responses for common questions with AI fallback for complex queries.

**Benefits:**
- ✅ Fast responses for common questions
- ✅ Cost-effective (rules are free, AI only for complex queries)
- ✅ Consistent branding for key topics
- ✅ AI handles edge cases and complex questions

## Backend Requirements (.NET Web API)

### Required Endpoints

#### 1. Chat Message Endpoint

```csharp
[HttpPost("api/chatbot/chat")]
public async Task<IActionResult> SendChatMessage([FromBody] ChatRequest request)
{
    // Process the chat message and return response
}
```

**Request Model:**
```csharp
public class ChatRequest
{
    public string Message { get; set; }
    public ChatContext Context { get; set; }
    public string? ConversationId { get; set; }
    public string? UserId { get; set; } // For authenticated users
}

public class ChatContext
{
    public string Type { get; set; } // "general", "customer_detail", "dashboard", etc.
    public string RoutePath { get; set; }
    public string? CustomerId { get; set; }
    public string? AnalysisId { get; set; }
    public string? ImportJobId { get; set; }
}
```

**Response Model:**
```csharp
public class ChatResponse
{
    public string Message { get; set; }
    public string ConversationId { get; set; }
    public List<string>? Suggestions { get; set; } // Follow-up suggestions
    public bool RequiresHumanHandoff { get; set; }
    public Dictionary<string, object>? Metadata { get; set; } // Extra data
}
```

#### 2. Contact Request Endpoint

```csharp
[HttpPost("api/chatbot/contact")]
public async Task<IActionResult> SendContactRequest([FromBody] ContactRequest request)
{
    // Create support ticket and send to team
}
```

**Request Model:**
```csharp
public class ContactRequest
{
    public string Email { get; set; }
    public string Message { get; set; }
    public ChatContext? Context { get; set; }
}
```

**Response Model:**
```csharp
public class ContactResponse
{
    public bool Success { get; set; }
    public string? TicketId { get; set; }
    public string Message { get; set; }
}
```

#### 3. Conversation History Endpoint

```csharp
[HttpGet("api/chatbot/conversations/{conversationId}")]
public async Task<IActionResult> GetConversationHistory(string conversationId)
{
    // Return conversation history for persistence
}
```

**Response Model:**
```csharp
public class ConversationHistory
{
    public string ConversationId { get; set; }
    public List<ChatMessage> Messages { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ChatMessage
{
    public string Id { get; set; }
    public string Content { get; set; }
    public string Sender { get; set; } // "user" or "bot"
    public DateTime Timestamp { get; set; }
    public string? Type { get; set; } // "text", "quick_action", "contact_request"
}
```

### Backend Services to Implement

#### 1. Chat Service

```csharp
public interface IChatService
{
    Task<ChatResponse> ProcessMessageAsync(ChatRequest request);
    Task<ConversationHistory> GetConversationAsync(string conversationId);
    Task SaveConversationAsync(string conversationId, ChatMessage message);
}

public class ChatService : IChatService
{
    private readonly IResponseEngine _responseEngine;
    private readonly IAiService _aiService;
    private readonly IConversationRepository _conversationRepo;

    public async Task<ChatResponse> ProcessMessageAsync(ChatRequest request)
    {
        // 1. Try rule-based response first
        var ruleResponse = await _responseEngine.GetResponseAsync(request.Message, request.Context);
        
        if (ruleResponse != null)
        {
            return ruleResponse;
        }

        // 2. Fallback to AI service
        return await _aiService.GetResponseAsync(request);
    }
}
```

#### 2. Response Engine (Rule-Based)

```csharp
public interface IResponseEngine
{
    Task<ChatResponse?> GetResponseAsync(string message, ChatContext context);
}

public class ResponseEngine : IResponseEngine
{
    public async Task<ChatResponse?> GetResponseAsync(string message, ChatContext context)
    {
        var lowerMessage = message.ToLower();

        // Pricing inquiries
        if (ContainsKeywords(lowerMessage, "price", "pricing", "cost", "how much"))
        {
            return new ChatResponse
            {
                Message = "Our pricing starts at $99/month for up to 1,000 customers. We offer flexible plans based on your customer volume. Would you like to see our full pricing details?",
                Suggestions = new List<string> { "View Pricing Plans", "Book Demo", "Contact Sales" }
            };
        }

        // Demo requests
        if (ContainsKeywords(lowerMessage, "demo", "demonstration", "show me", "trial"))
        {
            return new ChatResponse
            {
                Message = "I'd love to show you PulseAI in action! You can book a personalized demo where we'll show you how to reduce churn and increase customer lifetime value.",
                Suggestions = new List<string> { "Book Demo Now", "See Features", "Watch Video" }
            };
        }

        // Feature inquiries
        if (ContainsKeywords(lowerMessage, "features", "what does", "capabilities", "functionality"))
        {
            return new ChatResponse
            {
                Message = "PulseAI offers:\n• Real-time churn prediction\n• Customer segmentation\n• Lifetime value analytics\n• Automated insights\n• Integration with 50+ tools\n\nWhich feature interests you most?",
                Suggestions = new List<string> { "Churn Prediction", "Integrations", "Book Demo" }
            };
        }

        // Integration questions
        if (ContainsKeywords(lowerMessage, "integration", "connect", "api", "hubspot", "salesforce"))
        {
            return new ChatResponse
            {
                Message = "We integrate seamlessly with HubSpot, Salesforce, Stripe, Shopify, and 50+ other platforms. Our integrations sync your customer data in real-time for accurate predictions.",
                Suggestions = new List<string> { "View All Integrations", "Setup Guide", "Contact Support" }
            };
        }

        // Support/contact requests
        if (ContainsKeywords(lowerMessage, "help", "support", "contact", "talk to someone"))
        {
            return new ChatResponse
            {
                Message = "I'd be happy to connect you with our team! Please provide your email address and a brief description of how we can help you.",
                RequiresHumanHandoff = true
            };
        }

        return null; // No rule matched, try AI
    }

    private bool ContainsKeywords(string message, params string[] keywords)
    {
        return keywords.Any(keyword => message.Contains(keyword));
    }
}
```

#### 3. AI Service (Optional)

```csharp
public interface IAiService
{
    Task<ChatResponse> GetResponseAsync(ChatRequest request);
}

public class OpenAiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public async Task<ChatResponse> GetResponseAsync(ChatRequest request)
    {
        var systemPrompt = GetSystemPrompt(request.Context);
        
        var chatRequest = new
        {
            model = "gpt-3.5-turbo",
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = request.Message }
            },
            max_tokens = 300,
            temperature = 0.7
        };

        // Make API call to OpenAI
        var response = await _httpClient.PostAsJsonAsync("https://api.openai.com/v1/chat/completions", chatRequest);
        var result = await response.Content.ReadFromJsonAsync<OpenAiResponse>();

        return new ChatResponse
        {
            Message = result.Choices[0].Message.Content,
            ConversationId = request.ConversationId ?? Guid.NewGuid().ToString()
        };
    }

    private string GetSystemPrompt(ChatContext context)
    {
        return @"You are a helpful assistant for PulseAI, a customer analytics platform. 
                 You help potential customers understand our features:
                 - Churn prediction and prevention
                 - Customer lifetime value analytics
                 - Automated segmentation
                 - Real-time insights
                 
                 Be helpful, concise, and always try to guide users toward booking a demo or contacting sales.
                 If you don't know something specific, offer to connect them with our team.";
    }
}
```

#### 4. Contact/Ticketing Service

```csharp
public interface IContactService
{
    Task<ContactResponse> CreateContactRequestAsync(ContactRequest request);
}

public class ContactService : IContactService
{
    public async Task<ContactResponse> CreateContactRequestAsync(ContactRequest request)
    {
        // Create ticket in your ticketing system (Zendesk, Freshdesk, etc.)
        var ticketId = await CreateSupportTicket(request);
        
        // Send email notification to sales/support team
        await SendNotificationEmail(request);
        
        return new ContactResponse
        {
            Success = true,
            TicketId = ticketId,
            Message = "Your message has been sent to our team. We'll get back to you within 2 hours during business hours."
        };
    }
}
```

### Database Schema

#### Conversations Table
```sql
CREATE TABLE Conversations (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ConversationId NVARCHAR(100) NOT NULL UNIQUE,
    UserId NVARCHAR(100) NULL, -- For authenticated users
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    Context NVARCHAR(MAX) NULL -- JSON context data
);
```

#### Messages Table
```sql
CREATE TABLE Messages (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ConversationId NVARCHAR(100) NOT NULL,
    MessageId NVARCHAR(100) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Sender NVARCHAR(20) NOT NULL, -- 'user' or 'bot'
    MessageType NVARCHAR(50) NULL, -- 'text', 'quick_action', 'contact_request'
    Timestamp DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (ConversationId) REFERENCES Conversations(ConversationId)
);
```

#### Contact Requests Table
```sql
CREATE TABLE ContactRequests (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    TicketId NVARCHAR(100) NULL,
    Context NVARCHAR(MAX) NULL, -- JSON context data
    Status NVARCHAR(50) DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved'
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

## Implementation Phases

### Phase 1: Rule-Based Responses (Quick Win)
1. Implement `ResponseEngine` with common question patterns
2. Add `/api/chatbot/chat` endpoint
3. Update frontend to use real API instead of mocks
4. Test with common questions (pricing, demo, features)

### Phase 2: Contact Integration
1. Implement `/api/chatbot/contact` endpoint
2. Integrate with your existing ticketing/CRM system
3. Add email notifications to sales team
4. Test contact flow end-to-end

### Phase 3: AI Integration (Advanced)
1. Choose AI provider (OpenAI recommended)
2. Implement `IAiService` with chosen provider
3. Add conversation memory for context
4. Fine-tune responses for your business

### Phase 4: Analytics & Optimization
1. Track common questions and response effectiveness
2. A/B test different response styles
3. Add conversation analytics dashboard
4. Optimize for conversion (demo bookings, signups)

## Configuration

### appsettings.json
```json
{
  "Chatbot": {
    "EnableAI": true,
    "AIProvider": "OpenAI",
    "OpenAI": {
      "ApiKey": "your-openai-api-key",
      "Model": "gpt-3.5-turbo",
      "MaxTokens": 300
    },
    "ResponseCaching": {
      "Enabled": true,
      "CacheDurationMinutes": 60
    }
  }
}
```

## Next Steps

1. **Start with Phase 1** - Implement rule-based responses for immediate improvement
2. **Define your common questions** - Analyze current support tickets/inquiries
3. **Set up the database** - Create tables for conversation history
4. **Implement the endpoints** - Start with the chat endpoint
5. **Test thoroughly** - Ensure responses are helpful and on-brand

This approach will give you a much more responsive chatbot that can handle common questions effectively while building toward a fully AI-powered solution!