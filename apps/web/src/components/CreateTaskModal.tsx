import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from './ui/Modal';
import { useCreateTask } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useTeams } from '../hooks/useTeams';
import { Calendar, Tag, User, Layout, Users } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const createTask = useCreateTask();
  const { data: projects } = useProjects();
  const { data: teams } = useTeams();

  const onSubmit = async (data: any) => {
    try {
      await createTask.mutateAsync({
        ...data,
        tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Task Title</label>
          <input
            {...register('title', { required: 'Title is required' })}
            placeholder="Enter task title"
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
          />
          {errors.title && <p className="text-xs text-rose-500 font-bold">{errors.title.message as string}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Description</label>
          <textarea
            {...register('description')}
            placeholder="What needs to be done?"
            rows={3}
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <PlusSquare className="h-4 w-4" /> Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Due Date
            </label>
            <input
              type="datetime-local"
              {...register('dueDate')}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Layout className="h-4 w-4" /> Project
            </label>
            <select
              {...register('projectId')}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
            >
              <option value="">No Project</option>
              {projects?.map((project: any) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Users className="h-4 w-4" /> Team
            </label>
            <select
              {...register('teamId')}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
            >
              <option value="">No Team</option>
              {teams?.map((team: any) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Tag className="h-4 w-4" /> Tags (comma separated)
            </label>
            <input
              {...register('tags')}
              placeholder="frontend, bug, urgent"
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
            />
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
            disabled={createTask.isLoading}
            className="flex-1 px-5 py-3 rounded-2xl font-bold bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {createTask.isLoading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Fixed Lucide dependency
const PlusSquare = (props: any) => (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
    </svg>
)
