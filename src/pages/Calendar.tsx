import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Appointment { id: string; title: string; start_datetime: string; location: string; chantiers?: { name: string }; }

const Calendar = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    supabase.from('appointments').select('*, chantiers(name)').order('start_datetime')
      .then(({ data }) => setAppointments(data || []));
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('appointments').delete().eq('id', id);
    setAppointments(prev => prev.filter(a => a.id !== id));
    toast.success('RDV supprimé');
  };

  const grouped = appointments.reduce((acc, a) => {
    const date = new Date(a.start_datetime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(a);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Calendrier</h1>
        {appointments.length === 0 ? (
          <div className="bg-[#1E293B] rounded-xl border border-slate-700 p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucun rendez-vous planifié</p>
            <p className="text-slate-500 text-sm mt-1">Ajoutez des RDV depuis la page d'un chantier</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, appts]) => (
              <div key={date}>
                <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-3 capitalize">{date}</h2>
                <div className="space-y-2">
                  {appts.map((a) => (
                    <div key={a.id} className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-10 bg-orange-500 rounded-full flex-shrink-0" />
                        <div>
                          <p className="text-white font-medium">{a.title}</p>
                          <p className="text-slate-400 text-sm">
                            {new Date(a.start_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {a.location && ` • ${a.location}`}
                            {a.chantiers?.name && <span className="text-orange-400"> • {a.chantiers.name}</span>}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(a.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
