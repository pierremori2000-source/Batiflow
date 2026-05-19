import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, HardHat, MapPin, Calendar as CalendarIcon, Phone, Mail, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { supabase } from '@/lib/supabase';

interface Client { id: string; name: string; email: string; phone: string; address: string; }
interface Chantier { id: string; name: string; description: string; address: string; status: string; start_date: string; end_date: string; }

const statusColors: Record<string, string> = {
  en_cours: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  en_pause: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  termine: 'bg-green-500/20 text-green-400 border-green-500/30',
};
const statusLabels: Record<string, string> = { en_cours: 'En cours', en_pause: 'En pause', termine: 'Terminé' };

const ClientDetail = () => {
  const { clientName } = useParams<{ clientName: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newChantier, setNewChantier] = useState({ name: '', description: '', address: '', start_date: '', end_date: '' });

  useEffect(() => { loadData(); }, [clientName]);

  const loadData = async () => {
    setLoading(true);
    // clientName param is actually the UUID now
    const clientId = clientName;
    const { data: clientData } = await supabase.from('clients').select('*').eq('id', clientId).single();
    setClient(clientData);
    const { data: chantierData } = await supabase.from('chantiers').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
    setChantiers(chantierData || []);
    setLoading(false);
  };

  const handleCreateChantier = async () => {
    if (!newChantier.name.trim() || !client) return;
    setCreating(true);
    try {
      const { error } = await supabase.from('chantiers').insert({
        name: newChantier.name,
        description: newChantier.description || null,
        address: newChantier.address || null,
        start_date: newChantier.start_date || null,
        end_date: newChantier.end_date || null,
        client_id: client.id,
        status: 'en_cours',
      });
      if (error) throw error;
      toast.success('Chantier créé !');
      setDialogOpen(false);
      setNewChantier({ name: '', description: '', address: '', start_date: '', end_date: '' });
      loadData();
    } catch { toast.error('Erreur lors de la création'); }
    finally { setCreating(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Clients', href: '/clients' }, { label: client?.name || '...' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{client?.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {client?.email && <span className="flex items-center gap-1.5 text-slate-400 text-sm"><Mail className="w-3.5 h-3.5" />{client.email}</span>}
              {client?.phone && <span className="flex items-center gap-1.5 text-slate-400 text-sm"><Phone className="w-3.5 h-3.5" />{client.phone}</span>}
              {client?.address && <span className="flex items-center gap-1.5 text-slate-400 text-sm"><Home className="w-3.5 h-3.5" />{client.address}</span>}
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-2" />Nouveau chantier</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1E293B] border-slate-700 text-white">
              <DialogHeader><DialogTitle>Nouveau chantier pour {client?.name}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label className="text-slate-300">Nom du chantier *</Label>
                  <Input value={newChantier.name} onChange={(e) => setNewChantier({ ...newChantier, name: e.target.value })} className="bg-slate-800 border-slate-600 text-white" placeholder="Ex: Rénovation cuisine" /></div>
                <div><Label className="text-slate-300">Description</Label>
                  <Textarea value={newChantier.description} onChange={(e) => setNewChantier({ ...newChantier, description: e.target.value })} className="bg-slate-800 border-slate-600 text-white" placeholder="Description..." /></div>
                <div><Label className="text-slate-300">Adresse</Label>
                  <Input value={newChantier.address} onChange={(e) => setNewChantier({ ...newChantier, address: e.target.value })} className="bg-slate-800 border-slate-600 text-white" placeholder="Adresse du chantier" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-slate-300">Date début</Label>
                    <Input type="date" value={newChantier.start_date} onChange={(e) => setNewChantier({ ...newChantier, start_date: e.target.value })} className="bg-slate-800 border-slate-600 text-white" /></div>
                  <div><Label className="text-slate-300">Date fin</Label>
                    <Input type="date" value={newChantier.end_date} onChange={(e) => setNewChantier({ ...newChantier, end_date: e.target.value })} className="bg-slate-800 border-slate-600 text-white" /></div>
                </div>
                <Button onClick={handleCreateChantier} disabled={creating || !newChantier.name.trim()} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  {creating ? 'Création...' : 'Créer le chantier'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Badge variant="outline" className="border-slate-600 text-slate-300 px-3 py-1">
          <HardHat className="w-4 h-4 mr-2" />{chantiers.length} chantier{chantiers.length !== 1 ? 's' : ''}
        </Badge>

        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" /></div>
        ) : chantiers.length === 0 ? (
          <div className="bg-[#1E293B] rounded-xl border border-slate-700 p-12 text-center">
            <HardHat className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucun chantier pour ce client</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chantiers.map((ch) => (
              <div key={ch.id} onClick={() => navigate(`/chantier/${ch.id}`)}
                className="bg-[#1E293B] rounded-xl border border-slate-700 p-5 cursor-pointer hover:border-orange-500/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold">{ch.name}</h3>
                  <Badge variant="outline" className={statusColors[ch.status]}>{statusLabels[ch.status] || ch.status}</Badge>
                </div>
                {ch.address && <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><MapPin className="w-3.5 h-3.5" />{ch.address}</div>}
                {(ch.start_date || ch.end_date) && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs mt-3">
                    <CalendarIcon className="w-3.5 h-3.5" />{ch.start_date || '—'} → {ch.end_date || '—'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientDetail;
