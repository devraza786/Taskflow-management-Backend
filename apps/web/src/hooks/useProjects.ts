import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  ownerId?: string;
  deptId?: string;
  owner?: { id: string; name: string; avatarUrl?: string };
  department?: { id: string; name: string };
  _count?: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

export function useProjects() {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    },
    enabled: !!token,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProject: Partial<Project>) => {
      const { data } = await api.post('/projects', newProject);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Project> & { id: string }) => {
      const { data } = await api.patch(`/projects/${id}`, patch);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      await api.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
