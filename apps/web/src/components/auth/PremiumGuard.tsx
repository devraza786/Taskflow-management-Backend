import React from 'react';
import { useAuthStore } from '../../store/auth.store';
import { Crown, Lock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NavLink = Link as any;

interface PremiumGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minTier?: 'starter' | 'pro' | 'business' | 'enterprise';
}

const TIER_LEVELS = {
  FREE: 0,
  STARTER: 1,
  PRO: 2,
  PREMIUM: 3,
  ENTERPRISE: 4
};

export default function PremiumGuard({ children, fallback, minTier = 'business' }: PremiumGuardProps) {
  const user = useAuthStore((state) => state.user);
  
  const userTier = (user?.organization?.plan || 'FREE') as keyof typeof TIER_LEVELS;
  const requiredTier = minTier as keyof typeof TIER_LEVELS;
  
  // Admin always has access
  const hasAccess = user?.role === 'admin' || TIER_LEVELS[userTier] >= TIER_LEVELS[requiredTier];

  if (!hasAccess) {
    return (
      <>{fallback || (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-primary-100 border border-slate-100 overflow-hidden text-center p-8 relative">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"></div>
            
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Crown className="h-10 w-10 text-amber-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Premium Feature</h2>
            <p className="text-slate-500 mb-8">
              Advanced analytics and AI-powered insights are only available on Business and Enterprise plans.
            </p>
            
            <div className="space-y-4">
              <NavLink 
                to="/settings" 
                className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 group"
              >
                Upgrade Now
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </NavLink>
              <button className="w-full py-4 text-slate-500 font-semibold hover:text-slate-700 transition-colors">
                Learn more about plans
              </button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3" /> Secure Payment
              </div>
              <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
              <div>Cancel Anytime</div>
            </div>
          </div>
        </div>
      )}</>
    );
  }

  return <>{children}</>;
}
