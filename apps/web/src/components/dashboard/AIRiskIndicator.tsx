import { motion } from 'framer-motion';
import { Brain, AlertCircle, TrendingDown, Target } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export default function AIRiskIndicator() {
  return (
    <GlassCard className="p-8 h-full relative overflow-hidden bg-gradient-to-br from-primary-900/5 to-transparent">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Brain className="w-48 h-48" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200">
                <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">AI Insights</h3>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Analysis</p>
                </div>
            </div>
        </div>

        <div className="space-y-6 flex-1">
            <div className="p-6 bg-white/50 backdrop-blur rounded-[1.5rem] border border-white">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Project Health Score</p>
                    <span className="text-2xl font-black text-primary-600">92%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "92%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary-500 to-emerald-400" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/30 border border-white hover:bg-white/50 transition-colors">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Risk Detected</p>
                        <p className="text-sm font-extrabold text-slate-800 italic">3 tasks likely to slip deadline</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/30 border border-white hover:bg-white/50 transition-colors">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <TrendingDown className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Optimization</p>
                        <p className="text-sm font-extrabold text-slate-800 italic">Shift workload from Alice to Bob</p>
                    </div>
                </div>
            </div>
        </div>

        <button className="w-full mt-8 py-4 bg-primary-600 text-white rounded-2xl font-extrabold hover:bg-primary-700 active:scale-95 transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-2 group">
            <Target className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            Optimize Workflow
        </button>
      </div>
    </GlassCard>
  );
}
