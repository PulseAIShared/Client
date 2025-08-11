import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  trigger: string;
  segmentId?: string;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  convertedCount: number;
  revenueRecovered: number;
  createdAt: string;
  scheduledDate?: string;
  steps: CampaignStep[];
}

interface CampaignStep {
  id: string;
  stepOrder: number;
  type: string;
  delay: string;
  subject: string;
  content: string;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  convertedCount: number;
}

// Mock data
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Payment Recovery Flow',
    description: 'Automated flow for recovering failed payments',
    type: 'Email',
    status: 'Active',
    trigger: 'PaymentFailed',
    sentCount: 245,
    openedCount: 167,
    clickedCount: 89,
    convertedCount: 34,
    revenueRecovered: 18420,
    createdAt: '2024-03-15',
    steps: []
  }
];

// Get all campaigns
export const getCampaigns = async ({ 
  status, 
  type, 
  page = 1, 
  pageSize = 20 
}: { 
  status?: string; 
  type?: string; 
  page?: number; 
  pageSize?: number; 
} = {}): Promise<{ data: Campaign[]; total: number }> => {
  // TODO: Replace with actual API call when backend is ready
  // These parameters will be used for filtering once the API is implemented
  // return api.get(`/campaigns?status=${status}&type=${type}&page=${page}&pageSize=${pageSize}`);
  
  // For now, return mock data (parameters unused until API is implemented)
  console.log('Filters received:', { status, type, page, pageSize });
  return { data: mockCampaigns, total: mockCampaigns.length };
};

export const getCampaignsQueryOptions = (params?: { 
  status?: string; 
  type?: string; 
  page?: number; 
  pageSize?: number; 
}) => {
  return {
    queryKey: ['campaigns', params],
    queryFn: () => getCampaigns(params),
  };
};

export const useGetCampaigns = (
  params?: { status?: string; type?: string; page?: number; pageSize?: number },
  queryConfig?: QueryConfig<typeof getCampaignsQueryOptions>
) => {
  return useQuery({
    ...getCampaignsQueryOptions(params),
    ...queryConfig,
  });
};

// Get campaign by ID
export const getCampaignById = async ({ campaignId }: { campaignId: string }): Promise<Campaign> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get(`/campaigns/${campaignId}`);
  const campaign = mockCampaigns.find(c => c.id === campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  return campaign;
};

export const getCampaignByIdQueryOptions = (campaignId: string) => {
  return {
    queryKey: ['campaigns', campaignId],
    queryFn: () => getCampaignById({ campaignId }),
    enabled: !!campaignId,
  };
};

export const useGetCampaignById = (campaignId: string, queryConfig?: QueryConfig<typeof getCampaignByIdQueryOptions>) => {
  return useQuery({
    ...getCampaignByIdQueryOptions(campaignId),
    ...queryConfig,
  });
};

// Create campaign
export const createCampaign = async (data: {
  name: string;
  description?: string;
  type: string;
  trigger: string | { type: 'Manual' | 'Scheduled' | 'Event'; eventName?: string };
  segmentId?: string;
  senderProfileId?: string;
  steps: Array<{
    stepOrder: number;
    type: string;
    delay: string;
    subject: string;
    content: string;
    tracking?: { openTracking?: boolean; clickTracking?: boolean };
  }>;
  schedule?: { type: 'now' | 'at' | 'manual'; sendAtUtc?: string | null; timeZone?: string; rateLimitPerMinute?: number };
  testRecipients?: string[];
}): Promise<Campaign> => {
  return api.post('/campaigns', data);
};

type UseCreateCampaignOptions = {
  mutationConfig?: MutationConfig<typeof createCampaign>;
};

export const useCreateCampaign = ({ mutationConfig }: UseCreateCampaignOptions = {}) => {
  return useMutation({
    mutationFn: createCampaign,
    ...mutationConfig,
  });
};

// Launch campaign
export const launchCampaign = async ({ 
  campaignId, 
  scheduledDate 
}: { 
  campaignId: string; 
  scheduledDate?: string; 
}): Promise<Campaign> => {
  return api.post(`/campaigns/${campaignId}/launch`, { scheduledDate });
};

type UseLaunchCampaignOptions = {
  mutationConfig?: MutationConfig<typeof launchCampaign>;
};

export const useLaunchCampaign = ({ mutationConfig }: UseLaunchCampaignOptions = {}) => {
  return useMutation({
    mutationFn: launchCampaign,
    ...mutationConfig,
  });
};

// Pause campaign
export const pauseCampaign = async ({ campaignId }: { campaignId: string }): Promise<Campaign> => {
  return api.post(`/campaigns/${campaignId}/pause`);
};

type UsePauseCampaignOptions = {
  mutationConfig?: MutationConfig<typeof pauseCampaign>;
};

export const usePauseCampaign = ({ mutationConfig }: UsePauseCampaignOptions = {}) => {
  return useMutation({
    mutationFn: pauseCampaign,
    ...mutationConfig,
  });
};

// Delete campaign
export const deleteCampaign = async ({ campaignId }: { campaignId: string }): Promise<void> => {
  return api.delete(`/campaigns/${campaignId}`);
};

type UseDeleteCampaignOptions = {
  mutationConfig?: MutationConfig<typeof deleteCampaign>;
};

export const useDeleteCampaign = ({ mutationConfig }: UseDeleteCampaignOptions = {}) => {
  return useMutation({
    mutationFn: deleteCampaign,
    ...mutationConfig,
  });
};