import React, { useState } from 'react';
import { X, Users, MessageSquare, Info } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/teams', { name, description });
      toast.success('Team created successfully');
      onSuccess();
      onClose();
      setName('');
      setDescription('');
    } catch (error) {
      toast.error('Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create New Team</h2>
                <p className="text-slate-500 text-sm font-medium">Build a powerhouse for your projects.</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-widest pl-1">Team Name</label>
              <div className="relative group">
                 <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary-500 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-400 group-hover:bg-slate-100/50"
                  placeholder="e.g. Frontend Avengers"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-widest pl-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary-500 transition-all outline-none font-bold text-slate-900 placeholder:text-slate-400 min-h-[120px] resize-none"
                placeholder="What focus area does this team have?"
              />
            </div>

            <div className="bg-primary-50/50 p-4 rounded-2xl flex gap-3 text-primary-700 border border-primary-100/50">
                <Info className="h-5 w-5 shrink-0" />
                <p className="text-xs font-bold leading-relaxed">
                    Once created, you can add members and assign departments from the team dashboard.
                </p>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-3 px-12 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Team
                    <Plus className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { Plus } from 'lucide-react';
