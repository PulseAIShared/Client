# Authentication API Endpoints Specification

This document outlines all the authentication endpoints required by the PulseAI frontend application.

## Core Authentication Endpoints

### 1. Login with Email/Password
**Endpoint:** `POST /users/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "onboardingCompleted": boolean,
    "onboardingCurrentStep": number
  }
}
```

### 2. Get Current User
**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "token": "string", // Optional - refresh token if needed
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "onboardingCompleted": boolean,
    "onboardingCurrentStep": number
  }
}
```

### 3. Logout
**Endpoint:** `POST /users/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true
}
```

## Registration & Verification Endpoints

### 4. Send Verification Code
**Endpoint:** `POST /auth/send-verification-code`

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to email"
}
```

### 5. Verify Code & Create Account
**Endpoint:** `POST /auth/verify-code`

**Request Body:**
```json
{
  "email": "string",
  "code": "string"
}
```

**Response:**
```json
{
  "authData": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "firstName": "string", // May be null for email registrations
      "lastName": "string",  // May be null for email registrations
      "onboardingCompleted": false,
      "onboardingCurrentStep": 1
    }
  }
}
```

## Onboarding Endpoint

### 6. Dynamic Onboarding Step Processing
**Endpoint:** `POST /auth/onboarding`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body (Step 1 - Profile):**
```json
{
  "step": "1",
  "firstName": "string",
  "lastName": "string",
  "password": "string"
}
```

**Request Body (Step 2 - Company):**
```json
{
  "step": "2",
  "companyName": "string",
  "companyDomain": "string",
  "companyCountry": "string",
  "companySize": "string", // "startup", "smb", or "enterprise"
  "companyIndustry": "string"
}
```

**Response (Step 1 - Profile Updated):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "onboardingCompleted": false,
    "onboardingCurrentStep": 2
  }
}
```

**Response (Step 2 - Company Created & Onboarding Completed):**
```json
{
  "success": true,
  "message": "Company created and onboarding completed successfully",
  "companyId": "string",
  "onboardingCompleted": true,
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "onboardingCompleted": true,
    "onboardingCurrentStep": 3
  }
}
```

**Error Response:**
```json
{
  "error": "string",
  "details": "string" // Optional additional details
}
```

## SSO Authentication Endpoints

### 7. Google OAuth
**Endpoint:** `GET /auth/google`

**Query Parameters:**
```
popup=true              // For popup mode
invitation={token}      // Optional invitation token
```

**Behavior:**
- Redirects to Google OAuth
- On success, posts message to parent window (popup mode)
- Sets authentication cookies/tokens

### 8. Facebook OAuth
**Endpoint:** `GET /auth/facebook`

**Query Parameters:**
```
popup=true              // For popup mode
invitation={token}      // Optional invitation token
```

**Behavior:**
- Redirects to Facebook OAuth
- On success, posts message to parent window (popup mode)
- Sets authentication cookies/tokens

### 9. Apple OAuth
**Endpoint:** `GET /auth/apple`

**Query Parameters:**
```
popup=true              // For popup mode
invitation={token}      // Optional invitation token
```

**Behavior:**
- Redirects to Apple OAuth
- On success, posts message to parent window (popup mode)
- Sets authentication cookies/tokens

## SSO Success Callback

For popup-based SSO, the server should return an HTML page that posts a message to the parent window:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Authentication Success</title>
</head>
<body>
    <script>
        window.opener.postMessage({
            type: 'OAUTH_SUCCESS',
            payload: {
                token: '{jwt_token}',
                user: {user_object}
            }
        }, window.location.origin);
        window.close();
    </script>
</body>
</html>
```

For errors:
```html
<script>
    window.opener.postMessage({
        type: 'OAUTH_ERROR',
        error: 'Authentication failed'
    }, window.location.origin);
    window.close();
</script>
```

## Data Models

### User Object
```typescript
interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  onboardingCompleted: boolean;
  onboardingCurrentStep: number; // 1, 2, or 3
}
```

### AuthResponse
```typescript
interface AuthResponse {
  token: string;
  user: User;
}
```

### VerifyCodeResponse
```typescript
interface VerifyCodeResponse {
  authData: {
    token: string;
    user: User;
  };
}
```

## Onboarding Flow Logic

### Email Registration Users:
1. Send verification code → Step 1 (Profile setup) → Step 2 (Company setup) → Complete
2. `onboardingCurrentStep` progression: 1 → 2 → 3 (completed)

### SSO Users:
1. SSO Login → Step 2 (Company setup) → Complete
2. `onboardingCurrentStep` progression: 2 → 3 (completed)
3. SSO users skip profile setup since firstName/lastName come from OAuth

## Security Notes

1. All protected endpoints require `Authorization: Bearer {token}` header
2. JWT tokens should be validated and refreshed as needed
3. Onboarding endpoints should validate user's current step before processing
4. Users cannot skip steps or access steps they haven't reached
5. Server is the source of truth for `onboardingCurrentStep`

## Error Handling

All endpoints should return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `500` - Internal Server Error

Error responses should include a descriptive error message that the frontend can display to users.