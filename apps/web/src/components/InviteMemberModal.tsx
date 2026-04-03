import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from './ui/Modal';
import { UserPlus, Mail, Shield, Users, Loader2, CheckCircle2 } from 'lucide-react';
import { useTeams } from '../hooks/useTeams';
import { useCreateInvitation } from '../hooks/useInvitations';
import { toast } from 'react-hot-toast';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { data: teams } = useTeams();
  const createInvitation = useCreateInvitation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data: any) => {
    setError('');
    try {
      await createInvitation.mutateAsync(data);
      
      setIsSuccess(true);
      toast.success('Invitation sent!');
      setTimeout(() => {
        setIsSuccess(false);
        reset();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send invitation');
    }
  };

  const isSubmitting = createInvitation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Team Member">
      {isSuccess ? (
        <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Invitation Sent!</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">
                We've sent an invitation link to the recipient's inbox.
            </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex justify-between items-center">
                <span>{error}</span>
                <button type="button" onClick={() => setError('')} className="text-rose-400 hover:text-rose-600">✕</button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email Address
            </label>
            <input
              {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                  }
              })}
              placeholder="colleague@company.com"
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
            />
            {errors.email && <p className="text-xs text-rose-500 font-bold">{errors.email.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Role
              </label>
              <select
                {...register('role')}
                defaultValue="employee"
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
              >
                <option value="employee">Employee</option>
                <option value="team_head">Team Head</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4" /> Join Team
              </label>
              <select
                {...register('teamId')}
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
              >
                <option value="">No Team Assigned</option>
                {teams?.map((team: any) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
              <h4 className="text-sm font-extrabold text-slate-900 mb-2">What happens next?</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  The recipient will receive an invitation email with a secure link. Once they set their name and password, they'll be added to your organization automatically.
              </p>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 rounded-2xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 rounded-2xl font-bold bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
