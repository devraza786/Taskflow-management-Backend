import React from 'react';
import { useProjects, Project } from '../../hooks/useProjects';
import { 
  Plus, 
  FolderKanban, 
  MoreVertical, 
  Calendar, 
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react';

const StatusBadge = ({ status }: { status: Project['status'] }) => {
  const styles = {
    planning: 'bg-primary-50 text-primary-600 border-primary-100',
    active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    on_hold: 'bg-amber-50 text-amber-600 border-amber-100',
    completed: 'bg-slate-50 text-slate-600 border-slate-100',
    cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]} capitalize`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default function ProjectList() {
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and track your organizational initiatives.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all text-sm">
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2rem]" />
          ))
        ) : projects?.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-4 rounded-3xl mb-4">
              <FolderKanban className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
            <p className="text-slate-500 max-w-xs mt-1">Get started by creating your first project to organize your team's work.</p>
          </div>
        ) : (
          projects?.map((project) => (
            <div 
              key={project.id} 
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-600/5 transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <MoreVertical className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 truncate group-hover:text-primary-600 transition-colors">
                    {project.name}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 font-medium mb-6">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <StatusBadge status={project.status} />
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Updated 2 days ago</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-end">
                    <div className="space-y-4 flex-1">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        <span>Progress</span>
                        <span className="text-slate-900">64%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600 rounded-full w-[64%]" />
                      </div>
                    </div>
                  </div>
                   <div className="flex items-center justify-between mt-6">
                        <div className="flex -space-x-2">
                           {[1, 2, 3].map(i => (
                               <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                   JD
                               </div>
                           ))}
                           <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">
                               +4
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                               <CheckCircle2 className="h-3.5 w-3.5" />
                               {project._count?.tasks || 0}
                           </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
