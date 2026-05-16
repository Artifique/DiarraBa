"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bird, Plus, Search, Trash2, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase";
import { VolailleModel, FournisseurModel } from "@/lib/models";
import { Volaille, Fournisseur, VolailleType } from "@/types/database";

const VOLAILLE_TYPES: VolailleType[] = ['Poussin', 'Canard', 'Oua', 'Pintade', 'PouletChair', 'Poule', 'Dinde', 'Pigeon', 'Autre'];

export default function VolaillesPage() {
  const [loading, setLoading] = useState(true);
  const [volailles, setVolailles] = useState<(Volaille & { fournisseur_nom?: string })[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedVolaille, setSelectedVolaille] = useState<Volaille | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [formData, setFormData] = useState({ type: "Poussin" as VolailleType, quantite_disponible: 0, prix_unitaire: 0, fournisseur_id: "", description: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const [vData, fData] = await Promise.all([new VolailleModel(supabase).findAll(), new FournisseurModel(supabase).findAll()]);
      setVolailles(vData.map(v => ({ ...v, fournisseur_nom: fData.find(f => f.id === v.fournisseur_id)?.nom || "Inconnu" })));
      setFournisseurs(fData);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = volailles.filter(v => {
    const statut = v.quantite_disponible === 0 ? "Rupture" : v.quantite_disponible < 100 ? "Stock Bas" : "En Stock";
    return (v.type.toLowerCase().includes(searchTerm.toLowerCase()) || v.fournisseur_nom?.toLowerCase().includes(searchTerm.toLowerCase())) 
           && (statusFilter === "all" || statut === statusFilter);
  });

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const resetForm = () => { setFormData({ type: "Poussin", quantite_disponible: 0, prix_unitaire: 0, fournisseur_id: "", description: "" }); setSelectedVolaille(null); };

  const openEdit = (v: Volaille) => {
    setSelectedVolaille(v);
    setFormData({ type: v.type, quantite_disponible: v.quantite_disponible, prix_unitaire: Number(v.prix_unitaire), fournisseur_id: v.fournisseur_id, description: v.description || "" });
    setIsEditOpen(true);
  };

  const handleAction = async () => {
    if (!formData.fournisseur_id) { alert("Veuillez sélectionner un fournisseur."); return; }
    const supabase = createClient();
    const model = new VolailleModel(supabase);
    if(isEditOpen && selectedVolaille) await model.update(selectedVolaille.id, formData);
    else await model.create({...formData, actif: true});
    setIsOpen(false); setIsEditOpen(false); resetForm(); fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Inventaire des Volailles</h2>
          <p className="text-sm text-muted-foreground">Gestion centralisée du stock et des approvisionnements.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsOpen(true); }} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl">
          <Plus className="h-5 w-5 mr-2" /> Ajouter Volaille
        </Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Rechercher une volaille..." onChange={(e) => setSearchTerm(e.target.value)} className="bg-white/5 border-white/10 text-white pl-4 w-64" />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5 uppercase text-[10px] tracking-widest text-muted-foreground font-bold">
            <tr><th className="px-6 py-4">Type</th><th className="px-6 py-4">Fournisseur</th><th className="px-6 py-4">Quantité</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginated.map(v => (
              <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-bold text-white">{v.type}</td>
                <td className="px-6 py-4 text-sm text-white">{v.fournisseur_nom}</td>
                <td className="px-6 py-4 font-mono font-bold text-white">{v.quantite_disponible}</td>
                <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    <Button variant="ghost" className="h-8 w-8" onClick={() => openEdit(v)}><Pencil className="h-4 w-4 text-orange-accent" /></Button>
                    <Button variant="ghost" className="h-8 w-8" onClick={() => { setSelectedVolaille(v); setDeleteConfirmOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && <div className="p-4 border-t border-white/5"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
      </div>

      <Dialog open={isOpen || isEditOpen} onOpenChange={(v) => { setIsOpen(v && !isEditOpen); setIsEditOpen(v && isEditOpen); }}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">{isEditOpen ? "Modifier Volaille" : "Ajouter Volaille"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label className="text-xs uppercase font-bold text-white/70">Type</Label>
            <Select value={formData.type} onValueChange={(val: VolailleType) => setFormData({...formData, type: val})}><SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-night border-white/10 text-white">{VOLAILLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            <Label className="text-xs uppercase font-bold text-white/70">Fournisseur</Label>
            <Select value={formData.fournisseur_id} onValueChange={(val) => setFormData({...formData, fournisseur_id: val})}><SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Choisir..."/></SelectTrigger><SelectContent className="bg-night border-white/10 text-white">{fournisseurs.map(f => <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>)}</SelectContent></Select>
            <Label className="text-xs uppercase font-bold text-white/70">Quantité</Label>
            <Input type="number" value={formData.quantite_disponible} onChange={(e) => setFormData({...formData, quantite_disponible: parseInt(e.target.value) || 0})} className="bg-white/5 border-white/10 text-white" />
          </div>
          <DialogFooter><Button onClick={handleAction} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90">Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}