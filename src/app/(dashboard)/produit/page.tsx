// src/app/(dashboard)/produit/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle2, AlertCircle, Box, PackagePlus, Phone, User as UserIcon, Wallet, Search } from "lucide-react";
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
  prix_achat: z.number().nullable().optional(),
  quantite: z.number().min(0, "Min 0."),
  prix_unitaire: z.number().min(0, "Min 0."),
  categorieId: z.string().min(1, "Catégorie requise."),
  fournisseurId: z.string().optional().nullable(),
  newFournisseurNom: z.string().optional().nullable(),
  newFournisseurTel: z.string().min(1, "Téléphone obligatoire."),
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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
    if (!currentUserId) {
        setErrorMessage("Utilisateur non authentifié.");
        setShowError(true);
        return;
    }
    try {
      const payload = {
          nom: values.nom,
          prix_achat: values.prix_achat !== null && values.prix_achat !== undefined ? values.prix_achat : null,
          quantite: values.quantite || 0,
          prix_unitaire: values.prix_unitaire || 0,
          categorieId: values.categorieId,
          fournisseurId: values.fournisseurId && values.fournisseurId !== "null" ? values.fournisseurId : null,
          fournisseurInfo: {
              nom: values.newFournisseurNom && values.newFournisseurNom.trim() !== "" ? values.newFournisseurNom : null,
              telephone: values.newFournisseurTel
          }
      };

      if (editingProduit) await updateProduitAction(editingProduit.id, payload, currentUserId);
      else await createProduitAction(payload, currentUserId);

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
    if (!currentUserId) {
        setErrorMessage("Utilisateur non authentifié.");
        setShowError(true);
        return;
    }
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
    if (!currentUserId) {
        setErrorMessage("Utilisateur non authentifié.");
        setShowError(true);
        return;
    }
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

  const filteredProduits = produits.filter((prod: any) => {
    const matchesSearch = prod.nom.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || prod.categorieId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

      <div className="flex flex-col md:flex-row gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-white/30" />
            <Input placeholder="Rechercher un produit..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white/5 border-white/10 h-12 rounded-xl" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-60 bg-white/5 border-white/10 h-12 rounded-xl">
                <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent className="bg-night border-white/10">
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.nomCategorie}</SelectItem>)}
            </SelectContent>
        </Select>
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
            {filteredProduits.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-muted-foreground/50 italic">Aucun produit trouvé.</td></tr>
            ) : (
              filteredProduits.map((prod: any) => (
                <tr key={prod.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 md:p-6"><div className="flex flex-col"><span className="text-white font-bold">{prod.nom}</span><span className="text-[10px] text-muted-foreground uppercase">{prod.categorie?.nomCategorie}</span></div></td>
                  <td className="p-4 md:p-6 text-center">{prod.fournisseur ? <div className="flex flex-col"><span className="text-white/90">{prod.fournisseur.nom || "Indéfini"}</span><span className="text-[10px] text-orange-accent/70 font-mono">{prod.fournisseur.telephone}</span></div> : "---"}</td>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-night/95 backdrop-blur-2xl border-white/10 text-white sm:max-w-4xl rounded-[2rem] p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-accent via-yellow-500 to-orange-accent opacity-70" />
          <DialogHeader className="pt-8 px-8 flex-none"><DialogTitle className="text-3xl font-display font-bold">{editingProduit ? "Édition" : "Nouveau"} Produit</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-8 pt-4 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/5"><Box className="h-4 w-4 text-orange-accent" /><h3 className="text-orange-accent text-[11px] font-black uppercase tracking-widest">Informations Article</h3></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Désignation *</Label><Input placeholder="Ex: Poussin chair" {...register("nom")} className="bg-white/[0.03] border-white/10 h-12 rounded-xl" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Catégorie *</Label><Select onValueChange={(v) => setValue("categorieId", v)} value={watch("categorieId")}><SelectTrigger className="bg-white/[0.03] border-white/10 h-12 rounded-xl text-sm"><SelectValue placeholder="Choisir..." /></SelectTrigger><SelectContent className="bg-night border-white/10">{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.nomCategorie}</SelectItem>)}</SelectContent></Select></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Prix d'Achat (Opt.)</Label><Input type="number" step="0.01" {...register("prix_achat", { setValueAs: v => v === "" ? null : parseFloat(v) })} className="bg-white/[0.03] border-white/10 h-12 rounded-xl font-mono" /></div>
                            <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Prix Vente *</Label><Input type="number" step="0.01" {...register("prix_unitaire", { setValueAs: v => parseFloat(v) })} className="bg-white/[0.03] border-white/10 h-12 rounded-xl font-mono text-orange-accent font-black" /></div>
                        </div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Stock Initial</Label><Input type="number" {...register("quantite", { setValueAs: v => Number(v) })} className="bg-white/[0.03] border-white/10 h-12 rounded-xl font-mono text-center text-lg" /></div>
                    </div>
                    <div className="space-y-6 bg-white/[0.015] p-6 rounded-[2rem] border border-white/5 shadow-inner">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/5"><UserIcon className="h-4 w-4 text-blue-400" /><h3 className="text-blue-400 text-[11px] font-black uppercase tracking-widest">Source / Fournisseur</h3></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Nom ou Entreprise (Opt.)</Label><div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10" /><Input list="suppliers-names" placeholder="Tapez ou choisissez..." {...register("newFournisseurNom")} className="bg-white/5 border-white/10 focus:border-blue-400/50 pl-11 h-12 rounded-xl" /><datalist id="suppliers-names">{fournisseurs.map(f => f.nom && <option key={f.id} value={f.nom} />)}</datalist></div></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Téléphone *</Label><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10" /><Input list="suppliers-tels" placeholder="Tapez ou choisissez..." {...register("newFournisseurTel")} className="bg-white/5 border-white/10 focus:border-blue-400/50 pl-11 h-12 rounded-xl font-mono" /><datalist id="suppliers-tels">{fournisseurs.map(f => <option key={f.id} value={f.telephone} />)}</datalist></div></div>
                    </div>
                </div>
            </div>
            <div className="p-8 pt-0 border-t border-white/5 mt-auto"><Button type="submit" className="w-full h-14 bg-orange-accent text-night font-black uppercase rounded-2xl">Valider</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
