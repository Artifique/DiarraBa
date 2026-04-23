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
  Grid3X3,
  List,
  Loader2
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
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [newVolaille, setNewVolaille] = useState({ 
    type: "Poussin" as VolailleType, 
    quantite_disponible: 0, 
    prix_unitaire: 0, 
    fournisseur_id: "" 
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
    if (!newVolaille.fournisseur_id) {
      alert("Veuillez sélectionner un fournisseur");
      return;
    }
    try {
      const supabase = createClient();
      const model = new VolailleModel(supabase);
      await model.create({
        ...newVolaille,
        actif: true,
        description: null
      });
      setIsOpen(false);
      setNewVolaille({ type: "Poussin", quantite_disponible: 0, prix_unitaire: 0, fournisseur_id: "" });
      fetchData();
    } catch (error) {
      console.error("Error creating volaille:", error);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        const supabase = createClient();
        const model = new VolailleModel(supabase);
        await model.delete(itemToDelete);
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        fetchData();
      } catch (error) {
        console.error("Error deleting volaille:", error);
      }
    }
  };

  const getStatus = (qte: number) => {
    if (qte === 0) return "Rupture";
    if (qte < 100) return "Stock Bas";
    return "En Stock";
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "En Stock": return "text-forest-green";
      case "Stock Bas": return "text-yellow-500";
      case "Rupture": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "En Stock": return <CheckCircle2 className="h-4 w-4" />;
      case "Stock Bas": return <AlertTriangle className="h-4 w-4" />;
      case "Rupture": return <Package className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredVolailles = volailles.filter((v) => {
    const statut = getStatus(v.quantite_disponible);
    const matchesSearch =
      v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.fournisseur_nom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || v.date_ajout.startsWith(dateFilter);
    const matchesStatus = !statusFilter || statut === statusFilter;

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
          <p className="text-sm text-muted-foreground">Gérez votre stock de volailles et les alertes de réapprovisionnement.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("grid")}
            className={view === "grid" ? "bg-orange-accent text-night" : "border-white/10 text-white hover:bg-white/5"}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
            className={view === "list" ? "bg-orange-accent text-night" : "border-white/10 text-white hover:bg-white/5"}
          >
            <List className="h-4 w-4" />
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl">
                <Plus className="h-5 w-5 mr-2" />
                Ajouter une Volaille
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-night border-white/10 text-white sm:max-w-lg overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-white font-display text-xl">Nouvelle Volaille</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Ajoutez une nouvelle volaille à votre inventaire.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Type</Label>
                    <Select 
                      value={newVolaille.type} 
                      onValueChange={(val: VolailleType) => setNewVolaille({...newVolaille, type: val})}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Type de volaille" />
                      </SelectTrigger>
                      <SelectContent className="bg-night border-white/10">
                        {VOLAILLE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Quantité</Label>
                    <Input
                      type="number"
                      value={newVolaille.quantite_disponible}
                      onChange={(e) => setNewVolaille({...newVolaille, quantite_disponible: parseInt(e.target.value) || 0})}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Prix (FCFA)</Label>
                    <Input
                      type="number"
                      value={newVolaille.prix_unitaire}
                      onChange={(e) => setNewVolaille({...newVolaille, prix_unitaire: parseInt(e.target.value) || 0})}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Fournisseur</Label>
                    <Select 
                      value={newVolaille.fournisseur_id} 
                      onValueChange={(val) => setNewVolaille({...newVolaille, fournisseur_id: val})}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Choisir un fournisseur" />
                      </SelectTrigger>
                      <SelectContent className="bg-night border-white/10">
                        {fournisseurs.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/10 text-white hover:bg-white/5">Annuler</Button>
                <Button onClick={handleAdd} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90">
                  Ajouter au Stock
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-accent transition-colors" />
          <Input
            type="text"
            placeholder="Rechercher une volaille..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent className="bg-night border-white/10">
            <SelectItem value="null">Tous les statuts</SelectItem>
            <SelectItem value="En Stock">En Stock</SelectItem>
            <SelectItem value="Stock Bas">Stock Bas</SelectItem>
            <SelectItem value="Rupture">Rupture</SelectItem>
          </SelectContent>
        </Select>
        <DateFilter
          value={dateFilter}
          onChange={setDateFilter}
          placeholder="Filtrer par date d'ajout"
          className="max-w-xs"
        />
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-accent" />
          <p className="text-muted-foreground animate-pulse">Chargement de l'inventaire...</p>
        </div>
      ) : (
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {paginatedVolailles.map((volaille) => {
                  const statut = getStatus(volaille.quantite_disponible);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={volaille.id}
                      className="glass-card rounded-2xl p-6 border border-white/5 hover:border-orange-accent/20 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-orange-accent/10 border border-orange-accent/20 flex items-center justify-center text-orange-accent">
                          <Bird className="h-6 w-6" />
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(statut)}
                          <span className={cn("text-xs font-bold", getStatusColor(statut))}>
                            {statut}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-display font-bold text-white">{volaille.type}</h3>
                          <p className="text-xs text-muted-foreground">ID: #{volaille.id.slice(0, 8)}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Quantité:</span>
                            <span className="text-white font-mono font-bold">{volaille.quantite_disponible}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Prix:</span>
                            <span className="text-white font-mono font-bold">{volaille.prix_unitaire.toLocaleString()} FCFA</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Fournisseur:</span>
                            <span className="text-white truncate max-w-[120px]" title={volaille.fournisseur_nom}>
                              {volaille.fournisseur_nom}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                            Ajouté le {new Date(volaille.date_ajout).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => { setItemToDelete(volaille.id); setDeleteConfirmOpen(true); }}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="px-6 py-4 font-bold">Volaille</th>
                      <th className="px-6 py-4 font-bold">Quantité</th>
                      <th className="px-6 py-4 font-bold">Prix</th>
                      <th className="px-6 py-4 font-bold">Fournisseur</th>
                      <th className="px-6 py-4 font-bold">Statut</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                      {paginatedVolailles.map((volaille) => {
                        const statut = getStatus(volaille.quantite_disponible);
                        return (
                          <motion.tr
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={volaille.id}
                            className="group hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-orange-accent/10 border border-orange-accent/20 flex items-center justify-center text-orange-accent">
                                  <Bird className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">{volaille.type}</p>
                                  <p className="text-[10px] text-muted-foreground">ID: #{volaille.id.slice(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-mono font-bold text-white">{volaille.quantite_disponible}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-mono font-bold text-white">{volaille.prix_unitaire.toLocaleString()} FCFA</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {volaille.fournisseur_nom}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(statut)}
                                <span className={cn("text-xs font-bold", getStatusColor(statut))}>
                                  {statut}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => { setItemToDelete(volaille.id); setDeleteConfirmOpen(true); }}
                                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer cette volaille de l'inventaire ? Cette action est irréversible.
            </DialogDescription>
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
