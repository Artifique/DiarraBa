"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bird,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Package,
  Trash2,
  Grid3X3,
  List
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

const initialVolailles = [
  { id: 1, type: "Poussin", quantite: 1200, prix: 15, fournisseur: "Ferme Nationale", statut: "En Stock", date: "15 Jan 2024" },
  { id: 2, type: "Poulet de Chair", quantite: 45, prix: 45, fournisseur: "Élevage Premium", statut: "Stock Bas", date: "08 Feb 2024" },
  { id: 3, type: "Canard", quantite: 150, prix: 35, fournisseur: "Ferme Nationale", statut: "En Stock", date: "22 Mar 2024" },
  { id: 4, type: "Pintade", quantite: 0, prix: 50, fournisseur: "Volailles du Sud", statut: "Rupture", date: "10 Apr 2024" },
  { id: 5, type: "Dinde", quantite: 85, prix: 120, fournisseur: "Élevage Premium", statut: "En Stock", date: "05 May 2024" },
];

export default function VolaillesPage() {
  const [volailles, setVolailles] = useState(initialVolailles);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [newVolaille, setNewVolaille] = useState({ type: "", quantite: "", prix: "", fournisseur: "" });

  // Filtered and paginated volailles
  const filteredVolailles = volailles.filter((volaille) => {
    const matchesSearch =
      volaille.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volaille.fournisseur.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || volaille.date === dateFilter;
    const matchesStatus = !statusFilter || volaille.statut === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const totalPages = Math.ceil(filteredVolailles.length / itemsPerPage);
  const paginatedVolailles = filteredVolailles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, statusFilter]);

  const handleAdd = () => {
    if (!newVolaille.type) return;
    const qte = parseInt(newVolaille.quantite) || 0;
    const item = {
      id: Date.now(),
      type: newVolaille.type,
      quantite: qte,
      prix: parseInt(newVolaille.prix) || 0,
      fournisseur: newVolaille.fournisseur || "Inconnu",
      statut: qte > 100 ? "En Stock" : qte > 0 ? "Stock Bas" : "Rupture",
      date: new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
    setVolailles([item, ...volailles]);
    setIsOpen(false);
    setNewVolaille({ type: "", quantite: "", prix: "", fournisseur: "" });
  };

  const confirmDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      setVolailles(volailles.filter(v => v.id !== itemToDelete));
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
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
                    <Input
                      value={newVolaille.type}
                      onChange={(e) => setNewVolaille({...newVolaille, type: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="ex: Poussin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Quantité</Label>
                    <Input
                      type="number"
                      value={newVolaille.quantite}
                      onChange={(e) => setNewVolaille({...newVolaille, quantite: e.target.value})}
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
                      value={newVolaille.prix}
                      onChange={(e) => setNewVolaille({...newVolaille, prix: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Fournisseur</Label>
                    <Input
                      value={newVolaille.fournisseur}
                      onChange={(e) => setNewVolaille({...newVolaille, fournisseur: e.target.value})}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Nom du fournisseur"
                    />
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
            <SelectItem value="">Tous les statuts</SelectItem>
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

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {paginatedVolailles.map((volaille) => (
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
                    {getStatusIcon(volaille.statut)}
                    <span className={cn("text-xs font-bold", getStatusColor(volaille.statut))}>
                      {volaille.statut}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">{volaille.type}</h3>
                    <p className="text-xs text-muted-foreground">ID: #{volaille.id.toString().slice(-4)}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantité:</span>
                      <span className="text-white font-mono font-bold">{volaille.quantite}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prix:</span>
                      <span className="text-white font-mono font-bold">{volaille.prix} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fournisseur:</span>
                      <span className="text-white">{volaille.fournisseur}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      Ajouté le {volaille.date}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => confirmDelete(volaille.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
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
                  {paginatedVolailles.map((volaille) => (
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
                            <p className="text-[10px] text-muted-foreground">ID: #{volaille.id.toString().slice(-4)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-mono font-bold text-white">{volaille.quantite}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-mono font-bold text-white">{volaille.prix} FCFA</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {volaille.fournisseur}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(volaille.statut)}
                          <span className={cn("text-xs font-bold", getStatusColor(volaille.statut))}>
                            {volaille.statut}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => confirmDelete(volaille.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/5">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Pagination for grid view */}
      {view === "grid" && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
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
