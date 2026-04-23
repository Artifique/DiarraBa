"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Plus,
  Search,
  User,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
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
import { ReservationModel, ClientModel, VolailleModel, CouveuseModel } from "@/lib/models";
import { StatutReservation } from "@/types/database";

export default function ReservationsPage() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [volailles, setVolailles] = useState<any[]>([]);
  const [couveuses, setCouveuses] = useState<any[]>([]);

  const [selectedRes, setSelectedRes] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [newRes, setNewRes] = useState({
    client_id: "",
    type_volaille_id: "",
    quantite: 0,
    prix_unitaire: 0,
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

      const [rData, cData, vData, coData] = await Promise.all([
        rModel.findAllWithDetails(),
        cModel.findAll(),
        vModel.findAll(),
        coModel.findAll()
      ]);

      setReservations(rData);
      setClients(cData);
      setVolailles(vData);
      setCouveuses(coData);
    } catch (error) {
      console.error("Error fetching reservations data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!newRes.client_id || !newRes.quantite) return;
    try {
      const supabase = createClient();
      const rModel = new ReservationModel(supabase);
      
      const total = newRes.quantite * newRes.prix_unitaire;
      
      const reservation = await rModel.create({
        client_id: newRes.client_id,
        prix_total: total,
        statut_reservation: "EnAttente",
        date_reservation: new Date().toISOString(),
        date_livraison_prevue: new Date().toISOString(),
        type_paiement: "Tranche",
        notes: null
      });

      if (newRes.type_volaille_id) {
        await rModel.addVolaille({
          reservation_id: reservation.id,
          volaille_id: newRes.type_volaille_id,
          quantite: newRes.quantite,
          prix_unitaire: newRes.prix_unitaire,
          sous_total: total
        });
      }

      // Optionnel: Créer une livraison si lieu_livraison est rempli
      if (newRes.lieu_livraison) {
        await supabase.from("livraisons").insert({
          reservation_id: reservation.id,
          lieu: newRes.lieu_livraison,
          statut: "Planifiee"
        });
      }

      setIsOpen(false);
      setNewRes({ client_id: "", type_volaille_id: "", quantite: 0, prix_unitaire: 0, lieu_livraison: "" });
      fetchData();
    } catch (error) {
      console.error("Error creating reservation:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: StatutReservation) => {
    try {
      const supabase = createClient();
      const model = new ReservationModel(supabase);
      await model.updateStatut(id, newStatus);
      fetchData();
      if (selectedRes?.id === id) {
        const updated = await model.findById(id);
        setSelectedRes({ ...selectedRes, ...updated });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        const supabase = createClient();
        const model = new ReservationModel(supabase);
        await model.delete(itemToDelete);
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        if (selectedRes?.id === itemToDelete) setSelectedRes(null);
        fetchData();
      } catch (error) {
        console.error("Error cancelling reservation:", error);
      }
    }
  };

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.clients?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || res.date_reservation.startsWith(dateFilter);

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatItems = (res: any) => {
    const items = [];
    if (res.reservation_volailles?.length > 0) {
      items.push(`${res.reservation_volailles[0].quantite} ${res.reservation_volailles[0].volailles?.type}`);
    }
    if (res.reservation_couveuses?.length > 0) {
      items.push(`${res.reservation_couveuses.length} Couveuse(s)`);
    }
    return items.join(", ") || "Aucun article";
  };

  return (
    <div className="h-full flex flex-col gap-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">
            Réservations & Commandes
          </h2>
          <p className="text-sm text-muted-foreground">
            Gérez les commandes clients, les acomptes et les plannings de livraison.
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl">
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle Réservation
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-night border-white/10 text-white sm:max-w-2xl overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-white font-display text-xl">
                Nouvelle Réservation
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Créez une nouvelle commande pour un client.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                    Client
                  </Label>
                  <Select onValueChange={(val) => setNewRes({ ...newRes, client_id: val })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Choisir un client" />
                    </SelectTrigger>
                    <SelectContent className="bg-night border-white/10 text-white">
                      {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                    Lieu de Livraison
                  </Label>
                  <Input
                    value={newRes.lieu_livraison}
                    onChange={(e) => setNewRes({ ...newRes, lieu_livraison: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Ville ou adresse"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                  Articles & Tarification
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="md:col-span-2">
                    <Select onValueChange={(val) => {
                      const v = volailles.find(x => x.id === val);
                      setNewRes({ ...newRes, type_volaille_id: val, prix_unitaire: v?.prix_unitaire || 0 });
                    }}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Choisir une volaille" />
                      </SelectTrigger>
                      <SelectContent className="bg-night border-white/10 text-white">
                        {volailles.map(v => <SelectItem key={v.id} value={v.id}>{v.type} ({v.quantite_disponible})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    value={newRes.quantite}
                    onChange={(e) => setNewRes({ ...newRes, quantite: parseInt(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Qté"
                  />
                  <Input
                    type="number"
                    value={newRes.prix_unitaire}
                    onChange={(e) => setNewRes({ ...newRes, prix_unitaire: parseInt(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Prix Unit."
                  />
                </div>
                {newRes.quantite > 0 && newRes.prix_unitaire > 0 && (
                  <p className="text-right text-xs font-bold text-orange-accent">
                    Total estimé : {(newRes.quantite * newRes.prix_unitaire).toLocaleString()} FCFA
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                Annuler
              </Button>
              <Button onClick={handleAdd} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90">
                Confirmer la commande
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-accent transition-colors" />
          <Input
            type="text"
            placeholder="Rechercher une réservation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground pl-10"
          />
        </div>
        <DateFilter
          value={dateFilter}
          onChange={setDateFilter}
          placeholder="Filtrer par date"
          className="max-w-xs"
        />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-accent" />
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-hidden">
          <div className={cn("transition-all duration-500 flex flex-col gap-4", selectedRes ? "w-1/2" : "w-full")}>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              <AnimatePresence mode="popLayout">
                {paginatedReservations.map((res) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={res.id}
                    onClick={() => setSelectedRes(res)}
                    className={cn(
                      "glass-card p-4 rounded-xl border border-white/5 cursor-pointer transition-all hover:bg-white/[0.03]",
                      selectedRes?.id === res.id ? "border-orange-accent/50 bg-white/[0.05] orange-glow" : "hover:border-white/20"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          res.statut_reservation === "Confirmee" ? "bg-blue-400/10 text-blue-400" : 
                          res.statut_reservation === "Livree" ? "bg-forest-green/10 text-forest-green" : 
                          "bg-orange-accent/10 text-orange-accent"
                        )}>
                          <CalendarCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{res.clients?.nom}</h4>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">{res.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-bold text-white">{res.prix_total.toLocaleString()} FCFA</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(res.date_reservation).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-[11px] text-muted-foreground truncate max-w-[200px] italic">
                        {formatItems(res)}
                      </p>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
                        res.statut_reservation === "Confirmee" ? "bg-blue-400/10 text-blue-400 border border-blue-400/20" : 
                        res.statut_reservation === "Livree" ? "bg-forest-green/10 text-forest-green border border-forest-green/20" : 
                        "bg-orange-accent/10 text-orange-accent border border-orange-accent/20"
                      )}>
                        {res.statut_reservation}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </div>

          <AnimatePresence>
            {selectedRes && (
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                className="w-1/2 glass-card rounded-2xl border-white/10 overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <button onClick={() => setSelectedRes(null)} className="p-2 hover:bg-white/5 rounded-full text-muted-foreground hover:text-white transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h3 className="font-display font-bold text-white">Détails de la Réservation</h3>
                  <button onClick={() => { setItemToDelete(selectedRes.id); setDeleteConfirmOpen(true); }} className="p-2 hover:bg-destructive/10 text-destructive rounded-full transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-full bg-orange-accent/10 flex items-center justify-center text-orange-accent text-xl font-bold border border-orange-accent/20">
                        {selectedRes.clients?.nom.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{selectedRes.clients?.nom}</h4>
                        <p className="text-sm text-muted-foreground">{selectedRes.clients?.telephone}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-2 text-orange-accent" />
                        Créée le : {new Date(selectedRes.date_reservation).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center text-muted-foreground text-right">
                        Lieu : {selectedRes.lieu_livraison || "Non spécifié"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Articles réservés</h5>
                    <div className="space-y-2">
                      {selectedRes.reservation_volailles?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-sm text-white font-medium">{item.quantite} {item.volailles?.type}</span>
                          <span className="text-xs text-orange-accent font-bold">{item.prix_unitaire.toLocaleString()} FCFA/u</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Suivi de paiement</h5>
                      <span className="text-xs font-mono font-bold text-white">
                        {selectedRes.prix_total > 0 ? Math.round((selectedRes.montant_paye / selectedRes.prix_total) * 100) : 0}% Payé
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedRes.prix_total > 0 ? (selectedRes.montant_paye / selectedRes.prix_total) * 100 : 0}%` }}
                        className="h-full bg-forest-green"
                      />
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground italic">Payé: {selectedRes.montant_paye.toLocaleString()} FCFA</span>
                      <span className="text-white font-bold">Total: {selectedRes.prix_total.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progression</h5>
                    <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                      {[
                        { label: "Créée", active: true, icon: CheckCircle2 },
                        { label: "Confirmée", active: selectedRes.statut_reservation !== "EnAttente" && selectedRes.statut_reservation !== "Annulee", icon: CheckCircle2 },
                        { label: "Livrée", active: selectedRes.statut_reservation === "Livree", icon: CheckCircle2 },
                      ].map((step, idx) => (
                        <div key={idx} className="flex items-center gap-4 relative z-10">
                          <div className={cn("h-[23px] w-[23px] rounded-full flex items-center justify-center border-2", 
                            step.active ? "bg-forest-green border-forest-green text-night" : "bg-night border-white/10 text-muted-foreground")}>
                            <step.icon className="h-3 w-3" />
                          </div>
                          <p className={cn("text-xs font-bold", step.active ? "text-white" : "text-muted-foreground")}>{step.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.02] flex gap-3">
                  {selectedRes.statut_reservation === "EnAttente" && (
                    <button onClick={() => handleStatusChange(selectedRes.id, "Confirmee")} className="flex-1 py-3 bg-blue-400 text-night text-xs font-bold rounded-xl transition-all">
                      Confirmer
                    </button>
                  )}
                  {selectedRes.statut_reservation === "Confirmee" && (
                    <button onClick={() => handleStatusChange(selectedRes.id, "Livree")} className="flex-1 py-3 bg-orange-accent text-night text-xs font-bold rounded-xl transition-all">
                      Marquer Livré
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">Annuler la Réservation</DialogTitle>
            <DialogDescription className="text-muted-foreground">Voulez-vous vraiment annuler cette réservation ?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="border-white/10 text-white hover:bg-white/5">Garder</Button>
            <Button onClick={handleDelete} className="bg-destructive text-white font-bold hover:bg-destructive/90">Annuler la commande</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
