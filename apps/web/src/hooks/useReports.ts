import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export interface ProjectStat {
  id: string;
  name: string;
  status: string;
  _count: { tasks: number };
}

export interface TaskDistribution {
  status: string;
  _count: number;
}

export interface ProjectStats {
  projects: ProjectStat[];
  taskDistribution: TaskDistribution[];
}

export interface TeamPerformanceStat {
  id: string;
  name: string;
  _count: { members: number; tasks: number };
}

export function useProjectStats() {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery<ProjectStats>({
    queryKey: ['reports', 'project-stats'],
    queryFn: async () => {
      const { data } = await api.get('/reports/project-stats');
      return data;
    },
    enabled: !!token,
  });
}

export function useTeamPerformance() {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery<TeamPerformanceStat[]>({
    queryKey: ['reports', 'team-performance'],
    queryFn: async () => {
      const { data } = await api.get('/reports/team-performance');
      return data;
    },
    enabled: !!token,
  });
}
