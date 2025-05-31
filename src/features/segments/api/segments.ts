import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CustomerSegment, SegmentPerformanceMetrics } from '@/types/api';
import { MutationConfig, QueryConfig } from '@/lib/react-query';

// Mock data for segments (replace with actual API calls when backend is ready)
const mockSegments: CustomerSegment[] = [
  {
    id: '1',
    name: 'High-Value Enterprise',
    description: 'Enterprise customers with high LTV and low churn risk',
    criteria: [
      { field: 'plan_type', operator: 'equals', value: 'Enterprise', label: 'Plan Type = Enterprise' },
      { field: 'ltv', operator: 'greater_than', value: 500, label: 'LTV > $500' }
    ],
    customerCount: 1240,
    churnRate: 3.2,
    avgLTV: 850,
    avgRevenue: 12500,
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15',
    status: 'active',
    type: 'behavioral',
    color: '#8b5cf6'
  },
  // Add more mock segments...
];

// Get all segments
export const getSegments = async ({ 
  searchTerm, 
  filterType, 
  sortBy 
}: { 
  searchTerm?: string; 
  filterType?: string; 
  sortBy?: string; 
} = {}): Promise<CustomerSegment[]> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get(`/segments?searchTerm=${searchTerm}&filterType=${filterType}&sortBy=${sortBy}`);
  return mockSegments;
};

export const getSegmentsQueryOptions = (params?: { 
  searchTerm?: string; 
  filterType?: string; 
  sortBy?: string; 
}) => {
  return {
    queryKey: ['segments', params],
    queryFn: () => getSegments(params),
  };
};

export const useGetSegments = (
  params?: { searchTerm?: string; filterType?: string; sortBy?: string },
  queryConfig?: QueryConfig<typeof getSegmentsQueryOptions>
) => {
  return useQuery({
    ...getSegmentsQueryOptions(params),
    ...queryConfig,
  });
};

// Get segment performance
export const getSegmentPerformance = async (): Promise<SegmentPerformanceMetrics> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get('/segments/performance');
  return {
    totalSegments: 6,
    activeSegments: 10,
    totalCustomersSegmented: 11200,
    avgChurnReduction: 34,
    revenueImpact: '$127K',
    topPerformingSegment: {
      name: 'High-Value Enterprise',
      churnReduction: 45
    }
  };
};

export const getSegmentPerformanceQueryOptions = () => {
  return {
    queryKey: ['segments', 'performance'],
    queryFn: () => getSegmentPerformance(),
  };
};

export const useGetSegmentPerformance = (queryConfig?: QueryConfig<typeof getSegmentPerformanceQueryOptions>) => {
  return useQuery({
    ...getSegmentPerformanceQueryOptions(),
    ...queryConfig,
  });
};

// Get segment by ID
export const getSegmentById = async ({ segmentId }: { segmentId: string }): Promise<CustomerSegment> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get(`/segments/${segmentId}`);
  const segment = mockSegments.find(s => s.id === segmentId);
  if (!segment) {
    throw new Error('Segment not found');
  }
  return segment;
};

export const getSegmentByIdQueryOptions = (segmentId: string) => {
  return {
    queryKey: ['segments', segmentId],
    queryFn: () => getSegmentById({ segmentId }),
    enabled: !!segmentId,
  };
};

export const useGetSegmentById = (segmentId: string, queryConfig?: QueryConfig<typeof getSegmentByIdQueryOptions>) => {
  return useQuery({
    ...getSegmentByIdQueryOptions(segmentId),
    ...queryConfig,
  });
};

// Create segment
export const createSegment = async (data: {
  name: string;
  description: string;
  type: string;
  criteria: Array<{
    field: string;
    operator: string;
    value: string | number;
    label: string;
  }>;
}): Promise<CustomerSegment> => {
  return api.post('/segments', data);
};

type UseCreateSegmentOptions = {
  mutationConfig?: MutationConfig<typeof createSegment>;
};

export const useCreateSegment = ({ mutationConfig }: UseCreateSegmentOptions = {}) => {
  return useMutation({
    mutationFn: createSegment,
    ...mutationConfig,
  });
};

// Update segment
export const updateSegment = async ({ 
  segmentId, 
  ...data 
}: { 
  segmentId: string; 
  name: string; 
  description: string; 
  criteria: Array<{
    field: string;
    operator: string;
    value: string | number;
    label: string;
  }>; 
}): Promise<CustomerSegment> => {
  return api.put(`/segments/${segmentId}`, data);
};

type UseUpdateSegmentOptions = {
  mutationConfig?: MutationConfig<typeof updateSegment>;
};

export const useUpdateSegment = ({ mutationConfig }: UseUpdateSegmentOptions = {}) => {
  return useMutation({
    mutationFn: updateSegment,
    ...mutationConfig,
  });
};

// Delete segment
export const deleteSegment = async ({ segmentId }: { segmentId: string }): Promise<void> => {
  return api.delete(`/segments/${segmentId}`);
};

type UseDeleteSegmentOptions = {
  mutationConfig?: MutationConfig<typeof deleteSegment>;
};

export const useDeleteSegment = ({ mutationConfig }: UseDeleteSegmentOptions = {}) => {
  return useMutation({
    mutationFn: deleteSegment,
    ...mutationConfig,
  });
};