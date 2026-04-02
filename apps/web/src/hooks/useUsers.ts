import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'team_head' | 'employee';
  status: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export function useUsers() {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    },
    enabled: !!token,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<User> & { id: string }) => {
      const { data } = await api.patch(`/users/${id}`, patch);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
