import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuthStore } from '../../store/auth.store';
import { 
  User, 
  Building2, 
  Shield, 
  Bell, 
  Globe, 
  LogOut,
  ChevronRight,
  Camera,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle
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
  const setUser = useAuthStore((state) => state.setUser);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [activeTab, setActiveTab] = useState<'overview' | 'profile'>('overview');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  });

  const onUpdateProfile = async (data: any) => {
    setUpdateStatus('loading');
    try {
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/users/me`, data, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.data.status === 'success') {
        setUser(response.data.data.user);
        setUpdateStatus('success');
        setTimeout(() => {
          setUpdateStatus('idle');
          setActiveTab('overview');
        }, 2000);
      }
    } catch (error) {
      console.error('Update failed:', error);
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    }
  };

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
            <div className="flex items-center justify-between px-6">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Account</h3>
                {activeTab === 'profile' && (
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700"
                    >
                        Back to Overview
                    </button>
                )}
            </div>
            <div className="space-y-1">
                {activeTab === 'overview' ? (
                    <>
                        <div onClick={() => setActiveTab('profile')}>
                            <SettingItem 
                                icon={User} 
                                label="Personal Information" 
                                description="Update your name, email, and profile details." 
                            />
                        </div>
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
                    </>
                ) : (
                    <form onSubmit={handleSubmit(onUpdateProfile)} className="p-6 space-y-6 bg-slate-50/50 rounded-3xl border border-slate-100 mx-6 animate-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 px-1">Full Name</label>
                                <input 
                                    {...register('name', { required: 'Name is required' })}
                                    className="w-full h-12 bg-white border border-slate-200 rounded-2xl px-4 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Enter your name"
                                />
                                {errors.name && <p className="text-xs text-rose-500 font-bold px-1">{errors.name.message as string}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 px-1">Email Address</label>
                                <input 
                                    {...register('email', { 
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    className="w-full h-12 bg-white border border-slate-200 rounded-2xl px-4 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Enter your email"
                                />
                                {errors.email && <p className="text-xs text-rose-500 font-bold px-1">{errors.email.message as string}</p>}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            {updateStatus === 'success' && (
                                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Profile updated successfully!
                                </div>
                            )}
                            {updateStatus === 'error' && (
                                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                                    <AlertCircle className="h-4 w-4" />
                                    Failed to update profile.
                                </div>
                            )}
                            <button 
                                type="submit"
                                disabled={updateStatus === 'loading'}
                                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white font-extrabold rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-95"
                            >
                                {updateStatus === 'loading' ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Save className="h-5 w-5" />
                                )}
                                {updateStatus === 'loading' ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
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
