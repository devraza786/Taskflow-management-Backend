import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  AlertCircle,
  Mail,
  Shield,
  Clock,
  UserPlus,
  UserMinus,
  Briefcase
} from 'lucide-react';
import { useTeam, useTeamMembers, useDeleteTeam, useRemoveTeamMember } from '../../hooks/useTeams';
import { useUpdateUser } from '../../hooks/useUsers';
import CreateTeamModal from '../../components/team/CreateTeamModal';
import InviteMemberModal from '../../components/team/InviteMemberModal';
import { useAuthStore } from '../../store/auth.store';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: team, isLoading: isTeamLoading, error } = useTeam(id!);
  const { data: members, isLoading: isMembersLoading } = useTeamMembers(id!);
  const deleteTeam = useDeleteTeam();
  const removeMember = useRemoveTeamMember();
  const updateUser = useUpdateUser();
  const currentUser = useAuthStore(state => state.user);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  if (isTeamLoading || isMembersLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-12 w-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Team Not Found</h2>
        <button 
          onClick={() => navigate('/team')}
          className="mt-4 text-primary-600 font-bold hover:underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await deleteTeam.mutateAsync(team.id);
        toast.success('Team deleted successfully');
        navigate('/team');
      } catch (err) {
        toast.error('Failed to delete team');
      }
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (window.confirm('Remove this member from the team?')) {
      try {
        await removeMember.mutateAsync({ teamId: team.id, userId });
        toast.success('Member removed');
      } catch (err) {
        toast.error('Failed to remove member');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Visual Header */}
      <div className="relative h-64 w-full bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-amber-600/10" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10 transition-all">
          <div className="space-y-4">
             <button 
                onClick={() => navigate('/team')}
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-black uppercase tracking-widest pl-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Teams Directory
              </button>
              
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                  <Users className="h-10 w-10 md:h-12 md:w-12 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest pl-1">Team Entity</p>
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{team.name}</h1>
                </div>
              </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-6 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-xl active:scale-95"
              >
                <Edit3 className="h-4 w-4" />
                Manage
              </button>
              <button 
                onClick={handleDelete}
                className="p-4 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all shadow-lg active:scale-95"
              >
                <Trash2 className="h-5 w-5" />
              </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden pb-8">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="h-4 w-4" />
                <h3 className="text-sm font-black uppercase tracking-widest">Team Members</h3>
              </div>
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl font-bold text-xs hover:bg-primary-100 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Invite Member
              </button>
            </div>

            <div className="divide-y divide-slate-50">
              <AnimatePresence>
                {members?.map((member, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={member.userId} 
                    className="p-6 md:p-8 flex items-center justify-between hover:bg-slate-50 group transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-lg border-2 border-white shadow-sm overflow-hidden">
                          {member.user.avatarUrl ? (
                            <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full object-cover" />
                          ) : member.user.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 group-hover:text-primary-600 transition-colors uppercase text-[11px] tracking-widest mb-0.5">{member.user.name}</h4>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <Mail className="h-3 w-3" />
                            {member.user.email}
                          </div>
                          <span className="text-slate-200">•</span>
                          {currentUser?.role === 'admin' ? (
                            <select
                                value={member.user.role}
                                onChange={async (e) => {
                                    try {
                                        await updateUser.mutateAsync({ id: member.userId, role: e.target.value as any });
                                        toast.success('User role updated');
                                    } catch (err) {
                                        toast.error('Failed to update role');
                                    }
                                }}
                                className="bg-transparent border-none text-[10px] text-primary-500 font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-primary-50 rounded-lg px-2 py-0.5"
                            >
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="team_head">Team Head</option>
                                <option value="employee">Employee</option>
                            </select>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] text-primary-500 font-black uppercase tracking-widest">
                                <Shield className="h-3 w-3" />
                                {member.user.role}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => handleRemoveMember(member.userId)}
                        className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                       >
                        <UserMinus className="h-4 w-4" />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {(!members || members.length === 0) && (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl mx-auto flex items-center justify-center border border-slate-100">
                    <Users className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No members found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">About Team</label>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  {team.description || "Building excellence through collaboration. This team focuses on delivering high-impact features and maintaining system stability."}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Briefcase className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                      <p className="text-sm font-bold text-slate-900">{(team as any).department?.name || 'General'}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Shield className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Head</p>
                      <p className="text-sm font-bold text-slate-900">{(team as any).teamHead?.name || 'Unassigned'}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Clock className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created On</p>
                      <p className="text-sm font-bold text-slate-900">{new Date(team.createdAt).toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Performance Card */}
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl space-y-6">
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Team Velocity</h4>
                <p className="text-xs font-bold text-slate-500">Real-time performance metrics.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Project Completion</span>
                    <span className="text-primary-400">85%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Team Cohesion</span>
                    <span className="text-amber-400">Stable</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>

      <CreateTeamModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {}}
        team={team}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        teamId={team.id}
        teamName={team.name}
      />
    </div>
  );
}
