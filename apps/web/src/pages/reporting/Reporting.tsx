import React from 'react';
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
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  BrainCircuit,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle
} from 'lucide-react';
import PremiumGuard from '../../components/auth/PremiumGuard';

const data = [
  { name: 'Mon', tasks: 40, completed: 24 },
  { name: 'Tue', tasks: 30, completed: 13 },
  { name: 'Wed', tasks: 20, completed: 98 },
  { name: 'Thu', tasks: 27, completed: 39 },
  { name: 'Fri', tasks: 18, completed: 48 },
  { name: 'Sat', tasks: 23, completed: 38 },
  { name: 'Sun', tasks: 34, completed: 43 },
];

const pieData = [
  { name: 'Completed', value: 400 },
  { name: 'In Progress', value: 300 },
  { name: 'On Hold', value: 300 },
  { name: 'Delayed', value: 200 },
];

const COLORS = ['#0ea5e9', '#6366f1', '#f59e0b', '#ef4444'];

const StatCard = ({ title, value, change, isUp, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-primary-50 transition-colors">
        <Icon className="h-6 w-6 text-slate-400 group-hover:text-primary-600" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {change}
      </div>
    </div>
    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
    <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
  </div>
);

export default function Reporting() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reporting & Analytics</h1>
          <p className="text-slate-500 mt-1 font-medium">Detailed insights into your team's performance.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                <Calendar className="h-4 w-4" />
                Last 30 Days
            </button>
            <button className="px-5 py-2.5 bg-primary-600 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95">
                Export Data
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value="1,284" change="+12.5%" isUp={true} icon={TrendingUp} />
        <StatCard title="Active Users" value="42" change="+3.2%" isUp={true} icon={Users} />
        <StatCard title="Completion Rate" value="84%" change="-2.1%" isUp={false} icon={CheckCircle2} />
        <StatCard title="Avg. Time" value="4.2d" change="+5.4%" isUp={true} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-extrabold text-slate-900 mb-8">Task Velocity</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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
                <Area type="monotone" dataKey="tasks" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-extrabold text-slate-900 mb-8">Status Distribution</h3>
          <div className="h-[300px]">
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
          </div>
          <div className="space-y-3 mt-4 px-4">
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
                Our AI engine analyzes your team's workflow patterns to provide unique, actionable insights and predictive outcomes.
              </p>
              
              <div className="space-y-4">
                <div className="p-5 bg-slate-800/50 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
                    <p className="text-primary-400 text-sm font-black uppercase tracking-widest mb-1">Bottleneck Warning</p>
                    <p className="text-white font-bold">Team "Design Alpha" has a 74% higher risk of missing Friday's deadline due to review delay patterns.</p>
                </div>
                <div className="p-5 bg-slate-800/50 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
                    <p className="text-emerald-400 text-sm font-black uppercase tracking-widest mb-1">Efficiency Boost</p>
                    <p className="text-white font-bold">Automating "Client Approval" tasks could save 12.5 man-hours per week based on historical data.</p>
                </div>
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
                                <p className="text-white font-bold text-sm">Project X Success Probability</p>
                                <p className="text-slate-400 text-xs font-medium mt-0.5">Likely to complete 2 days ahead of schedule.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-10 w-10 shrink-0 bg-rose-500/20 rounded-xl flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-rose-400" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Resource Over-utilization</p>
                                <p className="text-slate-400 text-xs font-medium mt-0.5">High burn-out risk for 3 members in Sprint 4.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
