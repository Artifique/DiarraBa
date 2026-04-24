// filepath: src/app/(dashboard)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  Save,
  Camera,
  Loader2,
  Moon,
  Sun,
  Palette // Ajouté pour les préférences d'affichage
} from "lucide-react";
import { cn } from "@/lib/utils";
import { settingsService } from "@/lib/services";
import { Setting } from "@/types/database";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- Schéma Zod pour les paramètres système ---
const formSchema = z.object({
  app_name: z.string().min(1, "Le nom de l'application est requis."),
  contact_email: z.string().email("Email invalide.").optional().or(z.literal("")),
  dark_mode_enabled: z.boolean(),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<Setting[]>([]); // Pour stocker tous les paramètres bruts
  const [activeTab, setActiveTab] = useState("general"); // Pour gérer les onglets

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      app_name: "",
      contact_email: "",
      dark_mode_enabled: false,
    },
  });

  const { handleSubmit, register, reset, watch, formState: { errors } } = form;

  // Watch pour le switch du mode sombre
  const darkModeEnabled = watch("dark_mode_enabled");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const fetchedSettings = await settingsService.getAllSettings();
        setCurrentSettings(fetchedSettings); // Stocke les paramètres bruts

        // Mapper les paramètres récupérés aux valeurs par défaut du formulaire
        const defaultFormValues: SettingsFormValues = {
          app_name: fetchedSettings.find(s => s.key === 'app_name')?.value || "Tonomi",
          contact_email: fetchedSettings.find(s => s.key === 'contact_email')?.value || "",
          dark_mode_enabled: fetchedSettings.find(s => s.key === 'dark_mode_enabled')?.value === 'true',
        };
        reset(defaultFormValues); // Initialise le formulaire avec les valeurs récupérées
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [reset]);

  // Fonction de sauvegarde des paramètres
  const onSubmit = async (values: SettingsFormValues) => {
    setSaving(true);
    try {
      // TODO: Remplacer par l'ID réel du manager connecté
      const managerId = "CURRENT_MANAGER_ID";

      const updates = Object.keys(values).map(async (key) => {
        const value = (values as any)[key];
        const existingSetting = currentSettings.find(s => s.key === key);

        let type: Setting['type'];
        if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'object' && value !== null) {
          type = 'json';
        } else {
          type = 'string';
        }

        if (existingSetting) {
          await settingsService.updateSetting(
            existingSetting.id,
            { value: String(value), type },
            managerId
          );
        } else {
          await settingsService.createSetting(
            { key, value: String(value), type },
            managerId
          );
        }
      });

      await Promise.all(updates);

      alert("Paramètres enregistrés avec succès !");
      const reFetchedSettings = await settingsService.getAllSettings();
      setCurrentSettings(reFetchedSettings);
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
          <p className="text-sm text-muted-foreground">Configurez votre application et vos préférences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {[
            { label: "Général", icon: Settings, tab: "general" },
            { label: "Mon Profil", icon: User, tab: "profile" },
            { label: "Notifications", icon: Bell, tab: "notifications" },
            { label: "Apparence", icon: Palette, tab: "appearance" },
          ].map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === item.tab
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
            <form onSubmit={handleSubmit(onSubmit)}>
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="font-display font-bold text-white text-lg">Informations Générales</h3>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-accent/10 hover:bg-orange-accent text-orange-accent hover:text-night text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-1.5">
                      <label htmlFor="app_name" className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Nom de l'Application</label>
                      <input
                        id="app_name"
                        type="text"
                        {...register("app_name")}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-accent/50"
                      />
                      {errors.app_name && <p className="text-red-500 text-xs mt-1">{errors.app_name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="contact_email" className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Email de Contact</label>
                      <input
                        id="contact_email"
                        type="email"
                        {...register("contact_email")}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-accent/50"
                      />
                      {errors.contact_email && <p className="text-red-500 text-xs mt-1">{errors.contact_email.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="font-display font-bold text-white text-lg">Mon Profil</h3>
                    {/* Les informations du profil devraient venir d'une autre source que les paramètres système */}
                    {/* Et les boutons de sauvegarde devraient être spécifiques à ce formulaire */}
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-muted-foreground">Cette section est pour les informations de l'utilisateur connecté.</p>
                    <p className="text-muted-foreground">La gestion du profil manager n'est pas gérée via les paramètres système.</p>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="font-display font-bold text-white text-lg">Préférences de Notifications</h3>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-muted-foreground">La gestion des notifications sera implémentée ici.</p>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="font-display font-bold text-white text-lg">Préférences d'Apparence</h3>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-accent/10 hover:bg-orange-accent text-orange-accent hover:text-night text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <p className="text-sm font-bold text-white">Mode Sombre</p>
                        <p className="text-[11px] text-muted-foreground">Activer le thème sombre pour l'application.</p>
                      </div>
                      <div
                        onClick={() => form.setValue("dark_mode_enabled", !darkModeEnabled)}
                        className={cn(
                          "h-6 w-11 rounded-full relative p-1 cursor-pointer transition-all",
                          darkModeEnabled ? "bg-orange-accent" : "bg-gray-700"
                        )}
                      >
                        <motion.div
                          layout
                          transition={{ type: "spring", stiffness: 700, damping: 30 }}
                          className={cn(
                            "h-4 w-4 bg-night rounded-full absolute",
                            darkModeEnabled ? "right-1" : "left-1"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
