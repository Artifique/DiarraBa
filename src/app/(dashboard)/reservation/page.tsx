// src/app/(dashboard)/reservation/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle2, AlertCircle, Printer, DollarSign, Calendar, User, ShoppingBag, Wallet, Plus, Trash, Phone, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getReservationsAction, getClientsAction, getProduitsAction, createReservationAction, addLigneReservationAction, createPaiementAction, createFactureAction, deleteReservationAction } from "../../actions/data";
import { Reservation as PrismaReservation, Personne as PrismaPersonne, Produit as PrismaProduit, Paiement as PrismaPaiement, Prisma } from "../../../generated/prisma/index";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import jsPDF from "jspdf";
import "jspdf-autotable";
const autoTable = (jsPDF as any).prototype.autoTable;

const formSchema = z.object({
  clientId: z.string().optional().nullable(),
  clientNom: z.string().optional(),
  clientTel: z.string().min(1, "Téléphone requis."),
  date_reservation: z.string().min(1, "Date requise."),
  date_finale: z.string().min(1, "Date requise."),
  mode_paiement: z.string().optional().nullable(),
  methode_paiement: z.string().min(1, "Type de paiement requis."),
  montant_total: z.number().min(0).optional(),
  lignes: z.array(z.object({
    produitId: z.string().min(1, "Produit requis."),
    quantite: z.number().min(1, "Minimum 1."),
    prix_unitaire: z.number().min(0).optional(),
  })).min(1, "Au moins un produit."),
});

type ReservationFormValues = z.infer<typeof formSchema>;

const paiementFormSchema = z.object({
  montant: z.number().min(1, "Montant requis."),
  methode: z.enum(["Tranche", "Totalité"]),
  mode: z.string().optional().nullable(),
});

type PaiementFormValues = z.infer<typeof paiementFormSchema>;

export default function ReservationPage() {
  const [reservations, setReservations] = useState<PrismaReservation[]>([]);
  const [clients, setClients] = useState<PrismaPersonne[]>([]);
  const [produits, setProduits] = useState<PrismaProduit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<PrismaReservation | null>(null);
  const [selectedReservationForPaiement, setSelectedReservationForPaiement] = useState<PrismaReservation | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: null,
      clientNom: "",
      clientTel: "",
      date_reservation: new Date().toISOString().split('T')[0],
      date_finale: new Date().toISOString().split('T')[0],
      mode_paiement: "",
      methode_paiement: "Tranche",
      montant_total: 0,
      lignes: [{ produitId: "", quantite: 1 }],
    },
  });

  const { handleSubmit, register, reset, watch, setValue, control, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "lignes" });

  const paiementForm = useForm<PaiementFormValues>({
    resolver: zodResolver(paiementFormSchema),
    defaultValues: { montant: 0, methode: "Tranche", mode: "" },
  });
  const { handleSubmit: handlePaiementSubmit, register: registerPaiement, reset: resetPaiement, formState: { errors: paiementErrors } } = paiementForm;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserId(user.id);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, cl, pr] = await Promise.all([getReservationsAction(), getClientsAction(), getProduitsAction(1, 100)]);
      setReservations(res); setClients(cl); setProduits(pr);
    } catch (e: any) { setErrorMessage("Erreur de chargement."); setShowError(true); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const watchedClientId = watch("clientId");
  useEffect(() => {
    if (watchedClientId && watchedClientId !== "null") {
        const client = clients.find(c => c.id === watchedClientId);
        if (client) {
            setValue("clientNom", client.nom || "");
            setValue("clientTel", client.telephone || "");
        }
    }
  }, [watchedClientId, clients, setValue]);

  const montantTotal = watch("lignes")?.reduce((acc, ligne) => {
    const p = produits.find(p => p.id === ligne.produitId);
    return acc + (Number(ligne.quantite || 0) * (p?.prix_unitaire || 0));
  }, 0) || 0;

  useEffect(() => { setValue("montant_total", montantTotal); }, [montantTotal, setValue]);

  const onSubmit = async (values: ReservationFormValues) => {
    if (!currentUserId) {
        setErrorMessage("Utilisateur non authentifié.");
        setShowError(true);
        return;
    }
    try {
      const newReservation = await createReservationAction({
        client: values.clientId ? { connect: { id: values.clientId } } : undefined,
        clientNom: values.clientNom,
        clientTel: values.clientTel,
        date_reservation: new Date(values.date_reservation),
        date_finale: new Date(values.date_finale),
        mode_paiement: values.mode_paiement,
        methode_paiement: values.methode_paiement,
        montant_total: montantTotal,
      }, currentUserId);

      for (const ligne of values.lignes) {
        const produit = produits.find(p => p.id === ligne.produitId);
        await addLigneReservationAction({
          produit: { connect: { id: ligne.produitId } },
          quantite: Number(ligne.quantite),
          prix_unitaire: produit?.prix_unitaire || 0,
          reservation: { connect: { id: newReservation.id } },
        }, currentUserId);
      }
      setShowSuccess(true); setIsModalOpen(false); reset(); fetchData();
    } catch (e: any) { setErrorMessage(e.message || "Erreur création."); setShowError(true); }
  };

  const openEditModal = (res: PrismaReservation) => {
    setEditingReservation(res);
    reset({
      clientId: (res as any).clientId,
      clientNom: (res as any).clientNom || "",
      clientTel: (res as any).clientTel || "",
      date_reservation: new Date(res.date_reservation).toISOString().split('T')[0],
      date_finale: new Date(res.date_finale).toISOString().split('T')[0],
      mode_paiement: res.mode_paiement || "",
      methode_paiement: res.methode_paiement as "Tranche" | "Totalité",
      montant_total: res.montant_total,
      lignes: (res as any).lignes.map((l: any) => ({ produitId: l.produitId, quantite: l.quantite })),
    });
    setIsModalOpen(true);
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    if (!currentUserId) {
        setErrorMessage("Utilisateur non authentifié.");
        setShowError(true);
        return;
    }
    try { 
        await deleteReservationAction(deleteId, currentUserId); 
        setShowSuccess(true); 
        fetchData(); 
        setDeleteId(null); 
    } 
    catch (e: any) { 
        setErrorMessage("Erreur suppression."); 
        setShowError(true); 
        setDeleteId(null); 
    }
  };

  const openCreateModal = () => {
    reset({
      clientId: null,
      clientNom: "",
      clientTel: "",
      date_reservation: new Date().toISOString().split('T')[0],
      date_finale: new Date().toISOString().split('T')[0],
      mode_paiement: "",
      methode_paiement: "Tranche",
      montant_total: 0,
      lignes: [{ produitId: "", quantite: 1 }],
    });
    setIsModalOpen(true);
  };

  const openPaiementModal = (res: PrismaReservation) => {
    setSelectedReservationForPaiement(res);
    const dejaPaye = (res as any).paiements?.reduce((acc: any, p: any) => acc + p.montant, 0) || 0;
    const reste = res.montant_total - dejaPaye;
    
    resetPaiement({ 
        montant: Math.max(0, reste), 
        methode: "Tranche", 
        mode: "" 
    });
    setIsPaiementModalOpen(true);
  };

  const onPaiementSubmit = async (values: PaiementFormValues) => {
    if (!selectedReservationForPaiement || !currentUserId) return;
    try {
      const payload: Prisma.PaiementCreateInput = {
        montant: values.montant,
        mode_paiement: values.mode || null,
        reservation: { connect: { id: selectedReservationForPaiement.id } }
      };

      await createPaiementAction(payload, currentUserId);
      setShowSuccess(true); 
      setIsPaiementModalOpen(false); 
      resetPaiement(); 
      fetchData();
    } catch (e: any) { 
        console.error("Erreur paiement:", e);
        setErrorMessage(e.message || "Erreur lors du paiement."); 
        setShowError(true); 
    }
  };


  const generateInvoice = async (reservation: PrismaReservation) => {
    if (!currentUserId) {
        setErrorMessage("Utilisateur non authentifié.");
        setShowError(true);
        return;
    }
    try {
      const doc = new jsPDF();
      doc.setFontSize(22); doc.text("FACTURE", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text(`Client: ${(reservation as any).client?.nom || (reservation as any).clientNom || "N/A"}`, 14, 30);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 37);

      (doc as any).autoTable({
        startY: 50,
        head: [['Produit', 'Quantité', 'PU', 'Total']],
        body: (reservation as any).lignes.map((l: any) => [l.produit?.nom, l.quantite, l.prix_unitaire, l.quantite * l.prix_unitaire]),
        foot: [['', '', 'Total', `${reservation.montant_total} FCFA`]],
        theme: 'grid',
        headStyles: { fillColor: [245, 166, 35] }
      });

      const totalPaye = (reservation as any).paiements?.reduce((acc: any, p: any) => acc + p.montant, 0) || 0;
      
      await createFactureAction({
        reservation: { connect: { id: reservation.id } },
        numero: `FAC-${Date.now().toString().slice(-6)}`,
        date_facture: new Date(),
        montant_total: reservation.montant_total,
        montant_paye: totalPaye,
        montant_restant: reservation.montant_total - totalPaye,
        statut: (reservation.montant_total - totalPaye) <= 0 ? "Payee" : "Partielle",
      }, currentUserId);

      doc.save(`facture-${reservation.id.slice(0, 5)}.pdf`);
      setShowSuccess(true);
    } catch (e: any) { 
        console.error("Erreur PDF:", e);
        setErrorMessage("Erreur lors de la génération PDF."); 
        setShowError(true); 
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>;

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Gestion des Réservations</h2>
          <p className="text-sm text-muted-foreground/80">Suivi des commandes et facturation client.</p>
        </div>
        <Button onClick={openCreateModal} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 rounded-xl px-6 py-6 h-auto shadow-lg shadow-orange-accent/20 transition-all active:scale-95">
          <PlusCircle className="mr-2 h-5 w-5" /> Nouvelle Réservation
        </Button>
      </div>

      {/* Table View (Desktop & Tablet) */}
      <div className="hidden md:block glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-white/[0.03] uppercase text-[9px] md:text-[10px] tracking-widest text-muted-foreground/60 font-black border-b border-white/5">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4 text-center">Montant</th>
                  <th className="p-4 text-center">Reste</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {reservations.map((res: any) => {
                    const totalPaye = res.paiements?.reduce((acc: any, p: any) => acc + p.montant, 0) || 0;
                    const reste = res.montant_total - totalPaye;
                    return (
                        <tr key={res.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="p-4"><div className="flex flex-col"><span className="text-white font-bold">{res.client?.nom || res.clientNom || "N/A"}</span><span className="text-[10px] text-orange-accent/70 font-mono">{res.client?.telephone || res.clientTel}</span></div></td>
                            <td className="p-4 text-muted-foreground">{new Date(res.date_reservation).toLocaleDateString()} / {new Date(res.date_finale).toLocaleDateString()}</td>
                            <td className="p-4 text-center font-mono text-white">{res.montant_total.toLocaleString()}</td>
                            <td className="p-4 text-center font-bold text-red-400">{reste.toLocaleString()}</td>
                            <td className="p-4 text-right flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openPaiementModal(res)} className="text-forest-green hover:bg-forest-green/10"><DollarSign className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => generateInvoice(res)} className="text-blue-400 hover:bg-blue-400/10"><Printer className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => openEditModal(res)} className="text-orange-accent hover:bg-orange-accent/10"><Edit className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(res.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-5 w-5" /></Button>
                            </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
        </div>
      </div>

      {/* Card View (Mobile) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {reservations.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground/50 italic border border-white/10">Aucune réservation.</div>
        ) : (
          reservations.map((res: any) => {
            const totalPaye = res.paiements?.reduce((acc: any, p: any) => acc + p.montant, 0) || 0;
            const reste = res.montant_total - totalPaye;
            return (
              <div key={res.id} className="glass-card p-5 rounded-2xl border border-white/10 shadow-lg space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-bold text-base leading-tight">
                      {res.client?.nom || res.clientNom || "Client Indéfini"}
                    </h4>
                    <span className="text-[10px] text-orange-accent/70 font-mono mt-0.5 block">
                      {res.client?.telephone || res.clientTel}
                    </span>
                  </div>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black border",
                    reste <= 0 ? "bg-forest-green/10 text-forest-green border-forest-green/20" : "bg-destructive/10 text-destructive border-destructive/20"
                  )}>
                    {reste <= 0 ? "RÉGLÉ" : "SOLDE DÛ"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-white/[0.015] p-3 rounded-xl border border-white/5 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[8px] font-black uppercase">Réservation / Échéance</p>
                    <p className="text-white/80 font-medium mt-0.5">
                      {new Date(res.date_reservation).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-blue-400 font-medium text-[10px] mt-0.5">
                      échéance: {new Date(res.date_finale).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-[8px] font-black uppercase">Montant total</p>
                    <p className="text-white font-mono font-bold text-sm mt-0.5">
                      {res.montant_total.toLocaleString()} FCFA
                    </p>
                    {reste > 0 && (
                      <p className="text-red-400 font-mono text-[10px] font-bold mt-0.5">
                        reste: {reste.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <Button variant="ghost" size="icon" onClick={() => openPaiementModal(res)} className="text-forest-green hover:bg-forest-green/10 rounded-xl h-10 w-10 border border-white/5" title="Enregistrer un paiement">
                    <DollarSign className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => generateInvoice(res)} className="text-blue-400 hover:bg-blue-400/10 rounded-xl h-10 w-10 border border-white/5" title="Imprimer la facture">
                    <Printer className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(res)} className="text-orange-accent hover:bg-orange-accent/10 rounded-xl h-10 w-10 border border-white/5" title="Modifier">
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(res.id)} className="text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10 border border-white/5" title="Supprimer">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Suppression */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-night/95 backdrop-blur-xl text-white border-white/10 rounded-[2.5rem] p-10 max-w-sm text-center">
            <div className="flex flex-col items-center gap-6">
                <div className="h-20 w-20 bg-destructive/20 rounded-full flex items-center justify-center"><Trash2 className="h-10 w-10 text-destructive" /></div> 
                <div className="space-y-2">
                    <DialogTitle className="text-2xl font-display font-bold">Supprimer ?</DialogTitle>
                    <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
                </div>
                <div className="flex w-full gap-3">
                    <Button variant="ghost" className="flex-1 rounded-xl h-12" onClick={() => setDeleteId(null)}>Annuler</Button>
                    <Button className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl h-12" onClick={handleDelete}>Supprimer</Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-night/95 backdrop-blur-2xl border-white/10 text-white w-[95%] sm:max-w-4xl rounded-[2rem] p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-accent via-yellow-500 to-orange-accent opacity-70" />
          <DialogHeader className="pt-8 px-6 sm:px-8 flex-none"><DialogTitle className="text-2xl sm:text-3xl font-display font-bold">Nouvelle Réservation</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1 max-h-[60vh] sm:max-h-[65vh] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-4">
                        <h3 className="text-orange-accent uppercase font-black text-[10px] pb-1 border-b border-white/5">Client</h3>
                        <Select onValueChange={(v) => setValue("clientId", v === "null" ? null : v)}>
                            <SelectTrigger className="bg-white/5 h-12 rounded-xl"><SelectValue placeholder="Sélectionner client (Opt)" /></SelectTrigger>
                            <SelectContent className="bg-night border-white/10"><SelectItem value="null">Nouveau Client</SelectItem>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nom || c.telephone}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input placeholder="Nom client (Opt)" {...register("clientNom")} className="bg-white/5 h-12 rounded-xl" />
                        <Input placeholder="Téléphone *" {...register("clientTel")} className="bg-white/5 h-12 rounded-xl" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-blue-400 uppercase font-black text-[10px] pb-1 border-b border-white/5">Détails</h3>
                        <Select onValueChange={(v: any) => setValue("methode_paiement", v)}>
                            <SelectTrigger className="bg-white/5 h-12 rounded-xl"><SelectValue placeholder="Type Paiement *" /></SelectTrigger>
                            <SelectContent className="bg-night border-white/10"><SelectItem value="Tranche">Tranche</SelectItem><SelectItem value="Totalité">Totalité</SelectItem></SelectContent>
                        </Select>
                        <Select onValueChange={(v) => setValue("mode_paiement", v)}>
                            <SelectTrigger className="bg-white/5 h-12 rounded-xl"><SelectValue placeholder="Mode (Opt)" /></SelectTrigger>
                            <SelectContent className="bg-night border-white/10"><SelectItem value="Wave">Wave</SelectItem><SelectItem value="OrangeMoney">Orange Money</SelectItem><SelectItem value="Cash">Espèces</SelectItem></SelectContent>
                        </Select>
                        <Input type="date" {...register("date_reservation")} className="bg-white/5 h-12 rounded-xl" />
                        <Input type="date" {...register("date_finale")} className="bg-white/5 h-12 rounded-xl" />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-forest-green uppercase font-black text-[10px]">Produits</h3>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                            <Select onValueChange={(v) => setValue(`lignes.${index}.produitId`, v)}>
                                <SelectTrigger className="col-span-6 bg-white/5 h-12 rounded-xl"><SelectValue placeholder="Produit" /></SelectTrigger>
                                <SelectContent className="bg-night border-white/10">{produits.map(p => <SelectItem key={p.id} value={p.id}>{p.nom}</SelectItem>)}</SelectContent>
                            </Select>
                            <Input type="number" placeholder="Qté" {...register(`lignes.${index}.quantite`, { valueAsNumber: true })} className="col-span-3 bg-white/5 h-12 rounded-xl" />
                            <Button type="button" variant="ghost" onClick={() => remove(index)} className="col-span-3 text-destructive cursor-pointer hover:bg-destructive/10 rounded-xl"><Trash2 className="h-5 w-5" /></Button>
                        </div>
                    ))}
                    <Button type="button" onClick={() => append({ produitId: "", quantite: 1 })} variant="outline" className="w-full h-12 rounded-xl">+ Ajouter Produit</Button>
                    <div className="text-lg font-black text-white pt-2 text-right">Total: {montantTotal.toLocaleString()} FCFA</div>
                </div>
            </div>
            <div className="p-5 sm:p-8 pt-0 mt-auto border-t border-white/10 pt-6">
                <Button type="submit" className="bg-orange-accent text-night font-black h-14 w-full rounded-2xl shadow-xl active:scale-95 cursor-pointer">Valider la réservation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaiementModalOpen} onOpenChange={setIsPaiementModalOpen}>
        <DialogContent className="bg-night/95 backdrop-blur-2xl border-white/10 text-white w-[95%] sm:max-w-md rounded-[2rem] p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-forest-green via-emerald-400 to-forest-green opacity-70" />
          <DialogHeader className="pt-8 px-6 sm:px-8 flex-none"><DialogTitle className="text-2xl font-display font-bold">Nouveau Paiement</DialogTitle></DialogHeader>
          <form onSubmit={paiementForm.handleSubmit(onPaiementSubmit)} className="p-5 sm:p-8 pt-2 sm:pt-4 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-xs text-white/40 font-black uppercase">Solde à régler</p>
                <p className="text-3xl font-mono font-black text-forest-green">{paiementForm.watch("montant")?.toLocaleString()} FCFA</p>
            </div>
            <div className="space-y-4">
                <Input type="number" {...registerPaiement("montant", { valueAsNumber: true })} className="bg-white/5 h-12 rounded-xl" placeholder="Montant" />
                <Select onValueChange={(v: "Tranche" | "Totalité") => paiementForm.setValue("methode", v)} value={paiementForm.watch("methode")}>
                    <SelectTrigger className="bg-white/5 h-12 rounded-xl"><SelectValue placeholder="Type Paiement *" /></SelectTrigger>
                    <SelectContent className="bg-night border-white/10"><SelectItem value="Tranche">Tranche</SelectItem><SelectItem value="Totalité">Totalité</SelectItem></SelectContent>
                </Select>
                <Select onValueChange={(v) => paiementForm.setValue("mode", v)}>
                    <SelectTrigger className="bg-white/5 h-12 rounded-xl"><SelectValue placeholder="Mode (Opt)" /></SelectTrigger>
                    <SelectContent className="bg-night border-white/10"><SelectItem value="Wave">Wave</SelectItem><SelectItem value="OrangeMoney">Orange Money</SelectItem><SelectItem value="Cash">Espèces</SelectItem></SelectContent>
                </Select>
            </div>
            <Button type="submit" className="w-full h-14 bg-forest-green text-white font-black rounded-2xl">Valider Paiement</Button>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Statut Dialogs */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}><DialogContent className="bg-night/95 text-white text-center rounded-[2.5rem] p-10 max-w-sm"><div className="flex flex-col items-center gap-6"><div className="h-20 w-20 bg-forest-green/20 rounded-full flex items-center justify-center animate-bounce"><CheckCircle2 className="h-10 w-10 text-forest-green" /></div> <DialogTitle className="text-2xl font-display font-bold">Succès !</DialogTitle><Button onClick={() => setShowSuccess(false)} className="w-full bg-forest-green text-white rounded-xl h-12">Continuer</Button></div></DialogContent></Dialog>
      <Dialog open={showError} onOpenChange={setShowError}><DialogContent className="bg-night/95 text-white text-center rounded-[2.5rem] p-10 max-w-sm"><div className="flex flex-col items-center gap-6"><div className="h-20 w-20 bg-destructive/20 rounded-full flex items-center justify-center"><AlertCircle className="h-10 w-10 text-destructive" /></div> <DialogTitle className="text-2xl font-display font-bold">Erreur</DialogTitle><p className="text-sm">{errorMessage}</p><Button onClick={() => setShowError(false)} className="w-full bg-destructive text-white rounded-xl h-12">Reessayer</Button></div></DialogContent></Dialog>
    </div>
  );
}
