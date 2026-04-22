"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Trash2,
  Clock,
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

const initialPaiements = [
  {
    id: "PAY-001",
    reservation: "RES-2024-001",
    client: "Ahmed Bennani",
    montant: 45000,
    date: "22 Avr 2024",
    methode: "Especes",
    statut: "Completed",
  },
  {
    id: "PAY-002",
    reservation: "RES-2024-002",
    client: "Fatima Alaoui",
    montant: 35000,
    date: "21 Avr 2024",
    methode: "Virement",
    statut: "Completed",
  },
  {
    id: "PAY-003",
    reservation: "RES-2024-004",
    client: "Yassine Driss",
    montant: 15000,
    date: "20 Avr 2024",
    methode: "Carte",
    statut: "Pending",
  },
  {
    id: "PAY-004",
    reservation: "RES-2024-005",
    client: "Karim Tazi",
    montant: 60000,
    date: "19 Avr 2024",
    methode: "Cheque",
    statut: "Failed",
  },
];

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState(initialPaiements);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [newPayment, setNewPayment] = useState({
    client: "",
    reservation: "",
    montant: "",
    methode: "",
  });

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered and paginated paiements
  const filteredPaiements = paiements.filter((paiement) => {
    const matchesSearch =
      paiement.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paiement.reservation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paiement.methode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || paiement.date === dateFilter;

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);
  const paginatedPaiements = filteredPaiements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  const handleAdd = () => {
    if (!newPayment.client || !newPayment.montant) return;
    const item = {
      id: `PAY-00${paiements.length + 1}`,
      client: newPayment.client === "c1" ? "Ahmed Bennani" : "Client Divers",
      reservation: newPayment.reservation || "N/A",
      montant: parseInt(newPayment.montant) || 0,
      date: new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      methode: newPayment.methode || "Especes",
      statut: "Completed",
    };
    setPaiements([item, ...paiements]);
    setIsOpen(false);
    setNewPayment({ client: "", reservation: "", montant: "", methode: "" });
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      setPaiements(paiements.filter((p) => p.id !== itemToDelete));
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">
            Suivi des Paiements
          </h2>
          <p className="text-sm text-muted-foreground">
            Visualisez et gérez toutes les transactions financières de la ferme.
          </p>
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
                <DialogTitle className="text-white font-display text-xl">
                  Enregistrer un Paiement
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Saisissez les détails de la transaction financière.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                    Client
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setNewPayment({ ...newPayment, client: val })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Choisir un client" />
                    </SelectTrigger>
                    <SelectContent className="bg-night border-white/10 text-white">
                      <SelectItem value="c1">Ahmed Bennani</SelectItem>
                      <SelectItem value="c2">Fatima Alaoui</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                    Réservation (N°)
                  </Label>
                  <Input
                    value={newPayment.reservation}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        reservation: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="RES-2024-XXX"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                      Montant (FCFA)
                    </Label>
                    <Input
                      type="number"
                      value={newPayment.montant}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          montant: e.target.value,
                        })
                      }
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                      Méthode
                    </Label>
                    <Select
                      onValueChange={(val) =>
                        setNewPayment({ ...newPayment, methode: val })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-night border-white/10 text-white">
                        <SelectItem value="Especes">Espèces</SelectItem>
                        <SelectItem value="Virement">Virement</SelectItem>
                        <SelectItem value="Cheque">Chèque</SelectItem>
                        <SelectItem value="Carte">Carte</SelectItem>
                      </SelectContent>
                    </Select>
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
                  Confirmer l'encaissement
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Encaissé",
            value: paiements
              .reduce((acc, curr) => acc + curr.montant, 0)
              .toLocaleString(),
            icon: ArrowDownCircle,
            color: "text-forest-green",
          },
          {
            label: "En attente",
            value: "125 000",
            icon: Clock,
            color: "text-orange-accent",
          },
          {
            label: "Remboursements",
            value: "15 000",
            icon: ArrowUpCircle,
            color: "text-destructive",
          },
          {
            label: "Transactions",
            value: paiements.length.toString(),
            icon: CreditCard,
            color: "text-blue-400",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card p-4 rounded-xl border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  {stat.label}
                </p>
                <p className="text-lg font-mono font-bold text-white">
                  {stat.value}{" "}
                  <span className="text-[10px] opacity-50">FCFA</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
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
                <motion.tr
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={p.id}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white">{p.id}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.date}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-white">{p.client}</p>
                    <p className="text-[10px] text-orange-accent font-medium">
                      {p.reservation}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-white">
                    {p.montant.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] px-2 py-1 bg-white/5 rounded-md text-muted-foreground border border-white/5">
                      {p.methode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        p.statut === "Completed"
                          ? "bg-forest-green/10 text-forest-green border border-forest-green/20"
                          : p.statut === "Pending"
                            ? "bg-orange-accent/10 text-orange-accent border border-orange-accent/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20",
                      )}
                    >
                      {p.statut === "Completed"
                        ? "Terminé"
                        : p.statut === "Pending"
                          ? "En attente"
                          : "Échoué"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => confirmDelete(p.id)}
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

      {/* Modale de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est
              irréversible.
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
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
