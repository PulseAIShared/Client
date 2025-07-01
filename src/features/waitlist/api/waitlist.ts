import { useMutation } from '@tanstack/react-query';
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
  return api.post('/waitlist/signup', data);
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