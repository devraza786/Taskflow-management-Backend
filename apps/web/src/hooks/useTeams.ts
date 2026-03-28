import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export interface Team {
  id: string;
  name: string;
  deptId?: string;
  teamHeadId?: string;
  description?: string;
  _count?: {
    members: number;
    tasks: number;
  };
}

export function useTeams() {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await api.get('/teams');
      return data as Team[];
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (newTeam: Partial<Team>) => {
      const { data } = await api.post('/teams', newTeam);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  return { ...query, createTeam: createMutation.mutate };
}
