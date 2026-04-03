import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Table as TableIcon, 
  FileJson, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layout
} from 'lucide-react';
import api from '../../lib/api';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate?: string;
  endDate?: string;
}

export default function ReportPreviewModal({ isOpen, onClose, startDate, endDate }: ReportPreviewModalProps) {
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPreview();
    }
  }, [isOpen, startDate, endDate]);

  const fetchPreview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/exports/preview', {
        params: { startDate, endDate }
      });
      setPreviewData(response.data);
    } catch (err: any) {
      setError('Failed to load report preview');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    setIsExporting(format);
    try {
      const response = await api.get('/exports/generate', {
        params: { startDate, endDate, format },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `taskflow-report-${new Date().getTime()}.${format === 'xlsx' ? 'xlsx' : format === 'docx' ? 'docx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh]"
      >
        {/* Left Side: Preview Sidebar */}
        <div className="w-full md:w-80 bg-slate-50 p-8 border-r border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200">
               <Layout className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Report Export</h2>
          </div>

          <div className="space-y-4 flex-1">
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Select Format</p>
             
             {[
               { id: 'pdf', label: 'PDF Document', icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
               { id: 'xlsx', label: 'Excel Spreadsheet', icon: TableIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
               { id: 'csv', label: 'CSV File', icon: FileJson, color: 'text-blue-500', bg: 'bg-blue-50' },
               { id: 'docx', label: 'Word Document', icon: Download, color: 'text-indigo-500', bg: 'bg-indigo-50' },
             ].map((format) => (
               <button
                 key={format.id}
                 onClick={() => handleExport(format.id)}
                 disabled={isExporting !== null || isLoading}
                 className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all active:scale-95 group disabled:opacity-50"
               >
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${format.bg} ${format.color}`}>
                       <format.icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-700">{format.label}</span>
                 </div>
                 {isExporting === format.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                 ) : (
                    <Download className="h-4 w-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                 )}
               </button>
             ))}
          </div>

          <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-8">
            Reports generated aggregate data across projects, teams, and individual performance for the selected date range.
          </p>
        </div>

        {/* Right Side: Main Preview Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-white relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="h-6 w-6 text-slate-400" />
          </button>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
               <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
               <p className="font-bold text-slate-500 animate-pulse">Analyzing organizational data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
               <AlertCircle className="h-12 w-12 text-red-500" />
               <p className="font-bold text-slate-700">{error}</p>
               <button onClick={fetchPreview} className="text-primary-600 font-black text-sm uppercase">Try Again</button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="mb-10">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Report Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <p className="text-slate-500 text-xs font-black uppercase mb-1">Status</p>
                        <div className="flex items-center gap-2">
                           <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                           <span className="text-lg font-black text-slate-900">Finalized Report</span>
                        </div>
                     </div>
                     <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <p className="text-slate-500 text-xs font-black uppercase mb-1">Generated Range</p>
                        <div className="flex items-center gap-2">
                           <Clock className="h-4 w-4 text-amber-500" />
                           <span className="text-lg font-black text-slate-900">{startDate && endDate ? `${startDate} to ${endDate}` : 'All Time'}</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Key KPI Performance</h3>
                  <div className="bg-primary-900 text-white p-8 rounded-[2rem] shadow-xl shadow-primary-900/20 flex items-center justify-between">
                     <div>
                        <p className="text-primary-300 text-xs font-black uppercase mb-1">Completion Rate</p>
                        <h4 className="text-4xl font-black">{previewData?.metrics?.completionRate}%</h4>
                     </div>
                     <div className="text-right">
                        <p className="text-primary-300 text-xs font-black uppercase mb-1">Total Impact</p>
                        <h4 className="text-xl font-bold">{previewData?.metrics?.completed} Completed Tasks</h4>
                     </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                     {[
                        { label: 'Avg Cycle Time', value: `${previewData?.metrics?.avgDays}d`, icon: Clock },
                        { label: 'Project Count', value: previewData?.projects?.length, icon: Layout },
                        { label: 'Teams Tracked', value: previewData?.teams?.length, icon: CheckCircle2 },
                     ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-slate-100 flex flex-col gap-1">
                           <p className="text-slate-400 text-[10px] font-black uppercase">{stat.label}</p>
                           <p className="text-lg font-black text-slate-900">{stat.value}</p>
                        </div>
                     ))}
                  </div>

                  <div>
                     <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Detailed Breakdown</h3>
                     <div className="space-y-3">
                        {previewData?.projects?.slice(0, 4).map((p: any, i: number) => (
                           <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                              <span className="font-bold text-slate-700">{p.name}</span>
                              <div className="flex items-center gap-4">
                                 <span className="text-xs font-black text-slate-400 uppercase">TASKS: {p._count.tasks}</span>
                                 <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                                    {p.status}
                                 </span>
                              </div>
                           </div>
                        ))}
                        {previewData?.projects?.length > 4 && (
                           <p className="text-center text-xs font-bold text-slate-400 py-2">...and {previewData.projects.length - 4} more projects</p>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
