// src/app/(dashboard)/produit/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle2, AlertCircle, Box, PackagePlus, Phone, User as UserIcon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProduitsAction, countProduitsAction, createProduitAction, updateProduitAction, deleteProduitAction, getCategoriesAction, getFournisseursAction } from "../../actions/data";
import { Produit as PrismaProduit, Categorie as PrismaCategorie, Personne as PrismaPersonne, Prisma } from "../../../generated/prisma/index";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination"; 

const formSchema = z.object({
  nom: z.string().min(1, "Le nom est requis."),
  prix_achat: z.preprocess((val) => (val === "" || val === null || val === undefined ? null : Number(val)), z.number().nullable().optional()),
  quantite: z.preprocess((val) => (val === "" || val === null || val === undefined ? 0 : Number(val)), z.number().min(0)),
  prix_unitaire: z.preprocess((val) => (val === "" || val === null || val === undefined ? 0 : Number(val)), z.number().min(0)),
  categorieId: z.string().min(1, "La catégorie est requise."),
  newFournisseurNom: z.string().optional().nullable(),
  newFournisseurTel: z.string().min(1, "Le téléphone est obligatoire."),
});

type ProduitFormValues = z.infer<typeof formSchema>;

export default function ProduitPage() {
  const [produits, setProduits] = useState<PrismaProduit[]>([]);
  const [categories, setCategories] = useState<PrismaCategorie[]>([]);
  const [fournisseurs, setFournisseurs] = useState<PrismaPersonne[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingProduit, setEditingProduit] = useState<PrismaProduit | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState({ produitId: "", quantite: 0, type: "add" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const form = useForm<ProduitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      nom: "", 
      prix_achat: null, 
      quantite: 0, 
      prix_unitaire: 0, 
      categorieId: "", 
      newFournisseurNom: "",
      newFournisseurTel: ""
    },
  });

  const { handleSubmit, register, reset, setValue, watch, formState: { errors } } = form;

  const typedNom = watch("newFournisseurNom");
  const typedTel = watch("newFournisseurTel");

  // Remplissage automatique consolidé (un seul useEffect pour la stabilité)
  useEffect(() => {
    if (typedNom && !typedTel) {
        const found = fournisseurs.find(f => f.nom?.toLowerCase() === typedNom.toLowerCase());
        if (found) setValue("newFournisseurTel", found.telephone || "");
    } else if (typedTel && !typedNom) {
        const found = fournisseurs.find(f => f.telephone === typedTel);
        if (found) setValue("newFournisseurNom", found.nom || "");
    }
  }, [typedNom, typedTel, fournisseurs, setValue]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserId(user.id);
    }
  }, []);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const [produitsData, totalCount, categoriesData, fournisseursData] = await Promise.all([
        getProduitsAction(page, limit),
        countProduitsAction(),
        getCategoriesAction(1, 100),
        getFournisseursAction(),
      ]);
      setProduits(produitsData);
      setTotalPages(Math.ceil(totalCount / limit));
      setCategories(categoriesData);
      setFournisseurs(fournisseursData);
    } catch (e: any) {
      setErrorMessage("Erreur de chargement.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchData(currentPage); }, [fetchData, currentPage]);

  const onPageChange = (page: number) => { setCurrentPage(page); };

  const onSubmit = async (values: ProduitFormValues) => {
    try {
      const payload: any = {
        nom: values.nom,
        prix_achat: values.prix_achat,
        quantite: values.quantite,
        prix_unitaire: values.prix_unitaire,
        categorie: { connect: { id: values.categorieId } },
        fournisseurInfo: {
          nom: values.newFournisseurNom || null,
          telephone: values.newFournisseurTel
        }
      };

      if (editingProduit) {
        await updateProduitAction(editingProduit.id, payload, currentUserId);
      } else {
        await createProduitAction(payload, currentUserId);
      }
      setShowSuccess(true);
      setIsModalOpen(false);
      reset();
      fetchData(currentPage);
    } catch (e: any) {
      setErrorMessage(e.message || "Erreur d'enregistrement.");
      setShowError(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await deleteProduitAction(id, currentUserId);
      setShowSuccess(true);
      fetchData(currentPage);
    } catch (e: any) {
      setErrorMessage("Erreur de suppression.");
      setShowError(true);
    }
  };

  const handleStockAdjustment = async () => {
    if (!stockAdjustment.produitId || stockAdjustment.quantite <= 0) return;
    const produitToUpdate = produits.find(p => p.id === stockAdjustment.produitId);
    if (!produitToUpdate) return;
    let newQuantite = stockAdjustment.type === "add" ? produitToUpdate.quantite + stockAdjustment.quantite : produitToUpdate.quantite - stockAdjustment.quantite;
    if (newQuantite < 0) { setErrorMessage("Stock insuffisant."); setShowError(true); return; }
    try {
      await updateProduitAction(stockAdjustment.produitId, { quantite: newQuantite }, currentUserId);
      setShowSuccess(true);
      setIsStockModalOpen(false);
      fetchData(currentPage);
    } catch (e: any) { setErrorMessage("Erreur d'ajustement."); setShowError(true); }
  };

  const openCreateModal = () => {
    setEditingProduit(null);
    reset({ nom: "", prix_achat: null, quantite: 0, prix_unitaire: 0, categorieId: "", newFournisseurNom: "", newFournisseurTel: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (produit: PrismaProduit) => {
    setEditingProduit(produit);
    reset({
      nom: produit.nom,
      prix_achat: produit.prix_achat,
      quantite: produit.quantite,
      prix_unitaire: produit.prix_unitaire,
      categorieId: produit.categorieId,
      newFournisseurNom: (produit as any).fournisseur?.nom || "",
      newFournisseurTel: (produit as any).fournisseur?.telephone || "",
    });
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>;

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Gestion des Produits</h2>
          <p className="text-sm text-muted-foreground/80">Stock et approvisionnement.</p>
        </div>
        <Button onClick={openCreateModal} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 rounded-xl px-6 py-6 h-auto shadow-lg shadow-orange-accent/20 transition-all active:scale-95">
          <PlusCircle className="mr-2 h-5 w-5" /> Nouveau Produit
        </Button>
      </div>

      <div className="glass-card rounded-2xl overflow-x-auto border border-white/10 shadow-2xl">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-white/[0.03] uppercase text-[9px] md:text-[10px] tracking-widest text-muted-foreground/60 font-black border-b border-white/5">
            <tr>
              <th className="p-4 md:p-6">Produit / Catégorie</th>
              <th className="p-4 md:p-6 text-center">Fournisseur</th>
              <th className="p-4 md:p-6 text-center">Stock</th>
              <th className="p-4 md:p-6">Prix Vente</th>
              <th className="p-4 md:p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {produits.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-muted-foreground/50 italic">Aucun produit trouvé.</td></tr>
            ) : (
              produits.map((prod: any) => (
                <tr key={prod.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 md:p-6"><div className="flex flex-col"><span className="text-white font-bold">{prod.nom}</span><span className="text-[10px] text-muted-foreground uppercase">{prod.categorie?.nomCategorie}</span></div></td>
                  <td className="p-4 md:p-6 text-center">
                    {prod.fournisseur ? (
                        <div className="flex flex-col"><span className="text-white/90">{prod.fournisseur.nom || "Indéfini"}</span><span className="text-[10px] text-orange-accent/70 font-mono">{prod.fournisseur.telephone}</span></div>
                    ) : "---"}
                  </td>
                  <td className="p-4 md:p-6 text-center"><span className={cn("font-mono font-bold px-3 py-1 rounded-full text-xs border", prod.quantite <= 5 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-forest-green/10 text-forest-green border-forest-green/20")}>{prod.quantite}</span></td>
                  <td className="p-4 md:p-6 text-white font-mono font-bold">{prod.prix_unitaire.toLocaleString()} FCFA</td>
                  <td className="p-4 md:p-6 text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setStockAdjustment({ produitId: prod.id, quantite: 0, type: "add" }); setIsStockModalOpen(true); }} className="text-forest-green hover:bg-forest-green/10 rounded-lg"><PackagePlus className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(prod)} className="text-blue-400 hover:bg-blue-400/10 rounded-lg"><Edit className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(prod.id)} className="text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="h-5 w-5" /></Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} className="mt-6" />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-night/95 backdrop-blur-2xl border-white/10 text-white sm:max-w-4xl rounded-[2rem] p-0 overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-accent via-yellow-500 to-orange-accent opacity-70" />
          <DialogHeader className="pt-8 px-8">
            <DialogTitle className="text-3xl font-display font-bold">{editingProduit ? "Édition" : "Nouveau"} Produit</DialogTitle>
            <DialogDescription className="text-muted-foreground/60 text-xs">Seuls les champs marqués * sont obligatoires.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-4 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5"><Box className="h-4 w-4 text-orange-accent" /><h3 className="text-orange-accent text-[11px] font-black uppercase tracking-widest">Informations Article</h3></div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-white/40 uppercase">Désignation *</Label>
                        <Input placeholder="Ex: Poussin chair" {...register("nom")} className="bg-white/[0.03] border-white/10 h-12 rounded-xl" />
                        {errors.nom && <p className="text-destructive text-[10px] font-bold italic">{errors.nom.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-white/40 uppercase">Catégorie *</Label>
                        <Select onValueChange={(v) => setValue("categorieId", v)} value={watch("categorieId")}>
                            <SelectTrigger className="bg-white/[0.03] border-white/10 h-12 rounded-xl text-sm"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                            <SelectContent className="bg-night border-white/10">{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.nomCategorie}</SelectItem>)}</SelectContent>
                        </Select>
                        {errors.categorieId && <p className="text-destructive text-[10px] font-bold italic">{errors.categorieId.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-white/40 uppercase">Prix d'Achat (Opt.)</Label>
                            <Input type="number" step="0.01" {...register("prix_achat")} className="bg-white/[0.03] border-white/10 h-12 rounded-xl font-mono" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-white/40 uppercase">Prix Vente *</Label>
                            <Input type="number" step="0.01" {...register("prix_unitaire")} className="bg-white/[0.03] border-white/10 h-12 rounded-xl font-mono text-orange-accent font-black" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-white/40 uppercase">Stock Initial</Label>
                        <Input type="number" {...register("quantite")} className="bg-white/[0.03] border-white/10 h-12 rounded-xl font-mono text-center text-lg" />
                    </div>
                </div>

                <div className="space-y-6 bg-white/[0.015] p-6 rounded-[2rem] border border-white/5 shadow-inner">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5"><UserIcon className="h-4 w-4 text-blue-400" /><h3 className="text-blue-400 text-[11px] font-black uppercase tracking-widest">Source / Fournisseur</h3></div>
                    <div className="space-y-2">
                        <Label htmlFor="newFournisseurNom" className="text-[10px] font-black text-white/40 uppercase flex items-center justify-between">Nom ou Entreprise (Opt.)</Label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10" />
                            <Input list="suppliers-names" placeholder="Tapez ou choisissez..." {...register("newFournisseurNom")} className="bg-white/5 border-white/10 focus:border-blue-400/50 pl-11 h-12 rounded-xl" />
                            <datalist id="suppliers-names">{fournisseurs.map(f => f.nom && <option key={f.id} value={f.nom} />)}</datalist>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newFournisseurTel" className="text-[10px] font-black text-white/40 uppercase flex items-center justify-between">Téléphone *</Label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10" />
                            <Input list="suppliers-tels" placeholder="Tapez ou choisissez..." {...register("newFournisseurTel")} className="bg-white/5 border-white/10 focus:border-blue-400/50 pl-11 h-12 rounded-xl font-mono" />
                            <datalist id="suppliers-tels">{fournisseurs.map(f => <option key={f.id} value={f.telephone} />)}</datalist>
                        </div>
                        {errors.newFournisseurTel && <p className="text-destructive text-[10px] font-bold italic">{errors.newFournisseurTel.message}</p>}
                    </div>
                    <div className="p-4 rounded-xl bg-blue-400/5 border border-blue-400/10 text-[10px] text-blue-400/60 italic">L'auto-remplissage fonctionne si vous choisissez un nom ou numéro existant.</div>
                </div>
            </div>

            <DialogFooter className="mt-8 border-t border-white/5 pt-8 gap-4 flex-col sm:flex-row">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white rounded-xl h-12 px-8">Annuler</Button>
                <Button type="submit" className="bg-orange-accent text-night font-black uppercase tracking-widest hover:bg-orange-accent/90 rounded-xl px-12 h-14 shadow-xl active:scale-95 transition-all">{editingProduit ? "Enregistrer" : "Créer le produit"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
        <DialogContent className="bg-night/95 text-white sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-forest-green via-emerald-400 to-forest-green opacity-70" />
          <DialogHeader className="pt-8 px-8 text-center"><DialogTitle className="text-2xl font-display font-bold">Mouvement Stock</DialogTitle></DialogHeader>
          <div className="p-8 pt-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setStockAdjustment({...stockAdjustment, type: "add"})} className={cn("p-6 rounded-3xl border transition-all flex flex-col items-center gap-3", stockAdjustment.type === "add" ? "bg-forest-green/20 border-forest-green text-forest-green" : "bg-white/5 border-white/5 text-white/20 grayscale")}><PackagePlus className="h-8 w-8" /><span className="text-[10px] font-black uppercase">Réception</span></button>
                <button onClick={() => setStockAdjustment({...stockAdjustment, type: "remove"})} className={cn("p-6 rounded-3xl border transition-all flex flex-col items-center gap-3", stockAdjustment.type === "remove" ? "bg-destructive/20 border-destructive text-destructive" : "bg-white/5 border-white/5 text-white/20 grayscale")}><Trash2 className="h-8 w-8" /><span className="text-[10px] font-black uppercase">Sortie</span></button>
            </div>
            <Input type="number" value={stockAdjustment.quantite} onChange={(e) => setStockAdjustment({...stockAdjustment, quantite: Number(e.target.value)})} className="bg-white/5 border-white/10 h-20 rounded-3xl font-mono text-4xl text-center font-black" />
            <Button onClick={handleStockAdjustment} className={cn("w-full h-16 rounded-2xl font-black uppercase tracking-widest transition-all", stockAdjustment.type === "add" ? "bg-forest-green text-white" : "bg-destructive text-white")}>Valider</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}><DialogContent className="bg-night/95 text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm"><div className="flex flex-col items-center gap-6"><div className="h-20 w-20 bg-forest-green/20 rounded-full flex items-center justify-center animate-bounce"><CheckCircle2 className="h-10 w-10 text-forest-green" /></div> <DialogTitle className="text-2xl font-display font-bold">Succès !</DialogTitle><Button onClick={() => setShowSuccess(false)} className="w-full bg-forest-green/20 text-forest-green rounded-xl h-12 font-bold">Continuer</Button></div></DialogContent></Dialog>
      <Dialog open={showError} onOpenChange={setShowError}><DialogContent className="bg-night/95 text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm"><div className="flex flex-col items-center gap-6"><div className="h-20 w-20 bg-destructive/20 rounded-full flex items-center justify-center"><AlertCircle className="h-10 w-10 text-destructive" /></div> <DialogTitle className="text-2xl font-display font-bold">Erreur</DialogTitle><p className="text-destructive/80 text-sm">{errorMessage}</p><Button onClick={() => setShowError(false)} className="w-full bg-destructive text-white rounded-xl h-12 font-bold">Reessayer</Button></div></DialogContent></Dialog>
    </div>
  );
}
