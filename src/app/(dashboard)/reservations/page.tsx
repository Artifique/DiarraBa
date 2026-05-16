"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Loader2, Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase";
import { ReservationModel, ClientModel, VolailleModel, CouveuseModel } from "@/lib/models";

export default function ReservationsPage() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [volailles, setVolailles] = useState<any[]>([]);
  const [couveuses, setCouveuses] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<any | null>(null);

  const [newRes, setNewRes] = useState({
    client_id: "",
    type_volaille_id: "",
    couveuse_id: "",
    quantite_volaille: 0,
    quantite_couveuse: 0,
    prix_unitaire: 0,
    date_livraison_prevue: "",
    type_paiement: "Tranche",
    notes: "",
    lieu_livraison: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const rModel = new ReservationModel(supabase);
      const cModel = new ClientModel(supabase);
      const vModel = new VolailleModel(supabase);
      const coModel = new CouveuseModel(supabase);
      const [rData, cData, vData, coData] = await Promise.all([rModel.findAllWithDetails(), cModel.findAll(), vModel.findAll(), coModel.findAll()]);
      setReservations(rData); setClients(cData); setVolailles(vData); setCouveuses(coData);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!newRes.client_id) return;
    try {
      const supabase = createClient();
      const rModel = new ReservationModel(supabase);
      const prixVolaille = newRes.quantite_volaille * newRes.prix_unitaire;
      const prixCouveuse = newRes.couveuse_id ? (couveuses.find(c => c.id === newRes.couveuse_id)?.prix_location_par_jour || 0) * newRes.quantite_couveuse : 0;
      
      await rModel.create({
        client_id: newRes.client_id,
        prix_total: prixVolaille + prixCouveuse,
        statut_reservation: "EnAttente",
        date_reservation: new Date().toISOString(),
        date_livraison_prevue: newRes.date_livraison_prevue || new Date().toISOString().split('T')[0],
        type_paiement: newRes.type_paiement as any,
        notes: newRes.notes
      });

      setIsOpen(false);
      fetchData();
    } catch (error) { console.error(error); }
  };

  const calculateTotal = (res: any) => {
    const volailleTotal = res.reservation_volailles?.reduce((acc: number, item: any) => acc + Number(item.sous_total || 0), 0) || 0;
    const couveuseTotal = res.reservation_couveuses?.reduce((acc: number, item: any) => acc + Number(item.prix_total || 0), 0) || 0;
    return volailleTotal + couveuseTotal;
  };

  const renderArticles = (res: any) => {
    const couveusesGrouped = res.reservation_couveuses?.reduce((acc: any, item: any) => {
      const modele = item.couveuses?.modele || "Inconnue";
      if (!acc[modele]) acc[modele] = { count: 0, total: 0 };
      acc[modele].count += 1;
      acc[modele].total += Number(item.prix_total || 0);
      return acc;
    }, {});

    return (
      <div className="space-y-4">
        {res.reservation_volailles?.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase text-orange-accent">Volailles</h4>
            {res.reservation_volailles.map((item: any, idx: number) => (
              <div key={`v-${idx}`} className="flex justify-between p-2 bg-white/5 rounded text-sm">
                <span>{item.quantite} x {item.volailles?.type}</span>
                <span className="font-bold">{item.prix_unitaire.toLocaleString()} FCFA</span>
              </div>
            ))}
          </div>
        )}
        {couveusesGrouped && Object.entries(couveusesGrouped).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase text-orange-accent">Couveuses</h4>
            {Object.entries(couveusesGrouped).map(([modele, data]: [string, any], idx) => (
              <div key={`c-${idx}`} className="flex justify-between p-2 bg-white/5 rounded text-sm">
                <span>{data.count} x {modele}</span>
                <span className="font-bold">{data.total.toLocaleString()} FCFA</span>
              </div>
            ))}
          </div>
        )}
        <div className="pt-4 border-t border-white/10 flex justify-between font-bold text-white text-lg">
          <span>TOTAL À PAYER</span>
          <span>{calculateTotal(res).toLocaleString()} FCFA</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Réservations</h2>
        <Button onClick={() => { setNewRes({...newRes, client_id: ""}); setIsOpen(true); }} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl">
          <Plus className="h-5 w-5 mr-2" /> Nouvelle Réservation
        </Button>
      </div>
      
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <table className="w-full text-left">
          <thead>
            <tr className="text-muted-foreground uppercase text-[10px]">
              <th className="p-4">Client</th>
              <th className="p-4">Articles</th>
              <th className="p-4">Total</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(res => (
              <tr key={res.id} className="border-t border-white/5">
                <td className="p-4 font-bold text-white">{res.clients?.nom}</td>
                <td className="p-4 text-sm text-muted-foreground">{res.reservation_volailles?.length + res.reservation_couveuses?.length} article(s)</td>
                <td className="p-4 font-mono font-bold text-white">{Number(res.prix_total || 0).toLocaleString()} FCFA</td>
                <td className="p-4 text-right flex gap-2 justify-end">
                  <Button variant="ghost" className="h-8 w-8" onClick={() => { setSelectedRes(res); setIsViewOpen(true); }}><Eye className="h-4 w-4 text-blue-400" /></Button>
                  <Button variant="ghost" className="h-8 w-8" onClick={() => { setSelectedRes(res); setIsOpen(true); }}><Pencil className="h-4 w-4 text-orange-accent" /></Button>
                  <Button variant="ghost" className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-xl">
          <DialogHeader><DialogTitle>{selectedRes ? "Modifier" : "Nouvelle"} Réservation</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Select onValueChange={(val) => setNewRes({...newRes, client_id: val})}><SelectTrigger><SelectValue placeholder="Client..." /></SelectTrigger><SelectContent className="bg-night border-white/10">{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}</SelectContent></Select>
            <Input type="date" value={newRes.date_livraison_prevue} onChange={(e) => setNewRes({...newRes, date_livraison_prevue: e.target.value})} className="bg-white/5" />
            <Select onValueChange={(val) => setNewRes({...newRes, type_paiement: val})}><SelectTrigger><SelectValue placeholder="Paiement..." /></SelectTrigger><SelectContent className="bg-night border-white/10"><SelectItem value="Tranche">Tranche</SelectItem><SelectItem value="Totalite">Totalité</SelectItem></SelectContent></Select>
            <Input placeholder="Notes..." value={newRes.notes} onChange={(e) => setNewRes({...newRes, notes: e.target.value})} className="bg-white/5" />
            <div className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4 border-white/10">
              <Select onValueChange={(val) => { const v = volailles.find(x => x.id === val); setNewRes({...newRes, type_volaille_id: val, prix_unitaire: v?.prix_unitaire || 0 }); }}><SelectTrigger><SelectValue placeholder="Volaille..." /></SelectTrigger><SelectContent className="bg-night border-white/10">{volailles.map(v => <SelectItem key={v.id} value={v.id}>{v.type}</SelectItem>)}</SelectContent></Select>
              <Input type="number" placeholder="Qté" value={newRes.quantite_volaille} onChange={(e) => setNewRes({...newRes, quantite_volaille: parseInt(e.target.value) || 0})} className="bg-white/5" />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <Select onValueChange={(val) => setNewRes({...newRes, couveuse_id: val})}><SelectTrigger><SelectValue placeholder="Couveuse..." /></SelectTrigger><SelectContent className="bg-night border-white/10">{couveuses.map(c => <SelectItem key={c.id} value={c.id}>{c.modele}</SelectItem>)}</SelectContent></Select>
              <Input type="number" placeholder="Qté" value={newRes.quantite_couveuse} onChange={(e) => setNewRes({...newRes, quantite_couveuse: parseInt(e.target.value) || 0})} className="bg-white/5" />
            </div>
          </div>
          <DialogFooter><Button onClick={handleAdd} className="bg-orange-accent text-night font-bold">Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader><DialogTitle>Détails Articles & Paiement</DialogTitle></DialogHeader>
          {selectedRes && <div>{renderArticles(selectedRes)}</div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}