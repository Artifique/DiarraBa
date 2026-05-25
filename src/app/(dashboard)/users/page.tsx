// src/app/(dashboard)/users/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Loader2, AlertCircle, CheckCircle2, Trash2, User as UserIcon, Shield, Edit, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PasswordInput } from "@/components/ui/password-input";
import { getAllUsersAction, countUsersAction, createUserAction, deleteUserAction, updateUserAction } from "../../actions/data";
import { User as PrismaUser } from "../../../generated/prisma/index";
import { cn } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<PrismaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PrismaUser | null>(null);
  
  const [formData, setFormData] = useState({ nom: "", email: "", telephone: "", mot_de_passe: "", role: "gerant" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsersAction(1, 50);
      setUsers(data || []);
    } catch (e) {
      setError({ open: true, message: "Erreur de chargement." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSave = async () => {
    try {
      if (editingUser) {
        await updateUserAction(editingUser.id, { nom: formData.nom, email: formData.email, telephone: formData.telephone, role: formData.role });
      } else {
        await createUserAction({ ...formData, password: formData.mot_de_passe });
      }
      setIsOpen(false);
      setShowSuccess(true);
      fetchUsers();
    } catch (e: any) {
      setError({ open: true, message: e.message || "Erreur lors de la sauvegarde." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement cet utilisateur ?")) return;
    await deleteUserAction(id);
    fetchUsers();
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>;

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Équipe & Accès</h2>
            <p className="text-sm text-muted-foreground">Gestion des membres de l'organisation.</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setIsOpen(true); }} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 rounded-xl px-6 py-6 shadow-lg shadow-orange-accent/20">
          <UserPlus className="mr-2 h-5 w-5" /> Nouvel Accès
        </Button>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/[0.03] uppercase text-[9px] md:text-[10px] tracking-widest text-muted-foreground/60 font-black border-b border-white/5">
            <tr>
              <th className="p-6">Membre</th>
              <th className="p-6">Contact</th>
              <th className="p-6 text-center">Rôle</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40"><UserIcon className="h-6 w-6" /></div>
                        <span className="text-white font-bold">{u.nom}</span>
                    </div>
                </td>
                <td className="p-6 text-muted-foreground">
                    <div className="flex flex-col text-xs gap-1">
                        <span className="flex items-center gap-2"><Mail className="h-3 w-3" /> {u.email}</span>
                        <span className="flex items-center gap-2 font-mono"><Phone className="h-3 w-3" /> {u.telephone || "---"}</span>
                    </div>
                </td>
                <td className="p-6 text-center">
                    <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black border", u.role === "Admin" ? "bg-orange-accent/10 text-orange-accent border-orange-accent/20" : "bg-blue-400/10 text-blue-400 border-blue-400/20")}>
                        {u.role?.toUpperCase()}
                    </span>
                </td>
                <td className="p-6 text-right flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingUser(u); setFormData({ nom: u.nom, email: u.email || "", telephone: u.telephone || "", mot_de_passe: "", role: u.role }); setIsOpen(true); }} className="text-blue-400 hover:bg-blue-400/10"><Edit className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-5 w-5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-night/95 backdrop-blur-2xl border-white/10 text-white sm:max-w-lg rounded-[2rem] shadow-2xl p-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-accent via-yellow-500 to-orange-accent opacity-70" />
          <DialogHeader className="pt-8 px-8"><DialogTitle className="text-2xl font-display font-bold">{editingUser ? "Modifier" : "Nouvel accès"}</DialogTitle></DialogHeader>
          <div className="p-8 pt-4 space-y-6">
            <div className="space-y-4">
                <Input placeholder="Nom complet" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                <Input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                <Input placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                {!editingUser && <PasswordInput value={formData.mot_de_passe} onChange={(e: any) => setFormData({...formData, mot_de_passe: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" />}
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-night border-white/10"><SelectItem value="Admin">Admin</SelectItem><SelectItem value="gerant">Gérant</SelectItem></SelectContent>
                </Select>
            </div>
            <Button onClick={handleSave} className="w-full h-14 bg-orange-accent text-night font-black uppercase rounded-2xl shadow-xl active:scale-95">Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}><DialogContent className="bg-night/95 backdrop-blur-xl text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm"><div className="flex flex-col items-center gap-6"><div className="h-20 w-20 bg-forest-green/20 rounded-full flex items-center justify-center animate-bounce"><CheckCircle2 className="h-10 w-10 text-forest-green" /></div> <div className="space-y-2"><DialogTitle className="text-3xl font-display font-bold">Succès !</DialogTitle><p className="text-muted-foreground text-sm">Utilisateur mis à jour.</p></div><Button onClick={() => setShowSuccess(false)} className="w-full bg-forest-green text-white rounded-xl h-12 font-bold">Continuer</Button></div></DialogContent></Dialog>
      <Dialog open={error.open} onOpenChange={(v) => setError({...error, open: v})}><DialogContent className="bg-night/95 backdrop-blur-xl text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm"><div className="flex flex-col items-center gap-6"><div className="h-20 w-20 bg-destructive/20 rounded-full flex items-center justify-center"><AlertCircle className="h-10 w-10 text-destructive" /></div> <div className="space-y-2"><DialogTitle className="text-3xl font-display font-bold">Erreur</DialogTitle><p className="text-destructive/80 text-sm font-medium">{error.message}</p></div><Button onClick={() => setError({...error, open: false})} className="w-full bg-destructive text-white rounded-xl h-12 font-bold">Réessayer</Button></div></DialogContent></Dialog>
    </div>
  );
}
