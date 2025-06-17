import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { 
  CustomerSegment, 
  SegmentPerformanceMetrics, 
  SegmentResponse, 
  CreateSegmentRequest, 
  UpdateSegmentRequest, 
  SegmentPreviewRequest, 
  SegmentPreviewResponse, 
  SegmentType, 
  SegmentStatus, 
  CriteriaOperator, 
  transformSegmentResponse 
} from '@/types/api';
import { MutationConfig, QueryConfig } from '@/lib/react-query';


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
  const params = new URLSearchParams();
  if (searchTerm) params.append('searchTerm', searchTerm);
  if (filterType) params.append('filterType', filterType);
  if (sortBy) params.append('sortBy', sortBy);
  
  const response = await api.get(`/segments?${params.toString()}`) as SegmentResponse[];
  return response.map(transformSegmentResponse);
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
  return await api.get('/segments/performance') as SegmentPerformanceMetrics;
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
  const response = await api.get(`/segments/${segmentId}`) as SegmentResponse;
  return transformSegmentResponse(response);
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
  type: SegmentType;
  color: string;
  criteria: Array<{
    field: string;
    operator: CriteriaOperator;
    value: string;
    label: string;
  }>;
}): Promise<CustomerSegment> => {
  const request: CreateSegmentRequest = {
    name: data.name,
    description: data.description,
    type: data.type,
    color: data.color,
    criteria: data.criteria
  };
  
  const response = await api.post('/segments', request) as SegmentResponse;
  return transformSegmentResponse(response);
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
  type: SegmentType;
  color: string;
  status: SegmentStatus;
  criteria: Array<{
    field: string;
    operator: CriteriaOperator;
    value: string;
    label: string;
  }>; 
}): Promise<CustomerSegment> => {
  const request: UpdateSegmentRequest = {
    name: data.name,
    description: data.description,
    type: data.type,
    color: data.color,
    status: data.status,
    criteria: data.criteria
  };
  
  const response = await api.put(`/segments/${segmentId}`, request) as SegmentResponse;
  return transformSegmentResponse(response);
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
  await api.delete(`/segments/${segmentId}`);
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

// Preview segment
export const previewSegment = async (data: {
  criteria: Array<{
    field: string;
    operator: CriteriaOperator;
    value: string;
    label: string;
  }>;
  type: SegmentType;
}): Promise<SegmentPreviewResponse> => {
  const request: SegmentPreviewRequest = {
    criteria: data.criteria,
    type: data.type
  };
  
  return await api.post('/segments/preview', request) as SegmentPreviewResponse;
};

type UsePreviewSegmentOptions = {
  mutationConfig?: MutationConfig<typeof previewSegment>;
};

export const usePreviewSegment = ({ mutationConfig }: UsePreviewSegmentOptions = {}) => {
  return useMutation({
    mutationFn: previewSegment,
    ...mutationConfig,
  });
};