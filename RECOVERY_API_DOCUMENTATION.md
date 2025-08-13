# Recovery Page API Documentation

This document provides complete server implementation requirements for the Recovery page functionality.

The Recovery page focuses on **functional operations** for payment recovery and flow management. Analytics and insights are handled separately on the Insights page.

## Base URL Structure
All recovery endpoints are under `/recovery`

## Table of Contents
- [Main Recovery Endpoint](#main-recovery-endpoint)
- [Missed Payments Endpoints](#missed-payments-endpoints)
- [Recovery Flows Endpoints](#recovery-flows-endpoints)
- [Payment Actions Endpoints](#payment-actions-endpoints)
- [Error Handling](#error-handling)
- [Authentication](#authentication)

---

## Main Recovery Endpoint

### GET `/recovery`
Returns all data needed for the recovery page functionality (missed payments table and flows).

**Response Format:**
```json
{
  "analytics": {
    "tables": {
      "missedPayments": [
        {
          "id": "mp_1",
          "customer": "Acme Corp",
          "amount": 4500,
          "dueDate": "2024-01-15T00:00:00Z",
          "status": "Open",
          "attempts": 1,
          "segmentTags": ["Enterprise"],
          "customerId": "cust_123",
          "subscriptionId": "sub_456",
          "failureReason": "Card expired",
          "lastAttemptDate": "2024-01-14T10:30:00Z",
          "nextAttemptDate": "2024-01-16T10:30:00Z"
        }
      ]
    }
  },
  "flows": {
    "flows": [
      {
        "id": "flow_123",
        "name": "Payment Recovery Flow",
        "status": "Active",
        "type": "Automated",
        "trigger": "Payment Failed",
        "channels": ["Email", "SMS"],
        "successRate": 73,
        "recoveredRevenue": "$18,420",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-10T00:00:00Z",
        "enrolledPayments": 145,
        "totalRecovered": 18420,
        "steps": [
          {
            "step": 1,
            "type": "email",
            "delay": "1 hour",
            "subject": "Payment Update Required",
            "template": "payment_failed_initial",
            "open_rate": 68
          }
        ]
      }
    ],
    "templates": [
      {
        "id": "tpl_123",
        "name": "Winback Campaign",
        "trigger": "Cancelled subscription",
        "successRate": 28,
        "category": "Retention",
        "description": "Re-engage cancelled customers",
        "steps": [
          {
            "type": "email",
            "delay": "Immediate",
            "subject": "We'd love to have you back",
            "template": "winback_email_1"
          }
        ]
      }
    ]
  }
}
```

**Usage:**
This single endpoint provides all the functional data needed for the recovery page:
- **Missed payments table** for the work queue
- **Active recovery flows** for flow management
- **Flow templates** for creating new flows

No mock data - the API must return real data or appropriate errors.

---

## Missed Payments Endpoints

### GET `/recovery/payments/missed`
Retrieve filtered missed payments with pagination and sorting.

**Query Parameters:**
- `status` (optional): "All" | "Open" | "In Progress" | "Recovered"
- `minAmount` (optional): number
- `maxAmount` (optional): number  
- `segment` (optional): string
- `customerId` (optional): string
- `search` (optional): string (searches customer name)
- `dateRange` (optional): JSON string `{"start": "2024-01-01", "end": "2024-01-31"}`
- `sortBy` (optional): "customer" | "amount" | "dueDate" | "status" | "attempts"
- `sortDirection` (optional): "asc" | "desc"
- `limit` (optional): number (default: 100)
- `offset` (optional): number (default: 0)

**Example Request:**
```
GET /recovery/payments/missed?status=Open&minAmount=100&sortBy=amount&sortDirection=desc&limit=50
```

**Response Format:**
```json
{
  "data": [
    {
      "id": "mp_1",
      "customer": "Acme Corp",
      "amount": 4500,
      "dueDate": "2024-01-15T00:00:00Z",
      "status": "Open",
      "attempts": 1,
      "segmentTags": ["Enterprise"],
      "customerId": "cust_123",
      "subscriptionId": "sub_456",
      "failureReason": "Card expired",
      "lastAttemptDate": "2024-01-14T10:30:00Z",
      "nextAttemptDate": "2024-01-16T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Recovery Flows Endpoints

### GET `/recovery/flows`
Retrieve recovery flows with optional filtering.

**Query Parameters:**
- `status` (optional): "Active" | "Paused" | "Draft" | "All"
- `type` (optional): "Automated" | "AI-Generated" | "Behavioral" | "All"
- `sortBy` (optional): "name" | "createdAt" | "successRate" | "recoveredRevenue"
- `sortDirection` (optional): "asc" | "desc"

**Response Format:**
```json
[
  {
    "id": "flow_123",
    "name": "Payment Recovery Flow",
    "status": "Active",
    "type": "Automated",
    "trigger": "Payment Failed",
    "channels": ["Email", "SMS"],
    "successRate": 73,
    "recoveredRevenue": "$18,420",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-10T00:00:00Z",
    "enrolledPayments": 145,
    "totalRecovered": 18420,
    "steps": [...]
  }
]
```

### GET `/recovery/flows/templates`
Retrieve flow templates.

**Response Format:**
```json
[
  {
    "id": "tpl_123",
    "name": "Winback Campaign",
    "trigger": "Cancelled subscription",
    "successRate": 28,
    "category": "Retention",
    "description": "Re-engage cancelled customers",
    "steps": [
      {
        "type": "email",
        "delay": "Immediate",
        "subject": "We'd love to have you back",
        "template": "winback_email_1"
      }
    ]
  }
]
```

### POST `/recovery/flows`
Create a new recovery flow.

**Request Body:**
```json
{
  "name": "My Custom Flow",
  "trigger": "Payment Failed",
  "type": "Automated",
  "status": "Draft",
  "steps": [
    {
      "type": "email",
      "delay": "1 hour",
      "subject": "Payment Update Required",
      "template": "payment_failed_template"
    },
    {
      "type": "sms",
      "delay": "24 hours",
      "subject": "Quick payment reminder",
      "template": "payment_sms_reminder"
    }
  ]
}
```

**Response Format:**
```json
{
  "id": "flow_456",
  "name": "My Custom Flow",
  "status": "Draft",
  "type": "Automated",
  "trigger": "Payment Failed",
  "channels": ["Email", "SMS"],
  "successRate": 0,
  "recoveredRevenue": "$0",
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z",
  "enrolledPayments": 0,
  "totalRecovered": 0,
  "steps": [...]
}
```

### PUT `/recovery/flows/{flowId}`
Update an existing recovery flow.

**Request Body:** Same as POST, plus:
```json
{
  "id": "flow_456",
  // ... other fields to update
}
```

### DELETE `/recovery/flows/{flowId}`
Delete a recovery flow.

**Response Format:**
```json
{
  "success": true,
  "message": "Flow deleted successfully"
}
```

### GET `/recovery/flows/{flowId}/performance`
Get detailed performance metrics for a specific flow.

**Response Format:**
```json
{
  "flowId": "flow_123",
  "enrolledCount": 145,
  "recoveredCount": 89,
  "recoveredAmount": 18420,
  "averageTimeToRecover": 4.2,
  "stepPerformance": [
    {
      "step": 1,
      "sentCount": 145,
      "openRate": 68,
      "clickRate": 24,
      "conversionRate": 12
    },
    {
      "step": 2,
      "sentCount": 127,
      "responseRate": 45,
      "conversionRate": 35
    }
  ]
}
```

---

## Payment Actions Endpoints

### POST `/recovery/payments/{paymentId}/retry`
Manually retry a failed payment.

**Response Format:**
```json
{
  "success": true,
  "paymentId": "mp_1",
  "newAttemptDate": "2024-01-16T14:30:00Z",
  "message": "Payment retry scheduled successfully"
}
```

### POST `/recovery/payments/{paymentId}/enroll`
Enroll a single payment into a recovery flow.

**Request Body:**
```json
{
  "flowId": "flow_123"
}
```

**Response Format:**
```json
{
  "success": true,
  "paymentId": "mp_1",
  "flowId": "flow_123",
  "enrollmentId": "enroll_789",
  "message": "Payment enrolled in flow successfully"
}
```

### POST `/recovery/payments/bulk-enroll`
Enroll multiple payments into a recovery flow.

**Request Body:**
```json
{
  "paymentIds": ["mp_1", "mp_2", "mp_3"],
  "flowId": "flow_123"
}
```

**Response Format:**
```json
[
  {
    "success": true,
    "paymentId": "mp_1",
    "flowId": "flow_123",
    "enrollmentId": "enroll_789"
  },
  {
    "success": false,
    "paymentId": "mp_2",
    "flowId": "flow_123",
    "error": "Payment already recovered"
  }
]
```

### PATCH `/recovery/payments/{paymentId}`
Update payment status.

**Request Body:**
```json
{
  "status": "Recovered"
}
```

**Response Format:**
```json
{
  "success": true,
  "paymentId": "mp_1",
  "newStatus": "Recovered"
}
```

---

## Error Handling

All endpoints should return appropriate HTTP status codes:

- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity (business logic errors)
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "amount",
      "reason": "Amount must be greater than 0"
    }
  }
}
```

## Authentication

All endpoints require authentication via Bearer token:
```
Authorization: Bearer <jwt_token>
```

## Database Schema Requirements

### missed_payments table
```sql
id (string, primary key)
customer_id (string, foreign key)
subscription_id (string, foreign key)
amount (decimal)
currency (string, default 'USD')
due_date (timestamp)
status (enum: 'Open', 'In Progress', 'Recovered')
attempts (integer, default 0)
failure_reason (string)
last_attempt_date (timestamp)
next_attempt_date (timestamp)
created_at (timestamp)
updated_at (timestamp)
```

### recovery_flows table
```sql
id (string, primary key)
name (string)
status (enum: 'Active', 'Paused', 'Draft')
type (enum: 'Automated', 'AI-Generated', 'Behavioral')
trigger (string)
steps (json)
successRate (decimal)
total_enrolled (integer, default 0)
total_recovered (decimal, default 0)
created_at (timestamp)
updated_at (timestamp)
```

### flow_enrollments table
```sql
id (string, primary key)
payment_id (string, foreign key)
flow_id (string, foreign key)
current_step (integer, default 1)
status (enum: 'Active', 'Completed', 'Failed')
enrolled_at (timestamp)
completed_at (timestamp)
```

### flow_step_executions table
```sql
id (string, primary key)
enrollment_id (string, foreign key)
step_number (integer)
executed_at (timestamp)
status (enum: 'Sent', 'Delivered', 'Opened', 'Clicked', 'Responded')
response_data (json)
```




