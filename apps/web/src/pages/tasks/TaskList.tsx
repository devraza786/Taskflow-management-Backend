import { useTasks, type Task } from '../../hooks/useTasks';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  CheckCircle2,
} from 'lucide-react';

const PriorityBadge = ({ priority }: { priority: Task['priority'] }) => {
  const styles = {
    critical: 'bg-rose-50 text-rose-600 border-rose-100',
    high: 'bg-orange-50 text-orange-600 border-orange-100',
    medium: 'bg-primary-50 text-primary-600 border-primary-100',
    low: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${styles[priority]} uppercase tracking-wider`}>
      {priority}
    </span>
  );
};

export default function TaskList() {
  const { data: tasks, isLoading } = useTasks();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-slate-500 mt-1 font-medium">Keep track of your daily work and progress.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-64 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-sm"
                />
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
                <Filter className="h-5 w-5 text-slate-600" />
            </button>
            <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all text-sm">
                <Plus className="h-4 w-4" />
                Add Task
            </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-50">
                        <th className="px-6 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Task</th>
                        <th className="px-6 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Priority</th>
                        <th className="px-6 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Due Date</th>
                        <th className="px-6 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Assignee</th>
                        <th className="px-6 py-5"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={6} className="px-6 py-6 h-16 bg-slate-50/50 rounded-xl mb-2" />
                            </tr>
                        ))
                    ) : tasks?.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-20 text-center">
                                <p className="text-slate-400 font-medium">No tasks found. Relax or create one!</p>
                            </td>
                        </tr>
                    ) : (
                        tasks?.map((task) => (
                            <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-white transition-colors duration-300`}>
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{task.title}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-0.5">PROJ-1234 • Project Name</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 font-medium">
                                    <PriorityBadge priority={task.priority} />
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                            task.status === 'done' ? 'bg-emerald-500' :
                                            task.status === 'blocked' ? 'bg-rose-500' :
                                            task.status === 'in_progress' ? 'bg-amber-500' : 'bg-slate-400'
                                        }`} />
                                        <span className="text-sm font-bold text-slate-700 capitalize">
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                        <Calendar className="h-4 w-4" />
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                                    </div>
                                </td>
                                <td className="px-6 py-6 font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-extrabold text-primary-700 border-2 border-white shadow-sm">
                                            {task.assignee?.name.charAt(0) || 'U'}
                                        </div>
                                        <span className="text-sm text-slate-700 font-bold">{task.assignee?.name || 'Unassigned'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <button className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="h-5 w-5 text-slate-400" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
