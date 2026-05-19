import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, Search, LayoutGrid, List, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';

interface Chantier { id: string; name: string; address: string; status: string; start_date: string; end_date: string; clients?: { name: string }; }

const statusColors: Record<string, string> = {
  en_cours: 'bg-green-500/20 text-green-400 border-green-500/30',
  en_pause: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  termine: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};
const statusLabels: Record<string, string> = { en_cours: 'En cours', en_pause: 'En pause', termine: 'Terminé' };

const Chantiers = () => {
  const navigate = useNavigate();
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    supabase.from('chantiers').select('*, clients(name)').order('created_at', { ascending: false })
      .then(({ data }) => { setChantiers(data || []); setLoading(false); });
  }, []);

  const filtered = useMemo(() => chantiers.filter((ch) => {
    const q = search.toLowerCase();
    const matchSearch = !q || ch.name?.toLowerCase().includes(q) || ch.address?.toLowerCase().includes(q) || ch.clients?.name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || ch.status === statusFilter;
    return matchSearch && matchStatus;
  }), [chantiers, search, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Chantiers</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'text-orange-500' : 'text-slate-400'}><LayoutGrid className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'text-orange-500' : 'text-slate-400'}><List className="w-5 h-5" /></Button>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10 bg-[#1E293B] border-slate-700 text-white placeholder:text-slate-500" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-[#1E293B] border-slate-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="en_pause">En pause</SelectItem>
              <SelectItem value="termine">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center h-40 items-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#1E293B] rounded-xl border border-slate-700 p-12 text-center">
            <HardHat className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">{search || statusFilter !== 'all' ? 'Aucun chantier trouvé' : 'Aucun chantier pour le moment'}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ch) => (
              <div key={ch.id} onClick={() => navigate(`/chantier/${ch.id}`)} className="bg-[#1E293B] rounded-xl border border-slate-700 p-5 cursor-pointer hover:border-orange-500/50 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-semibold">{ch.name}</h3>
                  <Badge variant="outline" className={statusColors[ch.status]}>{statusLabels[ch.status]}</Badge>
                </div>
                {ch.clients?.name && <p className="text-orange-400 text-xs mb-2">{ch.clients.name}</p>}
                {ch.address && <div className="flex items-center gap-1.5 text-slate-400 text-sm"><MapPin className="w-3.5 h-3.5" />{ch.address}</div>}
                {(ch.start_date || ch.end_date) && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-2"><CalendarIcon className="w-3.5 h-3.5" />{ch.start_date || '—'} → {ch.end_date || '—'}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1E293B] rounded-xl border border-slate-700 divide-y divide-slate-700">
            {filtered.map((ch) => (
              <div key={ch.id} onClick={() => navigate(`/chantier/${ch.id}`)} className="p-4 flex items-center justify-between hover:bg-slate-700/30 cursor-pointer transition-colors">
                <div>
                  <p className="text-white font-medium">{ch.name}</p>
                  <p className="text-slate-400 text-sm">{ch.clients?.name || ''}{ch.address ? ` • ${ch.address}` : ''}</p>
                </div>
                <Badge variant="outline" className={statusColors[ch.status]}>{statusLabels[ch.status]}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Chantiers;
