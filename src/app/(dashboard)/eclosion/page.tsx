// src/app/(dashboard)/eclosion/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle2, AlertCircle, Calendar, Phone, Activity, ShoppingBag, CreditCard, ChevronRight, Wallet, DollarSign, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEclosionsAction, countEclosionsAction, createEclosionAction, updateEclosionAction, deleteEclosionAction } from "../../actions/data";
import { Eclosion as PrismaEclosion } from "../../../generated/prisma/index";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";

const formSchema = z.object({
  telephone: z.string().min(1, "Le numéro de téléphone est requis."),
  quantite: z.number().min(1, "Minimum 1."),
  date_debut: z.string().min(1, "Date de début requise."),
  date_fin_prevue: z.string().min(1, "Échéance requise."),
  prix: z.number().min(0),
  paye: z.boolean(),
});

type EclosionFormValues = z.infer<typeof formSchema>;

export default function EclosionPage() {
  const [eclosions, setEclosions] = useState<PrismaEclosion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);
  const [editingEclosion, setEditingEclosion] = useState<PrismaEclosion | null>(null);
  const [selectedEclosion, setSelectedEclosion] = useState<PrismaEclosion | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const limit = 10;

  const form = useForm<EclosionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      telephone: "",
      quantite: 1,
      date_debut: new Date().toISOString().split('T')[0],
      date_fin_prevue: new Date().toISOString().split('T')[0],
      prix: 0,
      paye: false,
    },
  });

  const paiementForm = useForm({ defaultValues: { prix: 0, paye: false } });

  const { handleSubmit, register, reset, watch, setValue, formState: { errors } } = form;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserId(user.id);
    }
  }, []);

  const fetchEclosions = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const [data, totalCount] = await Promise.all([
        getEclosionsAction(page, limit),
        countEclosionsAction(),
      ]);
      setEclosions(data);
      setTotalPages(Math.ceil(totalCount / limit));
    } catch (e: any) {
      setErrorMessage("Erreur de récupération.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchEclosions(currentPage); }, [fetchEclosions, currentPage]);

  const filteredEclosions = eclosions.filter((e) => {
    const matchesSearch = e.telephone.includes(searchQuery);
    const matchesDate = !dateFilter || new Date(e.date_fin_prevue).toISOString().split('T')[0] === dateFilter;
    return matchesSearch && matchesDate;
  });

  const onSubmit = async (values: EclosionFormValues) => {
    if (!currentUserId) {
        setErrorMessage("Utilisateur non authentifié.");
        setShowError(true);
        return;
    }
    try {
      const formattedValues = {
        ...values,
        date_debut: new Date(values.date_debut),
        date_fin_prevue: new Date(values.date_fin_prevue),
      };

      if (editingEclosion) {
        await updateEclosionAction(editingEclosion.id, formattedValues, currentUserId);
      } else {
        await createEclosionAction(formattedValues, currentUserId);
      }
      setShowSuccess(true);
      setIsModalOpen(false);
      reset();
      fetchEclosions(currentPage);
    } catch (e: any) {
      setErrorMessage(e.message || "Erreur lors de l'enregistrement.");
      setShowError(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUserId) {
        setErrorMessage("Utilisateur non authentifié.");
        setShowError(true);
        return;
    }
    if (!confirm("Supprimer cette éclosion ?")) return;
    try {
      await deleteEclosionAction(id, currentUserId);
      setShowSuccess(true);
      fetchEclosions(currentPage);
    } catch (e: any) {
      setErrorMessage("Erreur de suppression.");
      setShowError(true);
    }
  };

  const openPaiementModal = (e: PrismaEclosion) => {
    setSelectedEclosion(e);
    paiementForm.reset({ prix: e.prix, paye: e.paye });
    setIsPaiementModalOpen(true);
  };

  const handlePaiement = async (values: { prix: number, paye: boolean }) => {
    if (!selectedEclosion || !currentUserId) return;
    try {
        await updateEclosionAction(selectedEclosion.id, { prix: values.prix, paye: values.paye }, currentUserId);
        setShowSuccess(true);
        setIsPaiementModalOpen(false);
        fetchEclosions(currentPage);
    } catch (e) {
        setErrorMessage("Erreur lors de l'enregistrement.");
        setShowError(true);
    }
  };

  const openCreateModal = () => {
    setEditingEclosion(null);
    reset({ telephone: "", quantite: 0, date_debut: new Date().toISOString().split('T')[0], date_fin_prevue: new Date().toISOString().split('T')[0], prix: 0, paye: false });
    setIsModalOpen(true);
  };

  const openEditModal = (eclosion: PrismaEclosion) => {
    setEditingEclosion(eclosion);
    reset({
      telephone: eclosion.telephone,
      quantite: eclosion.quantite,
      date_debut: new Date(eclosion.date_debut).toISOString().split('T')[0],
      date_fin_prevue: new Date(eclosion.date_fin_prevue).toISOString().split('T')[0],
      prix: eclosion.prix,
      paye: eclosion.paye,
    });
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>;

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Gestion des Éclosions</h2>
          <p className="text-sm text-muted-foreground/80">Suivi des cycles de couveuse.</p>
        </div>
        <Button onClick={openCreateModal} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 rounded-xl px-6 py-6 h-auto shadow-lg shadow-orange-accent/20 transition-all active:scale-95">
          <PlusCircle className="mr-2 h-5 w-5" /> Lancer Éclosion
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-white/30" />
            <Input placeholder="Rechercher par téléphone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white/5 border-white/10 h-12 rounded-xl" />
        </div>
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full md:w-60 bg-white/5 border-white/10 h-12 rounded-xl text-xs font-mono" />
      </div>

      {/* Table View (Desktop & Tablet) */}
      <div className="hidden md:block glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-white/[0.03] uppercase text-[9px] md:text-[10px] tracking-widest text-muted-foreground/60 font-black border-b border-white/5">
            <tr>
              <th className="p-4 md:p-6">Client (Tel)</th>
              <th className="p-4 md:p-6 text-center">Quantité</th>
              <th className="p-4 md:p-6">Cycle (Début → Fin)</th>
              <th className="p-4 md:p-6 text-center">Coût</th>
              <th className="p-4 md:p-6 text-center">Statut</th>
              <th className="p-4 md:p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {filteredEclosions.length === 0 ? (
              <tr><td colSpan={6} className="p-12 text-center text-muted-foreground/50 italic">Aucun cycle trouvé.</td></tr>
            ) : (
              filteredEclosions.map((e) => (
                <tr key={e.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 md:p-6"><span className="text-white font-mono font-bold">{e.telephone}</span></td>
                  <td className="p-4 md:p-6 text-center"><span className="bg-white/5 px-3 py-1 rounded-full text-xs text-white/80">{e.quantite}</span></td>
                  <td className="p-4 md:p-6"><div className="flex items-center gap-2 text-[10px]"><span className="text-muted-foreground">{new Date(e.date_debut).toLocaleDateString()}</span><ChevronRight className="h-3 w-3" /><span className="text-blue-400">{new Date(e.date_fin_prevue).toLocaleDateString()}</span></div></td>
                  <td className="p-4 md:p-6 text-center text-white font-mono">{e.prix.toLocaleString()} FCFA</td>
                  <td className="p-4 md:p-6 text-center"><span className={cn("px-3 py-1 rounded-full text-[10px] font-black border", e.paye ? "bg-forest-green/10 text-forest-green border-forest-green/20" : "bg-destructive/10 text-destructive border-destructive/20")}>{e.paye ? "RÉGLÉ" : "À PAYER"}</span></td>
                  <td className="p-4 md:p-6 text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openPaiementModal(e)} className="text-forest-green hover:bg-forest-green/10 rounded-lg"><DollarSign className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(e)} className="text-blue-400 hover:bg-blue-400/10 rounded-lg"><Edit className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} className="text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="h-5 w-5" /></Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Card View (Mobile) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredEclosions.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground/50 italic border border-white/10">Aucun cycle trouvé.</div>
        ) : (
          filteredEclosions.map((e) => (
            <div key={e.id} className="glass-card p-5 rounded-2xl border border-white/10 shadow-lg space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/40 text-[8px] font-black uppercase tracking-wider">Téléphone</p>
                  <h4 className="text-white font-mono font-bold text-base mt-0.5">{e.telephone}</h4>
                </div>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black border",
                  e.paye ? "bg-forest-green/10 text-forest-green border-forest-green/20" : "bg-destructive/10 text-destructive border-destructive/20"
                )}>
                  {e.paye ? "RÉGLÉ" : "À PAYER"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/[0.015] p-3 rounded-xl border border-white/5 text-xs">
                <div>
                  <p className="text-muted-foreground text-[8px] font-black uppercase">Quantité d'œufs</p>
                  <p className="text-white font-bold mt-0.5">{e.quantite} pcs</p>
                  <p className="text-muted-foreground text-[8px] font-black uppercase mt-2">Prix total</p>
                  <p className="text-orange-accent font-mono font-bold text-xs mt-0.5">{e.prix.toLocaleString()} FCFA</p>
                </div>
                <div className="text-right flex flex-col justify-between">
                  <div>
                    <p className="text-muted-foreground text-[8px] font-black uppercase">Cycle début</p>
                    <p className="text-white/80 font-medium mt-0.5">{new Date(e.date_debut).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[8px] font-black uppercase mt-2">Échéance prévue</p>
                    <p className="text-blue-400 font-bold mt-0.5">{new Date(e.date_fin_prevue).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <Button variant="ghost" size="icon" onClick={() => openPaiementModal(e)} className="text-forest-green hover:bg-forest-green/10 rounded-xl h-10 w-10 border border-white/5" title="Paiement">
                  <DollarSign className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEditModal(e)} className="text-blue-400 hover:bg-blue-400/10 rounded-xl h-10 w-10 border border-white/5" title="Modifier">
                  <Edit className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} className="text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10 border border-white/5" title="Supprimer">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Création/Édition Éclosion */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-night/95 backdrop-blur-2xl border-white/10 text-white w-[95%] sm:max-w-md rounded-[2rem] p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-accent via-yellow-500 to-orange-accent opacity-70" />
          <DialogHeader className="pt-8 px-6 sm:px-8 flex-none">
            <DialogTitle className="text-2xl sm:text-3xl font-display font-bold">
              {editingEclosion ? "Modifier" : "Lancer"} Éclosion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/60 text-xs">
              Enregistrez un nouveau cycle de couveuse pour un client.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-8 pt-2 sm:pt-4 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Téléphone du client *</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input type="tel" placeholder="Ex: 771234567" {...register("telephone")} className="bg-white/5 border-white/10 pl-11 h-12 rounded-xl font-mono" />
                </div>
                {errors.telephone && <p className="text-destructive text-[10px] font-bold italic">{errors.telephone.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Quantité d'œufs *</Label>
                  <Input type="number" {...register("quantite", { valueAsNumber: true })} className="bg-white/5 border-white/10 h-12 rounded-xl text-center text-lg font-mono font-bold" />
                  {errors.quantite && <p className="text-destructive text-[10px] font-bold italic">{errors.quantite.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Coût Service (FCFA)</Label>
                  <Input type="number" {...register("prix", { valueAsNumber: true })} className="bg-white/5 border-white/10 h-12 rounded-xl font-mono text-right text-orange-accent font-bold" />
                  {errors.prix && <p className="text-destructive text-[10px] font-bold italic">{errors.prix.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Date de début</Label>
                  <Input type="date" {...register("date_debut")} className="bg-white/5 border-white/10 h-12 rounded-xl text-xs font-mono" />
                  {errors.date_debut && <p className="text-destructive text-[10px] font-bold italic">{errors.date_debut.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Échéance (20j)</Label>
                  <Input type="date" {...register("date_fin_prevue")} className="bg-white/5 border-white/10 h-12 rounded-xl text-xs font-mono" />
                  {errors.date_fin_prevue && <p className="text-destructive text-[10px] font-bold italic">{errors.date_fin_prevue.message}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                <input type="checkbox" {...register("paye")} className="h-5 w-5 rounded-lg border-white/10 bg-white/5 text-forest-green" />
                <Label className="text-xs font-bold text-white/60">Marquer comme payé dès le départ</Label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-white/5 gap-3 flex-col sm:flex-row mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white rounded-xl h-12 w-full sm:w-auto">
                Annuler
              </Button>
              <Button type="submit" className="bg-orange-accent text-night font-black uppercase tracking-widest hover:bg-orange-accent/90 rounded-xl px-8 h-14 shadow-xl active:scale-95 transition-all w-full sm:w-auto">
                {editingEclosion ? "Mettre à jour" : "Lancer le cycle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Paiement */}
      <Dialog open={isPaiementModalOpen} onOpenChange={setIsPaiementModalOpen}>
        <DialogContent className="bg-night/95 text-white w-[95%] sm:max-w-md rounded-[2rem] p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-forest-green via-emerald-400 to-forest-green opacity-70" />
          <DialogHeader className="pt-8 px-6 sm:px-8 flex-none"><DialogTitle className="text-2xl font-display font-bold">Paiement Éclosion</DialogTitle></DialogHeader>
          <form onSubmit={paiementForm.handleSubmit(handlePaiement)} className="p-5 sm:p-8 pt-2 sm:pt-4 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase">Montant Service (FCFA)</Label>
              <Input type="number" {...paiementForm.register("prix", { valueAsNumber: true })} className="bg-white/5 h-12 rounded-xl font-mono text-center text-lg font-bold" />
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                <input type="checkbox" {...paiementForm.register("paye")} className="h-5 w-5 rounded-lg border-white/10 bg-white/5 text-forest-green" />
                <Label className="text-xs font-bold text-white/60">Marquer comme payé</Label>
              </div>
            </div>
            <Button type="submit" className="w-full h-14 bg-forest-green text-white font-black rounded-2xl shadow-xl active:scale-95 cursor-pointer">Valider Paiement</Button>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialogues Statut */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}><DialogContent className="bg-night/95 text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm"><div className="flex flex-col items-center gap-6"><div className="h-20 w-20 bg-forest-green/20 rounded-full flex items-center justify-center animate-bounce"><CheckCircle2 className="h-10 w-10 text-forest-green" /></div> <DialogTitle className="text-2xl font-display font-bold">Succès !</DialogTitle><Button onClick={() => setShowSuccess(false)} className="w-full bg-forest-green text-white rounded-xl h-12">Continuer</Button></div></DialogContent></Dialog>
      <Dialog open={showError} onOpenChange={setShowError}><DialogContent className="bg-night/95 text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm"><div className="flex flex-col items-center gap-6"><div className="h-20 w-20 bg-destructive/20 rounded-full flex items-center justify-center"><AlertCircle className="h-10 w-10 text-destructive" /></div> <DialogTitle className="text-2xl font-display font-bold">Erreur</DialogTitle><p className="text-destructive/80 text-sm">{errorMessage}</p><Button onClick={() => setShowError(false)} className="w-full bg-destructive text-white rounded-xl h-12">Réessayer</Button></div></DialogContent></Dialog>
    </div>
  );
}
