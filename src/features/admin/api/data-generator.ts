import { api } from "@/lib/api-client";
import { MutationConfig } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";

// Types
export interface GenerateTestDataRequest {
  customerCount: number;
  periodCount: number;
  customerNames?: string[];
  outputFormat: 'xlsx' | 'csv';
}

export interface GenerateTestDataResponse {
  blob: Blob;
  fileName: string;
}

// API Function
export const generateTestData = async (request: GenerateTestDataRequest): Promise<GenerateTestDataResponse> => {
  const response = await api.post('/admin/data-generator/generate', request, {
    responseType: 'blob',
    // Return full response to access headers
    transformResponse: [(data) => data],
  });

  // Extract filename from content-disposition header if available
  const contentDisposition = response.headers?.['content-disposition'];
  let fileName = request.outputFormat === 'csv' ? 'test-data.csv' : 'test-data.xlsx';

  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      fileName = match[1].replace(/['"]/g, '');
    }
  }

  return {
    blob: response.data || response,
    fileName,
  };
};

// Hook
export const useGenerateTestData = (options?: {
  mutationConfig?: MutationConfig<typeof generateTestData>;
}) => {
  return useMutation({
    mutationFn: generateTestData,
    ...options?.mutationConfig,
  });
};

// Helper function to trigger download
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
