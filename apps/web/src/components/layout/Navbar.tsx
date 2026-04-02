import { useAuthStore } from '../../store/auth.store';
import { Search, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl lg:hidden transition-all"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="relative w-64 md:w-96 group hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all border"
            placeholder="Search tasks..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <NotificationCenter />

        
        <div className="h-8 w-px bg-slate-100 mx-1 md:mx-2"></div>

        <div className="flex items-center gap-2 md:gap-3">
          <p className="text-sm font-semibold text-slate-700 hidden lg:block">
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
