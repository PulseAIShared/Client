import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import {
  AcceptTeamInvitationRequest,
  AcceptTeamInvitationResponse,
  ProblemDetails,
  SendTeamInvitationRequest,
  TeamInvitationResponse,
  TeamMemberResponse,
  TeamSummaryResponse,
} from '@/types/api';

const TEAM_QUERY_KEYS = {
  summary: ['team', 'summary'] as const,
  members: ['team', 'members'] as const,
  invitations: ['team', 'invitations'] as const,
};

export const parseTeamProblem = (error: unknown): ProblemDetails => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: unknown; status?: number } };
    const data = axiosError.response?.data;
    if (data && typeof data === 'object') {
      return data as ProblemDetails;
    }
    return {
      status: axiosError.response?.status,
      detail: 'Request failed without server details.',
    };
  }

  if (error instanceof Error) {
    return { detail: error.message };
  }

  return { detail: 'Unknown error' };
};

export const getTeamSummary = async (): Promise<TeamSummaryResponse> => {
  return await api.get('/company');
};

export const getTeamMembers = async (): Promise<TeamMemberResponse[]> => {
  return await api.get('/company/members');
};

export const getTeamInvitations = async (): Promise<TeamInvitationResponse[]> => {
  return await api.get('/company/invitations');
};

export const sendTeamInvitation = async (payload: SendTeamInvitationRequest): Promise<TeamInvitationResponse> => {
  return await api.post('/company/invitations', payload);
};

export const revokeTeamInvitation = async (invitationId: string): Promise<void> => {
  await api.delete(`/company/invitations/${invitationId}`);
};

export const acceptTeamInvitation = async (payload: AcceptTeamInvitationRequest): Promise<AcceptTeamInvitationResponse> => {
  return await api.post('/company/invitations/accept', payload);
};


const getTeamSummaryQueryOptions = () => ({
  queryKey: TEAM_QUERY_KEYS.summary,
  queryFn: getTeamSummary,
});

const getTeamMembersQueryOptions = () => ({
  queryKey: TEAM_QUERY_KEYS.members,
  queryFn: getTeamMembers,
});

const getTeamInvitationsQueryOptions = () => ({
  queryKey: TEAM_QUERY_KEYS.invitations,
  queryFn: getTeamInvitations,
});

export const useTeamSummary = (
  queryConfig?: QueryConfig<typeof getTeamSummaryQueryOptions>,
) =>
  useQuery({
    ...getTeamSummaryQueryOptions(),
    ...queryConfig,
  });

export const useTeamMembers = (
  queryConfig?: QueryConfig<typeof getTeamMembersQueryOptions>,
) =>
  useQuery({
    ...getTeamMembersQueryOptions(),
    ...queryConfig,
  });

export const useTeamInvitations = (
  queryConfig?: QueryConfig<typeof getTeamInvitationsQueryOptions>,
) =>
  useQuery({
    ...getTeamInvitationsQueryOptions(),
    ...queryConfig,
  });

export const useSendTeamInvitation = (
  options?: Parameters<typeof useMutation<TeamInvitationResponse, unknown, SendTeamInvitationRequest>>[0],
) =>
  useMutation({
    mutationFn: sendTeamInvitation,
    ...options,
  });

export const useRevokeTeamInvitation = (
  options?: Parameters<typeof useMutation<void, unknown, string>>[0],
) =>
  useMutation({
    mutationFn: revokeTeamInvitation,
    ...options,
  });

export const useAcceptTeamInvitation = (
  options?: Parameters<typeof useMutation<AcceptTeamInvitationResponse, unknown, AcceptTeamInvitationRequest>>[0],
) =>
  useMutation({
    mutationFn: acceptTeamInvitation,
    ...options,
  });

export const teamQueryKeys = TEAM_QUERY_KEYS;
