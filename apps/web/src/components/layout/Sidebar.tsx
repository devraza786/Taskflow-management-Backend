import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Settings, 
  BarChart3, 
  FolderKanban,
  Layout,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: Users, label: 'Team', path: '/team', roles: ['admin', 'manager', 'team_head'] },
  { icon: BarChart3, label: 'Reporting', path: '/reports', roles: ['admin', 'manager'] },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:h-screen lg:sticky lg:top-0
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-200">
              <Layout className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">TaskFlow</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 lg:hidden rounded-xl hover:bg-slate-50 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            if (item.roles && !item.roles.includes(user?.role || '')) return null;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
