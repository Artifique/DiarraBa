"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Eye,
  Pencil,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { DateFilter } from "@/components/ui/date-filter";
import { createClient } from "@/lib/supabase";
import { ClientModel } from "@/lib/models/client.model";
import { Client } from "@/types/database";

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
  });

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const model = new ClientModel(supabase);
      const data = await model.findAll();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Filtered and paginated clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      client.telephone.includes(searchTerm) ||
      (client.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesDate = !dateFilter || client.date_inscription.startsWith(dateFilter);

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  const handleAdd = async () => {
    if (!formData.nom || !formData.telephone) return;
    try {
      const supabase = createClient();
      const model = new ClientModel(supabase);
      await model.create({
        ...formData,
        solde: 0,
        actif: true,
        notes: null
      });
      setIsOpen(false);
      setFormData({ nom: "", email: "", telephone: "", adresse: "" });
      fetchClients();
    } catch (error) {
      console.error("Error creating client:", error);
    }
  };

  const handleEdit = async () => {
    if (!selectedClient) return;
    try {
      const supabase = createClient();
      const model = new ClientModel(supabase);
      await model.update(selectedClient.id, formData);
      setIsEditOpen(false);
      fetchClients();
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    try {
      const supabase = createClient();
      const model = new ClientModel(supabase);
      await model.delete(selectedClient.id);
      setDeleteConfirmOpen(false);
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const openEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      nom: client.nom,
      email: client.email || "",
      telephone: client.telephone,
      adresse: client.adresse || "",
    });
    setIsEditOpen(true);
  };

  const openView = (client: Client) => {
    setSelectedClient(client);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">
            Gestion des Clients
          </h2>
          <p className="text-sm text-muted-foreground">
            Administrez vos comptes clients et leur historique de paiement.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({ nom: "", email: "", telephone: "", adresse: "" });
            setIsOpen(true);
          }}
          className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl"
        >
          <Plus className="h-5 w-5 mr-2" /> Nouveau Client
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-accent transition-colors" />
          <Input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground pl-10"
          />
        </div>
        <DateFilter
          value={dateFilter}
          onChange={setDateFilter}
          placeholder="Filtrer par date d'ajout"
          className="max-w-xs"
        />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4 font-bold">Client</th>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold">Localisation</th>
                <th className="px-6 py-4 font-bold text-right">Solde</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-accent mx-auto" />
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedClients.map((client) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={client.id}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-orange-accent/10 border border-orange-accent/20 flex items-center justify-center text-orange-accent font-bold text-sm">
                            {client.nom.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">
                              {client.nom}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              ID: #{client.id.toString().slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1.5 text-orange-accent/60" />{" "}
                            {client.email || "Non renseigné"}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1.5 text-orange-accent/60" />{" "}
                            {client.telephone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1.5 text-orange-accent/60" />{" "}
                          {client.adresse || "Non renseignée"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p
                          className={cn(
                            "text-sm font-mono font-bold",
                            client.solde > 0
                              ? "text-forest-green"
                              : client.solde < 0
                              ? "text-destructive"
                              : "text-white",
                          )}
                        >
                          {client.solde.toLocaleString()} FCFA
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openView(client)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEdit(client)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-orange-accent"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
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

      {/* Modale Ajouter/Modifier */}
      <Dialog
        open={isOpen || isEditOpen}
        onOpenChange={(val) => {
          setIsOpen(val && !isEditOpen);
          setIsEditOpen(val && isEditOpen);
        }}
      >
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">
              {isEditOpen ? "Modifier Client" : "Nouveau Client"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isEditOpen
                ? "Mettez à jour les informations du client."
                : "Ajoutez un nouveau client à votre base de données."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                Nom Complet
              </Label>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                Email
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                Téléphone
              </Label>
              <Input
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">
                Adresse
              </Label>
              <Input
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setIsEditOpen(false);
              }}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button
              onClick={isEditOpen ? handleEdit : handleAdd}
              className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90"
            >
              {isEditOpen ? "Enregistrer" : "Créer le profil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale Voir Détails */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-lg">
          {selectedClient && (
            <div className="space-y-8 py-4">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-orange-accent/10 border-2 border-orange-accent flex items-center justify-center text-orange-accent text-3xl font-bold">
                  {selectedClient.nom.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">
                    {selectedClient.nom}
                  </h3>
                  <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                    Inscrit le {new Date(selectedClient.date_inscription).toLocaleDateString('fr-FR')}
                  </p>
                  <div
                    className={cn(
                      "mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                      selectedClient.solde >= 0
                        ? "bg-forest-green/10 text-forest-green border border-forest-green/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20",
                    )}
                  >
                    Solde: {selectedClient.solde.toLocaleString()} FCFA
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-2">
                      Informations de contact
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-3 text-orange-accent/60" />
                        {selectedClient.email || "Non renseigné"}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-3 text-orange-accent/60" />
                        {selectedClient.telephone}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-3 text-orange-accent/60" />
                        {selectedClient.adresse || "Non renseignée"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modale Confirmation Suppression */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
