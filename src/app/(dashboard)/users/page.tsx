// src/app/(dashboard)/users/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Loader2, AlertCircle, CheckCircle2, Mail, Phone, Shield, Trash2, User as UserIcon, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PasswordInput } from "@/components/ui/password-input";
import { getAllUsersAction, countUsersAction, createUserAction, deleteUserAction } from "../../actions/data";
import { User as PrismaUser, Prisma } from "../../../generated/prisma/index";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<PrismaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [formData, setFormData] = useState<Prisma.UserCreateInput & { mot_de_passe: string }>({
    nom: "",
    email: "",
    telephone: "",
    mot_de_passe: "",
    role: "gerant",
    password: "",
  });
  const [error, setError] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchUsers = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const [data, totalCount] = await Promise.all([
        getAllUsersAction(page, limit),
        countUsersAction(),
      ]);
      setUsers(data || []);
      setTotalPages(Math.ceil(totalCount / limit));
    } catch (e) {
      setError({ open: true, message: "Erreur de chargement des utilisateurs." });
    }
    setLoading(false);
  }, [limit]);

  useEffect(() => { fetchUsers(currentPage); }, [fetchUsers, currentPage]);

  const handleCreate = async () => {
    if (!formData.email || !formData.mot_de_passe || !formData.nom) {
      setError({ open: true, message: "Veuillez remplir tous les champs obligatoires." });
      return;
    }
    try {
      await createUserAction({ ...formData, password: formData.mot_de_passe });
      setIsOpen(false);
      setFormData({ nom: "", email: "", telephone: "", mot_de_passe: "", role: "gerant", password: "" });
      setShowSuccess(true);
      fetchUsers(currentPage);
    } catch (e: any) {
      setError({ open: true, message: e.message || "Erreur de création." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement cet accès ?")) return;
    try {
      await deleteUserAction(id);
      setShowSuccess(true);
      fetchUsers(currentPage);
    } catch (e: any) {
      setError({ open: true, message: "Erreur de suppression." });
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>;

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Accès Utilisateurs</h2>
          <p className="text-sm text-muted-foreground/80">Gérez les permissions et les membres de l'équipe.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 rounded-xl px-6 py-6 h-auto shadow-lg shadow-orange-accent/20 transition-all active:scale-95">
          <UserPlus className="mr-2 h-5 w-5" /> Nouvel Utilisateur
        </Button>
      </div>

      <div className="glass-card rounded-2xl overflow-x-auto border border-white/10 shadow-2xl">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-white/[0.03] uppercase text-[9px] md:text-[10px] tracking-widest text-muted-foreground/60 font-black border-b border-white/5">
            <tr>
              <th className="p-4 md:p-6">Membre</th>
              <th className="p-4 md:p-6">Rôle / Sécurité</th>
              <th className="p-4 md:p-6">Contact</th>
              <th className="p-4 md:p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {users.length === 0 ? (
              <tr><td colSpan={4} className="p-12 text-center text-muted-foreground/50 italic">Aucun utilisateur.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 md:p-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40"><UserIcon className="h-5 w-5" /></div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">{u.nom}</span>
                            <span className="text-[10px] text-muted-foreground">{u.email}</span>
                        </div>
                    </div>
                  </td>
                  <td className="p-4 md:p-6 text-center md:text-left">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border inline-flex items-center gap-1.5", u.role === "Admin" ? "bg-orange-accent/10 text-orange-accent border-orange-accent/20" : "bg-blue-400/10 text-blue-400 border-blue-400/20")}>
                        <Shield className="h-3 w-3" /> {u.role?.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 md:p-6 text-muted-foreground font-mono text-xs">{u.telephone || "---"}</td>
                  <td className="p-4 md:p-6 text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="h-5 w-5" /></Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="mt-6" />

      {/* Modal Création */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-night/95 backdrop-blur-2xl border-white/10 text-white sm:max-w-md rounded-[2.5rem] shadow-2xl p-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-accent via-yellow-500 to-orange-accent opacity-70" />
          <DialogHeader className="pt-8 px-8">
            <DialogTitle className="text-3xl font-display font-bold tracking-tight">Nouvel Accès</DialogTitle>
            <DialogDescription className="text-muted-foreground/60 text-xs">Créez un compte pour un nouveau gérant ou administrateur.</DialogDescription>
          </DialogHeader>

          <div className="p-8 pt-4 space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-white/40 uppercase">Nom complet *</Label>
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                        <Input placeholder="Prénom Nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="bg-white/5 border-white/10 pl-11 h-12 rounded-xl" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-white/40 uppercase">Email *</Label>
                        <Input type="email" placeholder="email@exemple.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-sm" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-white/40 uppercase">Téléphone</Label>
                        <Input placeholder="00 00 00 00" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl font-mono" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-white/40 uppercase">Mot de passe *</Label>
                    <PasswordInput
                      value={formData.mot_de_passe}
                      onChange={(e: any) => setFormData({...formData, mot_de_passe: e.target.value, password: e.target.value})}
                      className="bg-white/5 border-white/10 h-12 rounded-xl"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-white/40 uppercase">Niveau d'accréditation</Label>
                    <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-night border-white/10">
                            <SelectItem value="gerant">Gérant (Standard)</SelectItem>
                            <SelectItem value="Admin">Administrateur (Complet)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DialogFooter className="pt-6 border-t border-white/5">
                <Button onClick={() => setIsOpen(false)} variant="ghost" className="text-white/40 hover:text-white rounded-xl">Annuler</Button>
                <Button onClick={handleCreate} className="bg-orange-accent text-night font-black uppercase tracking-widest hover:bg-orange-accent/90 rounded-xl px-10 h-12 shadow-xl shadow-orange-accent/20 transition-all">Activer le compte</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Statut Dialogs */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-night/95 backdrop-blur-xl text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm">
            <div className="flex flex-col items-center gap-6">
                <div className="h-20 w-20 bg-forest-green/20 rounded-full flex items-center justify-center animate-bounce"><CheckCircle2 className="h-10 w-10 text-forest-green" /></div> 
                <div className="space-y-2"><DialogTitle className="text-3xl font-display font-bold">Réussite</DialogTitle><p className="text-muted-foreground text-sm">L'utilisateur a été configuré avec succès.</p></div>
                <Button onClick={() => setShowSuccess(false)} className="w-full bg-forest-green text-white rounded-xl h-12 font-bold">Terminer</Button>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={error.open} onOpenChange={(v) => setError({...error, open: v})}>
        <DialogContent className="bg-night/95 backdrop-blur-xl text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm">
            <div className="flex flex-col items-center gap-6">
                <div className="h-20 w-20 bg-destructive/20 rounded-full flex items-center justify-center"><AlertCircle className="h-10 w-10 text-destructive" /></div> 
                <div className="space-y-2"><DialogTitle className="text-3xl font-display font-bold">Échec</DialogTitle><p className="text-destructive/80 text-sm font-medium">{error.message}</p></div>
                <Button onClick={() => setError({...error, open: false})} className="w-full bg-destructive text-white rounded-xl h-12 font-bold">Reessayer</Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
