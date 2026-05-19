import { useEffect, useState } from 'react';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
  }, []);

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error('Mot de passe trop court (6 caractères min)'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error('Erreur: ' + error.message);
    else { toast.success('Mot de passe mis à jour'); setNewPassword(''); }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-lg">
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <div className="bg-[#1E293B] rounded-xl border border-slate-700 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><User className="w-5 h-5 text-orange-400" />Mon compte</h2>
          <div>
            <Label className="text-slate-300 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />Email</Label>
            <Input value={email} disabled className="bg-slate-800 border-slate-600 text-slate-400 mt-1" />
          </div>
          <div>
            <Label className="text-slate-300 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" />Nouveau mot de passe</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-slate-800 border-slate-600 text-white mt-1" placeholder="••••••••" />
          </div>
          <Button onClick={handleUpdatePassword} disabled={loading || !newPassword} className="bg-orange-500 hover:bg-orange-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Mettre à jour
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
