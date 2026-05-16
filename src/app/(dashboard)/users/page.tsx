"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ nom: "", email: "", telephone: "", mot_de_passe: "", role: "Gerant" });
  const [success, setSuccess] = useState<{ open: boolean; title: string; message: string }>({ open: false, title: "", message: "" });
  const [error, setError] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await createClient().from("managers").select("*");
    if (error) console.error("Error:", error);
    setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async () => {
    if (!formData.email || !formData.mot_de_passe || !formData.nom) {
      setError({ open: true, message: "Veuillez remplir tous les champs." });
      return;
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.mot_de_passe,
        options: { data: { nom: formData.nom, telephone: formData.telephone, role: formData.role } }
      });
      if (error) throw error;
      setIsOpen(false);
      setSuccess({ open: true, title: "Succès", message: "Utilisateur créé." });
      setFormData({ nom: "", email: "", telephone: "", mot_de_passe: "", role: "Gerant" });
      fetchUsers();
    } catch (e: any) { setError({ open: true, message: e.message || "Erreur lors de la création." }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Gestion des Utilisateurs</h2>
          <p className="text-sm text-muted-foreground">Créer et administrer les accès.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl">
          <UserPlus className="mr-2" /> Créer Utilisateur
        </Button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/5 uppercase text-[10px] tracking-widest text-muted-foreground font-bold">
            <tr><th className="p-6">Nom</th><th className="p-6">Email</th><th className="p-6">Rôle</th></tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={3} className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-orange-accent" /></td></tr>
            ) : (
                users.map(u => (
                  <tr key={u.id} className="border-t border-white/5">
                    <td className="p-6 text-white font-bold">{u.nom}</td>
                    <td className="p-6 text-sm text-muted-foreground">{u.email}</td>
                    <td className="p-6 text-orange-accent font-bold">{u.role}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-xl font-display">Créer un utilisateur</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Label className="text-xs uppercase font-bold text-white/70">Nom complet</Label>
            <Input placeholder="Nom du gérant..." value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="bg-white/5 border-white/10"/>
            <Label className="text-xs uppercase font-bold text-white/70">Email</Label>
            <Input placeholder="email@exemple.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-white/5 border-white/10"/>
            <Label className="text-xs uppercase font-bold text-white/70">Téléphone</Label>
            <Input placeholder="00 00 00 00" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="bg-white/5 border-white/10"/>
            <Label className="text-xs uppercase font-bold text-white/70">Mot de passe</Label>
            <PasswordInput value={formData.mot_de_passe} onChange={(e: any) => setFormData({...formData, mot_de_passe: e.target.value})} />
            <Label className="text-xs uppercase font-bold text-white/70">Rôle</Label>
            <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}><SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Rôle" /></SelectTrigger><SelectContent className="bg-night border-white/10"><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Gerant">Gerant</SelectItem></SelectContent></Select>
          </div>
          <DialogFooter><Button onClick={handleCreate} className="bg-orange-accent text-night font-bold">Créer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={success.open} onOpenChange={(v) => setSuccess({...success, open: v})}>
        <DialogContent className="bg-night text-white text-center"><div className="flex flex-col items-center gap-2"><CheckCircle2 className="h-10 w-10 text-forest-green" /> <DialogTitle>{success.title}</DialogTitle></div><p className="text-muted-foreground">{success.message}</p></DialogContent>
      </Dialog>
      <Dialog open={error.open} onOpenChange={(v) => setError({...error, open: v})}>
        <DialogContent className="bg-night text-white text-center"><div className="flex flex-col items-center gap-2"><AlertCircle className="h-10 w-10 text-destructive" /> <DialogTitle>Erreur</DialogTitle></div><p className="text-muted-foreground">{error.message}</p></DialogContent>
      </Dialog>
    </div>
  );
}