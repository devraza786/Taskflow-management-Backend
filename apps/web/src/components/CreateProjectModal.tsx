import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from './ui/Modal';
import { useCreateProject } from '../hooks/useProjects';
import { useTeams } from '../hooks/useTeams';
import { Calendar, Layout, Users, FileText } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const createProject = useCreateProject();
  const { data: teams } = useTeams();

  const onSubmit = async (data: any) => {
    try {
      await createProject.mutateAsync(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start New Project">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Layout className="h-4 w-4" /> Project Name
          </label>
          <input
            {...register('name', { required: 'Project name is required' })}
            placeholder="e.g., Q3 Marketing Campaign"
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
          />
          {errors.name && <p className="text-xs text-rose-500 font-bold">{errors.name.message as string}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Description
          </label>
          <textarea
            {...register('description')}
            placeholder="Describe the project goals..."
            rows={3}
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Start Date
            </label>
            <input
              type="date"
              {...register('startDate')}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> End Date
            </label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Users className="h-4 w-4" /> Assigning Team (Optional)
          </label>
          <select
            {...register('teamId')}
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
          >
            <option value="">No Team Assigned</option>
            {teams?.map((team: any) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-3 rounded-2xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createProject.isLoading}
            className="flex-1 px-5 py-3 rounded-2xl font-bold bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {createProject.isLoading ? 'Starting...' : 'Start Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
