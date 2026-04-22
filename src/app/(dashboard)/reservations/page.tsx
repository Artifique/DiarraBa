"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Plus,
  Search,
  ChevronRight,
  User,
  Clock,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Trash2,
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

const initialReservations = [
  {
    id: "RES-2024-001",
    client: "Ahmed Bennani",
    items: "500 Poussins, 1 Couveuse",
    total: 85000,
    paye: 45000,
    statut: "Confirmee",
    date: "22 Avr 2024",
    details: { tel: "+212 612 111111", lieu: "Rabat", type: "Tranche" },
  },
  {
    id: "RES-2024-002",
    client: "Fatima Alaoui",
    items: "200 Canards",
    total: 35000,
    paye: 35000,
    statut: "Livree",
    date: "21 Avr 2024",
    details: { tel: "+212 612 222222", lieu: "Fès", type: "Totalite" },
  },
  {
    id: "RES-2024-003",
    client: "Mohammed Karim",
    items: "150 Pintades",
    total: 50000,
    paye: 0,
    statut: "EnAttente",
    date: "23 Avr 2024",
    details: { tel: "+212 612 333333", lieu: "Tangier", type: "Tranche" },
  },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState(initialReservations);
  const [selectedRes, setSelectedRes] = useState<
    (typeof initialReservations)[0] | null
  >(null);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Filtered and paginated reservations
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.items.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || reservation.date === dateFilter;

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  const [newRes, setNewRes] = useState({
    client: "",
    items: "",
    qte: "",
    pu: "",
    lieu: "",
  });

  const handleAdd = () => {
    if (!newRes.client || !newRes.qte || !newRes.pu) return;
    const totalCalc = (parseInt(newRes.qte) || 0) * (parseInt(newRes.pu) || 0);
    const item = {
      id: `RES-${new Date().getFullYear()}-${String(reservations.length + 1).padStart(3, "0")}`,
      client:
        newRes.client === "c1"
          ? "Ahmed Bennani"
          : newRes.client === "c2"
            ? "Fatima Alaoui"
            : "Mohammed Karim",
      items: `${newRes.qte} ${newRes.items || "Articles"}`,
      total: totalCalc,
      paye: 0,
      statut: "EnAttente" as const,
      date: new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      details: {
        tel: "+212 ...",
        lieu: newRes.lieu || "Non spécifié",
        type: "Tranche" as const,
      },
    };
    setReservations([item, ...reservations]);
    setIsOpen(false);
    setNewRes({ client: "", items: "", qte: "", pu: "", lieu: "" });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setReservations(
      reservations.map((r) =>
        r.id === id ? { ...r, statut: newStatus as any } : r,
      ),
    );
    if (selectedRes?.id === id) {
      setSelectedRes({ ...selectedRes, statut: newStatus as any });
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      setReservations(reservations.filter((r) => r.id !== itemToDelete));
      if (selectedRes?.id === itemToDelete) {
        setSelectedRes(null);
      }
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">
            Réservations & Commandes
          </h2>
          <p className="text-sm text-muted-foreground">
            Gérez les commandes clients, les acomptes et les plannings de
            livraison.
          </p>
        </div>      </div>

      {/* Filters */}
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
                  <Select
                    onValueChange={(val) =>
                      setNewRes({ ...newRes, client: val })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Choisir un client" />
                    </SelectTrigger>
                    <SelectContent className="bg-night border-white/10 text-white">
                      <SelectItem value="c1">Ahmed Bennani</SelectItem>
                      <SelectItem value="c2">Fatima Alaoui</SelectItem>
                      <SelectItem value="c3">Mohammed Karim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                    Type de Paiement
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Mode de règlement" />
                    </SelectTrigger>
                    <SelectContent className="bg-night border-white/10 text-white">
                      <SelectItem value="totalite">Totalité</SelectItem>
                      <SelectItem value="tranche">Par Tranche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                  Articles & Tarification
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="md:col-span-2">
                    <Select
                      onValueChange={(val) =>
                        setNewRes({ ...newRes, items: val })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Espèce" />
                      </SelectTrigger>
                      <SelectContent className="bg-night border-white/10 text-white">
                        <SelectItem value="Poussins">Poussin</SelectItem>
                        <SelectItem value="Poulets">Poulet Chair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    value={newRes.qte}
                    onChange={(e) =>
                      setNewRes({ ...newRes, qte: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Qté"
                  />
                  <Input
                    type="number"
                    value={newRes.pu}
                    onChange={(e) =>
                      setNewRes({ ...newRes, pu: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Prix Unit."
                  />
                </div>
                {newRes.qte && newRes.pu && (
                  <p className="text-right text-xs font-bold text-orange-accent">
                    Total estimé :{" "}
                    {(
                      parseInt(newRes.qte) * parseInt(newRes.pu)
                    ).toLocaleString()}{" "}
                    FCFA
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                    Date de Livraison prévue
                  </Label>
                  <Input
                    type="date"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                    Lieu de Livraison
                  </Label>
                  <Input
                    value={newRes.lieu}
                    onChange={(e) =>
                      setNewRes({ ...newRes, lieu: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Ville ou adresse"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
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
                Confirmer la commande
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Liste des réservations */}
        <div
          className={cn(
            "transition-all duration-500 flex flex-col gap-4",
            selectedRes ? "w-1/2" : "w-full",
          )}
        >
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-accent transition-colors" />
            <input
              type="text"
              placeholder="Rechercher par client ou numéro..."
              className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-accent/50"
            />
          </div>

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
                    selectedRes?.id === res.id
                      ? "border-orange-accent/50 bg-white/[0.05] orange-glow"
                      : "hover:border-white/20",
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          res.statut === "Confirmee"
                            ? "bg-blue-400/10 text-blue-400"
                            : res.statut === "Livree"
                              ? "bg-forest-green/10 text-forest-green"
                              : "bg-orange-accent/10 text-orange-accent",
                        )}
                      >
                        <CalendarCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {res.client}
                        </h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">
                          {res.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-white">
                        {res.total.toLocaleString()} FCFA
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {res.date}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground truncate max-w-[200px] italic">
                      "{res.items}"
                    </p>
                    <div
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
                        res.statut === "Confirmee"
                          ? "bg-blue-400/10 text-blue-400 border border-blue-400/20"
                          : res.statut === "Livree"
                            ? "bg-forest-green/10 text-forest-green border border-forest-green/20"
                            : "bg-orange-accent/10 text-orange-accent border border-orange-accent/20",
                      )}
                    >
                      {res.statut}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
        </div>

        {/* Panneau de détails coulissant */}
        <AnimatePresence>
          {selectedRes && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-1/2 glass-card rounded-2xl border-white/10 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setSelectedRes(null)}
                  className="p-2 hover:bg-white/5 rounded-full text-muted-foreground hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="font-display font-bold text-white">
                  Détails de la Réservation
                </h3>
                <button
                  onClick={() => confirmDelete(selectedRes.id)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-full transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Client Info */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-full bg-orange-accent/10 flex items-center justify-center text-orange-accent text-xl font-bold border border-orange-accent/20">
                      {selectedRes.client.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {selectedRes.client}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedRes.details.tel}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-2 text-orange-accent" />
                      Créée le : {selectedRes.date}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-3.5 w-3.5 mr-2 text-orange-accent" />
                      Lieu : {selectedRes.details.lieu}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Articles réservés
                  </h5>
                  <div className="space-y-2">
                    {selectedRes.items.split(", ").map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5"
                      >
                        <span className="text-sm text-white font-medium">
                          {item}
                        </span>
                        <span className="text-xs text-orange-accent font-bold">
                          Inclus
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Tracker */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Suivi de paiement
                    </h5>
                    <span className="text-xs font-mono font-bold text-white">
                      {selectedRes.total > 0
                        ? Math.round(
                            (selectedRes.paye / selectedRes.total) * 100,
                          )
                        : 0}
                      % Payé
                    </span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${selectedRes.total > 0 ? (selectedRes.paye / selectedRes.total) * 100 : 0}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-forest-green shadow-[0_0_10px_rgba(45,106,45,0.5)]"
                    />
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground italic">
                      Payé: {selectedRes.paye.toLocaleString()} FCFA
                    </span>
                    <span className="text-white font-bold">
                      Total: {selectedRes.total.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Progression
                  </h5>
                  <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                    {[
                      {
                        label: "Créée",
                        date: selectedRes.date,
                        active: true,
                        icon: CheckCircle2,
                      },
                      {
                        label: "Confirmée",
                        date: "En cours",
                        active: selectedRes.statut !== "EnAttente",
                        icon: CheckCircle2,
                      },
                      {
                        label: "Livrée",
                        date: "Prévue",
                        active: selectedRes.statut === "Livree",
                        icon: Clock,
                      },
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 relative z-10"
                      >
                        <div
                          className={cn(
                            "h-[23px] w-[23px] rounded-full flex items-center justify-center border-2",
                            step.active
                              ? "bg-forest-green border-forest-green text-night"
                              : "bg-night border-white/10 text-muted-foreground",
                          )}
                        >
                          <step.icon className="h-3 w-3" />
                        </div>
                        <div>
                          <p
                            className={cn(
                              "text-xs font-bold",
                              step.active
                                ? "text-white"
                                : "text-muted-foreground",
                            )}
                          >
                            {step.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">
                            {step.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex gap-3">
                <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all border border-white/5">
                  Générer Facture
                </button>
                {selectedRes.statut !== "Livree" && (
                  <button
                    onClick={() => handleStatusChange(selectedRes.id, "Livree")}
                    className="flex-1 py-3 bg-orange-accent text-night text-xs font-bold rounded-xl shadow-lg orange-glow-hover transition-all active:scale-95"
                  >
                    Marquer comme Livré
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modale de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Voulez-vous vraiment supprimer cette réservation ? Toutes les
              données associées seront effacées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-destructive text-white font-bold hover:bg-destructive/90"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
