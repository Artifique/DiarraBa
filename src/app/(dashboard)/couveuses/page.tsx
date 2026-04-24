"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Box, 
  Plus, 
  Search, 
  Zap,
  Activity,
  History,
  Trash2,
  Pencil,
  Loader2,
  MoreVertical,
  CheckCircle2,
  XCircle
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase";
import { CouveuseModel, FournisseurModel } from "@/lib/models";
import { Couveuse, Fournisseur } from "@/types/database";

export default function CouveusesPage() {
  const [loading, setLoading] = useState(true);
  const [couveuses, setCouveuses] = useState<(Couveuse & { fournisseur_nom?: string })[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedCouveuse, setSelectedCouveuse] = useState<Couveuse | null>(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({ 
    modele: "", 
    capacite: 0, 
    prix_location_par_jour: 0, 
    fournisseur_id: "",
    description: "",
    disponible: true
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const cModel = new CouveuseModel(supabase);
      const fModel = new FournisseurModel(supabase);
      
      const [cData, fData] = await Promise.all([
        cModel.findAll(),
        fModel.findAll()
      ]);

      const couveusesWithFournisseur = cData.map(c => ({
        ...c,
        fournisseur_nom: fData.find(f => f.id === c.fournisseur_id)?.nom || "Inconnu"
      }));

      setCouveuses(couveusesWithFournisseur);
      setFournisseurs(fData);
    } catch (error) {
      console.error("Error fetching couveuses:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!formData.modele || !formData.fournisseur_id) return;
    try {
      const supabase = createClient();
      const model = new CouveuseModel(supabase);
      await model.create({
        modele: formData.modele,
        capacite: formData.capacite,
        prix_location_par_jour: formData.prix_location_par_jour,
        fournisseur_id: formData.fournisseur_id,
        description: formData.description,
        disponible: formData.disponible,
        actif: true
      });
      setIsOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error creating couveuse:", error);
    }
  };

  const handleEdit = async () => {
    if (!selectedCouveuse) return;
    try {
      const supabase = createClient();
      const model = new CouveuseModel(supabase);
      await model.update(selectedCouveuse.id, {
        modele: formData.modele,
        capacite: formData.capacite,
        prix_location_par_jour: formData.prix_location_par_jour,
        fournisseur_id: formData.fournisseur_id,
        description: formData.description,
        disponible: formData.disponible
      });
      setIsEditOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error updating couveuse:", error);
    }
  };

  const handleDelete = async () => {
    if (selectedCouveuse) {
      try {
        const supabase = createClient();
        const model = new CouveuseModel(supabase);
        await model.delete(selectedCouveuse.id);
        setDeleteConfirmOpen(false);
        setSelectedCouveuse(null);
        fetchData();
      } catch (error) {
        console.error("Error deleting couveuse:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ modele: "", capacite: 0, prix_location_par_jour: 0, fournisseur_id: "", description: "", disponible: true });
    setSelectedCouveuse(null);
  };

  const openEdit = (c: Couveuse) => {
    setSelectedCouveuse(c);
    setFormData({
      modele: c.modele,
      capacite: c.capacite,
      prix_location_par_jour: Number(c.prix_location_par_jour),
      fournisseur_id: c.fournisseur_id,
      description: c.description || "",
      disponible: c.disponible
    });
    setIsEditOpen(true);
  };

  const filteredCouveuses = couveuses.filter((c) => {
    const matchesSearch = c.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.fournisseur_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "disponible" && c.disponible) ||
                         (statusFilter === "occupee" && !c.disponible);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCouveuses.length / itemsPerPage);
  const paginatedCouveuses = filteredCouveuses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Parc des Couveuses</h2>
          <p className="text-sm text-muted-foreground">Gestion des équipements d'incubation et de leur disponibilité.</p>
        </div>

        <Button 
          onClick={() => { resetForm(); setIsOpen(true); }}
          className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl"
        >
          <Plus className="h-5 w-5 mr-2" /> Nouvelle Couveuse
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-accent transition-colors" />
          <Input
            type="text"
            placeholder="Rechercher un modèle ou fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-white/10 text-white pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="État" />
          </SelectTrigger>
          <SelectContent className="bg-night border-white/10 text-white">
            <SelectItem value="all">Tous les états</SelectItem>
            <SelectItem value="disponible">Disponibles</SelectItem>
            <SelectItem value="occupee">Occupées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4 font-bold">Équipement</th>
                <th className="px-6 py-4 font-bold">Fournisseur</th>
                <th className="px-6 py-4 font-bold">Capacité</th>
                <th className="px-6 py-4 font-bold">Prix / Jour</th>
                <th className="px-6 py-4 font-bold">Disponibilité</th>
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
                  {paginatedCouveuses.map((c) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={c.id}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-orange-accent/10 flex items-center justify-center text-orange-accent">
                            <Box className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{c.modele}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">ID: {c.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {c.fournisseur_nom}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        {c.capacite} œufs
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        {Number(c.prix_location_par_jour).toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          c.disponible ? "bg-forest-green/10 text-forest-green border border-forest-green/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                        )}>
                          {c.disponible ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {c.disponible ? "Disponible" : "Occupée"}
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
                            <DropdownMenuItem onClick={() => openEdit(c)} className="hover:bg-white/5 cursor-pointer">
                              <Pencil className="h-4 w-4 mr-2" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">
                              <History className="h-4 w-4 mr-2" /> Historique
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => { setSelectedCouveuse(c); setDeleteConfirmOpen(true); }} 
                              className="text-destructive hover:bg-destructive/10 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
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
            <DialogTitle className="text-white font-display text-xl">{isEditOpen ? "Modifier Couveuse" : "Nouvelle Couveuse"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Renseignez les détails de l'équipement.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Modèle / Nom</Label>
              <Input value={formData.modele} onChange={(e) => setFormData({...formData, modele: e.target.value})} className="bg-white/5 border-white/10 text-white" placeholder="Ex: Automatique 500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Capacité (œufs)</Label>
                <Input type="number" value={formData.capacite} onChange={(e) => setFormData({...formData, capacite: parseInt(e.target.value) || 0})} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Prix / Jour (FCFA)</Label>
                <Input type="number" value={formData.prix_location_par_jour} onChange={(e) => setFormData({...formData, prix_location_par_jour: parseInt(e.target.value) || 0})} className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Fournisseur</Label>
                <Select value={formData.fournisseur_id} onValueChange={(val) => setFormData({...formData, fournisseur_id: val})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent className="bg-night border-white/10 text-white">
                    {fournisseurs.map(f => <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Disponibilité</Label>
                <Select value={formData.disponible ? "true" : "false"} onValueChange={(val) => setFormData({...formData, disponible: val === "true"})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-night border-white/10 text-white">
                    <SelectItem value="true">Disponible</SelectItem>
                    <SelectItem value="false">Occupée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-white/5 border-white/10 text-white" placeholder="État de l'équipement..." />
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
            <DialogDescription className="text-muted-foreground">Voulez-vous vraiment retirer cette couveuse du parc ?</DialogDescription>
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
