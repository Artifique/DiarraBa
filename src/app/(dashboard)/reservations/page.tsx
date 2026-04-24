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
  Trash2,
  Loader2,
  Eye,
  ChevronRight,
  MapPin,
  MoreVertical,
  Pencil
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
  const [isViewOpen, setIsViewOpen] = useState(false);
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
        setIsViewOpen(false);
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
        setIsViewOpen(false);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Réservations & Commandes</h2>
          <p className="text-sm text-muted-foreground">Suivi des commandes clients et plannings.</p>
        </div>
        
        <Button onClick={() => setIsOpen(true)} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl">
          <Plus className="h-5 w-5 mr-2" /> Nouvelle Réservation
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
        <DateFilter value={dateFilter} onChange={setDateFilter} className="max-w-xs" />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4 font-bold">Client / Réf</th>
                <th className="px-6 py-4 font-bold">Articles</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Statut</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-orange-accent mx-auto" /></td></tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedReservations.map((res) => (
                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={res.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => { setSelectedRes(res); setIsViewOpen(true); }}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{res.clients?.nom}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">ID: {res.id.slice(0, 8)}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground italic">
                        {formatItems(res)}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        {res.prix_total.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                          res.statut_reservation === "Confirmee" ? "bg-blue-400/10 text-blue-400 border border-blue-400/20" : 
                          res.statut_reservation === "Livree" ? "bg-forest-green/10 text-forest-green border border-forest-green/20" : 
                          "bg-orange-accent/10 text-orange-accent border border-orange-accent/20"
                        )}>
                          {res.statut_reservation}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-white"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-night border-white/10 text-white">
                            <DropdownMenuItem onClick={() => { setSelectedRes(res); setIsViewOpen(true); }} className="hover:bg-white/5 cursor-pointer"><Eye className="h-4 w-4 mr-2" /> Voir</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setItemToDelete(res.id); setDeleteConfirmOpen(true); }} className="text-destructive hover:bg-destructive/10 cursor-pointer"><Trash2 className="h-4 w-4 mr-2" /> Annuler</DropdownMenuItem>
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
        {totalPages > 1 && <div className="px-6 py-4 border-t border-white/5"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
      </div>

      {/* Modal View Details */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-xl">
          {selectedRes && (
            <div className="space-y-8 py-4">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-full bg-orange-accent/10 border-2 border-orange-accent flex items-center justify-center text-orange-accent text-2xl font-bold">
                  {selectedRes.clients?.nom.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white">{selectedRes.clients?.nom}</h3>
                  <p className="text-muted-foreground text-xs">{selectedRes.clients?.telephone}</p>
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10">
                    Réf: {selectedRes.id.slice(0, 12)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Informations</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-white/70"><Clock className="h-4 w-4 mr-2 text-orange-accent" /> {new Date(selectedRes.date_reservation).toLocaleDateString('fr-FR')}</div>
                      <div className="flex items-center text-white/70"><MapPin className="h-4 w-4 mr-2 text-orange-accent" /> {selectedRes.livraisons?.[0]?.lieu || "À définir"}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div><p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Paiement</p>
                    <div className="space-y-1">
                      <p className="text-xl font-mono font-bold text-white">{selectedRes.prix_total.toLocaleString()} FCFA</p>
                      <p className="text-[10px] text-forest-green font-bold">Payé: {selectedRes.montant_paye?.toLocaleString() || 0} FCFA</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Articles</p>
                <div className="space-y-2">
                  {selectedRes.reservation_volailles?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-sm font-medium">{item.quantite} {item.volailles?.type}</span>
                      <span className="text-xs font-bold text-orange-accent">{item.prix_unitaire.toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                {selectedRes.statut_reservation === "EnAttente" && (
                  <Button onClick={() => handleStatusChange(selectedRes.id, "Confirmee")} className="flex-1 bg-blue-400 text-night font-bold">Confirmer</Button>
                )}
                {selectedRes.statut_reservation === "Confirmee" && (
                  <Button onClick={() => handleStatusChange(selectedRes.id, "Livree")} className="flex-1 bg-forest-green text-white font-bold">Marquer Livré</Button>
                )}
                <Button variant="outline" onClick={() => setIsViewOpen(false)} className="flex-1 border-white/10">Fermer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Add Reservation */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-white font-display text-xl">Nouvelle Réservation</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-white/70">Client</Label>
              <Select onValueChange={(val) => setNewRes({ ...newRes, client_id: val })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent className="bg-night border-white/10 text-white">
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2">
                <Label className="text-xs uppercase font-bold text-white/70">Article</Label>
                <Select onValueChange={(val) => {
                  const v = volailles.find(x => x.id === val);
                  setNewRes({ ...newRes, type_volaille_id: val, prix_unitaire: v?.prix_unitaire || 0 });
                }}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Volaille" /></SelectTrigger>
                  <SelectContent className="bg-night border-white/10 text-white">
                    {volailles.map(v => <SelectItem key={v.id} value={v.id}>{v.type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase font-bold text-white/70">Quantité</Label>
                <Input type="number" value={newRes.quantite} onChange={(e) => setNewRes({ ...newRes, quantite: parseInt(e.target.value) || 0 })} className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-white/70">Lieu de Livraison</Label>
              <Input value={newRes.lieu_livraison} onChange={(e) => setNewRes({ ...newRes, lieu_livraison: e.target.value })} className="bg-white/5 border-white/10 text-white" placeholder="Ville..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/10 text-white hover:bg-white/5">Annuler</Button>
            <Button onClick={handleAdd} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90">Créer la commande</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader><DialogTitle className="text-white">Annuler la Réservation</DialogTitle><DialogDescription className="text-muted-foreground">Cette action est irréversible.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="border-white/10 text-white">Conserver</Button><Button onClick={handleDelete} className="bg-destructive text-white font-bold">Annuler la commande</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
