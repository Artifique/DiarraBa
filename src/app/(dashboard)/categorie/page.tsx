// src/app/(dashboard)/categorie/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle2, AlertCircle, Package, Layers, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCategoriesAction, countCategoriesAction, createCategorieAction, updateCategorieAction, deleteCategorieAction } from "../../actions/data"; 
import { Categorie as PrismaCategorie } from "../../../generated/prisma/index"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";

const formSchema = z.object({
  nomCategorie: z.string().min(1, "Le nom de la catégorie est requis."),
});

type CategorieFormValues = z.infer<typeof formSchema>;

export default function CategoriePage() {
  const [categories, setCategories] = useState<PrismaCategorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<PrismaCategorie | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const form = useForm<CategorieFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nomCategorie: "" },
  });

  const { handleSubmit, register, reset, formState: { errors } } = form;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserId(user.id);
    }
  }, []);

  const fetchCategories = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const [data, totalCount] = await Promise.all([
        getCategoriesAction(page, limit),
        countCategoriesAction(),
      ]);
      setCategories(data);
      setTotalPages(Math.ceil(totalCount / limit));
    } catch (e: any) {
      setErrorMessage("Erreur de chargement.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchCategories(currentPage); }, [fetchCategories, currentPage]);

  const onSubmit = async (values: CategorieFormValues) => {
    if (!currentUserId) {
        setErrorMessage("Utilisateur non authentifié.");
        setShowError(true);
        return;
    }
    try {
      if (editingCategorie) {
        await updateCategorieAction(editingCategorie.id, values, currentUserId);
      } else {
        await createCategorieAction(values, currentUserId);
      }
      setShowSuccess(true);
      setIsModalOpen(false);
      reset({ nomCategorie: "" });
      fetchCategories(currentPage);
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
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      await deleteCategorieAction(id, currentUserId);
      setShowSuccess(true);
      fetchCategories(currentPage);
    } catch (e: any) {
      setErrorMessage("Erreur de suppression.");
      setShowError(true);
    }
  };

  const openCreateModal = () => {
    setEditingCategorie(null);
    reset({ nomCategorie: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (categorie: PrismaCategorie) => {
    setEditingCategorie(categorie);
    reset({ nomCategorie: categorie.nomCategorie });
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>;

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Gestion des Catégories</h2>
          <p className="text-sm text-muted-foreground/80">Classement et organisation des stocks.</p>
        </div>
        <Button onClick={openCreateModal} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 rounded-xl px-6 py-6 h-auto shadow-lg shadow-orange-accent/20 transition-all active:scale-95">
          <PlusCircle className="mr-2 h-5 w-5" /> Ajouter une Catégorie
        </Button>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-white/[0.03] uppercase text-[9px] md:text-[10px] tracking-widest text-muted-foreground/60 font-black border-b border-white/5">
                <tr>
                  <th className="p-4 md:p-6">Nom de Catégorie</th>
                  <th className="p-4 md:p-6">Dernière Mise à jour</th>
                  <th className="p-4 md:p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {categories.length === 0 ? (
                  <tr><td colSpan={3} className="p-12 text-center text-muted-foreground/50 italic">Aucune catégorie.</td></tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 md:p-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-orange-accent/10 flex items-center justify-center text-orange-accent"><Tag className="h-4 w-4" /></div>
                            <span className="text-white font-bold">{cat.nomCategorie}</span>
                        </div>
                      </td>
                      <td className="p-4 md:p-6 text-muted-foreground/80">{new Date(cat.date_modification).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      <td className="p-4 md:p-6 text-right flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(cat)} className="text-blue-400 hover:bg-blue-400/10 rounded-lg"><Edit className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="h-5 w-5" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="mt-6" />

      {/* Modal Création/Edition */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-night/95 backdrop-blur-2xl border-white/10 text-white sm:max-w-md rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden p-0">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-accent via-yellow-500 to-orange-accent opacity-70" />
          <DialogHeader className="pt-8 px-8">
            <DialogTitle className="text-3xl font-display font-bold tracking-tight">{editingCategorie ? "Modifier" : "Nouvelle"} Catégorie</DialogTitle>
            <DialogDescription className="text-muted-foreground/60 text-xs">Organisez vos produits avec des étiquettes claires.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-4 space-y-8">
            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5"><Layers className="h-4 w-4 text-orange-accent" /><h3 className="text-orange-accent text-[11px] font-black uppercase tracking-widest">Détails Catégorie</h3></div>
                
                <div className="space-y-2">
                    <Label htmlFor="nomCategorie" className="text-[10px] font-black text-white/40 uppercase">Nom de l'étiquette *</Label>
                    <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                        <Input id="nomCategorie" placeholder="Ex: Volailles de chair" {...register("nomCategorie")} className="bg-white/[0.03] border-white/10 pl-11 h-12 rounded-xl transition-all" />
                    </div>
                    {errors.nomCategorie && <p className="text-destructive text-[10px] font-bold italic">{errors.nomCategorie.message}</p>}
                </div>
            </div>

            <DialogFooter className="mt-8 border-t border-white/5 pt-8 gap-4 flex-col sm:flex-row">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white rounded-xl h-12 px-8">Annuler</Button>
                <Button type="submit" className="bg-orange-accent text-night font-black uppercase tracking-widest hover:bg-orange-accent/90 rounded-xl px-12 h-14 shadow-xl active:scale-95 transition-all">
                    {editingCategorie ? "Mettre à jour" : "Créer la catégorie"}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Statut Dialogs */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-night/95 backdrop-blur-xl text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm">
            <div className="flex flex-col items-center gap-6">
                <div className="h-20 w-20 bg-forest-green/20 rounded-full flex items-center justify-center animate-bounce"><CheckCircle2 className="h-10 w-10 text-forest-green" /></div> 
                <div className="space-y-2"><DialogTitle className="text-3xl font-display font-bold">Parfait !</DialogTitle><p className="text-muted-foreground text-sm">La catégorie a été enregistrée avec succès.</p></div>
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
