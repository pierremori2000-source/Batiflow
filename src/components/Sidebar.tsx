import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, Users, Bell, Settings, LogOut, HardHat, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeChantierCount, setActiveChantierCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const { data } = await supabase.from('chantiers').select('status');
      const active = (data || []).filter((ch) => ch.status === 'en_cours').length;
      setActiveChantierCount(active);
    } catch { /* ignore */ }
    try {
      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('read', false);
      setNotificationCount(count || 0);
    } catch { setNotificationCount(0); }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Tableau de bord', badge: null },
    { to: '/chantiers', icon: <HardHat className="w-5 h-5" />, label: 'Chantiers', badge: activeChantierCount > 0 ? activeChantierCount : null },
    { to: '/calendar', icon: <Calendar className="w-5 h-5" />, label: 'Calendrier', badge: null },
    { to: '/documents', icon: <FileText className="w-5 h-5" />, label: 'Documents', badge: null },
    { to: '/clients', icon: <Users className="w-5 h-5" />, label: 'Clients', badge: null },
    { to: '/notifications', icon: <Bell className="w-5 h-5" />, label: 'Notifications', badge: notificationCount > 0 ? notificationCount : null, isNotification: true },
    { to: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Paramètres', badge: null },
  ];

  const sidebarContent = (
    <aside className="w-64 bg-[#1E293B] border-r border-slate-700 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Batiflow</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-orange-500/10 text-orange-500' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {item.label}
            </div>
            {item.badge !== null && (
              <span className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold px-1.5 ${
                'isNotification' in item && item.isNotification ? 'bg-red-500 text-white' : 'bg-orange-500/20 text-orange-400'
              }`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );

  if (typeof isOpen !== 'undefined') {
    return (
      <>
        <div className="hidden md:block">{sidebarContent}</div>
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
            <div className="fixed inset-y-0 left-0 z-50 md:hidden">{sidebarContent}</div>
          </>
        )}
      </>
    );
  }

  return sidebarContent;
};

export default Sidebar;
