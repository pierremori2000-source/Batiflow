import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, HardHat, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  chantier_count?: number;
}

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*, chantiers(count)')
      .order('name');
    if (error) { toast.error('Erreur de chargement'); return; }
    const mapped = (data || []).map((c) => ({
      ...c,
      chantier_count: c.chantiers?.[0]?.count || 0,
    }));
    setClients(mapped);
  };

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) return;
    setCreating(true);
    try {
      const { error } = await supabase.from('clients').insert({
        name: newClient.name.trim(),
        email: newClient.email.trim() || null,
        phone: newClient.phone.trim() || null,
        address: newClient.address.trim() || null,
      });
      if (error) throw error;
      toast.success('Client créé avec succès');
      setDialogOpen(false);
      setNewClient({ name: '', email: '', phone: '', address: '' });
      loadData();
    } catch {
      toast.error('Erreur lors de la création du client');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{clients.length} client(s)</span>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Nouveau client
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1E293B] border-slate-700 text-white">
                <DialogHeader><DialogTitle>Nouveau client</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  {[
                    { label: 'Nom *', key: 'name', placeholder: 'Nom du client', type: 'text' },
                    { label: 'Email', key: 'email', placeholder: 'email@exemple.com', type: 'email' },
                    { label: 'Téléphone', key: 'phone', placeholder: '06 12 34 56 78', type: 'text' },
                    { label: 'Adresse', key: 'address', placeholder: 'Adresse du client', type: 'text' },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <Label className="text-slate-300">{label}</Label>
                      <Input
                        type={type}
                        value={newClient[key as keyof typeof newClient]}
                        onChange={(e) => setNewClient({ ...newClient, [key]: e.target.value })}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                  <Button onClick={handleCreateClient} disabled={creating || !newClient.name.trim()} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création...</> : 'Créer le client'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un client..."
            className="pl-10 bg-[#1E293B] border-slate-700 text-white placeholder:text-slate-500" />
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-slate-700">
          {filteredClients.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">{search ? 'Aucun client trouvé' : 'Aucun client pour le moment'}</p>
              <p className="text-slate-500 text-sm mt-1">{search ? 'Essayez un autre terme' : 'Cliquez sur "Nouveau client" pour commencer'}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <div className="col-span-3">Nom</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Téléphone</div>
                <div className="col-span-2">Chantiers</div>
                <div className="col-span-2">Action</div>
              </div>
              {filteredClients.map((c) => (
                <div key={c.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-700/30 transition-colors">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <span className="text-orange-400 text-sm font-bold">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-white font-medium text-sm">{c.name}</span>
                  </div>
                  <div className="col-span-3 text-slate-400 text-sm truncate">{c.email || '—'}</div>
                  <div className="col-span-2 text-slate-400 text-sm">{c.phone || '—'}</div>
                  <div className="col-span-2 flex items-center gap-1 text-slate-300 text-sm">
                    <HardHat className="w-4 h-4 text-slate-500" />{c.chantier_count}
                  </div>
                  <div className="col-span-2">
                    <button onClick={() => navigate(`/clients/${c.id}`)} className="text-xs text-orange-400 hover:text-orange-300 font-medium">
                      Voir détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
