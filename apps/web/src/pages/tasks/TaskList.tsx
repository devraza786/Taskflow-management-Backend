import { useState } from 'react';
import { useTasks, useDeleteTask, useUpdateTaskStatus } from '../../hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import CreateTaskModal from '../../components/CreateTaskModal';
import RoleGuard from '../../components/auth/RoleGuard';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TaskList() {
  const { data: tasks, isLoading } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const deleteTask = useDeleteTask();
  const updateStatus = useUpdateTaskStatus();

  const handleStatusChange = async (e: React.MouseEvent, taskId: string, newStatus: any) => {
    e.stopPropagation();
    try {
      await updateStatus.mutateAsync({ taskId, status: newStatus });
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTask.mutateAsync(taskId);
        toast.success('Task deleted');
      } catch (err) {
        toast.error('Error deleting task');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-slate-500 mt-1 font-medium">Keep track of your projects and team activities.</p>
        </div>
        <RoleGuard allowedRoles={['admin', 'manager', 'user']}>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all text-sm"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </RoleGuard>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm">
            <Filter className="h-4 w-4" />
            Priority
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm">
            Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-[2rem]" />
          ))
        ) : tasks?.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-4 rounded-3xl mb-4">
              <CheckCircle2 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No tasks yet</h3>
            <p className="text-slate-500 max-w-xs mt-1">Start your journey by creating a new task for your team.</p>
          </div>
        ) : (
          tasks?.map((task) => (
            <div 
              key={task.id}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="group bg-white rounded-[2rem] p-6 border border-slate-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-3xl -mr-12 -mt-12 rounded-full" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  task.priority === 'critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                  task.priority === 'high' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                  'bg-slate-50 text-slate-500 border border-slate-100'
                }`}>
                  {task.priority}
                </div>
                <div className="flex gap-1">
                   <button 
                    onClick={(e) => handleDelete(e, task.id)}
                    className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all"
                   >
                    <Trash2 className="h-4 w-4" />
                   </button>
                   <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">{task.title}</h3>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">
                {task.description || 'Focus on delivering excellence through collaboration...'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    task.status === 'done' ? 'bg-emerald-400' :
                    task.status === 'in_progress' ? 'bg-primary-400 animate-pulse' :
                    'bg-slate-200'
                  }`} />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">{task.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

// Inline trash icon since it wasn't imported
function Trash2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  );
}
