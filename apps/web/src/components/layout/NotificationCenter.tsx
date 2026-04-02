import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from '../../utils/date';

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all relative ${
          isOpen ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'
        }`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">{unreadCount} unread messages</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-900">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No new notifications at the moment.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!notification.isRead ? 'bg-primary-50/30' : ''}`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full"></div>
                    )}
                    <div className="flex gap-3">
                      <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                        notification.type === 'TASK_ASSIGNED' ? 'bg-blue-100 text-blue-600' :
                        notification.type === 'PROJECT_UPDATE' ? 'bg-purple-100 text-purple-600' :
                        notification.type === 'TEAM_INVITE' ? 'bg-orange-100 text-orange-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.isRead ? 'text-slate-600' : 'text-slate-900 font-bold'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {notification.body}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                          {formatDistanceToNow(new Date(notification.createdAt))}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-green-600 hover:border-green-100 transition-all shadow-sm"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                        <button 
                          className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm"
                          title="View details"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button 
                className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
