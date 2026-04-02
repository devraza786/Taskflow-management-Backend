import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function GlassCard({ children, className, hoverable = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={cn(
        "relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-xl shadow-slate-200/50",
        hoverable && "hover:shadow-2xl hover:shadow-primary-500/10 transition-shadow duration-300",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
