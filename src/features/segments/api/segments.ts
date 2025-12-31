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
  transformSegmentResponse,
  GeneratedSegmentDto,
  AISegmentPromptRequest
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
  
  try {
    const response = await api.post('/segments', request);
    console.log('RAW API RESPONSE:', response);
    
    // Handle empty response from 201 Created - segment was created successfully
    if (!response || (typeof response === 'string' && response === "") || response === null || response === undefined) {
      console.log('Empty response from server, segment created successfully');
      // Return a mock segment object for the UI
      return {
        id: Date.now().toString(), // Temporary ID
        name: data.name,
        description: data.description,
        criteria: data.criteria.map(c => ({
          field: c.field,
          operator: c.operator as unknown as 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in',
          value: c.value,
          label: c.label
        })),
        customerCount: 0,
        churnRate: 0,
        avgLTV: 0,
        avgRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active' as const,
        type: data.type as any,
        color: data.color
      };
    }
    
    // If we get actual data, transform it
    if (response && typeof response === 'object') {
      return transformSegmentResponse(response as unknown as SegmentResponse);
    }
    
    // Fallback for unexpected response
    console.warn('Unexpected response format:', response);
    return {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      criteria: data.criteria.map(c => ({
        field: c.field,
        operator: c.operator as unknown as 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in',
        value: c.value,
        label: c.label
      })),
      customerCount: 0,
      churnRate: 0,
      avgLTV: 0,
      avgRevenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active' as const,
      type: data.type as any,
      color: data.color
    };
  } catch (error) {
    console.error('Create segment error:', error);
    throw error;
  }
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
    criteria: data.criteria.map(c => ({
      field: c.field,
      operator: c.operator,
      value: c.value,
      label: c.label
    }))
  };
  
  const response = await api.put(`/segments/${segmentId}`, request) as unknown as SegmentResponse;
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

// Generate segment from AI prompt
export const generateSegmentFromPrompt = async (data: {
  prompt: string;
}): Promise<GeneratedSegmentDto> => {
  const request: AISegmentPromptRequest = {
    prompt: data.prompt
  };

  const response = await api.post('/segments/ai/generate', request);
  return response as GeneratedSegmentDto;
};

type UseGenerateSegmentFromPromptOptions = {
  mutationConfig?: MutationConfig<typeof generateSegmentFromPrompt>;
};

export const useGenerateSegmentFromPrompt = ({ mutationConfig }: UseGenerateSegmentFromPromptOptions = {}) => {
  return useMutation({
    mutationFn: generateSegmentFromPrompt,
    ...mutationConfig,
  });
};