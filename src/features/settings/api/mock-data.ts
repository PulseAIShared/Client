import { Integration, IntegrationStats } from "@/types/api";

// Mock data (replace with actual API calls when backend is ready)
export const mockIntegrations: Integration[] = [
  {
    id: '1',
    type: 'Salesforce',
    name: 'Salesforce CRM',
    status: 'Disconnected',
    lastSyncedAt: undefined,
    syncedRecordCount: 0
  },
  {
    id: '2',
    type: 'Stripe',
    name: 'Stripe Payments',
    status: 'Disconnected',
    lastSyncedAt: undefined,
    syncedRecordCount: 0
  },
  {
    id: '3',
    type: 'HubSpot',
    name: 'HubSpot CRM',
    status: 'Disconnected',
    lastSyncedAt: undefined,
    syncedRecordCount: 0
  },
  {
    id: '4',
    type: 'Mailchimp',
    name: 'Mailchimp Email Marketing',
    status: 'Disconnected',
    lastSyncedAt: undefined,
    syncedRecordCount: 0
  },
  {
    id: '5',
    type: 'Google Analytics',
    name: 'Google Analytics 4',
    status: 'Disconnected',
    lastSyncedAt: undefined,
    syncedRecordCount: 0
  },
  {
    id: '6',
    type: 'Pipedrive',
    name: 'Pipedrive CRM',
    status: 'Disconnected',
    lastSyncedAt: undefined,
    syncedRecordCount: 0
  },
  {
    id: '7',
    type: 'Zoho',
    name: 'Zoho CRM',
    status: 'Disconnected',
    lastSyncedAt: undefined,
    syncedRecordCount: 0
    
  }
];

export const mockIntegrationStats: IntegrationStats = {
  connectedCount: 4,
  totalRecordsSynced: 45970,
  lastSyncTime: '2 minutes ago'
};