// src/features/customers/api/import.ts (fixed)
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';

// Types matching the backend responses
export interface ImportJobResponse {
  importJobId: string;
  status: 'Validating' | 'Validated' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  totalRecords: number;
  processedRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  errorCount: number;
  fileName: string;
  importSource: string;
  skipDuplicates: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  message?: string;
}

export interface ImportErrorResponse {
  id: string;
  rowNumber: number;
  fieldName: string;
  errorMessage: string;
  rawValue: string;
  errorType: 'Validation' | 'Duplicate' | 'Processing';
}

export interface ImportJobSummaryResponse {
  importJobId: string;
  fileName: string;
  status: string;
  totalRecords: number;
  successfulRecords: number;
  errorCount: number;
  createdAt: string;
  completedAt?: string;
}

export interface UploadImportResponse {
  importJobId: string;
  message: string;
  status: string;
}

export interface ConfirmImportResponse {
  importJobId: string;
  message: string;
  status: string;
}

// Upload and validate import file
export const uploadImport = async (formData: FormData): Promise<UploadImportResponse> => {
  return api.post('/imports/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

type UseUploadImportOptions = {
  mutationConfig?: MutationConfig<typeof uploadImport>;
};

export const useUploadImport = ({ mutationConfig }: UseUploadImportOptions = {}) => {
  return useMutation({
    mutationFn: uploadImport,
    ...mutationConfig,
  });
};

// Confirm import after validation
export const confirmImport = async (importJobId: string): Promise<ConfirmImportResponse> => {
  return api.post(`/imports/${importJobId}/confirm`);
};

type UseConfirmImportOptions = {
  mutationConfig?: MutationConfig<typeof confirmImport>;
};

export const useConfirmImport = ({ mutationConfig }: UseConfirmImportOptions = {}) => {
  return useMutation({
    mutationFn: confirmImport,
    ...mutationConfig,
  });
};

// Get import job status
export const getImportStatus = async (importJobId: string): Promise<ImportJobResponse> => {
  return api.get(`/imports/${importJobId}/status`);
};

export const getImportStatusQueryOptions = (importJobId: string) => {
  return {
    queryKey: ['imports', 'status', importJobId],
    queryFn: () => getImportStatus(importJobId),
    enabled: !!importJobId,
    refetchInterval: (query: { state: { data?: ImportJobResponse } }) => {
      const data = query.state.data;
      // Stop polling when job is completed, failed, or cancelled
      if (!data) return 5000; // Poll every 5 seconds initially
      const terminalStatuses = ['Completed', 'Failed', 'Cancelled'];
      return terminalStatuses.includes(data.status) ? false : 5000;
    },
  };
};

export const useGetImportStatus = (
  importJobId: string,
  queryConfig?: QueryConfig<typeof getImportStatusQueryOptions>
) => {
  return useQuery({
    ...getImportStatusQueryOptions(importJobId),
    ...queryConfig,
  });
};

// Get import job errors
export const getImportErrors = async (importJobId: string): Promise<ImportErrorResponse[]> => {
  return api.get(`/imports/${importJobId}/errors`);
};

export const getImportErrorsQueryOptions = (importJobId: string) => {
  return {
    queryKey: ['imports', 'errors', importJobId],
    queryFn: () => getImportErrors(importJobId),
    enabled: !!importJobId,
  };
};

export const useGetImportErrors = (
  importJobId: string,
  queryConfig?: QueryConfig<typeof getImportErrorsQueryOptions>
) => {
  return useQuery({
    ...getImportErrorsQueryOptions(importJobId),
    ...queryConfig,
  });
};

// Cancel import job
export const cancelImport = async (importJobId: string): Promise<ConfirmImportResponse> => {
  return api.post(`/imports/${importJobId}/cancel`);
};

type UseCancelImportOptions = {
  mutationConfig?: MutationConfig<typeof cancelImport>;
};

export const useCancelImport = ({ mutationConfig }: UseCancelImportOptions = {}) => {
  return useMutation({
    mutationFn: cancelImport,
    ...mutationConfig,
  });
};

// Get user's import history
export const getImportHistory = async ({
  page = 1,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
} = {}): Promise<{
  items: ImportJobSummaryResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  return api.get(`/imports?page=${page}&pageSize=${pageSize}`);
};

export const getImportHistoryQueryOptions = (params?: { page?: number; pageSize?: number }) => {
  return {
    queryKey: ['imports', 'history', params],
    queryFn: () => getImportHistory(params),
  };
};

export const useGetImportHistory = (
  params?: { page?: number; pageSize?: number },
  queryConfig?: QueryConfig<typeof getImportHistoryQueryOptions>
) => {
  return useQuery({
    ...getImportHistoryQueryOptions(params),
    ...queryConfig,
  });
};