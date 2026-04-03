import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Layout, 
  Users, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  AlertCircle,
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useProject, useDeleteProject } from '../../hooks/useProjects';
import CreateProjectModal from '../../components/CreateProjectModal';
import { toast } from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id!);
  const deleteProject = useDeleteProject();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-12 w-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Project Not Found</h2>
        <button 
          onClick={() => navigate('/projects')}
          className="mt-4 text-primary-600 font-bold hover:underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will be unassigned.')) {
      try {
        await deleteProject.mutateAsync(project.id);
        toast.success('Project deleted successfully');
        navigate('/projects');
      } catch (err) {
        toast.error('Failed to delete project');
      }
    }
  };

  const statusColors = {
    planning: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    on_hold: 'bg-amber-50 text-amber-600 border-amber-100',
    completed: 'bg-primary-50 text-primary-600 border-primary-100',
    cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 blur-[100px] -ml-32 -mb-32 rounded-full" />

        <div className="relative z-10 space-y-8">
           <button 
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  Project Overview
                </div>
                <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${statusColors[project.status]}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight max-w-2xl">
                {project.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-6 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-50 transition-all active:scale-95 shadow-xl"
              >
                <Edit3 className="h-4 w-4" />
                Edit Project
              </button>
              <button 
                onClick={handleDelete}
                className="p-4 bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-2xl hover:bg-rose-500/30 transition-all active:scale-95"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress & Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <FileText className="h-4 w-4" />
                <h3 className="text-sm font-black uppercase tracking-widest">Project Description</h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium text-lg">
                {project.description || "No detailed description provided for this project."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50 space-y-3">
                 <div className="flex items-center gap-3 text-slate-500">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Tasks Overview</span>
                 </div>
                 <div className="flex items-end gap-3 font-black text-slate-900">
                    <span className="text-4xl">{project._count?.tasks || 0}</span>
                    <span className="text-sm text-slate-400 mb-2 uppercase tracking-widest font-black">Total Tasks</span>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50 space-y-3">
                 <div className="flex items-center gap-3 text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Timeline Status</span>
                 </div>
                 <div className="flex items-center gap-2 font-black text-slate-900">
                    <span className="text-sm text-slate-500 uppercase tracking-widest font-black">Ongoing Phase</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="h-4 w-4" />
                <h3 className="text-sm font-black uppercase tracking-widest">Latest Activity</h3>
              </div>
            </div>
            <div className="py-12 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Recent task updates will appear here.</p>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Information</label>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Started</p>
                      <p className="text-sm font-bold text-slate-900">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Flexible'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Calendar className="h-5 w-5 text-rose-400" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deadline</p>
                      <p className="text-sm font-bold text-slate-900">
                        {project.endDate ? new Date(project.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'No Deadline'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Users className="h-5 w-5 text-primary-400" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned Department</p>
                      <p className="text-sm font-bold text-slate-900">{(project as any).department?.name || 'Cross-functional'}</p>
                    </div>
                  </div>
                </div>
              </div>
           </div>

           <div className="bg-primary-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-100 space-y-6">
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase tracking-widest">Team Performance</h4>
                <p className="text-xs font-bold text-primary-100/60">Efficiency metrics for this project.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary-100/50">Completion</p>
                    <p className="text-xl font-black">0%</p>
                 </div>
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary-100/50">Velocity</p>
                    <p className="text-xl font-black">High</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <CreateProjectModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
      />
    </div>
  );
}
