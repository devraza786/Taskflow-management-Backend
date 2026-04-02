import { useState } from 'react';
import { useTeams } from '../../hooks/useTeams';
import { useUsers } from '../../hooks/useUsers';
import InviteMemberModal from '../../components/InviteMemberModal';
import CreateTeamModal from '../../components/team/CreateTeamModal';
import RoleGuard from '../../components/auth/RoleGuard';
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Plus,
  Trash2
} from 'lucide-react';

export default function TeamManagement() {
  const { data: teams, isLoading: isLoadingTeams, refetch: refetchTeams } = useTeams();
  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useUsers();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/teams/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete team');
      
      refetchTeams();
    } catch (error) {
      setErrorMessage('Error deleting team');
    }
  };

  const refetch = () => {
      refetchTeams();
      refetchUsers();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Team Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage teams, departments, and member roles.</p>
        </div>
        <div className="flex gap-4">
            <RoleGuard allowedRoles={['admin', 'manager']}>
            <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-3 rounded-2xl font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-sm"
            >
                <UserPlus className="h-4 w-4" />
                Invite Member
            </button>
            <button 
                onClick={() => setIsCreateTeamModalOpen(true)}
                className="flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all text-sm"
            >
                <Plus className="h-4 w-4" />
                Add Team
            </button>
            </RoleGuard>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex justify-between items-center text-rose-600 font-bold">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="text-rose-400 hover:text-rose-600">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Departments & Teams</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isLoadingTeams ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-3xl" />
                        ))
                    ) : teams?.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                            No teams created yet.
                        </div>
                    ) : (
                        teams?.map((team) => (
                            <div key={team.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-primary-600/5 transition-all group relative cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-2xl bg-white text-primary-600 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div className="flex gap-1">
                                        <RoleGuard allowedRoles={['admin', 'manager']}>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTeam(team.id);
                                                }}
                                                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </RoleGuard>
                                        <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                            <MoreVertical className="h-4 w-4 text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{team.name}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-sm text-slate-500 font-medium">{team._count?.members || 0} Members</p>
                                    <div className="flex -space-x-1.5">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 shadow-sm" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Users className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Member Directory</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Member</th>
                                <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest pr-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoadingUsers ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4"><div className="h-10 w-48 bg-slate-50 rounded-xl" /></td>
                                        <td className="py-4"><div className="h-6 w-20 bg-slate-50 rounded-lg" /></td>
                                        <td className="py-4"><div className="h-6 w-16 bg-slate-50 rounded-lg" /></td>
                                        <td className="py-4"><div className="h-6 w-10 bg-slate-50 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : users?.map((m) => (
                                <tr key={m.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="py-5 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 border-2 border-white shadow-sm overflow-hidden group-hover:bg-primary-100 group-hover:text-primary-600 group-hover:border-primary-100 transition-all">
                                                {m.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{m.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">{m.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                            m.role === 'admin' ? 'bg-indigo-50 text-indigo-700' :
                                            m.role === 'manager' ? 'bg-primary-50 text-primary-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {m.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${m.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`} />
                                            <span className="text-sm font-bold text-slate-600 capitalize">{m.status}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 pr-4 text-right">
                                        <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-xl shadow-sm transition-all">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-primary-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-primary-900/20">
                <h3 className="text-lg font-bold mb-4 relative z-10">Organization Setup</h3>
                <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3 group opacity-60">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xs font-bold border border-white/5">1</div>
                        <span className="text-sm font-medium">Departments Config</span>
                    </div>
                    <div className="flex items-center gap-3 group opacity-60">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xs font-bold border border-white/5">2</div>
                        <span className="text-sm font-medium">Team Structures</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-black/20 ring-4 ring-primary-600/20">3</div>
                        <span className="text-sm font-bold">Invite Employees</span>
                    </div>
                </div>
                <RoleGuard allowedRoles={['admin']}>
                  <button className="w-full mt-10 py-4 bg-white text-primary-900 rounded-2xl font-extrabold hover:bg-primary-50 transition-all active:scale-95 shadow-xl relative z-10">
                      Manage Roles
                  </button>
                </RoleGuard>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-800/30 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-700/20 rounded-full blur-2xl -ml-12 -mb-12" />
            </div>
        </div>
      </div>

      <CreateTeamModal 
        isOpen={isCreateTeamModalOpen} 
        onClose={() => setIsCreateTeamModalOpen(false)} 
        onSuccess={() => refetch()} 
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
