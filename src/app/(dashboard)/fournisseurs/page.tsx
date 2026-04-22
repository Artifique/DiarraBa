"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Trash2,
  Eye,
  Pencil,
  Star,
  Package,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { DateFilter } from "@/components/ui/date-filter";

const initialFournisseurs = [
  { id: 1, nom: "Ferme Nationale", email: "contact@ferme.ma", tel: "+212 522 444444", adresse: "Marrakech, Maroc", solde: 45000, notation: 5, date: "15 Jan 2024" },
  { id: 2, nom: "Élevage Premium", email: "info@elevage.ma", tel: "+212 522 555555", adresse: "Casablanca, Maroc", solde: -12000, notation: 4, date: "08 Feb 2024" },
  { id: 3, nom: "Volailles du Sud", email: "ventes@vds.ma", tel: "+212 522 666666", adresse: "Agadir, Maroc", solde: 0, notation: 3, date: "22 Mar 2024" },
];

export default function FournisseursPage() {
  const [fournisseurs, setFournisseurs] = useState(initialFournisseurs);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [formData, setFormData] = useState({ nom: "", email: "", tel: "", adresse: "" });

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered and paginated fournisseurs
  const filteredFournisseurs = fournisseurs.filter((fournisseur) => {
    const matchesSearch =
      fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fournisseur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fournisseur.tel.includes(searchTerm) ||
      fournisseur.adresse.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || fournisseur.date === dateFilter;

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredFournisseurs.length / itemsPerPage);
  const paginatedFournisseurs = filteredFournisseurs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  const handleAdd = () => {
    if (!formData.nom) return;
    const item = {
      id: Date.now(),
      ...formData,
      solde: 0,
      notation: 5,
      date: new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
    setFournisseurs([item, ...fournisseurs]);
    setIsOpen(false);
    setFormData({ nom: "", email: "", tel: "", adresse: "" });
  };

  const handleEdit = () => {
    setFournisseurs(fournisseurs.map(f => f.id === selectedFournisseur.id ? { ...f, ...formData } : f));
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    setFournisseurs(fournisseurs.filter(f => f.id !== selectedFournisseur.id));
    setDeleteConfirmOpen(false);
  };

  const openEdit = (f: any) => {
    setSelectedFournisseur(f);
    setFormData({ nom: f.nom, email: f.email || "", tel: f.tel || "", adresse: f.adresse || "" });
    setIsEditOpen(true);
  };

  const openView = (f: any) => {
    setSelectedFournisseur(f);
    setIsViewOpen(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
        )}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Gestion des Fournisseurs</h2>
          <p className="text-sm text-muted-foreground">Administrez votre réseau de fournisseurs et le suivi des approvisionnements.</p>
        </div>
        <Button
          onClick={() => { setFormData({ nom: "", email: "", tel: "", adresse: "" }); setIsOpen(true); }}
          className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl"
        >
          <Plus className="h-5 w-5 mr-2" /> Nouveau Fournisseur
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-accent transition-colors" />
          <Input
            type="text"
            placeholder="Rechercher un fournisseur..."
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
                <th className="px-6 py-4 font-bold">Fournisseur</th>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold">Localisation</th>
                <th className="px-6 py-4 font-bold">Notation</th>
                <th className="px-6 py-4 font-bold text-right">Solde</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {paginatedFournisseurs.map((fournisseur) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={fournisseur.id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-accent/10 border border-orange-accent/20 flex items-center justify-center text-orange-accent font-bold text-sm">
                          {fournisseur.nom.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{fournisseur.nom}</p>
                          <p className="text-[10px] text-muted-foreground">ID: #{fournisseur.id.toString().slice(-4)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1.5 text-orange-accent/60" /> {fournisseur.email}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1.5 text-orange-accent/60" /> {fournisseur.tel}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1.5 text-orange-accent/60" /> {fournisseur.adresse}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {renderStars(fournisseur.notation)}
                        <span className="text-xs text-muted-foreground ml-1">({fournisseur.notation})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={cn(
                        "text-sm font-mono font-bold",
                        fournisseur.solde > 0 ? "text-forest-green" : fournisseur.solde < 0 ? "text-destructive" : "text-white"
                      )}>
                        {fournisseur.solde.toLocaleString()} FCFA
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openView(fournisseur)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white" title="Voir">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(fournisseur)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-orange-accent" title="Modifier">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => { setSelectedFournisseur(fournisseur); setDeleteConfirmOpen(true); }} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive" title="Supprimer">
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
      <Dialog open={isOpen || isEditOpen} onOpenChange={(val) => { setIsOpen(val && !isEditOpen); setIsEditOpen(val && isEditOpen); }}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">{isEditOpen ? "Modifier Fournisseur" : "Nouveau Fournisseur"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isEditOpen ? "Mettez à jour les informations du fournisseur." : "Ajoutez un nouveau fournisseur à votre réseau."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Nom de l'entreprise</Label>
              <Input value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Téléphone</Label>
              <Input value={formData.tel} onChange={(e) => setFormData({...formData, tel: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Adresse</Label>
              <Input value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsOpen(false); setIsEditOpen(false); }} className="border-white/10 text-white hover:bg-white/5">Annuler</Button>
            <Button onClick={isEditOpen ? handleEdit : handleAdd} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90">
              {isEditOpen ? "Enregistrer les modifications" : "Créer le profil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale Voir Détails */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-lg">
          {selectedFournisseur && (
            <div className="space-y-8 py-4">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-orange-accent/10 border-2 border-orange-accent flex items-center justify-center text-orange-accent text-3xl font-bold">
                  {selectedFournisseur.nom.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">{selectedFournisseur.nom}</h3>
                  <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Fournisseur depuis le {selectedFournisseur.date}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      {renderStars(selectedFournisseur.notation)}
                    </div>
                    <span className="text-xs text-muted-foreground">({selectedFournisseur.notation}/5)</span>
                  </div>
                  <div className={cn(
                    "mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                    selectedFournisseur.solde >= 0 ? "bg-forest-green/10 text-forest-green border border-forest-green/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                  )}>
                    Solde: {selectedFournisseur.solde.toLocaleString()} FCFA
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-2">Informations de contact</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-3 text-orange-accent/60" />
                        {selectedFournisseur.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-3 text-orange-accent/60" />
                        {selectedFournisseur.tel}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-3 text-orange-accent/60" />
                        {selectedFournisseur.adresse}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-2">Statistiques</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ID Fournisseur:</span>
                        <span className="text-white font-mono">#{selectedFournisseur.id.toString().slice(-4)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date d'ajout:</span>
                        <span className="text-white">{selectedFournisseur.date}</span>
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
            <DialogTitle className="text-white font-display text-xl">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.
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
