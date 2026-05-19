import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, Camera, Calendar, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';

interface Chantier {
  id: string;
  name: string;
  address: string;
  status: string;
  clients: { name: string } | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: ch } = await supabase.from('chantiers').select('id, name, address, status, clients(name)').order('created_at', { ascending: false });
      setChantiers(ch || []);
    } catch { toast.error('Erreur de chargement des chantiers'); }

    const { count: photos } = await supabase.from('chantier_photos').select('*', { count: 'exact', head: true });
    setPhotoCount(photos || 0);
    const { count: appts } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
    setAppointmentCount(appts || 0);
    const { count: docs } = await supabase.from('documents').select('*', { count: 'exact', head: true });
    setDocumentCount(docs || 0);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      en_cours: 'bg-green-500/20 text-green-400',
      termine: 'bg-slate-500/20 text-slate-400',
      en_pause: 'bg-yellow-500/20 text-yellow-400',
    };
    const labels: Record<string, string> = { en_cours: 'En cours', termine: 'Terminé', en_pause: 'En pause' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.en_cours}`}>
        {labels[status] || status}
      </span>
    );
  };

  const stats = [
    { icon: <HardHat className="w-6 h-6" />, label: 'Chantiers', value: chantiers.length, color: 'text-orange-500' },
    { icon: <Camera className="w-6 h-6" />, label: 'Photos', value: photoCount, color: 'text-blue-500' },
    { icon: <Calendar className="w-6 h-6" />, label: 'Rendez-vous', value: appointmentCount, color: 'text-green-500' },
    { icon: <FileText className="w-6 h-6" />, label: 'Documents', value: documentCount, color: 'text-purple-500' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
          <Button onClick={() => navigate('/clients')} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
            <Users className="w-4 h-4 mr-2" />
            Gérer les clients
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#1E293B] rounded-xl p-5 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-slate-700">
          <div className="p-5 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Mes chantiers</h2>
            <Button onClick={() => navigate('/chantiers')} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
              <HardHat className="w-4 h-4 mr-2" /> Nouveau chantier
            </Button>
          </div>
          {chantiers.length === 0 ? (
            <div className="p-12 text-center">
              <HardHat className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Aucun chantier pour le moment</p>
              <p className="text-slate-500 text-sm mt-2">Commencez par ajouter un client puis créez un chantier.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {chantiers.map((chantier) => (
                <div key={chantier.id} onClick={() => navigate(`/chantier/${chantier.id}`)}
                  className="p-5 flex items-center justify-between hover:bg-slate-700/30 cursor-pointer transition-colors">
                  <div>
                    <h3 className="font-medium text-white">{chantier.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {chantier.address || "Pas d'adresse"}
                      {chantier.clients?.name && ` • ${chantier.clients.name}`}
                    </p>
                  </div>
                  {getStatusBadge(chantier.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
