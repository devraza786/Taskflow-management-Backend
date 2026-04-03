import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export interface TeamMember {
  userId: string;
  joinedAt: string;
  user: { id: string; name: string; email: string; role: string; avatarUrl?: string };
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  deptId?: string;
  teamHeadId?: string;
  members?: TeamMember[];
  _count?: { members: number; tasks: number };
  createdAt: string;
  updatedAt: string;
}

export function useTeams() {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await api.get('/teams');
      return data;
    },
    enabled: !!token,
  });
}

export function useTeam(id: string) {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery<Team>({
    queryKey: ['teams', id],
    queryFn: async () => {
      const { data } = await api.get(`/teams/${id}`);
      return data;
    },
    enabled: !!token && !!id,
  });
}

export function useTeamMembers(teamId: string) {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery<TeamMember[]>({
    queryKey: ['teams', teamId, 'members'],
    queryFn: async () => {
      const { data } = await api.get(`/teams/${teamId}/members`);
      return data;
    },
    enabled: !!token && !!teamId,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTeam: Partial<Team>) => {
      const { data } = await api.post('/teams', newTeam);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Team> & { id: string }) => {
      const { data } = await api.patch(`/teams/${id}`, patch);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string) => {
      await api.delete(`/teams/${teamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const { data } = await api.post(`/teams/${teamId}/members`, { userId });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      await api.delete(`/teams/${teamId}/members/${userId}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
