import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, FileText, Calendar, Plus, Upload, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { supabase, storage } from '@/lib/supabase';

interface Chantier { id: string; name: string; description: string; address: string; status: string; start_date: string; end_date: string; client_id: string; clients?: { name: string }; }
interface Photo { id: string; url: string; caption: string; created_at: string; }
interface Document { id: string; url: string; name: string; type: string; created_at: string; }
interface Appointment { id: string; title: string; description: string; start_datetime: string; location: string; }

const statusColors: Record<string, string> = {
  en_cours: 'bg-green-500/20 text-green-400 border-green-500/30',
  en_pause: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  termine: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};
const statusLabels: Record<string, string> = { en_cours: 'En cours', en_pause: 'En pause', termine: 'Terminé' };

const ChantierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chantier, setChantier] = useState<Chantier | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [apptDialogOpen, setApptDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('autre');
  const [newAppt, setNewAppt] = useState({ title: '', description: '', start_datetime: '', location: '' });
  const [editData, setEditData] = useState({ name: '', description: '', address: '', status: '', start_date: '', end_date: '' });

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    setLoading(true);
    const { data: ch } = await supabase.from('chantiers').select('*, clients(name)').eq('id', id).single();
    setChantier(ch);
    if (ch) setEditData({ name: ch.name, description: ch.description || '', address: ch.address || '', status: ch.status, start_date: ch.start_date || '', end_date: ch.end_date || '' });
    const { data: ph } = await supabase.from('chantier_photos').select('*').eq('chantier_id', id).order('created_at', { ascending: false });
    setPhotos(ph || []);
    const { data: docs } = await supabase.from('documents').select('*').eq('chantier_id', id).order('created_at', { ascending: false });
    setDocuments(docs || []);
    const { data: appts } = await supabase.from('appointments').select('*').eq('chantier_id', id).order('start_datetime');
    setAppointments(appts || []);
    setLoading(false);
  };

  const handleUpdateChantier = async () => {
    const { error } = await supabase.from('chantiers').update(editData).eq('id', id);
    if (error) { toast.error('Erreur de mise à jour'); return; }
    toast.success('Chantier mis à jour');
    setEditOpen(false);
    loadAll();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `photos/${id}/${Date.now()}-${file.name}`;
      const url = await storage.upload(file, path);
      await supabase.from('chantier_photos').insert({ chantier_id: id, url, caption: photoCaption || null });
      toast.success('Photo ajoutée');
      setPhotoDialogOpen(false);
      setPhotoCaption('');
      loadAll();
    } catch { toast.error("Erreur lors de l'upload"); }
    finally { setUploading(false); }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `documents/${id}/${Date.now()}-${file.name}`;
      const url = await storage.upload(file, path);
      await supabase.from('documents').insert({ chantier_id: id, url, name: docName || file.name, type: docType, size_bytes: file.size });
      toast.success('Document ajouté');
      setDocDialogOpen(false);
      setDocName('');
      setDocType('autre');
      loadAll();
    } catch { toast.error("Erreur lors de l'upload"); }
    finally { setUploading(false); }
  };

  const handleAddAppt = async () => {
    if (!newAppt.title || !newAppt.start_datetime) return;
    const { error } = await supabase.from('appointments').insert({ chantier_id: id, ...newAppt });
    if (error) { toast.error('Erreur'); return; }
    toast.success('Rendez-vous ajouté');
    setApptDialogOpen(false);
    setNewAppt({ title: '', description: '', start_datetime: '', location: '' });
    loadAll();
  };

  const handleDeletePhoto = async (photoId: string) => {
    await supabase.from('chantier_photos').delete().eq('id', photoId);
    loadAll();
  };

  const handleDeleteDoc = async (docId: string) => {
    await supabase.from('documents').delete().eq('id', docId);
    loadAll();
  };

  const handleDeleteAppt = async (apptId: string) => {
    await supabase.from('appointments').delete().eq('id', apptId);
    loadAll();
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    </DashboardLayout>
  );

  if (!chantier) return (
    <DashboardLayout>
      <div className="text-center text-slate-400 mt-20">Chantier introuvable</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: 'Clients', href: '/clients' },
          ...(chantier.clients ? [{ label: chantier.clients.name, href: `/clients/${chantier.client_id}` }] : []),
          { label: chantier.name },
        ]} />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{chantier.name}</h1>
              <Badge variant="outline" className={statusColors[chantier.status]}>{statusLabels[chantier.status]}</Badge>
            </div>
            {chantier.address && <p className="text-slate-400 text-sm">{chantier.address}</p>}
            {chantier.description && <p className="text-slate-500 text-sm mt-1">{chantier.description}</p>}
            {(chantier.start_date || chantier.end_date) && (
              <p className="text-slate-500 text-xs mt-2">
                {chantier.start_date || '—'} → {chantier.end_date || '—'}
              </p>
            )}
          </div>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Pencil className="w-4 h-4 mr-2" />Modifier
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1E293B] border-slate-700 text-white">
              <DialogHeader><DialogTitle>Modifier le chantier</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label className="text-slate-300">Nom</Label>
                  <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="bg-slate-800 border-slate-600 text-white" /></div>
                <div><Label className="text-slate-300">Description</Label>
                  <Textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="bg-slate-800 border-slate-600 text-white" /></div>
                <div><Label className="text-slate-300">Adresse</Label>
                  <Input value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} className="bg-slate-800 border-slate-600 text-white" /></div>
                <div><Label className="text-slate-300">Statut</Label>
                  <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="en_pause">En pause</SelectItem>
                      <SelectItem value="termine">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-slate-300">Date début</Label>
                    <Input type="date" value={editData.start_date} onChange={(e) => setEditData({ ...editData, start_date: e.target.value })} className="bg-slate-800 border-slate-600 text-white" /></div>
                  <div><Label className="text-slate-300">Date fin</Label>
                    <Input type="date" value={editData.end_date} onChange={(e) => setEditData({ ...editData, end_date: e.target.value })} className="bg-slate-800 border-slate-600 text-white" /></div>
                </div>
                <Button onClick={handleUpdateChantier} className="w-full bg-orange-500 hover:bg-orange-600 text-white">Enregistrer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="photos">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="photos" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Camera className="w-4 h-4 mr-2" />Photos ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="rdv" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />RDV ({appointments.length})
            </TabsTrigger>
          </TabsList>

          {/* Photos */}
          <TabsContent value="photos" className="mt-4">
            <div className="flex justify-end mb-4">
              <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white"><Upload className="w-4 h-4 mr-2" />Ajouter une photo</Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1E293B] border-slate-700 text-white">
                  <DialogHeader><DialogTitle>Ajouter une photo</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div><Label className="text-slate-300">Légende</Label>
                      <Input value={photoCaption} onChange={(e) => setPhotoCaption(e.target.value)} className="bg-slate-800 border-slate-600 text-white" placeholder="Description de la photo" /></div>
                    <div><Label className="text-slate-300">Fichier image</Label>
                      <Input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="bg-slate-800 border-slate-600 text-white file:text-slate-300 file:bg-slate-700 file:border-0 file:mr-2" /></div>
                    {uploading && <p className="text-slate-400 text-sm text-center">Upload en cours...</p>}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {photos.length === 0 ? (
              <div className="bg-[#1E293B] rounded-xl border border-slate-700 p-12 text-center">
                <Camera className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Aucune photo pour ce chantier</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((p) => (
                  <div key={p.id} className="relative group rounded-xl overflow-hidden bg-slate-800 aspect-square">
                    <img src={p.url} alt={p.caption || ''} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      {p.caption && <p className="text-white text-xs">{p.caption}</p>}
                      <button onClick={() => handleDeletePhoto(p.id)} className="self-end text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="mt-4">
            <div className="flex justify-end mb-4">
              <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-2" />Ajouter un document</Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1E293B] border-slate-700 text-white">
                  <DialogHeader><DialogTitle>Ajouter un document</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div><Label className="text-slate-300">Nom du document</Label>
                      <Input value={docName} onChange={(e) => setDocName(e.target.value)} className="bg-slate-800 border-slate-600 text-white" placeholder="Ex: Devis cuisine" /></div>
                    <div><Label className="text-slate-300">Type</Label>
                      <Select value={docType} onValueChange={setDocType}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="devis">Devis</SelectItem>
                          <SelectItem value="facture">Facture</SelectItem>
                          <SelectItem value="bon_commande">Bon de commande</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-slate-300">Fichier</Label>
                      <Input type="file" onChange={handleDocUpload} disabled={uploading} className="bg-slate-800 border-slate-600 text-white file:text-slate-300 file:bg-slate-700 file:border-0 file:mr-2" /></div>
                    {uploading && <p className="text-slate-400 text-sm text-center">Upload en cours...</p>}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {documents.length === 0 ? (
              <div className="bg-[#1E293B] rounded-xl border border-slate-700 p-12 text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Aucun document pour ce chantier</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((d) => (
                  <div key={d.id} className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">{d.name}</p>
                        <p className="text-slate-500 text-xs capitalize">{d.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-orange-400 hover:text-orange-300">Ouvrir</a>
                      <button onClick={() => handleDeleteDoc(d.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* RDV */}
          <TabsContent value="rdv" className="mt-4">
            <div className="flex justify-end mb-4">
              <Dialog open={apptDialogOpen} onOpenChange={setApptDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-2" />Nouveau RDV</Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1E293B] border-slate-700 text-white">
                  <DialogHeader><DialogTitle>Nouveau rendez-vous</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div><Label className="text-slate-300">Titre *</Label>
                      <Input value={newAppt.title} onChange={(e) => setNewAppt({ ...newAppt, title: e.target.value })} className="bg-slate-800 border-slate-600 text-white" placeholder="Ex: Visite chantier" /></div>
                    <div><Label className="text-slate-300">Date et heure *</Label>
                      <Input type="datetime-local" value={newAppt.start_datetime} onChange={(e) => setNewAppt({ ...newAppt, start_datetime: e.target.value })} className="bg-slate-800 border-slate-600 text-white" /></div>
                    <div><Label className="text-slate-300">Lieu</Label>
                      <Input value={newAppt.location} onChange={(e) => setNewAppt({ ...newAppt, location: e.target.value })} className="bg-slate-800 border-slate-600 text-white" placeholder="Adresse ou lieu" /></div>
                    <div><Label className="text-slate-300">Description</Label>
                      <Textarea value={newAppt.description} onChange={(e) => setNewAppt({ ...newAppt, description: e.target.value })} className="bg-slate-800 border-slate-600 text-white" /></div>
                    <Button onClick={handleAddAppt} disabled={!newAppt.title || !newAppt.start_datetime} className="w-full bg-orange-500 hover:bg-orange-600 text-white">Créer le RDV</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {appointments.length === 0 ? (
              <div className="bg-[#1E293B] rounded-xl border border-slate-700 p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Aucun rendez-vous planifié</p>
              </div>
            ) : (
              <div className="space-y-2">
                {appointments.map((a) => (
                  <div key={a.id} className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">{a.title}</p>
                        <p className="text-slate-400 text-xs">{new Date(a.start_datetime).toLocaleString('fr-FR')}{a.location && ` • ${a.location}`}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAppt(a.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ChantierDetail;
