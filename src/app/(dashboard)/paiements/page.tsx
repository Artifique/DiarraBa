"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Download,
  Trash2,
  Clock,
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
import { PaiementModel, ClientModel, ReservationModel } from "@/lib/models";
import { Paiement, Client, Reservation } from "@/types/database";

export default function PaiementsPage() {
  const [loading, setLoading] = useState(true);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [newPayment, setNewPayment] = useState({
    client_id: "",
    reservation_id: "",
    montant: 0,
    methode_paiement: "Especes",
  });

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const pModel = new PaiementModel(supabase);
      const cModel = new ClientModel(supabase);
      const rModel = new ReservationModel(supabase);

      const [pData, cData, rData] = await Promise.all([
        pModel.findAllWithDetails(),
        cModel.findAll(),
        rModel.findAllWithDetails()
      ]);

      const enhancedPaiements = pData.map(p => ({
        ...p,
        client_nom: p.reservations?.clients?.nom || "Inconnu",
        reservation_ref: p.reservation_id?.slice(0, 8) || "N/A"
      }));

      setPaiements(enhancedPaiements);
      setClients(cData);
      setReservations(rData);
    } catch (error) {
      console.error("Error fetching payments data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!newPayment.client_id || !newPayment.montant) return;
    try {
      const supabase = createClient();
      const model = new PaiementModel(supabase);
      await model.create({
        reservation_id: newPayment.reservation_id,
        montant: newPayment.montant,
        methode: newPayment.methode_paiement as any,
        statut: "Completed",
        date_paiement: new Date().toISOString(),
        reference: null,
        notes: null
      });
      setIsOpen(false);
      setNewPayment({ client_id: "", reservation_id: "", montant: 0, methode_paiement: "Especes" });
      fetchData();
    } catch (error) {
      console.error("Error registering payment:", error);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        const supabase = createClient();
        const model = new PaiementModel(supabase);
        await model.delete(itemToDelete);
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        fetchData();
      } catch (error) {
        console.error("Error deleting payment:", error);
      }
    }
  };

  const filteredPaiements = paiements.filter((p) => {
    const matchesSearch =
      p.client_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.methode_paiement.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || p.date_paiement.startsWith(dateFilter);

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);
  const paginatedPaiements = filteredPaiements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Suivi des Paiements</h2>
          <p className="text-sm text-muted-foreground">Visualisez et gérez toutes les transactions financières de la ferme.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all">
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl">
                <CreditCard className="h-4 w-4 mr-2" />
                Enregistrer un Paiement
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white font-display text-xl">Enregistrer un Paiement</DialogTitle>
                <DialogDescription className="text-muted-foreground">Saisissez les détails de la transaction financière.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Client</Label>
                  <Select onValueChange={(val) => setNewPayment({ ...newPayment, client_id: val })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Choisir un client" />
                    </SelectTrigger>
                    <SelectContent className="bg-night border-white/10 text-white">
                      {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Réservation (Facultatif)</Label>
                  <Select onValueChange={(val) => setNewPayment({ ...newPayment, reservation_id: val })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Associer à une commande" />
                    </SelectTrigger>
                    <SelectContent className="bg-night border-white/10 text-white">
                      <SelectItem value="none">Aucune</SelectItem>
                      {reservations.filter(r => r.client_id === newPayment.client_id).map(r => (
                        <SelectItem key={r.id} value={r.id}>Commande #{r.id.slice(0,8)} ({r.prix_total} FCFA)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Montant (FCFA)</Label>
                    <Input
                      type="number"
                      value={newPayment.montant}
                      onChange={(e) => setNewPayment({ ...newPayment, montant: parseInt(e.target.value) || 0 })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Méthode</Label>
                    <Select onValueChange={(val) => setNewPayment({ ...newPayment, methode_paiement: val })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-night border-white/10 text-white">
                        <SelectItem value="Especes">Espèces</SelectItem>
                        <SelectItem value="Virement">Virement</SelectItem>
                        <SelectItem value="Cheque">Chèque</SelectItem>
                        <SelectItem value="OrangeMoney">Orange Money</SelectItem>
                        <SelectItem value="Wave">Wave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/10 text-white hover:bg-white/5">Annuler</Button>
                <Button onClick={handleAdd} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90">Confirmer l'encaissement</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-accent transition-colors" />
          <Input
            type="text"
            placeholder="Rechercher un paiement..."
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
        <div className="py-24 flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Total Encaissé", value: paiements.reduce((acc, curr) => acc + curr.montant, 0).toLocaleString(), icon: ArrowDownCircle, color: "text-forest-green" },
              { label: "Transactions", value: paiements.length.toString(), icon: CreditCard, color: "text-blue-400" },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}><stat.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</p>
                    <p className="text-lg font-mono font-bold text-white">{stat.value} <span className="text-[10px] opacity-50">FCFA</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/5">
                <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">Référence</th>
                  <th className="px-6 py-4 font-semibold">Client / Réservation</th>
                  <th className="px-6 py-4 font-semibold">Montant</th>
                  <th className="px-6 py-4 font-semibold">Méthode</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {paginatedPaiements.map((p) => (
                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{p.id.slice(0, 8)}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(p.date_paiement).toLocaleDateString('fr-FR')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white">{p.client_nom}</p>
                        <p className="text-[10px] text-orange-accent font-medium">Ref: {p.reservation_ref}</p>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-white">{p.montant.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] px-2 py-1 bg-white/5 rounded-md text-muted-foreground border border-white/5">{p.methode_paiement}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-forest-green/10 text-forest-green border border-forest-green/20")}>
                          Terminé
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setItemToDelete(p.id); setDeleteConfirmOpen(true); }} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {totalPages > 1 && <div className="px-6 py-4 border-t border-white/5"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
          </div>
        </>
      )}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-muted-foreground">Êtes-vous sûr de vouloir supprimer ce paiement ?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="border-white/10 text-white hover:bg-white/5">Annuler</Button>
            <Button onClick={handleDelete} className="bg-destructive text-white font-bold hover:bg-destructive/90">Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
