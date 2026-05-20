import { useState, useEffect, useCallback } from 'react';

import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Info,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
  is_read: boolean;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    // In a real app, fetch from notifications table
    setNotifications([
      {
        id: '1',
        title: 'Document Expiring Soon',
        message: 'Vehicle 1169 VXA Registration expires in 7 days.',
        type: 'warning',
        created_at: new Date().toISOString(),
        is_read: false
      },
      {
        id: '2',
        title: 'Critical: Insurance Expired',
        message: 'Vehicle 4422 RTL Insurance has expired. Trip blocked.',
        type: 'error',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        is_read: false
      },
      {
        id: '3',
        title: 'System Update',
        message: 'TMS Pro version 1.4.2 is now live with MacOS theme support.',
        type: 'info',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        is_read: true
      }
    ]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Bell className="text-blue-600" size={32} />
            Notification Center
          </h1>
          <p className="text-slate-500">Stay updated on fleet compliance and system alerts.</p>
        </div>
        <Button variant="outline" className="rounded-2xl">Mark all as read</Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-slate-50 rounded-[28px] animate-pulse" />
          ))
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <Bell size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No new notifications.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              className={cn(
                "p-6 rounded-[32px] border-2 transition-all flex items-start gap-5",
                notif.is_read ? "bg-white border-slate-100 opacity-60" : "bg-white border-blue-100 shadow-lg shadow-blue-500/5"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                notif.type === 'warning' ? "bg-amber-50 text-amber-500" :
                notif.type === 'error' ? "bg-rose-50 text-rose-500" :
                notif.type === 'success' ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
              )}>
                {notif.type === 'warning' ? <AlertTriangle size={24} /> :
                 notif.type === 'error' ? <XCircle size={24} /> :
                 notif.type === 'success' ? <CheckCircle2 size={24} /> : <Info size={24} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{notif.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={18} />
                  </button>
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {new Date(notif.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    Expiry Alert
                  </div>
                  {!notif.is_read && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      NEW
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
