import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useTasks } from '../../hooks/useTasks';
import CreateTaskModal from '../../components/CreateTaskModal';
import PricingModal from '../../components/PricingModal';
import GlassCard from '../../components/ui/GlassCard';
import WorkloadChart from '../../components/dashboard/WorkloadChart';
import AIRiskIndicator from '../../components/dashboard/AIRiskIndicator';
import RoleGuard from '../../components/auth/RoleGuard';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Plus,
  ArrowRight,
  MoreVertical
} from 'lucide-react';

const PremiumStatCard = ({ icon: Icon, label, value, color, trend }: any) => (
  <GlassCard className="p-6">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-4 rounded-[1.25rem] ${color} bg-opacity-10 shadow-sm`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black flex items-center gap-1 uppercase tracking-wider">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </span>
      )}
    </div>
    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
    <p className="text-4xl font-black text-slate-900 tracking-tight">{value}</p>
  </GlassCard>
);

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { data: tasks, isLoading } = useTasks();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const stats = [
    { label: 'Active Tasks', value: tasks?.filter(t => t.status !== 'done').length || 0, icon: Clock, color: 'bg-primary-600', trend: '+12%' },
    { label: 'Completed', value: tasks?.filter(t => t.status === 'done').length || 0, icon: CheckCircle2, color: 'bg-emerald-500', trend: '+5%' },
    { label: 'Blocked', value: tasks?.filter(t => t.status === 'blocked').length || 0, icon: AlertCircle, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-widest">Workspace Dashboard</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Work Performance
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg italic opacity-80">
            Welcome back, {user?.name.split(' ')[0]}! You have {stats[0].value} tasks requiring your attention today.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <RoleGuard allowedRoles={['admin', 'manager', 'team_head']}>
                <button 
                    onClick={() => setIsTaskModalOpen(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 transition-all text-sm group"
                >
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                    CREATE TASK
                </button>
            </RoleGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <PremiumStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <GlassCard className="xl:col-span-2 overflow-hidden border-none shadow-none bg-transparent" hoverable={false}>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative group">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Assignments</h2>
                        <button className="text-sm font-black text-primary-600 hover:text-primary-700 flex items-center gap-1.5 active:scale-95 transition-all uppercase tracking-widest">
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
                            ))
                        ) : tasks?.length === 0 ? (
                            <div className="py-16 text-center border-2 border-dashed border-slate-50 rounded-[2rem]">
                                <p className="text-slate-400 font-bold italic">No tasks discovered in this sector.</p>
                            </div>
                        ) : (
                            tasks?.slice(0, 4).map((task) => (
                                <div key={task.id} className="group relative flex items-center gap-4 p-5 rounded-2xl bg-slate-50/50 hover:bg-white transition-all border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 cursor-pointer">
                                    <div className={`p-0.5 rounded-full ${
                                        task.priority === 'critical' ? 'bg-rose-500' :
                                        task.priority === 'high' ? 'bg-orange-500' :
                                        task.priority === 'medium' ? 'bg-primary-500' : 'bg-slate-300'
                                    }`}>
                                        <div className="w-2 h-10 rounded-full bg-white opacity-20" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-slate-800 truncate group-hover:text-primary-600 transition-colors uppercase text-sm tracking-tight">{task.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.status.replace('_', ' ')}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.priority}</span>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-100 rounded-xl transition-all">
                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <RoleGuard allowedRoles={['admin', 'manager']}>
                    <div className="lg:w-[350px] space-y-8">
                        <div className="bg-primary-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary-900/40 min-h-[350px] flex flex-col justify-end">
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-xl border border-white/10">
                                    <Plus className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-black mb-4 tracking-tighter">Enterprise Pro</h2>
                                <p className="text-primary-200 text-base mb-8 leading-relaxed font-medium italic opacity-90">
                                    Unlock advanced multi-team reporting and AI predictive analytics.
                                </p>
                                <button 
                                    onClick={() => setIsPricingModalOpen(true)}
                                    className="w-full bg-white text-primary-900 py-5 rounded-2xl font-black shadow-xl hover:bg-primary-50 hover:scale-[1.02] transition-all active:scale-95 tracking-widest uppercase text-sm"
                                >
                                    Upgrade Now
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-800 rounded-full opacity-50 blur-3xl" />
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-primary-700 rounded-full opacity-30 blur-2xl" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/5 w-[500px] h-[500px] rounded-full" />
                        </div>
                    </div>
                </RoleGuard>
            </div>
        </GlassCard>

        <div className="space-y-8">
            <AIRiskIndicator />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <GlassCard className="p-0 border-slate-100 bg-white shadow-2xl shadow-slate-200/40">
            <WorkloadChart />
        </GlassCard>
      </div>
      
      <CreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
      />

      <PricingModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
      />
    </div>
  );
}


