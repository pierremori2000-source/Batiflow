import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { HardHat, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
      setChecking(false);
    });
  }, [navigate]);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Compte créé ! Vérifiez votre email pour confirmer.');
        setMode('login');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
            <HardHat className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-white">Batiflow</span>
        </div>

        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h2>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="bg-slate-800 border-slate-600 text-white mt-1"
                placeholder="vous@exemple.com"
              />
            </div>
            <div>
              <Label className="text-slate-300">Mot de passe</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="bg-slate-800 border-slate-600 text-white mt-1"
                placeholder="••••••••"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {mode === 'login' ? 'Se connecter' : 'Créer le compte'}
            </Button>
          </div>

          <p className="text-center text-slate-400 text-sm mt-6">
            {mode === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-orange-400 hover:text-orange-300 font-medium"
            >
              {mode === 'login' ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
