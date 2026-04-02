import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, Zap } from 'lucide-react';

const insights = [
  {
    title: "Project Velocity Increase",
    description: "Your team's completion rate has improved by 24% this week. Keep up the momentum!",
    type: "positive",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  },
  {
    title: "Potential Bottleneck",
    description: "The 'Marketing Campaign' project has 5 tasks overdue. Consider reassigning resources.",
    type: "warning",
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50"
  },
  {
    title: "Resource Optimization",
    description: "AI suggests that merging 'Design' and 'Frontend' standups could save 4 hours/week.",
    type: "suggestion",
    icon: Lightbulb,
    color: "text-primary-500",
    bg: "bg-primary-50"
  }
];

export default function AIInsights() {
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
            Live Analysis
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group/card"
            >
              <div className={`w-12 h-12 rounded-2xl ${insight.bg} flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform`}>
                <insight.icon className={`h-6 w-6 ${insight.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2">{insight.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4 font-medium">
                {insight.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-primary-400 group-hover/card:gap-3 transition-all">
                VIEW ACTION PLAN
                <ArrowRight className="h-3 w-3" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs font-medium max-w-md">
            Our AI models analyze task completion patterns, team communication frequency, and project deadlines to provide actionable intelligence.
          </p>
          <button className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-sm hover:bg-slate-100 transition-all active:scale-95 shadow-xl">
            Generate Deep Report
          </button>
        </div>
      </div>
    </div>
  );
}
