import { useEffect, useState } from 'react';
import { FileText, Download, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Document { id: string; name: string; type: string; url: string; created_at: string; chantiers?: { name: string }; }

const typeColors: Record<string, string> = {
  devis: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  facture: 'bg-green-500/20 text-green-400 border-green-500/30',
  bon_commande: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  autre: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('documents').select('*, chantiers(name)').order('created_at', { ascending: false })
      .then(({ data }) => setDocuments(data || []));
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    toast.success('Document supprimé');
  };

  const filtered = documents.filter(d => !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.chantiers?.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un document..." className="pl-10 bg-[#1E293B] border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        {filtered.length === 0 ? (
          <div className="bg-[#1E293B] rounded-xl border border-slate-700 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">{search ? 'Aucun document trouvé' : 'Aucun document pour le moment'}</p>
          </div>
        ) : (
          <div className="bg-[#1E293B] rounded-xl border border-slate-700 divide-y divide-slate-700">
            {filtered.map((d) => (
              <div key={d.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-white font-medium text-sm">{d.name}</p>
                    <p className="text-slate-500 text-xs">{d.chantiers?.name} • {new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={typeColors[d.type] || typeColors.autre}>{d.type}</Badge>
                  <a href={d.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white"><Download className="w-4 h-4" /></a>
                  <button onClick={() => handleDelete(d.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Documents;
