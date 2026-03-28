import { useTeams } from '../../hooks/useTeams';
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
} from 'lucide-react';

export default function TeamManagement() {
  const { data: teams, isLoading } = useTeams();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Team Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage teams, departments, and member roles.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all text-sm">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Departments & Teams</h2>
                    <button className="text-sm font-bold text-primary-600 hover:text-primary-700">Add Team</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isLoading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-3xl" />
                        ))
                    ) : teams?.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                            No teams created yet.
                        </div>
                    ) : (
                        teams?.map((team) => (
                            <div key={team.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-primary-600/5 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-2xl bg-white text-primary-600 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <button className="p-1 hover:bg-white rounded-lg transition-colors">
                                        <MoreVertical className="h-4 w-4 text-slate-400" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-900">{team.name}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-sm text-slate-500 font-medium">{team._count?.members || 0} Members</p>
                                    <div className="flex -space-x-1.5">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Directory</h2>
                <div className="space-y-4">
                   {/* Table or list of all users */}
                   <p className="text-slate-400 text-center py-8">User detailed list coming soon...</p>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-primary-900 rounded-[2.5rem] p-8 text-white">
                <h3 className="text-lg font-bold mb-4">Organization Setup</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center text-xs">1</div>
                        <span className="text-sm font-medium">Departments Config</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center text-xs">2</div>
                        <span className="text-sm font-medium">Team Structures</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs text-white">3</div>
                        <span className="text-sm font-medium">Invite Employees</span>
                    </div>
                </div>
                <button className="w-full mt-8 py-4 bg-white text-primary-900 rounded-2xl font-extrabold hover:bg-primary-50 transition-colors shadow-lg">
                    Manage Roles
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
