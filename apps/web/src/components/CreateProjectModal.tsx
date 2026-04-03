import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from './ui/Modal';
import { useCreateProject, useUpdateProject, Project } from '../hooks/useProjects';
import { useTeams } from '../hooks/useTeams';
import { Calendar, Layout, Users, FileText } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null; // Optional project for editing
}

export default function CreateProjectModal({ isOpen, onClose, project }: CreateProjectModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: teams } = useTeams();

  const isEditing = !!project;

  // Pre-fill form when editing
  useEffect(() => {
    if (project) {
      setValue('name', project.name);
      setValue('description', project.description || '');
      setValue('status', project.status);
      setValue('teamId', project.deptId || ''); // In the schema it might be deptId
      
      if (project.startDate) {
        setValue('startDate', new Date(project.startDate).toISOString().split('T')[0]);
      }
      if (project.endDate) {
        setValue('endDate', new Date(project.endDate).toISOString().split('T')[0]);
      }
    } else {
      reset();
    }
  }, [project, setValue, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditing && project) {
        await updateProject.mutateAsync({ id: project.id, ...data });
      } else {
        await createProject.mutateAsync(data);
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const isLoading = createProject.isLoading || updateProject.isLoading;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? 'Edit Project' : 'Start New Project'}
    >
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
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none px-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> End Date
            </label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none px-4"
            />
          </div>
        </div>

        {isEditing && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Status</label>
            <select
              {...register('status')}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none px-4"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Users className="h-4 w-4" /> Assigning Team (Optional)
          </label>
          <select
            {...register('teamId')}
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none px-4"
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
            disabled={isLoading}
            className="flex-1 px-5 py-3 rounded-2xl font-bold bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Project' : 'Start Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
