import { api } from "@/lib/api-client";
import { MutationConfig, QueryConfig } from "@/lib/react-query";
import { AdminUserResponse, PagedResult, AdminUsersQueryParams, UpdateUserRequest } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// API Functions
export const getAllUsers = async (params: AdminUsersQueryParams = {}): Promise<PagedResult<AdminUserResponse>> => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
  if (params.searchTerm) searchParams.append('searchTerm', params.searchTerm);
  if (params.role) searchParams.append('role', params.role);

  return api.get(`/admin/users?${searchParams.toString()}`);
};

export const getUserById = async (id: string): Promise<AdminUserResponse> => {
  return api.get(`/admin/users/${id}`);
};

export const updateUser = async (data: { id: string; user: UpdateUserRequest }): Promise<void> => {
  return api.put(`/admin/users/${data.id}`, data.user);
};

export const deleteUser = async (id: string): Promise<void> => {
  return api.delete(`/admin/users/${id}`);
};

// Query Options
export const getAllUsersQueryOptions = (params: AdminUsersQueryParams = {}) => {
  return {
    queryKey: ['admin', 'users', params],
    queryFn: () => getAllUsers(params),
    keepPreviousData: true,
  };
};

export const getUserByIdQueryOptions = (id: string) => {
  return {
    queryKey: ['admin', 'users', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  };
};

// Hooks
export const useGetAllUsers = (
  params: AdminUsersQueryParams = {},
  queryConfig?: QueryConfig<typeof getAllUsersQueryOptions>
) => {
  return useQuery({
    ...getAllUsersQueryOptions(params),
    ...queryConfig,
  });
};

export const useGetUserById = (
  id: string,
  queryConfig?: QueryConfig<typeof getUserByIdQueryOptions>
) => {
  return useQuery({
    ...getUserByIdQueryOptions(id),
    ...queryConfig,
  });
};

export const useUpdateUser = (options?: {
  mutationConfig?: MutationConfig<typeof updateUser>;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (_, variables) => {
      // Invalidate the users list
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      // Update the specific user cache
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.id] });
    },
    ...options?.mutationConfig,
  });
};

export const useDeleteUser = (options?: {
  mutationConfig?: MutationConfig<typeof deleteUser>;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidate the users list to refetch after deletion
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    ...options?.mutationConfig,
  });
};