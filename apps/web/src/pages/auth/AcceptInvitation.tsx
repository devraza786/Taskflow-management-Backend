import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvitation, useAcceptInvitation } from '../../hooks/useInvitations';
import { useAuthStore } from '../../store/auth.store';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail
} from 'lucide-react';

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const { data: invitation, isLoading, error } = useInvitation(token!);
  const acceptInvitation = useAcceptInvitation();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsAccepting(true);
      const result = await acceptInvitation.mutateAsync({
        token: token!,
        name,
        password,
      });

      setAuth(result.user, result.accessToken, result.refreshToken);
      toast.success('Welcome to Taskflow!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Validating Invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl space-y-6 border border-slate-100">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl mx-auto flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">Invalid Invitation</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              This invitation may have expired, been revoked, or already used. Please contact your administrator for a new one.
            </p>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            Go to Login
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="bg-slate-900 p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-amber-600/10" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1 pl-1">Invitation Secure</p>
                  <h1 className="text-3xl font-black tracking-tight leading-none">Join the Team</h1>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                  <Building2 className="h-4 w-4 text-primary-400" />
                  <span className="text-xs font-bold">{invitation.organization?.name}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                  <User className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold">Invited by {invitation.inviter?.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-12 space-y-8">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Account Identity</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-600">
                    {invitation.email}
                </div>
            </div>

            <form onSubmit={handleAccept} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Create Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 transition-all font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isAccepting}
                  className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100"
                >
                  {isAccepting ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Setting up Account...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle2 className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Secured by Taskflow Guard&trade;
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
