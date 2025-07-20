# PulseAI Customer Management System - Context

## Overview
The PulseAI customer management system is a comprehensive customer lifecycle management platform with advanced analytics, churn prediction, and data integration capabilities. It serves as the central hub for managing customer relationships and retention.

## Main Routes
- **Primary Route**: `/app/customers` - Main customer list and management
- **Detail Route**: `/app/customers/:id` - Individual customer details and analytics

## Core Components & Features

### 1. Customer List Management
- **Search & Filtering**: Real-time search with debouncing, status filters (All, Active, High Risk, Payment Issues, Cancelled)
- **Table View**: Sortable columns (Name, Plan, Tenure, LTV, Churn Risk, Activity) with bulk operations
- **Mobile View**: Optimized card layout for mobile devices
- **Pagination**: Server-side pagination with configurable page sizes

### 2. Customer Import System
- **Multi-step Import Wizard**: 4-step process with template selection
- **Template Support**: Pre-configured formats for HubSpot, Salesforce, Pipedrive, and custom formats
- **Real-time Processing**: Background imports with SignalR progress notifications
- **Data Validation**: Client and server-side validation with detailed error reporting
- **Import History**: Track all import jobs with status monitoring

### 3. Customer Detail View (3 Tabs)

#### Overview Tab
- **Key Metrics**: Tenure, LTV, Plan Type, Monthly Revenue in card format
- **Customer Profile**: Personal and business information grid
- **Churn Risk Assessment**: Visual indicators with AI-powered recommendations
- **Action Buttons**: Send Message, Launch Campaign (permission-gated)

#### Analytics Tab
- **Activity Timeline**: Chronological interaction history
- **Engagement Charts**: 6-month trend visualization using Recharts
- **Churn Risk Evolution**: Historical risk progression tracking
- **Predictive Insights**: AI-powered behavioral analysis and time-to-churn estimates

#### Data Sources Tab
- **Integration Overview**: Connected data sources and sync status
- **Data Quality Metrics**: Completeness scores by category (CRM, Payment, Marketing, Support)
- **Recommendations Engine**: Suggestions for data improvement
- **Source Management**: Connect/disconnect integrations

### 4. Bulk Operations
- **Multi-select**: Checkbox selection for bulk actions
- **Bulk Delete**: Confirmation modal with detailed results reporting
- **Bulk Export**: CSV export with filtering applied
- **Bulk Update**: Mass customer data modifications

## Data Flow & API Integration

### Customer API (`src/features/customers/api/customers.ts`)
- `getCustomers()`: Paginated list with filtering/sorting
- `getCustomerById()`: Individual customer details
- `createCustomer()`: Add new customers
- `updateCustomer()`: Modify existing data
- `deleteCustomers()`: Bulk deletion
- `exportCustomers()`: CSV export functionality

### Import API (`src/features/customers/api/import.ts`)
- `uploadImport()`: File upload with validation
- `confirmImport()`: Process validated imports
- `getImportStatus()`: Real-time job monitoring
- `getImportHistory()`: View past import jobs
- `cancelImport()`: Job cancellation

## Advanced Features

### Churn Risk Management
- **ML-powered Risk Scoring**: Dynamic risk assessment with visual indicators
- **Predictive Analytics**: Time-to-churn estimates and behavioral patterns
- **Risk Trend Analysis**: Historical risk progression tracking
- **Automated Recommendations**: AI-generated suggestions for customer retention

### Data Quality & Integration
- **Multi-source Data**: Supports CRM, payment, marketing, and support integrations
- **Quality Scoring**: Automated completeness and accuracy metrics
- **Sync Monitoring**: Real-time integration health tracking
- **Data Enrichment**: Suggestions for missing or incomplete data

### Real-time Features
- **SignalR Integration**: Live updates for imports and data changes
- **Progress Tracking**: Real-time job status for long-running operations
- **Push Notifications**: Important event notifications
- **Auto-refresh**: Background data synchronization

## Permission System
- **Role-based Access**: Company roles (Viewer, Staff, Owner) with escalating permissions
- **Feature Gating**: UI elements hidden/shown based on user permissions
- **Required Permissions**:
  - `customers:read` - View customer data
  - `customers:write` - Modify customer data
  - `campaigns:write` - Launch customer campaigns

## Technical Architecture
- **Frontend**: React 19, TypeScript, TailwindCSS 4.x, Mantine components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Real-time**: SignalR for live updates
- **Charts**: Recharts library for data visualization
- **Performance**: Lazy loading, debounced search, server-side pagination

## User Experience
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Touch-friendly**: Optimized interactions for mobile devices
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Graceful fallbacks and detailed error messages
- **Accessibility**: ARIA labels and keyboard navigation support

This customer management system provides enterprise-grade functionality for subscription businesses focusing on customer retention and churn reduction through data-driven insights and automated workflows.