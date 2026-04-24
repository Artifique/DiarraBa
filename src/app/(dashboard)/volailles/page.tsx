"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bird,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Package,
  Trash2,
  Pencil,
  Eye,
  Loader2,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { DateFilter } from "@/components/ui/date-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({ 
    type: "Poussin" as VolailleType, 
    quantite_disponible: 0, 
    prix_unitaire: 0, 
    fournisseur_id: "",
    description: ""
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const vModel = new VolailleModel(supabase);
      const fModel = new FournisseurModel(supabase);
      
      const [vData, fData] = await Promise.all([
        vModel.findAll(),
        fModel.findAll()
      ]);

      const volaillesWithFournisseur = vData.map(v => ({
        ...v,
        fournisseur_nom: fData.find(f => f.id === v.fournisseur_id)?.nom || "Inconnu"
      }));

      setVolailles(volaillesWithFournisseur);
      setFournisseurs(fData);
    } catch (error) {
      console.error("Error fetching volailles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!formData.fournisseur_id) return;
    try {
      const supabase = createClient();
      const model = new VolailleModel(supabase);
      await model.create({
        type: formData.type,
        quantite_disponible: formData.quantite_disponible,
        prix_unitaire: formData.prix_unitaire,
        fournisseur_id: formData.fournisseur_id,
        description: formData.description,
        actif: true
      });
      setIsOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error creating volaille:", error);
    }
  };

  const handleEdit = async () => {
    if (!selectedVolaille) return;
    try {
      const supabase = createClient();
      const model = new VolailleModel(supabase);
      await model.update(selectedVolaille.id, {
        type: formData.type,
        quantite_disponible: formData.quantite_disponible,
        prix_unitaire: formData.prix_unitaire,
        fournisseur_id: formData.fournisseur_id,
        description: formData.description
      });
      setIsEditOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error updating volaille:", error);
    }
  };

  const handleDelete = async () => {
    if (selectedVolaille) {
      try {
        const supabase = createClient();
        const model = new VolailleModel(supabase);
        await model.delete(selectedVolaille.id);
        setDeleteConfirmOpen(false);
        setSelectedVolaille(null);
        fetchData();
      } catch (error) {
        console.error("Error deleting volaille:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ type: "Poussin", quantite_disponible: 0, prix_unitaire: 0, fournisseur_id: "", description: "" });
    setSelectedVolaille(null);
  };

  const openEdit = (v: Volaille) => {
    setSelectedVolaille(v);
    setFormData({
      type: v.type,
      quantite_disponible: v.quantite_disponible,
      prix_unitaire: Number(v.prix_unitaire),
      fournisseur_id: v.fournisseur_id,
      description: v.description || ""
    });
    setIsEditOpen(true);
  };

  const getStatus = (qte: number) => {
    if (qte === 0) return "Rupture";
    if (qte < 100) return "Stock Bas";
    return "En Stock";
  };

  const filteredVolailles = volailles.filter((v) => {
    const statut = getStatus(v.quantite_disponible);
    const matchesSearch = v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.fournisseur_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || v.date_ajout.startsWith(dateFilter);
    const matchesStatus = statusFilter === "all" || statut === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const totalPages = Math.ceil(filteredVolailles.length / itemsPerPage);
  const paginatedVolailles = filteredVolailles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Inventaire des Volailles</h2>
          <p className="text-sm text-muted-foreground">Gestion centralisée du stock et des approvisionnements.</p>
        </div>

        <Button 
          onClick={() => { resetForm(); setIsOpen(true); }}
          className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl"
        >
          <Plus className="h-5 w-5 mr-2" /> Ajouter au Stock
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-accent transition-colors" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-white/10 text-white pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent className="bg-night border-white/10 text-white">
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="En Stock">En Stock</SelectItem>
            <SelectItem value="Stock Bas">Stock Bas</SelectItem>
            <SelectItem value="Rupture">Rupture</SelectItem>
          </SelectContent>
        </Select>
        <DateFilter value={dateFilter} onChange={setDateFilter} className="max-w-xs" />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4 font-bold">Type de Volaille</th>
                <th className="px-6 py-4 font-bold">Fournisseur</th>
                <th className="px-6 py-4 font-bold">Quantité</th>
                <th className="px-6 py-4 font-bold">Prix Unitaire</th>
                <th className="px-6 py-4 font-bold">Statut</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-accent mx-auto" />
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedVolailles.map((v) => {
                    const statut = getStatus(v.quantite_disponible);
                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={v.id}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-orange-accent/10 flex items-center justify-center text-orange-accent">
                              <Bird className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{v.type}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">ID: {v.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {v.fournisseur_nom}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-white">
                          {v.quantite_disponible}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-white">
                          {Number(v.prix_unitaire).toLocaleString()} FCFA
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            statut === "En Stock" ? "bg-forest-green/10 text-forest-green border border-forest-green/20" :
                            statut === "Stock Bas" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                            "bg-destructive/10 text-destructive border border-destructive/20"
                          )}>
                            {statut === "En Stock" ? <CheckCircle2 className="h-3 w-3" /> :
                             statut === "Stock Bas" ? <AlertTriangle className="h-3 w-3" /> :
                             <Package className="h-3 w-3" />}
                            {statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-night border-white/10 text-white">
                              <DropdownMenuItem onClick={() => openEdit(v)} className="hover:bg-white/5 cursor-pointer">
                                <Pencil className="h-4 w-4 mr-2" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => { setSelectedVolaille(v); setDeleteConfirmOpen(true); }} 
                                className="text-destructive hover:bg-destructive/10 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      <Dialog open={isOpen || isEditOpen} onOpenChange={(val) => { if(!val) { resetForm(); setIsOpen(false); setIsEditOpen(false); } }}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">{isEditOpen ? "Modifier Volaille" : "Ajouter une Volaille"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Renseignez les détails de l'article en inventaire.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Type</Label>
                <Select value={formData.type} onValueChange={(val: VolailleType) => setFormData({...formData, type: val})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-night border-white/10 text-white">
                    {VOLAILLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Fournisseur</Label>
                <Select value={formData.fournisseur_id} onValueChange={(val) => setFormData({...formData, fournisseur_id: val})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent className="bg-night border-white/10 text-white">
                    {fournisseurs.map(f => <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Quantité</Label>
                <Input type="number" value={formData.quantite_disponible} onChange={(e) => setFormData({...formData, quantite_disponible: parseInt(e.target.value) || 0})} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Prix Unitaire (FCFA)</Label>
                <Input type="number" value={formData.prix_unitaire} onChange={(e) => setFormData({...formData, prix_unitaire: parseInt(e.target.value) || 0})} className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-white/5 border-white/10 text-white" placeholder="Optionnel..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsOpen(false); setIsEditOpen(false); }} className="border-white/10 text-white hover:bg-white/5">Annuler</Button>
            <Button onClick={isEditOpen ? handleEdit : handleAdd} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90">
              {isEditOpen ? "Sauvegarder" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-muted-foreground">Cette action est irréversible. Voulez-vous continuer ?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="border-white/10 text-white hover:bg-white/5">Annuler</Button>
            <Button onClick={handleDelete} className="bg-destructive text-white font-bold hover:bg-destructive/90">Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
