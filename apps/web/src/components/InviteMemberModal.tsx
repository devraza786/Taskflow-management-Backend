import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from './ui/Modal';
import { UserPlus, Mail, Shield, Users } from 'lucide-react';
import { useTeams } from '../hooks/useTeams';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { data: teams } = useTeams();

  const onSubmit = async (data: any) => {
    // Placeholder for invitation logic
    alert(`Invitation sent to ${data.email}`);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Team Member">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Users className="h-4 w-4" /> Team
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
            <h4 className="text-sm font-extrabold text-slate-900 mb-2">Wait, what happens next?</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                We'll send an invitation email to the address above. Once they accept, they'll be automatically added to your organization's dashboard and the selected team.
            </p>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-3 rounded-2xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-5 py-3 rounded-2xl font-bold bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all"
          >
            Send Invitation
          </button>
        </div>
      </form>
    </Modal>
  );
}
