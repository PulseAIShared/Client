import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export interface WaitlistSignupRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  source?: string;
}

export interface WaitlistSignupResponse {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  message?: string;
}

export const signupForWaitlist = async (data: WaitlistSignupRequest): Promise<WaitlistSignupResponse> => {
  return api.post('/waiting-list/join', data);
};

type UseWaitlistSignupOptions = {
  mutationConfig?: MutationConfig<typeof signupForWaitlist>;
};

export const useWaitlistSignup = ({ mutationConfig }: UseWaitlistSignupOptions = {}) => {
  return useMutation({
    mutationFn: signupForWaitlist,
    ...mutationConfig,
  });
};

export interface WaitingListEntryResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  source?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  updatedAt: string;
}

export interface WaitingListPaginatedResponse {
  items: WaitingListEntryResponse[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface WaitingListQueryParams {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
}

export const getWaitingListEntries = async (params: WaitingListQueryParams = {}): Promise<WaitingListPaginatedResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
  if (params.status) searchParams.append('status', params.status);
  if (params.search) searchParams.append('search', params.search);

  return api.get(`/waiting-list?${searchParams.toString()}` ) ;
};

export const useGetWaitingListEntries = (params: WaitingListQueryParams = {}) => {
  return useQuery({
    queryKey: ['waiting-list', params],
    queryFn: () => getWaitingListEntries(params),
  });
};