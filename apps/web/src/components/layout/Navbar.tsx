import React from 'react';
import { useAuthStore } from '../../store/auth.store';
import { Bell, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="relative w-96 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all border"
          placeholder="Search tasks, teams, projects..."
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-100 mx-2"></div>

        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-slate-700 hidden md:block">
            {user?.name}
          </p>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
