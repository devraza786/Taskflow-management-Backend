import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  parentDeptId?: string;
  manager?: { id: string; name: string };
  _count?: { teams: number };
  createdAt: string;
  updatedAt: string;
}

export function useDepartments() {
  const token = useAuthStore((state) => state.accessToken);
  return useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/depts');
      return data;
    },
    enabled: !!token,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dept: Partial<Department>) => {
      const { data } = await api.post('/depts', dept);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Department> & { id: string }) => {
      const { data } = await api.patch(`/depts/${id}`, patch);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deptId: string) => {
      await api.delete(`/depts/${deptId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}
