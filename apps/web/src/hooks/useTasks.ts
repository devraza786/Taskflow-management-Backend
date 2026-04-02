import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'blocked' | 'done' | 'archived';
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: string;
  startDate?: string;
  assignedTo?: string;
  projectId?: string;
  teamId?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  assignee?: { id: string; name: string; avatarUrl?: string };
  creator?: { id: string; name: string };
  _count?: { subTasks: number; comments: number };
  createdAt: string;
  updatedAt: string;
}

export const useTasks = (filters?: { projectId?: string; teamId?: string; status?: string }) => {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery<Task[]>({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.projectId) params.append('projectId', filters.projectId);
      if (filters?.teamId) params.append('teamId', filters.teamId);
      if (filters?.status) params.append('status', filters.status);
      const { data } = await api.get(`/tasks?${params.toString()}`);
      return data;
    },
    enabled: !!token,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const { data } = await api.post('/tasks', taskData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Task> & { id: string }) => {
      const { data } = await api.patch(`/tasks/${id}`, patch);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: Task['status'] }) => {
      const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
