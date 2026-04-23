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
  const [newCouveuse, setNewCouveuse] = useState({ 
    modele: "", 
    capacite: 0, 
    prix_location_par_jour: 0, 
    fournisseur_id: "" 
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
    if (!newCouveuse.modele || !newCouveuse.fournisseur_id) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    try {
      const supabase = createClient();
      const model = new CouveuseModel(supabase);
      await model.create({
        ...newCouveuse,
        actif: true,
        disponible: true,
        description: null
      });
      setIsOpen(false);
      setNewCouveuse({ modele: "", capacite: 0, prix_location_par_jour: 0, fournisseur_id: "" });
      fetchData();
    } catch (error) {
      console.error("Error creating couveuse:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette couveuse ?")) {
      try {
        const supabase = createClient();
        const model = new CouveuseModel(supabase);
        await model.delete(id);
        fetchData();
      } catch (error) {
        console.error("Error deleting couveuse:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Gestion des Couveuses</h2>
          <p className="text-sm text-muted-foreground">Suivi de la disponibilité et location des équipements d'incubation.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl">
              <Plus className="h-5 w-5 mr-2" />
              Ajouter une Couveuse
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white font-display text-xl">Nouvelle Couveuse</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Ajoutez un nouvel équipement à votre parc.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Modèle / Nom</Label>
                <Input 
                  value={newCouveuse.modele}
                  onChange={(e) => setNewCouveuse({...newCouveuse, modele: e.target.value})}
                  className="bg-white/5 border-white/10 text-white" 
                  placeholder="Ex: Automatique 500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Capacité (œufs)</Label>
                  <Input 
                    type="number"
                    value={newCouveuse.capacite}
                    onChange={(e) => setNewCouveuse({...newCouveuse, capacite: parseInt(e.target.value) || 0})}
                    className="bg-white/5 border-white/10 text-white" 
                    placeholder="0" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Prix / Jour (FCFA)</Label>
                  <Input 
                    type="number"
                    value={newCouveuse.prix_location_par_jour}
                    onChange={(e) => setNewCouveuse({...newCouveuse, prix_location_par_jour: parseInt(e.target.value) || 0})}
                    className="bg-white/5 border-white/10 text-white" 
                    placeholder="0" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Fournisseur</Label>
                <Select 
                  value={newCouveuse.fournisseur_id} 
                  onValueChange={(val) => setNewCouveuse({...newCouveuse, fournisseur_id: val})}
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                Annuler
              </Button>
              <Button onClick={handleAdd} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90">
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-accent" />
          <p className="text-muted-foreground animate-pulse">Chargement des couveuses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {couveuses.map((c) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={c.id} 
                className="glass-card rounded-2xl overflow-hidden group border-white/5 hover:border-orange-accent/30 transition-all"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-night flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <Box className="h-7 w-7 text-orange-accent" />
                    </div>
                    <div className="flex gap-2">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        c.disponible ? "bg-forest-green/10 text-forest-green border border-forest-green/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                      )}>
                        {c.disponible ? "Disponible" : "Occupée"}
                      </div>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-display font-bold text-white mb-1">{c.modele}</h3>
                  <p className="text-xs text-muted-foreground mb-6">Fournisseur : {c.fournisseur_nom}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Capacité</p>
                      <div className="flex items-center text-white font-mono font-bold">
                        <Zap className="h-3 w-3 mr-1 text-orange-accent" />
                        {c.capacite} <span className="text-[10px] ml-1 text-muted-foreground">œufs</span>
                      </div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Prix / jour</p>
                      <p className="text-white font-mono font-bold">{c.prix_location_par_jour.toLocaleString()} <span className="text-[10px] text-muted-foreground">FCFA</span></p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 text-xs font-bold bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors flex items-center justify-center">
                      <Activity className="h-3 w-3 mr-2" />
                      État
                    </button>
                    <button className="flex-1 py-2.5 text-xs font-bold bg-orange-accent/10 hover:bg-orange-accent text-orange-accent hover:text-night rounded-xl transition-all flex items-center justify-center">
                      <History className="h-3 w-3 mr-2" />
                      Historique
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
