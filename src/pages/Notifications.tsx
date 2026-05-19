import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';

interface Notification { id: string; title: string; message: string; type: string; read: boolean; created_at: string; }

const typeColors: Record<string, string> = {
  info: 'bg-blue-500', warning: 'bg-yellow-500', success: 'bg-green-500', error: 'bg-red-500',
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    setNotifications(data || []);
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    load();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Notifications {unreadCount > 0 && <span className="text-sm font-normal text-slate-400 ml-2">({unreadCount} non lues)</span>}</h1>
          {unreadCount > 0 && (
            <Button onClick={markAllRead} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <CheckCheck className="w-4 h-4 mr-2" />Tout marquer comme lu
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="bg-[#1E293B] rounded-xl border border-slate-700 p-12 text-center">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune notification</p>
          </div>
        ) : (
          <div className="bg-[#1E293B] rounded-xl border border-slate-700 divide-y divide-slate-700">
            {notifications.map((n) => (
              <div key={n.id} className={`p-4 flex items-start gap-3 ${!n.read ? 'bg-orange-500/5' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${typeColors[n.type] || typeColors.info}`} />
                <div className="flex-1">
                  <p className={`font-medium text-sm ${n.read ? 'text-slate-300' : 'text-white'}`}>{n.title}</p>
                  {n.message && <p className="text-slate-400 text-sm mt-0.5">{n.message}</p>}
                  <p className="text-slate-600 text-xs mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-2" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
