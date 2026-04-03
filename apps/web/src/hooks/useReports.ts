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

export interface VelocityPoint {
  name: string;
  completed: number;
  total: number;
}

export interface ProjectStats {
  projects: ProjectStat[];
  taskDistribution: TaskDistribution[];
  metrics: {
    completed: number;
    avgDays: string;
    velocity: VelocityPoint[];
  };
}

export interface TeamPerformanceStat {
  id: string;
  name: string;
  _count: { members: number; tasks: number };
}

export function useProjectStats(startDate?: string, endDate?: string) {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery<ProjectStats>({
    queryKey: ['reports', 'project-stats', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get('/reports/project-stats', {
        params: { startDate, endDate }
      });
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

export interface AIInsight {
  title: string;
  description: string;
  type: string;
  color: string;
}

export function useAIInsights() {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery<AIInsight[]>({
    queryKey: ['reports', 'ai-insights'],
    queryFn: async () => {
      const { data } = await api.get('/reports/ai-insights');
      return data;
    },
    enabled: !!token,
    retry: false
  });
}
