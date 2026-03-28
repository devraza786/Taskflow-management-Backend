import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  ownerId?: string;
  deptId?: string;
  _count?: {
    tasks: number;
  };
}

export function useProjects() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data as Project[];
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (newProject: Partial<Project>) => {
      const { data } = await axios.post(`${API_URL}/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return { ...query, createProject: createMutation.mutate };
}
