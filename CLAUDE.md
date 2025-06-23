# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (runs on port 3000 with HTTPS using localhost certs)
- **Build**: `npm run build` (TypeScript compile + Vite build)
- **Lint**: `npm run lint` (ESLint check)
- **Lint fix**: `npm run lint:fix` (ESLint auto-fix)
- **Format**: `npm run format` (Prettier formatting)
- **Preview**: `npm run preview` (preview production build)

## Architecture Overview

This is a React + TypeScript + Vite application for PulseAI customer analytics platform.

### Core Technologies
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS 4.x, Mantine components
- **Routing**: React Router v7 with lazy loading
- **State Management**: Zustand for global state, TanStack Query for server state
- **Forms**: TanStack Form with Zod validation
- **Real-time**: SignalR for live notifications
- **HTTP Client**: Axios with interceptors for auth

### Project Structure

**Feature-based Architecture**: Code is organized by domain features in `src/features/`:
- `analytics/` - Churn analysis and predictive models
- `auth/` - Authentication (login/register)
- `customers/` - Customer management, imports, details
- `dashboard/` - Main dashboard with charts and insights
- `insights/` - Advanced analytics and LTV calculations
- `notifications/` - Real-time notification system
- `segments/` - Customer segmentation
- `settings/` - Account settings and integrations

Each feature contains:
- `api/` - API calls and data fetching
- `components/` - Feature-specific UI components

**Shared Infrastructure**:
- `src/lib/` - Core utilities (auth, API client, SignalR)
- `src/components/ui/` - Reusable UI components
- `src/app/routes/` - Route definitions with lazy loading

### Authentication & API

**Authentication Flow**:
- JWT tokens managed via `react-query-auth`
- Token stored in memory and attached to requests via Axios interceptors
- Protected routes redirect unauthenticated users to `/auth/login`

**API Integration**:
- Base URL configured via `VITE_APP_API_URL` environment variable
- Axios instance in `src/lib/api-client.ts` handles auth headers and response parsing
- TanStack Query for caching and synchronization

**Real-time Features**:
- SignalR connection to `/hubs/notifications` endpoint
- Automatic reconnection with exponential backoff
- User group management for targeted notifications

### Environment Configuration

Required environment variables (prefixed with `VITE_APP_`):
- `VITE_APP_API_URL` - Backend API base URL
- `VITE_APP_APP_URL` - Frontend URL (defaults to localhost:3000)

### Key Patterns

**Route Organization**: App routes under `/app` require authentication, use lazy loading for code splitting

**Form Handling**: TanStack Form + Zod for validation, consistent error handling

**Component Structure**: Feature components import from local `index.ts` barrel exports

**Styling**: TailwindCSS with custom components, Mantine for complex UI elements

**Data Flow**: TanStack Query mutations update cache, SignalR broadcasts changes for real-time updates

### Performance Optimizations

**Notification System**: Optimized to minimize API calls
- SignalR handles all real-time notification updates
- Minimal fallback polling (5 minutes) only when SignalR is unavailable
- No refetching on window focus - relies on SignalR events
- Connection status indicator shows when real-time updates are active
- Manual refresh option available when needed

## Theme System

The application uses a flexible dark/light theme system built with Tailwind CSS v4 and CSS custom properties.

### Theme Implementation

**Theme Context**: Located in `src/lib/theme-context.tsx`
- React context for theme state management
- Persists theme preference in localStorage
- Toggles `.dark` class on document root
- Default theme is dark (preserves original design)

**CSS Variables**: Defined in `src/styles/theme.css`
- Uses Tailwind v4's `@theme` directive for custom colors
- Separate variable sets for light and dark modes
- Automatic switching based on `.dark` class

**Theme Variables Available**:
- `bg-primary`, `bg-secondary` - Background colors
- `surface-primary`, `surface-secondary` - Card/surface backgrounds
- `text-primary`, `text-secondary`, `text-muted` - Text colors
- `border-primary` - Border colors
- `accent-primary`, `accent-secondary` - Accent colors for buttons/highlights
- `gradient-from`, `gradient-via`, `gradient-to` - Gradient colors
- `success`, `success-muted`, `success-bg` - Success/green semantic colors
- `warning`, `warning-muted`, `warning-bg` - Warning/yellow semantic colors
- `error`, `error-muted`, `error-bg` - Error/red semantic colors
- `info`, `info-muted`, `info-bg` - Info/cyan semantic colors

### Usage in Components

Use theme variables instead of hard-coded colors:
```tsx
// ✅ Good - Uses theme variables
<div className="bg-surface-primary text-text-primary border-border-primary">
  <h1 className="text-text-primary">Title</h1>
  <button className="bg-accent-primary hover:bg-accent-hover">Click me</button>
  <div className="text-success-muted">Success message</div>
  <div className="text-error-muted">Error message</div>
</div>

// ❌ Bad - Hard-coded colors
<div className="bg-slate-800 text-white border-slate-700">
  <h1 className="text-white">Title</h1>
  <button className="bg-blue-500 hover:bg-blue-600">Click me</button>
  <div className="text-green-400">Success message</div>
  <div className="text-red-400">Error message</div>
</div>
```

### Customizing Colors

Edit the CSS variables in `src/styles/theme.css`:
```css
:root {
  /* Light theme */
  --bg-primary: 248 250 252; /* RGB values */
  --accent-primary: 59 130 246;
}

.dark {
  /* Dark theme */
  --bg-primary: 15 23 42;
  --accent-primary: 96 165 250;
}
```

### Theme Toggle

Theme toggle button is available in the top navigation (`src/components/ui/nav/top-navigation.tsx`) with sun/moon icons that automatically switch based on current theme.