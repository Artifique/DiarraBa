// filepath: src/app/(dashboard)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Save,
  Camera,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase"; // Pour ManagerModel
import { ManagerModel } from "@/lib/models"; // Pour ManagerModel
import { Manager } from "@/types/database"; // Pour le type Manager

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- Schéma Zod pour les informations du Manager ---
const formSchema = z.object({
  nom: z.string().min(1, "Le nom est requis."),
  email: z.string().email("Email invalide.").optional().or(z.literal("")),
  telephone: z.string().min(1, "Le numéro de téléphone est requis."),
});

type ManagerFormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manager, setManager] = useState<Manager | null>(null); // Pour stocker les données du manager

  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      email: "",
      telephone: "",
    },
  });

  const { handleSubmit, register, reset, formState: { errors } } = form;

  useEffect(() => {
    const fetchManager = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const model = new ManagerModel(supabase);
        const data = await model.findFirst(); // Assumons qu'il n'y a qu'un seul manager ou que nous récupérons celui connecté
        if (data) {
          setManager(data);
          reset({
            nom: data.nom,
            email: data.email || "",
            telephone: data.telephone,
          });
        }
      } catch (error) {
        console.error("Error fetching manager:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchManager();
  }, [reset]);

  const onSubmit = async (values: ManagerFormValues) => {
    if (!manager) return; // Ne pas sauvegarder si pas de manager chargé
    setSaving(true);
    try {
      const supabase = createClient();
      const model = new ManagerModel(supabase);
      const updatedManager = await model.update(manager.id, values);
      setManager(updatedManager); // Met à jour l'état local du manager
      alert("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Error updating manager profile:", error);
      alert("Erreur lors de la mise à jour du profil.");
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
          <User className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Mon Profil</h2>
          <p className="text-sm text-muted-foreground">Gérez vos informations personnelles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Suppression de la navigation latérale - un seul onglet reste */}
        <div className="lg:col-span-1 space-y-2">
          <button
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              "bg-orange-accent text-night shadow-lg orange-glow" // Toujours actif
            )}
          >
            <User className="h-4 w-4" />
            Mon Profil
          </button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl border border-white/5 space-y-8"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="font-display font-bold text-white text-lg">Informations Personnelles</h3>
                  <button
                    type="submit"
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
                      {manager?.nom.charAt(0)}
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-orange-accent text-night rounded-full border-2 border-night hover:scale-110 transition-transform">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-1.5">
                      <label htmlFor="nom" className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Nom complet</label>
                      <input
                        id="nom"
                        type="text"
                        {...register("nom")}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-accent/50"
                      />
                      {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Email professionnel</label>
                      <input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-accent/50"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="telephone" className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Téléphone</label>
                      <input
                        id="telephone"
                        type="tel"
                        {...register("telephone")}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-accent/50"
                      />
                      {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone.message}</p>}
                    </div>
                    {/* Le rôle est affiché mais non modifiable ici */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Rôle</label>
                      <div className="h-11 bg-white/5 border border-white/10 rounded-xl px-4 flex items-center text-sm text-orange-accent font-bold">Manager Principal</div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
