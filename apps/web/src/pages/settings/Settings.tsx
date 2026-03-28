import { useAuthStore } from '../../store/auth.store';
import { 
  User, 
  Building2, 
  Shield, 
  Bell, 
  Globe, 
  LogOut,
  ChevronRight,
  Camera
} from 'lucide-react';

const SettingItem = ({ icon: Icon, label, description, rightElement }: any) => (
  <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer group rounded-3xl">
    <div className="flex items-center gap-6">
      <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 group-hover:text-primary-600 transition-colors">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-extrabold text-slate-900">{label}</p>
        <p className="text-sm text-slate-500 font-medium">{description}</p>
      </div>
    </div>
    {rightElement || <ChevronRight className="h-5 w-5 text-slate-300" />}
  </div>
);

export default function Settings() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1 font-medium">Manage your profile, organization, and preferences.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col items-center mb-10">
            <div className="relative">
                <div className="w-32 h-32 rounded-[2.5rem] bg-primary-100 flex items-center justify-center text-4xl font-extrabold text-primary-700 border-4 border-white shadow-xl shadow-primary-200/50">
                    {user?.name.charAt(0)}
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-white hover:bg-slate-50 rounded-2xl shadow-lg border border-slate-100 text-primary-600 transition-all active:scale-95">
                    <Camera className="h-5 w-5" />
                </button>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-6">{user?.name}</h2>
            <p className="text-slate-500 font-medium capitalize mt-1 px-4 py-1.5 bg-slate-100 rounded-full text-xs font-bold leading-none">{user?.role}</p>
        </div>

        <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-6">Account</h3>
            <div className="space-y-1">
                <SettingItem 
                    icon={User} 
                    label="Personal Information" 
                    description="Update your name, email, and profile details." 
                />
                <SettingItem 
                    icon={Shield} 
                    label="Security" 
                    description="Change your password and manage 2FA settings." 
                />
                <SettingItem 
                    icon={Bell} 
                    label="Notifications" 
                    description="Choose what alerts you want to receive." 
                />
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-6">Organization</h3>
                <div className="space-y-1">
                    <SettingItem 
                        icon={Building2} 
                        label="Organization Settings" 
                        description="Manage logo, branding, and billing profile." 
                    />
                    <SettingItem 
                        icon={Globe} 
                        label="Language & Region" 
                        description="Set your preferred language and timezone." 
                    />
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50">
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center gap-4 p-6 hover:bg-rose-50 rounded-3xl group transition-all"
                >
                    <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                        <LogOut className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                        <p className="font-extrabold text-slate-900 group-hover:text-rose-600">Sign Out</p>
                        <p className="text-sm text-slate-500 font-medium group-hover:text-rose-400">Safely log out of your account.</p>
                    </div>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
