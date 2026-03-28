import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

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
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data as Team[];
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (newTeam: Partial<Team>) => {
      const { data } = await axios.post(`${API_URL}/teams`, newTeam, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  return { ...query, createTeam: createMutation.mutate };
}
