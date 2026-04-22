"use client";

import { useState } from "react";
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
  Trash2
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialVolailles = [
  { id: 1, type: "Poussin", quantite: 1200, prix: 15, fournisseur: "Ferme Nationale", statut: "En Stock" },
  { id: 2, type: "Poulet de Chair", quantite: 45, prix: 45, fournisseur: "Élevage Premium", statut: "Stock Bas" },
  { id: 3, type: "Canard", quantite: 150, prix: 35, fournisseur: "Ferme Nationale", statut: "En Stock" },
  { id: 4, type: "Pintade", quantite: 0, prix: 50, fournisseur: "Volailles du Sud", statut: "Rupture" },
  { id: 5, type: "Dinde", quantite: 85, prix: 120, fournisseur: "Élevage Premium", statut: "En Stock" },
];

export default function VolaillesPage() {
  const [volailles, setVolailles] = useState(initialVolailles);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const [newVolaille, setNewVolaille] = useState({ type: "", quantite: "", prix: "", fournisseur: "" });

  const handleAdd = () => {
    if (!newVolaille.type) return;
    const qte = parseInt(newVolaille.quantite) || 0;
    const item = {
      id: Date.now(),
      type: newVolaille.type,
      quantite: qte,
      prix: parseInt(newVolaille.prix) || 0,
      fournisseur: newVolaille.fournisseur || "Inconnu",
      statut: qte > 100 ? "En Stock" : qte > 0 ? "Stock Bas" : "Rupture"
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Inventaire des Volailles</h2>
          <p className="text-sm text-muted-foreground">Gérez votre stock de volailles et les alertes de réapprovisionnement.</p>
        </div>
        
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
                Remplissez les informations pour ajouter un nouveau stock de volaille.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs uppercase tracking-widest font-bold text-white/70">Type de Volaille</Label>
                  <Input 
                    value={newVolaille.type}
                    onChange={(e) => setNewVolaille({...newVolaille, type: e.target.value})}
                    className="bg-white/5 border-white/10 text-white" 
                    placeholder="Ex: Poussin" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fournisseur" className="text-xs uppercase tracking-widest font-bold text-white/70">Fournisseur</Label>
                  <Input 
                    value={newVolaille.fournisseur}
                    onChange={(e) => setNewVolaille({...newVolaille, fournisseur: e.target.value})}
                    className="bg-white/5 border-white/10 text-white" 
                    placeholder="Nom du fournisseur" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantite" className="text-xs uppercase tracking-widest font-bold text-white/70">Quantité</Label>
                  <Input 
                    id="quantite" 
                    type="number" 
                    value={newVolaille.quantite}
                    onChange={(e) => setNewVolaille({...newVolaille, quantite: e.target.value})}
                    className="bg-white/5 border-white/10 text-white" 
                    placeholder="0" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prix" className="text-xs uppercase tracking-widest font-bold text-white/70">Prix Unitaire (FCFA)</Label>
                  <Input 
                    id="prix" 
                    type="number" 
                    value={newVolaille.prix}
                    onChange={(e) => setNewVolaille({...newVolaille, prix: e.target.value})}
                    className="bg-white/5 border-white/10 text-white" 
                    placeholder="0" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs uppercase tracking-widest font-bold text-white/70">Notes / Description</Label>
                <textarea 
                  id="notes" 
                  className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-accent/50"
                  placeholder="Informations complémentaires..."
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleAdd}
                className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90"
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-orange-accent/10 flex items-center justify-center text-orange-accent">
            <Bird className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Volailles</p>
            <p className="text-xl font-mono font-bold text-white">
              {volailles.reduce((acc, curr) => acc + curr.quantite, 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-forest-green/10 flex items-center justify-center text-forest-green">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">En Stock</p>
            <p className="text-xl font-mono font-bold text-white">
              {volailles.filter(v => v.statut === "En Stock").length} Types
            </p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl border-orange-accent/20 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Alertes Stock</p>
            <p className="text-xl font-mono font-bold text-white">
              {volailles.filter(v => v.statut !== "En Stock").length} Alertes
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-2 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher une espèce ou un fournisseur..." 
            className="w-full h-10 bg-night/50 border border-white/10 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-accent/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center px-3 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
            <Filter className="h-4 w-4 mr-2 text-orange-accent" />
            Filtres
          </button>
          <div className="h-8 w-px bg-white/10 mx-2" />
          <div className="flex bg-night/50 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setView("grid")}
              className={cn("p-1.5 rounded-md transition-all", view === "grid" ? "bg-orange-accent text-night" : "text-muted-foreground hover:text-white")}
            >
              <Package className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setView("list")}
              className={cn("p-1.5 rounded-md transition-all", view === "list" ? "bg-orange-accent text-night" : "text-muted-foreground hover:text-white")}
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {volailles.map((v, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={v.id} 
                className="glass-card p-5 rounded-2xl group hover:border-orange-accent/30 transition-all relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center border border-white/10">
                    <Bird className="h-6 w-6 text-orange-accent" />
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold",
                    v.statut === "En Stock" ? "bg-forest-green/10 text-forest-green" : 
                    v.statut === "Stock Bas" ? "bg-orange-accent/10 text-orange-accent" : 
                    "bg-destructive/10 text-destructive"
                  )}>
                    {v.statut}
                  </div>
                </div>
                
                <h4 className="text-lg font-display font-bold text-white mb-1">{v.type}</h4>
                <p className="text-xs text-muted-foreground mb-4">Par {v.fournisseur}</p>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Quantité</p>
                    <p className="text-xl font-mono font-bold text-white">{v.quantite}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Prix Unitaire</p>
                    <p className="text-lg font-mono font-bold text-orange-accent">{v.prix} <span className="text-[10px]">FCFA</span></p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                  <button className="flex-1 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                    Modifier
                  </button>
                  <button 
                    onClick={() => confirmDelete(v.id)}
                    className="p-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4 font-semibold">Espèce</th>
                <th className="px-6 py-4 font-semibold">Fournisseur</th>
                <th className="px-6 py-4 font-semibold">Quantité</th>
                <th className="px-6 py-4 font-semibold">Prix Unitaire</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {volailles.map((v) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={v.id} 
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white">{v.type}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{v.fournisseur}</td>
                    <td className="px-6 py-4 font-mono font-bold text-white">{v.quantite}</td>
                    <td className="px-6 py-4 font-mono text-orange-accent">{v.prix} FCFA</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold",
                        v.statut === "En Stock" ? "bg-forest-green/10 text-forest-green" : 
                        v.statut === "Stock Bas" ? "bg-orange-accent/10 text-orange-accent" : 
                        "bg-destructive/10 text-destructive"
                      )}>
                        {v.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(v.id)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Voulez-vous vraiment supprimer cet article de l'inventaire ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="border-white/10 text-white hover:bg-white/5">
              Annuler
            </Button>
            <Button onClick={handleDelete} className="bg-destructive text-white font-bold hover:bg-destructive/90">
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
