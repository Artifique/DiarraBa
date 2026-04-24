"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  User, 
  Bell, 
  Save,
  Camera,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { ManagerModel } from "@/lib/models";
import { Manager } from "@/types/database";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manager, setManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: ""
  });

  useEffect(() => {
    const fetchManager = async () => {
      try {
        const supabase = createClient();
        const model = new ManagerModel(supabase);
        const data = await model.findFirst();
        if (data) {
          setManager(data);
          setFormData({
            nom: data.nom,
            email: data.email,
            telephone: data.telephone
          });
        }
      } catch (error) {
        console.error("Error fetching manager:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchManager();
  }, []);

  const handleSave = async () => {
    if (!manager) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const model = new ManagerModel(supabase);
      const updated = await model.update(manager.id, formData);
      setManager(updated);
      alert("Paramètres enregistrés avec succès !");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 border-b-2 border-orange-accent text-orange-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-orange-accent/10 flex items-center justify-center text-orange-accent">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Paramètres Système</h2>
          <p className="text-sm text-muted-foreground">Configurez votre compte et vos préférences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {[
            { label: "Mon Profil", icon: User, active: true },
            { label: "Notifications", icon: Bell, active: false },
          ].map((item) => (
            <button 
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                item.active 
                  ? "bg-orange-accent text-night shadow-lg orange-glow" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl border border-white/5 space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="font-display font-bold text-white text-lg">Informations Personnelles</h3>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-accent/10 hover:bg-orange-accent text-orange-accent hover:text-night text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white border-2 border-orange-accent overflow-hidden">
                    {formData.nom.charAt(0)}
                  </div>
                  <button className="absolute bottom-0 right-0 p-1.5 bg-orange-accent text-night rounded-full border-2 border-night hover:scale-110 transition-transform">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Nom complet</label>
                    <input type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-accent/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Email professionnel</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-accent/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Téléphone</label>
                    <input type="tel" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-accent/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Rôle</label>
                    <div className="h-11 bg-white/5 border border-white/10 rounded-xl px-4 flex items-center text-sm text-orange-accent font-bold">Manager Principal</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="font-display font-bold text-white text-lg border-b border-white/5 pb-4">Préférences d'Affichage</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">Mode Sombre Premium</p>
                    <p className="text-[11px] text-muted-foreground">Interface Midnight activée.</p>
                  </div>
                  <div className="h-6 w-11 bg-orange-accent rounded-full relative p-1 cursor-pointer"><div className="h-4 w-4 bg-night rounded-full absolute right-1" /></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
