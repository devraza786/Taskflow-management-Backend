import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Tag, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  Layout,
  Users,
  MessageSquare
} from 'lucide-react';
import { useTask, useUpdateTaskStatus, useDeleteTask } from '../../hooks/useTasks';
import CreateTaskModal from '../../components/CreateTaskModal';
import { toast } from 'react-hot-toast';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading, error } = useTask(id!);
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-12 w-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Task Not Found</h2>
        <button 
          onClick={() => navigate('/tasks')}
          className="mt-4 text-primary-600 font-bold hover:underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask.mutateAsync(task.id);
        toast.success('Task deleted successfully');
        navigate('/tasks');
      } catch (err) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (newStatus: any) => {
    try {
      await updateStatus.mutateAsync({ taskId: task.id, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-lg">
                Task Detail
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                ID: {task.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {task.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-bold hover:bg-rose-100 transition-all shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <MessageSquare className="h-4 w-4" />
              <h3 className="text-sm font-black uppercase tracking-widest">Description</h3>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
              {task.description || "No description provided for this task."}
            </p>
          </div>

          {/* Subtasks (Placeholder) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="h-4 w-4" />
                <h3 className="text-sm font-black uppercase tracking-widest">Performance & Activity</h3>
              </div>
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100">
                      <Clock className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Created At</p>
                      <p className="text-xs text-slate-500 font-medium">{new Date(task.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
               </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Last Updated</p>
                      <p className="text-xs text-slate-500 font-medium">{new Date(task.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Status Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</label>
              <select 
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary-500/10 transition-all uppercase text-[11px] tracking-wider"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Priority</label>
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                task.priority === 'critical' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                task.priority === 'high' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                'bg-slate-50 border-slate-100 text-slate-600'
              }`}>
                <AlertCircle className="h-5 w-5" />
                <span className="font-extrabold uppercase tracking-widest text-[11px]">{task.priority}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Due Date</label>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Calendar className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'No due date'}
                </span>
              </div>
            </div>
          </div>

          {/* Connections Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl space-y-6">
             <div className="space-y-1">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Context</h4>
                <p className="text-xs font-medium text-slate-500">Related team and project.</p>
             </div>

             <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl border border-white/5 group hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Layout className="h-5 w-5 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project</p>
                    <p className="text-sm font-bold truncate">{(task as any).project?.name || 'Unassigned'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl border border-white/5 group hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Team</p>
                    <p className="text-sm font-bold truncate">{(task as any).team?.name || 'Unassigned'}</p>
                  </div>
                </div>
             </div>

             <div className="pt-4 border-t border-white/5 space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {task.tags?.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-300 border border-white/5">
                      #{tag}
                    </span>
                  ))}
                  {(!task.tags || task.tags.length === 0) && (
                    <span className="text-[10px] font-medium text-slate-600">No tags.</span>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>

      <CreateTaskModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
      />
    </div>
  );
}
