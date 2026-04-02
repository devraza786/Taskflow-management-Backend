import { useState, useEffect } from 'react';
import { 
  BarChart as ReBarChart, 
  Bar as ReBar, 
  XAxis as ReXAxis, 
  YAxis as ReYAxis, 
  CartesianGrid as ReCartesianGrid, 
  Tooltip as ReTooltip, 
  ResponsiveContainer as ReResponsiveContainer, 
  PieChart as RePieChart, 
  Pie as RePie, 
  Cell as ReCell,
  AreaChart as ReAreaChart,
  Area as ReArea
} from 'recharts';

const BarChart = ReBarChart as any;
const Bar = ReBar as any;
const XAxis = ReXAxis as any;
const YAxis = ReYAxis as any;
const CartesianGrid = ReCartesianGrid as any;
const Tooltip = ReTooltip as any;
const ResponsiveContainer = ReResponsiveContainer as any;
const PieChart = RePieChart as any;
const Pie = RePie as any;
const Cell = ReCell as any;
const AreaChart = ReAreaChart as any;
const Area = ReArea as any;

import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import api from '../lib/api';
import AIInsights from '../components/reporting/AIInsights';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reporting() {
  const [projectStats, setProjectStats] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, teamsRes] = await Promise.all([
          api.get('/reports/projects'),
          api.get('/reports/teams')
        ]);
        setProjectStats(projectsRes.data);
        setTeamStats(teamsRes.data);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsCards = [
    { label: 'Total Projects', value: projectStats?.projects?.length || 0, icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Active Teams', value: teamStats?.length || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tasks Completed', value: projectStats?.metrics?.completed || 0, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg. Completion', value: `${projectStats?.metrics?.avgDays || 0}d`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight tracking-tighter">Reporting & Analytics</h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time insights across your organization.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-3 rounded-2xl font-bold hover:bg-slate-50 shadow-sm transition-all text-sm active:scale-95">
            <Calendar className="h-4 w-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all text-sm active:scale-95">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <AIInsights />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color} transition-transform group-hover:scale-110 duration-300`}>
                <card.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-slate-500 text-sm font-black uppercase tracking-widest leading-none">{card.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">Task Distribution</h2>
            <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
              <Filter className="h-5 w-5" />
            </button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStats?.taskDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="_count"
                  nameKey="status"
                >
                  {projectStats?.taskDistribution?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#fff',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {projectStats?.taskDistribution?.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{entry.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Team Performance</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamStats || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#fff',
                    padding: '12px 16px'
                  }}
                />
                <Bar dataKey="_count.tasks" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <h2 className="text-xl font-bold text-slate-900 mb-8 font-black uppercase tracking-widest text-sm text-slate-400">Project Velocity (Last 6 Weeks)</h2>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={projectStats?.metrics?.velocity || []}
            >
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
              <Tooltip 
                 contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#fff',
                    padding: '12px 16px'
                  }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#4f46e5" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
