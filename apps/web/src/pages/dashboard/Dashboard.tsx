import React from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useTasks } from '../../hooks/useTasks';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Plus
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 shadow-sm shadow-slate-100`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </span>
      )}
    </div>
    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</p>
    <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
  </div>
);

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { data: tasks, isLoading } = useTasks();

  const stats = [
    { label: 'Active Tasks', value: tasks?.filter(t => t.status !== 'done').length || 0, icon: Clock, color: 'bg-primary-600', trend: '+12%' },
    { label: 'Completed', value: tasks?.filter(t => t.status === 'done').length || 0, icon: CheckCircle2, color: 'bg-emerald-500', trend: '+5%' },
    { label: 'Blocked', value: tasks?.filter(t => t.status === 'blocked').length || 0, icon: AlertCircle, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Work Performance
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Welcome back, {user?.name.split(' ')[0]}! Here's what's happening today.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all text-sm">
          <Plus className="h-4 w-4" />
          Create New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Assignments</h2>
            <button className="text-sm font-bold text-primary-600 hover:text-primary-700">View all</button>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <p>Loading tasks...</p>
            ) : tasks?.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-400 font-medium">No tasks assigned yet.</p>
              </div>
            ) : (
              tasks?.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className={`w-2 h-10 rounded-full ${
                    task.priority === 'critical' ? 'bg-rose-500' :
                    task.priority === 'high' ? 'bg-orange-500' :
                    task.priority === 'medium' ? 'bg-primary-500' : 'bg-slate-300'
                  }`} />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{task.title}</p>
                    <p className="text-sm text-slate-500 capitalize">{task.status.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-700 capitalize">{task.priority}</p>
                    <p className="text-xs text-slate-400">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-primary-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl shadow-primary-900/40">
           <div className="relative z-10">
              <h2 className="text-2xl font-extrabold mb-4">Enterprise Pro</h2>
              <p className="text-primary-200 text-lg mb-8 leading-relaxed font-medium">
                Unlock advanced team reporting and analytics for your department.
              </p>
              <button className="bg-white text-primary-900 px-8 py-4 rounded-2xl font-extrabold shadow-lg hover:bg-primary-50 transition-all active:scale-95">
                Upgrade Now
              </button>
           </div>
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-800 rounded-full opacity-50 blur-3xl" />
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-primary-700 rounded-full opacity-30 blur-2xl" />
        </div>
      </div>
    </div>
  );
}
