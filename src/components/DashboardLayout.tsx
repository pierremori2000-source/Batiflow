import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Menu, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from './Sidebar';
import client from '@/lib/client';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await client.auth.me();
        if (!user?.data) {
          navigate('/');
        } else {
          setUserEmail(user.data.email || '');
        }
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    loadNotificationCount();
  }, []);

  const loadNotificationCount = async () => {
    try {
      const res = await client.entities.notifications?.query?.({ query: { read: false } });
      setNotificationCount(res?.data?.items?.length || 0);
    } catch {
      setNotificationCount(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-700 flex items-center justify-between px-4 md:px-6">
          {/* Left: hamburger on mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/clients')}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white hidden sm:flex"
            >
              <Plus className="w-4 h-4 mr-1" />
              Nouveau chantier
            </Button>
            <Button
              onClick={() => navigate('/clients')}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white sm:hidden"
            >
              <Plus className="w-4 h-4" />
            </Button>

            {/* Notification bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative text-slate-400 hover:text-white p-2"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-300" />
              </div>
              {userEmail && (
                <span className="text-slate-400 text-sm hidden lg:block max-w-[180px] truncate">
                  {userEmail}
                </span>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;