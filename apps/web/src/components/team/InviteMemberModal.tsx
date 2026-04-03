import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, 
  Mail, 
  Shield, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Send,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

type Role = 'admin' | 'manager' | 'team_head' | 'employee';

export default function InviteMemberModal({ isOpen, onClose, teamId, teamName }: InviteMemberModalProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      role: 'employee' as Role,
    }
  });

  const onSubmit = async (data: { email: string, role: Role }) => {
    setStatus('loading');
    try {
      await api.post(`/teams/${teamId}/invitations`, data);
      setStatus('success');
      toast.success('Invitation sent successfully!');
      setTimeout(() => {
        onClose();
        reset();
        setStatus('idle');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      const msg = error.response?.data?.error || 'Failed to send invitation';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-200">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Invite to {teamName}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Member Invitation</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            {status === 'success' ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 animate-in zoom-in duration-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Invitation Sent!</h3>
                <p className="text-slate-500 font-medium">An email has been dispatched to the recipient.</p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Recipient Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      <input
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                          }
                        })}
                        placeholder="colleague@company.com"
                        className="w-full h-14 pl-12 pr-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                    {errors.email && <p className="text-rose-500 text-xs font-bold px-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Role</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      <select
                        {...register('role')}
                        className="w-full h-14 pl-12 pr-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="employee">Employee (Standard Access)</option>
                        <option value="team_head">Team Head (Lead Access)</option>
                        <option value="manager">Manager (Management Access)</option>
                        <option value="admin">Admin (Full Control)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-16 bg-primary-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Sending Invitation...
                      </>
                    ) : (
                      <>
                        <Send className="h-6 w-6" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-xs font-bold">{errorMessage}</p>
                  </div>
                )}
              </>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
