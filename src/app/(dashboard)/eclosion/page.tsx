// src/app/(dashboard)/eclosion/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle2, AlertCircle, Calendar, Phone, Activity, ShoppingBag, CreditCard, ChevronRight, Wallet } from "lucide-react";
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
  quantite: z.preprocess((val) => (val === "" || val === null ? 0 : Number(val)), z.number().min(1, "Minimum 1.")),
  date_debut: z.string().min(1, "Date de début requise."),
  date_fin_prevue: z.string().min(1, "Échéance requise."),
  prix: z.preprocess((val) => (val === "" || val === null ? 0 : Number(val)), z.number().min(0)),
  paye: z.boolean(),
});

type EclosionFormValues = z.infer<typeof formSchema>;

export default function EclosionPage() {
  const [eclosions, setEclosions] = useState<PrismaEclosion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEclosion, setEditingEclosion] = useState<PrismaEclosion | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const form = useForm<EclosionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      telephone: "",
      quantite: 0,
      date_debut: new Date().toISOString().split('T')[0],
      date_fin_prevue: new Date().toISOString().split('T')[0],
      prix: 0,
      paye: false,
    },
  });

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

  const onSubmit = async (values: EclosionFormValues) => {
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

  const openCreateModal = () => {
    setEditingEclosion(null);
    reset({
      telephone: "",
      quantite: 0,
      date_debut: new Date().toISOString().split('T')[0],
      date_fin_prevue: new Date().toISOString().split('T')[0],
      prix: 0,
      paye: false,
    });
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

  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);
  const [selectedEclosion, setSelectedEclosion] = useState<PrismaEclosion | null>(null);

  // Formulaire Paiement
  const paiementForm = useForm({
    defaultValues: { prix: 0, paye: false }
  });

  const openPaiementModal = (e: PrismaEclosion) => {
    setSelectedEclosion(e);
    paiementForm.reset({ prix: e.prix, paye: e.paye });
    setIsPaiementModalOpen(true);
  };

  const handlePaiement = async (values: { prix: number, paye: boolean }) => {
    if (!selectedEclosion) return;
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

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>;

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Gestion des Éclosions</h2>
          <p className="text-sm text-muted-foreground/80">Suivi des cycles de couveuse et éclosions.</p>
        </div>
        <Button onClick={openCreateModal} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 rounded-xl px-6 py-6 h-auto shadow-lg shadow-orange-accent/20 transition-all active:scale-95">
          <PlusCircle className="mr-2 h-5 w-5" /> Lancer une Éclosion
        </Button>
      </div>

      <div className="glass-card rounded-2xl overflow-x-auto border border-white/10 shadow-2xl">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-white/[0.03] uppercase text-[9px] md:text-[10px] tracking-widest text-muted-foreground/60 font-black border-b border-white/5">
            <tr>
              <th className="p-4 md:p-6">Client (Tel)</th>
              <th className="p-4 md:p-6 text-center">Quantité</th>
              <th className="p-4 md:p-6">Cycle (Début → Fin)</th>
              <th className="p-4 md:p-6 text-center">Coût Service</th>
              <th className="p-4 md:p-6 text-center">Statut</th>
              <th className="p-4 md:p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {eclosions.length === 0 ? (
              <tr><td colSpan={6} className="p-12 text-center text-muted-foreground/50 italic">Aucun cycle enregistré.</td></tr>
            ) : (
              eclosions.map((e) => (
                <tr key={e.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 md:p-6"><span className="text-white font-mono font-bold">{e.telephone}</span></td>
                  <td className="p-4 md:p-6 text-center">
                    <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold text-white/80 border border-white/5">{e.quantite} oeufs</span>
                  </td>
                  <td className="p-4 md:p-6">
                    <div className="flex items-center gap-2 text-[10px] font-medium">
                        <span className="text-muted-foreground">{new Date(e.date_debut).toLocaleDateString()}</span>
                        <ChevronRight className="h-3 w-3 text-orange-accent/40" />
                        <span className="text-blue-400">{new Date(e.date_fin_prevue).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="p-4 md:p-6 text-center font-mono font-bold text-white">{e.prix.toLocaleString()} FCFA</td>
                  <td className="p-4 md:p-6 text-center">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border", e.paye ? "bg-forest-green/10 text-forest-green border-forest-green/20" : "bg-destructive/10 text-destructive border-destructive/20")}>
                        {e.paye ? "RÉGLÉ" : "À PAYER"}
                    </span>
                  </td>
                  <td className="p-4 md:p-6 text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(e)} className="text-blue-400 hover:bg-blue-400/10 rounded-lg"><Edit className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} className="text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="h-5 w-5" /></Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="mt-6" />

      {/* Modal Création/Edition */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-night/95 backdrop-blur-2xl border-white/10 text-white sm:max-w-2xl rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden p-0">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-accent via-yellow-500 to-orange-accent opacity-70" />
          <DialogHeader className="pt-8 px-8">
            <DialogTitle className="text-3xl font-display font-bold tracking-tight">{editingEclosion ? "Édition" : "Nouvelle"} Éclosion</DialogTitle>
            <DialogDescription className="text-muted-foreground/60 text-xs">Paramétrez le cycle de développement des œufs.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-4 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Colonne Client & Oeufs */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5"><Phone className="h-4 w-4 text-orange-accent" /><h3 className="text-orange-accent text-[11px] font-black uppercase tracking-widest">Client & Stock</h3></div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-white/40 uppercase">Téléphone du propriétaire *</Label>
                        <Input placeholder="00 00 00 00" {...register("telephone")} className="bg-white/[0.03] border-white/10 h-12 rounded-xl font-mono" />
                        {errors.telephone && <p className="text-destructive text-[10px] font-bold italic">{errors.telephone.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-white/40 uppercase">Nombre d'œufs *</Label>
                        <Input type="number" {...register("quantite")} className="bg-white/[0.03] border-white/10 h-12 rounded-xl font-mono text-center text-lg" />
                        {errors.quantite && <p className="text-destructive text-[10px] font-bold italic">{errors.quantite.message}</p>}
                    </div>
                </div>

                {/* Colonne Cycle & Finances */}
                <div className="space-y-6 bg-white/[0.015] p-6 rounded-[2rem] border border-white/5 shadow-inner">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5"><Calendar className="h-4 w-4 text-blue-400" /><h3 className="text-blue-400 text-[11px] font-black uppercase tracking-widest">Cycle & Paiement</h3></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-white/40 uppercase">Date Début</Label>
                            <Input type="date" {...register("date_debut")} className="bg-white/5 border-white/10 h-11 rounded-xl text-xs font-mono" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-white/40 uppercase">Fin Prévue</Label>
                            <Input type="date" {...register("date_fin_prevue")} className="bg-white/5 border-white/10 h-11 rounded-xl text-xs font-mono text-blue-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-white/40 uppercase">Prix du service (FCFA)</Label>
                        <div className="relative">
                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/10" />
                            <Input type="number" step="0.01" {...register("prix")} className="bg-white/5 border-white/10 pl-12 h-12 rounded-xl font-mono font-bold text-orange-accent" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                        <input type="checkbox" id="paye" {...register("paye")} className="h-5 w-5 rounded-lg border-white/10 bg-white/5 text-orange-accent focus:ring-orange-accent/50" />
                        <Label htmlFor="paye" className="text-xs font-bold text-white/60 cursor-pointer">Marquer comme déjà réglé</Label>
                    </div>
                </div>
            </div>

            <DialogFooter className="mt-8 border-t border-white/5 pt-8 gap-4 flex-col sm:flex-row">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white rounded-xl h-12 px-8">Annuler</Button>
                <Button type="submit" className="bg-orange-accent text-night font-black uppercase tracking-widest hover:bg-orange-accent/90 rounded-xl px-12 h-14 shadow-xl active:scale-95 transition-all">Lancer le cycle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialogues Statut */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-night/95 backdrop-blur-xl text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm">
            <div className="flex flex-col items-center gap-6">
                <div className="h-20 w-20 bg-forest-green/20 rounded-full flex items-center justify-center animate-bounce"><CheckCircle2 className="h-10 w-10 text-forest-green" /></div> 
                <div className="space-y-2"><DialogTitle className="text-3xl font-display font-bold">Excellent !</DialogTitle><p className="text-muted-foreground text-sm">Le suivi de l'éclosion a été mis à jour avec succès.</p></div>
                <Button onClick={() => setShowSuccess(false)} className="w-full bg-forest-green text-white rounded-xl h-12 font-bold shadow-lg shadow-forest-green/20">Continuer</Button>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent className="bg-night/95 backdrop-blur-xl text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm">
            <div className="flex flex-col items-center gap-6">
                <div className="h-20 w-20 bg-destructive/20 rounded-full flex items-center justify-center"><AlertCircle className="h-10 w-10 text-destructive" /></div> 
                <div className="space-y-2"><DialogTitle className="text-3xl font-display font-bold">Erreur</DialogTitle><p className="text-destructive/80 text-sm font-medium">{errorMessage}</p></div>
                <Button onClick={() => setShowError(false)} className="w-full bg-destructive text-white rounded-xl h-12 font-bold shadow-lg shadow-destructive/20">Reessayer</Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
