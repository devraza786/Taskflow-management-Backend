import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import api from '../../lib/api';
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  BrainCircuit,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  File as FileIcon,
  X
} from 'lucide-react';
import { useProjectStats, useAIInsights } from '../../hooks/useReports';
import { exportToCSV, exportToExcel, exportToPDF, exportToWord } from '../../utils/exportUtils';
import PremiumGuard from '../../components/auth/PremiumGuard';
import { format } from 'date-fns';

const COLORS = ['#0ea5e9', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StatCard = ({ title, value, change, isUp, icon: Icon, loading }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-primary-50 transition-colors">
        <Icon className="h-6 w-6 text-slate-400 group-hover:text-primary-600" />
      </div>
      {!loading && change && (
        <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          {change}
        </div>
      )}
    </div>
    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
    {loading ? (
      <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg mt-1" />
    ) : (
      <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
    )}
  </div>
);

export default function Reporting() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const { data, isLoading } = useProjectStats(startDate, endDate);
  const { data: insights, isLoading: isLoadingInsights, error: insightsError } = useAIInsights();

  const pieData = data?.taskDistribution.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item._count
  })) || [];

  const handleExport = async (type: 'pdf' | 'excel' | 'csv' | 'word') => {
    if (!data) return;

    if (type === 'word') {
      const fileName = `Taskflow_Report_${format(new Date(), 'yyyy-MM-dd')}`;
      const title = `Taskflow Management - Project Report (${startDate || 'All Time'} - ${endDate || 'Now'})`;
      const exportData = data.projects.map(p => ({
        Project: p.name,
        Status: p.status,
        Tasks: p._count.tasks
      }));
      exportToWord(exportData, title, fileName);
      return;
    }

    try {
      const response = await api.get('/reports/export', {
        params: { type, startDate, endDate },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = type === 'pdf' ? 'pdf' : type === 'excel' ? 'xlsx' : 'csv';
      link.setAttribute('download', `Taskflow_Report_${format(new Date(), 'yyyy-MM-dd')}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
      // Fallback to client-side export if backend fails
      const fileName = `Taskflow_Report_${format(new Date(), 'yyyy-MM-dd')}`;
      const title = `Taskflow Management - Project Report (${startDate || 'All Time'} - ${endDate || 'Now'})`;
      const exportData = data.projects.map(p => ({
        Project: p.name,
        Status: p.status,
        Tasks: p._count.tasks
      }));
      
      switch (type) {
        case 'pdf': exportToPDF(exportData, title, fileName); break;
        case 'excel': exportToExcel(exportData, fileName); break;
        case 'csv': exportToCSV(exportData, fileName); break;
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reporting & Analytics</h1>
          <p className="text-slate-500 mt-1 font-medium">Detailed insights into your team's performance.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-1">
                <Calendar className="h-4 w-4 text-slate-400" />
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs font-bold text-slate-600 border-none focus:ring-0 cursor-pointer"
                />
                <span className="text-slate-400">-</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs font-bold text-slate-600 border-none focus:ring-0 cursor-pointer"
                />
            </div>
            <button 
              onClick={() => setShowPreview(true)}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 flex items-center gap-2"
            >
                <Download className="h-4 w-4" />
                Export Report
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={data?.metrics?.completed || 0} change="+12.5%" isUp={true} icon={TrendingUp} loading={isLoading} />
        <StatCard title="Active Projects" value={data?.projects?.length || 0} change="+3.2%" isUp={true} icon={Users} loading={isLoading} />
        <StatCard title="Task Count" value={data?.projects?.reduce((acc, p) => acc + p._count.tasks, 0) || 0} change="-2.1%" isUp={false} icon={CheckCircle2} loading={isLoading} />
        <StatCard title="Avg. Cycle Time" value={`${data?.metrics?.avgDays || '0'}d`} change="+5.4%" isUp={true} icon={Clock} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-extrabold text-slate-900 mb-8">Work Velocity</h3>
          <div className="h-[350px]">
            {isLoading ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-3xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.metrics?.velocity || []}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600, fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600, fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                  <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={3} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-extrabold text-slate-900 mb-8">Status Distribution</h3>
          <div className="h-[300px]">
            {isLoading ? (
               <div className="w-full h-full bg-slate-50 animate-pulse rounded-3xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-3 mt-4 px-4 overflow-y-auto max-h-[150px]">
            {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                        <span className="text-sm font-bold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">{item.value}</span>
                </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-1 rounded-[3rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 text-slate-800/50 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <BrainCircuit className="h-64 w-64" />
        </div>
        <div className="bg-slate-900 rounded-[2.8rem] p-10 border border-slate-800 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/20">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight italic">AI Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Insights generated based on your team's current performance patterns and historical data cycles.
              </p>
              
              <div className="space-y-4">
                {isLoadingInsights ? (
                    <div className="space-y-4">
                        <div className="h-20 bg-slate-800/50 animate-pulse rounded-3xl" />
                        <div className="h-20 bg-slate-800/50 animate-pulse rounded-3xl" />
                    </div>
                ) : insightsError ? (
                  <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl backdrop-blur-sm">
                    <p className="text-rose-400 font-bold mb-2">Premium Feature</p>
                    <p className="text-slate-400 text-sm">AI Insights are exclusive to the Premium plan. Please upgrade to unlock advanced automated analytics and performance predictions.</p>
                  </div>
                ) : (
                  Array.isArray(insights) && insights.map((insight, i) => (
                    <div key={i} className="p-5 bg-slate-800/50 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
                        <p className={`text-${insight.color}-400 text-sm font-black uppercase tracking-widest mb-1`}>{insight.title}</p>
                        <p className="text-white font-bold">{insight.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-primary-500/10 blur-[100px] rounded-full" />
                <div className="relative p-8 bg-slate-800/30 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-md">
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-bold">Predictive Confidence</span>
                            <span className="text-primary-400 font-extrabold text-lg">92%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="w-[92%] h-full bg-primary-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-primary-400" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Optimal Performance</p>
                                <p className="text-slate-400 text-xs font-medium mt-0.5">Your team is operating at peak efficiency this week.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 bg-rose-500/20 rounded-xl flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-rose-400" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Sprint Risk Low</p>
                                <p className="text-slate-400 text-xs font-medium mt-0.5">No immediate blockers identified in current projects.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview and Export Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          />
          <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Report Preview</h2>
                <p className="text-slate-500 font-medium">Verify your data before exporting</p>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[50vh]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Project Name</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Total Tasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-slate-900">{p._count.tasks}</td>
                    </tr>
                  ))}
                  {!data?.projects.length && (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-slate-400 font-medium italic">No projects found for this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <p className="text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Choose Export Format</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => handleExport('pdf')}
                  className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-200 rounded-3xl hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 transition-all group"
                >
                  <div className="p-3 bg-red-50 text-red-500 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <FileIcon className="h-6 w-6" />
                  </div>
                  <span className="font-extrabold text-slate-900">PDF Document</span>
                </button>
                <button 
                  onClick={() => handleExport('excel')}
                  className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-200 rounded-3xl hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all group"
                >
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <span className="font-extrabold text-slate-900">Excel Sheet</span>
                </button>
                <button 
                  onClick={() => handleExport('csv')}
                  className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-200 rounded-3xl hover:border-slate-500 hover:shadow-xl hover:shadow-slate-500/10 transition-all group"
                >
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <FileCode className="h-6 w-6" />
                  </div>
                  <span className="font-extrabold text-slate-900">CSV Archive</span>
                </button>
                <button 
                  onClick={() => handleExport('word')}
                  className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all group"
                >
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="font-extrabold text-slate-900">MS Word</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
