import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', tasks: 4, efficiency: 85 },
  { name: 'Tue', tasks: 7, efficiency: 92 },
  { name: 'Wed', tasks: 5, efficiency: 78 },
  { name: 'Thu', tasks: 8, efficiency: 95 },
  { name: 'Fri', tasks: 12, efficiency: 88 },
  { name: 'Sat', tasks: 3, efficiency: 98 },
  { name: 'Sun', tasks: 2, efficiency: 94 },
];

export default function WorkloadChart() {
  return (
    <div className="h-[300px] w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight uppercase text-xs opacity-50">Team Performance</h3>
          <p className="text-2xl font-black text-slate-900 mt-1">Workload Peak <span className="text-primary-600">+14%</span></p>
        </div>
        <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 rounded-full border border-primary-100">
                <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                <span className="text-[10px] font-bold text-primary-700 uppercase">Live Metrics</span>
            </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: '12px'
            }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Area 
            type="monotone" 
            dataKey="tasks" 
            stroke="#2563eb" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorTasks)" 
            animationDuration={2000}
          />
          <Area 
            type="monotone" 
            dataKey="efficiency" 
            stroke="#10b981" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorEff)" 
            animationDuration={2500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
