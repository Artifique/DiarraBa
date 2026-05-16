"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus, CheckCircle2, AlertCircle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase";
import { PaiementModel, ClientModel, ReservationModel } from "@/lib/models";
import { Client } from "@/types/database";

export default function PaiementsPage() {
  const [loading, setLoading] = useState(true);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedPaiement, setSelectedPaiement] = useState<any | null>(null);
  const [success, setSuccess] = useState<{ open: boolean; title: string; message: string }>({ open: false, title: "", message: "" });
  const [error, setError] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const [formData, setFormData] = useState({ client_id: "", reservation_id: "", montant: 0, methode_paiement: "Especes" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const [pData, cData, rData] = await Promise.all([
        new PaiementModel(supabase).findAllWithDetails(),
        new ClientModel(supabase).findAll(),
        new ReservationModel(supabase).findAllWithDetails()
      ]);
      setPaiements(pData.map(p => ({ ...p, client_nom: p.reservations?.clients?.nom || "Inconnu", reservation_ref: p.reservation_id?.slice(0, 8) || "N/A" })));
      setClients(cData); setReservations(rData);
    } catch (e) { setError({ open: true, message: "Erreur chargement paiements" }); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async () => {
    if (!formData.montant) { setError({ open: true, message: "Montant requis" }); return; }
    try {
      const supabase = createClient();
      const model = new PaiementModel(supabase);
      if (isEditOpen && selectedPaiement) {
        await model.update(selectedPaiement.id, { montant: formData.montant, methode: formData.methode_paiement as any });
        setSuccess({ open: true, title: "Succès", message: "Paiement modifié." });
      } else {
        await model.create({
          reservation_id: (formData.reservation_id || undefined) as string,
          montant: formData.montant,
          methode: formData.methode_paiement as any,
          statut: "Completed",
          date_paiement: new Date().toISOString(),
          reference: null,
          notes: null
        });
        setSuccess({ open: true, title: "Succès", message: "Paiement enregistré." });
      }
      setIsOpen(false); setIsEditOpen(false); setFormData({ client_id: "", reservation_id: "", montant: 0, methode_paiement: "Especes" }); fetchData();
    } catch (e) { setError({ open: true, message: "Échec de l'opération" }); }
  };

  const openEdit = (p: any) => {
    setSelectedPaiement(p);
    setFormData({ client_id: p.reservations?.client_id || "", reservation_id: p.reservation_id || "", montant: p.montant, methode_paiement: p.methode });
    setIsEditOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await new PaiementModel(createClient()).delete(itemToDelete);
      setDeleteConfirmOpen(false);
      setSuccess({ open: true, title: "Supprimé", message: "Paiement supprimé." });
      fetchData();
    } catch (e) { setError({ open: true, message: "Échec suppression" }); }
  };

  const filtered = paiements.filter(p => (p.client_nom.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Suivi des Paiements</h2>
          <p className="text-sm text-muted-foreground">Historique des transactions financières.</p>
        </div>
        <Button onClick={() => { setIsOpen(true); setFormData({ client_id: "", reservation_id: "", montant: 0, methode_paiement: "Especes" }); }} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl">
          <Plus className="mr-2" /> Enregistrer Paiement
        </Button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/5 uppercase text-[10px] tracking-widest text-muted-foreground font-bold">
            <tr><th className="p-6">Réf</th><th className="p-6">Client</th><th className="p-6">Montant</th><th className="p-6 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginated.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="p-6 font-bold text-white">{p.id.slice(0, 8)}</td>
                <td className="p-6 text-sm text-white">{p.client_nom}</td>
                <td className="p-6 font-mono font-bold text-white">{p.montant.toLocaleString()} FCFA</td>
                <td className="p-6 text-right flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4 text-orange-accent" /></Button>
                    <Button variant="ghost" onClick={() => { setItemToDelete(p.id); setDeleteConfirmOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && <div className="p-4 border-t border-white/5"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
      </div>

      <Dialog open={isOpen || isEditOpen} onOpenChange={(v) => { setIsOpen(v && !isEditOpen); setIsEditOpen(v && isEditOpen); }}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-xl font-display">{isEditOpen ? "Modifier Paiement" : "Enregistrer Paiement"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            {!isEditOpen && <>
              <Label className="text-xs uppercase font-bold text-white/70">Client</Label>
              <Select onValueChange={(val) => setFormData({ ...formData, client_id: val })}><SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Client..." /></SelectTrigger><SelectContent className="bg-night">{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}</SelectContent></Select>
              <Label className="text-xs uppercase font-bold text-white/70">Réservation</Label>
              <Select onValueChange={(val) => setFormData({ ...formData, reservation_id: val })}><SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Réservation..." /></SelectTrigger><SelectContent className="bg-night">{reservations.filter(r => r.client_id === formData.client_id).map(r => <SelectItem key={r.id} value={r.id}>#{r.id.slice(0, 8)} ({r.prix_total.toLocaleString()} FCFA)</SelectItem>)}</SelectContent></Select>
            </>}
            <Label className="text-xs uppercase font-bold text-white/70">Montant</Label>
            <Input type="number" value={formData.montant} onChange={(e) => setFormData({...formData, montant: parseInt(e.target.value) || 0})} className="bg-white/5 border-white/10 text-white" />
            <Label className="text-xs uppercase font-bold text-white/70">Méthode</Label>
            <Select value={formData.methode_paiement} onValueChange={(val) => setFormData({ ...formData, methode_paiement: val })}><SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-night"><SelectItem value="Especes">Espèces</SelectItem><SelectItem value="Virement">Virement</SelectItem><SelectItem value="OrangeMoney">Orange Money</SelectItem><SelectItem value="Wave">Wave</SelectItem></SelectContent></Select>
          </div>
          <DialogFooter><Button onClick={handleAction} className="bg-orange-accent text-night font-bold">Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}