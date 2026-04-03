import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/api';
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
  AlertCircle,
  Key,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'overview' | 'profile' | 'security' | 'organization' | 'notifications';

const SettingItem = ({ icon: Icon, label, description, onClick, rightElement }: any) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer group rounded-3xl border border-transparent hover:border-slate-100"
  >
    <div className="flex items-center gap-6">
      <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 group-hover:text-primary-600 transition-colors">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-extrabold text-slate-900">{label}</p>
        <p className="text-sm text-slate-500 font-medium">{description}</p>
      </div>
    </div>
    {rightElement || <ChevronRight className="h-5 w-5 text-slate-300 group-hover:translate-x-1 transition-transform" />}
  </div>
);

export default function Settings() {
  const { user, setUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [status, setStatus] = useState<{ type: 'loading' | 'success' | 'error' | 'idle', message?: string }>({ type: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const orgForm = useForm({
    defaultValues: {
      name: user?.organization?.name || '',
    }
  });

  const [notifications, setNotifications] = useState({
    tasks: user?.preferences?.notifications?.tasks ?? true,
    projects: user?.preferences?.notifications?.projects ?? true,
    team: user?.preferences?.notifications?.team ?? true,
    reports: user?.preferences?.notifications?.reports ?? true,
  });

  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');

  const onUpdateProfile = async (data: any) => {
    setStatus({ type: 'loading' });
    try {
      const response = await api.patch('/users/me', data);
      setUser(response.data);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setStatus({ type: 'idle' }), 3000);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Update failed' });
    }
  };

  const onChangePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
        setStatus({ type: 'error', message: 'Passwords do not match' });
        return;
    }
    setStatus({ type: 'loading' });
    try {
      await api.post('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      setStatus({ type: 'success', message: 'Password changed successfully!' });
      passwordForm.reset();
      setTimeout(() => setStatus({ type: 'idle' }), 3000);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to change password' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus({ type: 'loading', message: 'Uploading avatar...' });
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(response.data);
      setStatus({ type: 'success', message: 'Avatar updated!' });
      setTimeout(() => setStatus({ type: 'idle' }), 3000);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setStatus({ type: 'error', message: 'Upload failed' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-1 font-medium text-lg">Manage your identity and organization parameters.</p>
        </div>
        {activeTab !== 'overview' && (
            <button 
                onClick={() => { setActiveTab('overview'); setStatus({ type: 'idle' }); }}
                className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>
        )}
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
        {status.type !== 'idle' && (
            <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ${status.type === 'loading' ? 'bg-primary-500 animate-pulse' : status.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-10"
            >
              <div className="flex flex-col items-center">
                  <div className="relative group">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 overflow-hidden border-4 border-white shadow-2xl relative">
                          {user?.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white bg-gradient-to-br from-primary-500 to-purple-600">
                                  {user?.name.charAt(0)}
                              </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="h-8 w-8 text-white" />
                          </div>
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-3 bg-white hover:bg-slate-50 rounded-2xl shadow-lg border border-slate-100 text-primary-600 transition-all active:scale-95 z-10"
                      >
                          <Camera className="h-5 w-5" />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarUpload} 
                        className="hidden" 
                        accept="image/*" 
                      />
                  </div>
                  <div className="text-center mt-6">
                    <h2 className="text-3xl font-black text-slate-900">{user?.name}</h2>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="text-slate-500 font-bold">{user?.email}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-primary-600 font-black uppercase tracking-widest text-[10px] bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">{user?.role}</span>
                    </div>
                  </div>
              </div>

              <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-6 mb-4">Account Preferences</h3>
                    <div className="grid grid-cols-1 gap-2">
                        <SettingItem 
                            icon={User} 
                            label="Personal Information" 
                            description="Name, email, and discovery settings" 
                            onClick={() => setActiveTab('profile')}
                        />
                        <SettingItem 
                            icon={Lock} 
                            label="Password & Security" 
                            description="Keep your account safe and updated" 
                            onClick={() => setActiveTab('security')}
                        />
                        <SettingItem 
                            icon={Bell} 
                            label="Notifications" 
                            description="Configure system and email alerts" 
                            onClick={() => setActiveTab('notifications')}
                        />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-6 mb-4">Workspace</h3>
                    <div className="grid grid-cols-1 gap-2">
                        <SettingItem 
                            icon={Building2} 
                            label="Organization Control" 
                            description="Management and billing parameters" 
                            onClick={() => setActiveTab('organization')}
                        />
                        <SettingItem 
                            icon={Globe} 
                            label="Locale & Access" 
                            description="Language, timezone and regional settings" 
                            onClick={() => setActiveTab('locale')}
                        />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                        onClick={() => logout()}
                        className="w-full flex items-center justify-between p-6 bg-rose-50/50 hover:bg-rose-50 rounded-3xl group border border-rose-100 transition-all active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-6">
                            <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                <LogOut className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <p className="font-extrabold text-slate-900">Sign Out</p>
                                <p className="text-sm text-slate-500 font-medium">Terminate current session</p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-rose-300" />
                    </button>
                  </div>
              </div>
            </motion.div>
          ) : activeTab === 'profile' ? (
            <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-primary-100 rounded-3xl text-primary-600">
                        <User className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Personal Information</h2>
                        <p className="text-slate-500 font-medium">Update your identity across the platform.</p>
                    </div>
                </div>

                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">Display Name</label>
                            <input 
                                {...profileForm.register('name', { required: 'Name is required' })}
                                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-slate-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="Your full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">Email Address</label>
                            <input 
                                {...profileForm.register('email', { required: 'Email is required' })}
                                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-slate-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="Email address"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        {status.type === 'success' && (
                            <div className="flex items-center gap-2 text-emerald-600 font-bold animate-in slide-in-from-left-4">
                                <CheckCircle2 className="h-5 w-5" />
                                {status.message}
                            </div>
                        )}
                        {status.type === 'error' && (
                            <div className="flex items-center gap-2 text-rose-600 font-bold animate-in slide-in-from-left-4">
                                <AlertCircle className="h-5 w-5" />
                                {status.message}
                            </div>
                        )}
                        <div />
                        <button 
                            type="submit"
                            disabled={status.type === 'loading'}
                            className="flex items-center gap-3 px-10 py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {status.type === 'loading' ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                            Save Updates
                        </button>
                    </div>
                </form>
            </motion.div>
          ) : activeTab === 'security' ? (
            <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-amber-100 rounded-3xl text-amber-600">
                        <Key className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Security Credentials</h2>
                        <p className="text-slate-500 font-medium">Manage your password and authentication methods.</p>
                    </div>
                </div>

                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">Current Password</label>
                            <input 
                                type="password"
                                {...passwordForm.register('currentPassword', { required: 'Field required' })}
                                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">New Password</label>
                                <input 
                                    type="password"
                                    {...passwordForm.register('newPassword', { required: 'Field required', minLength: 8 })}
                                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">Confirm New Password</label>
                                <input 
                                    type="password"
                                    {...passwordForm.register('confirmPassword', { required: 'Field required' })}
                                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div />
                        <button 
                            type="submit"
                            disabled={status.type === 'loading'}
                            className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                        >
                            Update Security
                        </button>
                    </div>
                </form>
            </motion.div>
          ) : activeTab === 'organization' ? (
            <motion.div
                key="organization"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-primary-100 rounded-3xl text-primary-600">
                        <Building2 className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Organization Control</h2>
                        <p className="text-slate-500 font-medium">Manage your workspace identity and subscription tier.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Current Tier</p>
                        <p className="text-2xl font-black text-primary-600 uppercase tracking-tight">{user?.organization?.plan || 'Free'}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Creation Date</p>
                        <p className="text-xl font-black text-slate-900">{new Date(user?.organization?.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-2 text-white">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Billing Cycle</p>
                        <p className="text-xl font-black">Monthly Renew</p>
                    </div>
                </div>

                <form onSubmit={orgForm.handleSubmit(async (data) => {
                    setStatus({ type: 'loading' });
                    try {
                        const response = await api.patch('/users/organization', data);
                        setUser({ ...user!, organization: response.data });
                        setStatus({ type: 'success', message: 'Organization updated!' });
                        setTimeout(() => setStatus({ type: 'idle' }), 3000);
                    } catch (err: any) {
                        setStatus({ type: 'error', message: 'Failed to update organization' });
                    }
                })} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">Organization Name</label>
                        <input 
                            {...orgForm.register('name', { required: 'Name is required' })}
                            className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-slate-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
                            placeholder="Org Name"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div />
                        <button 
                            type="submit"
                            disabled={status.type === 'loading'}
                            className="flex items-center gap-3 px-10 py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Update Workspace
                        </button>
                    </div>
                </form>
            </motion.div>
          ) : activeTab === 'notifications' ? (
            <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 bg-primary-100 rounded-3xl text-primary-600">
                        <Bell className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Notifications</h2>
                        <p className="text-slate-500 font-medium">Manage how you receive alerts and reports.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { id: 'tasks', label: 'Task Assignments', desc: 'Notify when I am assigned to a new task' },
                        { id: 'projects', label: 'Project Updates', desc: 'Notify when a project I am in is updated' },
                        { id: 'team', label: 'Team Invitations', desc: 'Notify when I am invited to a team' },
                        { id: 'reports', label: 'Weekly Reports', desc: 'Send automated performance summaries' },
                    ].map((pref) => (
                        <div key={pref.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div>
                                <p className="font-extrabold text-slate-900 uppercase text-[11px] tracking-widest mb-1">{pref.label}</p>
                                <p className="text-xs text-slate-500 font-medium">{pref.desc}</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={(notifications as any)[pref.id]} 
                                    onChange={(e) => setNotifications({ ...notifications, [pref.id]: e.target.checked })}
                                />
                                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div />
                    <button 
                        onClick={async () => {
                            setStatus({ type: 'loading' });
                            try {
                                await api.patch('/users/me', { preferences: { notifications } });
                                setUser({ ...user!, preferences: { ...user!.preferences, notifications } });
                                setStatus({ type: 'success', message: 'Preferences saved!' });
                                setTimeout(() => setStatus({ type: 'idle' }), 3000);
                            } catch (err) {
                                setStatus({ type: 'error', message: 'Failed to save preferences' });
                            }
                        }}
                        className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95"
                    >
                        Save Preferences
                    </button>
                </div>
            </motion.div>
          ) : activeTab === 'locale' ? (
            <motion.div
                key="locale"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-indigo-100 rounded-3xl text-indigo-600">
                        <Globe className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Locale & Access</h2>
                        <p className="text-slate-500 font-medium">Configure your regional and display preferences.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">Timezone</label>
                        <select 
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        >
                            <option value="UTC">UTC (Coordinated Universal Time)</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="Europe/London">London (GMT/BST)</option>
                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                            <option value="Asia/Dubai">Dubai (GST)</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div />
                    <button 
                        onClick={async () => {
                            setStatus({ type: 'loading' });
                            try {
                                await api.patch('/users/me', { timezone });
                                setUser({ ...user!, timezone });
                                setStatus({ type: 'success', message: 'Locale updated!' });
                                setTimeout(() => setStatus({ type: 'idle' }), 3000);
                            } catch (err) {
                                setStatus({ type: 'error', message: 'Failed to update locale' });
                            }
                        }}
                        className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        Save Locale
                    </button>
                </div>
            </motion.div>
          ) : (
              <div className="py-20 text-center space-y-4">
                  <div className="p-6 bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                      <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
                  </div>
                  <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Module coming soon...</p>
                  <button onClick={() => setActiveTab('overview')} className="text-primary-600 font-bold">Return to Settings</button>
              </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
