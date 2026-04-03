import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, Zap, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/api';

interface Insight {
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'suggestion';
  color: 'emerald' | 'amber' | 'indigo' | 'primary';
}

const iconMap = {
  positive: TrendingUp,
  warning: AlertTriangle,
  suggestion: Lightbulb
};

const colorMap = {
  emerald: { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  amber: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  indigo: { text: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
  primary: { text: "text-primary-400", bg: "bg-primary-400/10", border: "border-primary-400/20" }
};

export default function AIInsights() {
  const { user } = useAuthStore();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLocked = user?.plan === 'free' || user?.plan === 'starter' || !user?.plan;

  useEffect(() => {
    if (isLocked) {
        setIsLoading(false);
        return;
    }

    const fetchInsights = async () => {
      try {
        const response = await api.get('/reports/insights');
        setInsights(response.data);
      } catch (err: any) {
        console.error('Failed to fetch AI insights:', err);
        setError(err.response?.data?.message || 'Failed to load insights');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [isLocked]);

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-primary-900/20 border border-white/10 group">
      {/* Background Glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-600/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl shadow-lg shadow-primary-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">AI Reporting Insights</h2>
              <p className="text-slate-400 text-sm font-medium">Predictive analysis based on team behavior.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-primary-400">
            <Zap className="h-3 w-3 fill-primary-400" />
            {isLocked ? 'Premium Feature' : 'Live Analysis'}
          </div>
        </div>

        <div className="relative">
          {isLocked && (
            <div className="absolute inset-0 z-20 backdrop-blur-sm bg-slate-900/40 rounded-3xl flex flex-col items-center justify-center text-center p-6 border border-white/5 animate-in fade-in duration-500">
               <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-orange-500/20">
                  <Lock className="h-8 w-8 text-white" />
               </div>
               <h3 className="text-xl font-black mb-2">AI Insights is Locked</h3>
               <p className="text-slate-400 text-sm font-medium max-w-xs mb-6">
                 Upgrade to the <span className="text-white font-bold">Business</span> or <span className="text-white font-bold">Enterprise</span> plan to unlock advanced AI-driven analytics and predictive reporting.
               </p>
               <button className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-primary-600/20">
                 Upgrade Now
               </button>
            </div>
          )}

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isLocked ? 'opacity-20 pointer-events-none' : ''}`}>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 animate-pulse h-48 rounded-3xl border border-white/10" />
              ))
            ) : insights.length > 0 ? (
              insights.map((insight, index) => {
                const Icon = iconMap[insight.type] || Lightbulb;
                const colors = colorMap[insight.color as keyof typeof colorMap] || colorMap.primary;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group/card"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{insight.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4 font-medium">
                      {insight.description}
                    </p>
                    <div className={`flex items-center gap-2 text-xs font-bold ${colors.text} group-hover/card:gap-3 transition-all`}>
                      VIEW ACTION PLAN
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </motion.div>
                );
              })
            ) : (
                <div className="col-span-3 py-12 text-center text-slate-500 font-bold italic">
                   {error || 'No insights available yet. Check back later as your team completes more tasks.'}
                </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs font-medium max-w-md">
            Our AI models analyze task completion patterns, team communication frequency, and project deadlines to provide actionable intelligence.
          </p>
          {!isLocked && (
            <button 
                onClick={() => window.location.reload()}
                disabled={isLoading}
                className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-sm hover:bg-slate-100 transition-all active:scale-95 shadow-xl flex items-center gap-2 disabled:opacity-50"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Refresh Analysis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
