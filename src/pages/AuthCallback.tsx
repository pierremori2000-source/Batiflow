import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
const AuthCallback = () => {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      navigate(session ? '/dashboard' : '/');
    });
  }, []);
  return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" /></div>;
};
export default AuthCallback;
