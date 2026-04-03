import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/api';

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  organization?: {
    name: string;
    slug: string;
  };
  inviter?: {
    name: string;
    avatarUrl?: string;
  };
}

export function useInvitation(token: string) {
  return useQuery<Invitation>({
    queryKey: ['invitations', token],
    queryFn: async () => {
      const { data } = await api.get(`/invitations/${token}`);
      return data;
    },
    enabled: !!token,
  });
}

export function useCreateInvitation() {
  return useMutation({
    mutationFn: async (payload: { email: string; role: string; teamId?: string }) => {
      const { data } = await api.post('/invitations', payload);
      return data;
    },
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: async ({ token, ...payload }: { token: string; name: string; password: string }) => {
      const { data } = await api.post(`/invitations/${token}/accept`, payload);
      return data;
    },
  });
}
