# Authentication & Onboarding Flow Specification

This document outlines the complete authentication and onboarding flow for PulseLTV, including UI interactions, server requirements, and OAuth handling.

## Overview

The new authentication system consolidates login/register flows into two main routes (`/login` and `/register`) with both SSO and email verification options, followed by a progressive onboarding experience for first-time users.

## Route Structure

```
/auth/login       - Login page with SSO + email options
/auth/register    - Register page with SSO + email options  
/auth/onboarding  - Multi-step onboarding for first-time users
```

## Authentication Methods

### 1. Email Verification Flow

**UI Flow:**
1. User enters email address
2. System sends 6-digit verification code
3. UI shows: "Enter the verification code sent to [email]"
4. Second input field appears for verification code
5. User submits code to authenticate

**Server Requirements:**
```http
POST /auth/send-verification-code
Content-Type: application/json
{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "Verification code sent",
  "expiresIn": 300
}
```

```http
POST /auth/verify-code
Content-Type: application/json
{
  "email": "user@example.com",
  "code": "123456"
}

Response: 200 OK
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt-token",
  "isFirstLogin": true,
  "hasCompletedOnboarding": false
}
```

### 2. SSO Flow (Google, Facebook, Apple)

**UI Flow:**
1. User clicks "Continue with [Provider]" button
2. **New popup window opens** with OAuth provider
3. Parent window shows loading state with spinner
4. User completes OAuth in popup
5. Popup window closes automatically
6. Parent window receives authentication result
7. Redirect based on `isFirstLogin` status

**Technical Implementation:**

**Frontend (Popup Window):**
```javascript
// Open OAuth popup
const popup = window.open(
  `${API_URL}/auth/${provider}?popup=true`,
  'oauth-popup',
  'width=500,height=600,scrollbars=yes,resizable=yes'
);

// Listen for popup completion
const messageHandler = (event) => {
  if (event.origin !== window.location.origin) return;
  
  if (event.data.type === 'OAUTH_SUCCESS') {
    setAuthData(event.data.payload);
    popup.close();
    handleAuthSuccess(event.data.payload);
  } else if (event.data.type === 'OAUTH_ERROR') {
    setError(event.data.error);
    popup.close();
  }
};

window.addEventListener('message', messageHandler);
```

**Server OAuth Endpoints:**
```http
GET /auth/google?popup=true
GET /auth/facebook?popup=true  
GET /auth/apple?popup=true

# OAuth callback - renders HTML that posts message to parent
GET /auth/google/callback
GET /auth/facebook/callback
GET /auth/apple/callback
```

**OAuth Callback Response (HTML):**
```html
<!DOCTYPE html>
<html>
<head><title>Authentication Complete</title></head>
<body>
<script>
  // Success case
  window.opener.postMessage({
    type: 'OAUTH_SUCCESS',
    payload: {
      user: { /* user data */ },
      token: 'jwt-token',
      isFirstLogin: true,
      hasCompletedOnboarding: false
    }
  }, window.location.origin);
  
  // Error case  
  window.opener.postMessage({
    type: 'OAUTH_ERROR',
    error: 'Authentication failed'
  }, window.location.origin);
  
  window.close();
</script>
</body>
</html>
```

## Loading States

### Email Flow Loading States
1. **Sending Code**: "Sending verification code..."
2. **Verifying Code**: "Verifying code..."

### SSO Flow Loading States
1. **Opening Popup**: Button shows spinner briefly
2. **OAuth In Progress**: Overlay with message "Complete authentication in the popup window"
3. **Processing Result**: "Processing authentication..."

## First-Time User Detection

**Server Logic:**
- Track `first_login_at` timestamp in user table
- When user authenticates for the first time, `first_login_at` is NULL
- Return `isFirstLogin: true` in auth response
- Update `first_login_at` after successful authentication
- Track `onboarding_completed_at` separately for onboarding flow

**Database Schema Addition:**
```sql
ALTER TABLE users ADD COLUMN first_login_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN onboarding_completed_at TIMESTAMP NULL;
```

## Onboarding Flow

### Route: `/auth/onboarding`

**Prerequisites:**
- User must be authenticated
- `isFirstLogin` must be true OR `hasCompletedOnboarding` must be false

**Progress Steps:**

#### Step 1: Profile Setup
**Email Users:**
- First Name (required)
- Last Name (required)  
- Password (required, min 8 chars)

**SSO Users:**
- Skip this step (data from OAuth provider)

#### Step 2: Company Setup
**All Users:**
- Company Name (required)
- Company Domain (required, validation pattern)
- Industry (dropdown, required)
- Company Size (dropdown, required)
- Country (dropdown, required)

#### Step 3: Integration Preferences
**All Users (checkboxes):**

**CRMs:**
- [ ] HubSpot
- [ ] Salesforce
- [ ] Pipedrive
- [ ] Zoho CRM
- [ ] Monday.com
- [ ] Other

**Payment Processors:**
- [ ] Stripe
- [ ] PayPal
- [ ] Square
- [ ] Braintree
- [ ] Authorize.net
- [ ] Other

**E-commerce Platforms:**
- [ ] Shopify
- [ ] WooCommerce
- [ ] Magento
- [ ] BigCommerce
- [ ] Other

**Server Endpoints:**

```http
PUT /auth/onboarding/profile
Content-Type: application/json
{
  "firstName": "John",
  "lastName": "Doe", 
  "password": "securepass123"
}
```

```http
PUT /auth/onboarding/company
Content-Type: application/json
{
  "name": "Acme Corp",
  "domain": "acme.com",
  "industry": "technology",
  "size": "startup",
  "country": "US"
}
```

```http
PUT /auth/onboarding/integrations
Content-Type: application/json
{
  "crms": ["hubspot", "salesforce"],
  "paymentProcessors": ["stripe"],
  "ecommercePlatforms": ["shopify"]
}
```

```http
POST /auth/onboarding/complete
Response: 200 OK
{
  "message": "Onboarding completed",
  "redirectTo": "/app"
}
```

## UI Components Structure

### Authentication Pages

```tsx
// Shared component for both login/register
<AuthPage mode="login" | "register">
  <AuthHeader />
  
  {/* SSO Section */}
  <SSOButtons onLoading={setIsLoading} />
  {isLoading && <SSOLoadingOverlay />}
  
  <Divider />
  
  {/* Email Section */}
  <EmailAuthForm mode={mode} />
</AuthPage>
```

### Onboarding Page

```tsx
<OnboardingLayout>
  <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
  
  <StepContent>
    {currentStep === 1 && <ProfileSetupStep />}
    {currentStep === 2 && <CompanySetupStep />}
    {currentStep === 3 && <IntegrationPreferencesStep />}
  </StepContent>
  
  <NavigationButtons>
    <BackButton disabled={currentStep === 1} />
    <NextButton loading={isSubmitting} />
  </NavigationButtons>
</OnboardingLayout>
```

## Error Handling

### Email Verification Errors
- Invalid email format
- Code expired (5 minutes)
- Invalid code (max 3 attempts)
- Too many requests (rate limiting)

### SSO Errors
- Popup blocked by browser
- OAuth provider error
- Network connection issues
- User cancellation

### Onboarding Errors
- Form validation errors
- Server-side validation failures
- Network timeouts
- Session expiration

## Security Considerations

1. **Verification Codes:**
   - 6-digit numeric codes
   - 5-minute expiration
   - Rate limiting: max 3 codes per email per hour
   - Max 3 verification attempts per code

2. **OAuth Security:**
   - State parameter validation
   - Origin validation for postMessage
   - Popup window security restrictions

3. **Session Management:**
   - JWT token expiration
   - Secure token storage
   - Automatic logout on token expiry

## Analytics & Tracking

**Events to Track:**
- `auth_method_selected` (email | google | facebook | apple)
- `verification_code_sent`
- `verification_code_verified`
- `oauth_popup_opened`
- `oauth_completed`
- `onboarding_step_completed`
- `onboarding_completed`
- `auth_error` (with error type)

This specification provides the complete flow for implementing both frontend UI and backend server requirements for the new authentication and onboarding system.

## .NET Server Implementation Requirements

To support the UI flow described above, the .NET server needs to implement the following components:

### **1. Database Schema Updates**

```sql
-- Add onboarding tracking fields to Users table
ALTER TABLE Users ADD COLUMN IsFirstLogin BIT DEFAULT 1;
ALTER TABLE Users ADD COLUMN OnboardingCompleted BIT DEFAULT 0;
ALTER TABLE Users ADD COLUMN OnboardingCompletedAt DATETIME2 NULL;
ALTER TABLE Users ADD COLUMN FirstLoginAt DATETIME2 NULL;
ALTER TABLE Users ADD COLUMN OnboardingCurrentStep INT DEFAULT 1;

-- Create verification codes table
CREATE TABLE VerificationCodes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL,
    Code NVARCHAR(6) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    IsUsed BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    AttemptCount INT DEFAULT 0,
    INDEX IX_VerificationCodes_Email_Code (Email, Code),
    INDEX IX_VerificationCodes_ExpiresAt (ExpiresAt)
);
```

### **2. Authentication Endpoints**

#### **Email Verification**
```csharp
[HttpPost("auth/send-verification-code")]
public async Task<IActionResult> SendVerificationCode([FromBody] SendCodeRequest request)
{
    // 1. Validate email format
    // 2. Rate limiting: max 3 codes per email per hour
    // 3. Generate 6-digit numeric code
    // 4. Store in VerificationCodes table with 5-minute expiry
    // 5. Send email with code
    // 6. Return success response
}

[HttpPost("auth/verify-code")]
public async Task<IActionResult> VerifyCode([FromBody] VerifyCodeRequest request)
{
    // 1. Find valid, unexpired code for email
    // 2. Check attempt count (max 3 attempts per code)
    // 3. If valid: create/login user, mark code as used
    // 4. Set IsFirstLogin = true for new users
    // 5. Update FirstLoginAt timestamp on first login
    // 6. Generate JWT token
    // 7. Return AuthResponse with user data and onboarding status
}
```

#### **OAuth Integration**
```csharp
[HttpGet("auth/{provider}")]
public IActionResult InitiateOAuth(string provider, [FromQuery] bool popup = false, [FromQuery] string invitation = null)
{
    // 1. Validate provider (google, facebook, apple)
    // 2. Store invitation token in session/state if provided
    // 3. Redirect to OAuth provider with appropriate scopes
    // 4. Include popup=true in state for popup handling
}

[HttpGet("auth/{provider}/callback")]
public async Task<IActionResult> OAuthCallback(string provider, [FromQuery] string code, [FromQuery] string state)
{
    // 1. Exchange code for access token with provider
    // 2. Fetch user info from provider API
    // 3. Create/login user with OAuth data
    // 4. Set IsFirstLogin = true for new users
    // 5. Handle invitation token if present in state
    // 6. If popup=true in state, return HTML with postMessage
    // 7. Otherwise, redirect to frontend with token
}
```

### **3. Response Models**

```csharp
public class AuthResponse
{
    public string Token { get; set; }
    public UserDto User { get; set; }
}

public class UserDto
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Avatar { get; set; }
    public string Role { get; set; }
    public string CompanyId { get; set; }
    public bool? IsCompanyOwner { get; set; }
    public bool? IsFirstLogin { get; set; }
    public OnboardingStatusDto OnboardingStatus { get; set; }
}

public class OnboardingStatusDto
{
    public bool Completed { get; set; }
    public int? CurrentStep { get; set; }
    public List<string> CompletedSteps { get; set; } = new();
}
```

### **4. Onboarding Endpoints**

```csharp
[HttpPut("auth/onboarding/profile")]
[Authorize]
public async Task<IActionResult> UpdateProfile([FromBody] ProfileUpdateRequest request)
{
    // For email users: update firstName, lastName, password
    // Mark profile step as completed
}

[HttpPut("auth/onboarding/company")]
[Authorize] 
public async Task<IActionResult> CreateCompany([FromBody] CompanyCreationRequest request)
{
    // Create company record
    // Associate user with company
    // Mark company step as completed
}

[HttpPut("auth/onboarding/integrations")]
[Authorize]
public async Task<IActionResult> SaveIntegrations([FromBody] IntegrationsRequest request)
{
    // Save integration preferences
    // Mark integrations step as completed
}

[HttpPost("auth/onboarding/complete")]
[Authorize]
public async Task<IActionResult> CompleteOnboarding()
{
    // Set OnboardingCompleted = true
    // Set OnboardingCompletedAt = now
    // Set IsFirstLogin = false
    // Return success response
}
```

### **5. Security & Validation**

```csharp
// Rate limiting configuration
services.Configure<RateLimitOptions>(options =>
{
    options.Rules.Add(new RateLimitRule
    {
        Endpoint = "auth/send-verification-code",
        Period = TimeSpan.FromHours(1),
        Limit = 3,
        QueuingEnabled = false
    });
});

// Email service for verification codes
public interface IEmailService
{
    Task SendVerificationCodeAsync(string email, string code);
}

// Code generation service
public interface IVerificationCodeService
{
    string GenerateCode(); // Returns 6-digit numeric string
    Task<bool> ValidateCodeAsync(string email, string code);
    Task StoreCodeAsync(string email, string code, TimeSpan expiry);
}
```

### **6. OAuth Popup Response HTML**

```html
<!DOCTYPE html>
<html>
<head><title>Authentication Complete</title></head>
<body>
<script>
try {
    const authData = @Html.Raw(Json.Serialize(Model.AuthData));
    const error = @Html.Raw(Json.Serialize(Model.Error));
    
    if (authData) {
        window.opener.postMessage({
            type: 'OAUTH_SUCCESS',
            payload: authData
        }, '@Model.Origin');
    } else {
        window.opener.postMessage({
            type: 'OAUTH_ERROR', 
            error: error
        }, '@Model.Origin');
    }
} catch (e) {
    window.opener.postMessage({
        type: 'OAUTH_ERROR',
        error: 'Authentication failed'
    }, '@Model.Origin');
}
window.close();
</script>
</body>
</html>
```

### **7. Configuration Requirements**

```json
{
  "Authentication": {
    "Google": {
      "ClientId": "your-google-client-id",
      "ClientSecret": "your-google-client-secret"
    },
    "Facebook": {
      "AppId": "your-facebook-app-id", 
      "AppSecret": "your-facebook-app-secret"
    },
    "Apple": {
      "ClientId": "your-apple-client-id",
      "TeamId": "your-apple-team-id",
      "KeyId": "your-apple-key-id",
      "PrivateKey": "your-apple-private-key"
    }
  },
  "Email": {
    "SmtpHost": "smtp.sendgrid.net",
    "SmtpPort": 587,
    "ApiKey": "your-sendgrid-api-key"
  },
  "RateLimit": {
    "VerificationCodes": {
      "MaxPerHour": 3,
      "MaxAttempts": 3
    }
  }
}
```

This implementation will fully support the frontend authentication flow with email verification, SSO popup handling, and progressive onboarding for first-time users.