// src/app/(dashboard)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, User, Save, Loader2, CheckCircle2, AlertCircle, Mail, Phone, Lock, Bell, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { User as PrismaUser, Setting as PrismaSetting } from "../../../generated/prisma/index";
import { settingsService } from "@/lib/services";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const formSchema = z.object({
  nom: z.string().min(1, "Le nom est requis."),
  email: z.string().email("Email invalide.").optional().or(z.literal("")),
  telephone: z.string().min(1, "Le numéro de téléphone est requis."),
});

const appSettingsFormSchema = z.object({
  email_notifications_enabled: z.boolean(),
  low_stock_threshold: z.preprocess((val) => Number(val), z.number().min(0)),
});

type ManagerFormValues = z.infer<typeof formSchema>;
type AppSettingsFormValues = z.infer<typeof appSettingsFormSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<PrismaUser | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "app_settings">("profile");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [appSettings, setAppSettings] = useState<PrismaSetting[]>([]);

  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nom: "", email: "", telephone: "" },
  });

  const appSettingsForm = useForm<AppSettingsFormValues>({
    resolver: zodResolver(appSettingsFormSchema),
    defaultValues: { email_notifications_enabled: false, low_stock_threshold: 5 },
  });

  const { handleSubmit: handleProfileSubmit, register: registerProfile, reset: resetProfile } = form;
  const { handleSubmit: handleAppSettingsSubmit, register: registerAppSettings, reset: resetAppSettings } = appSettingsForm;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData: PrismaUser = JSON.parse(storedUser);
          setUser(userData);
          resetProfile({
            nom: userData.nom,
            email: userData.email || "",
            telephone: userData.telephone,
          });
        }
        const fetchedSettings = await settingsService.getAllSettings();
        setAppSettings(fetchedSettings);
        resetAppSettings({
          email_notifications_enabled: fetchedSettings.find(s => s.key === "email_notifications_enabled")?.value === "true",
          low_stock_threshold: Number(fetchedSettings.find(s => s.key === "low_stock_threshold")?.value) || 5,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [resetProfile, resetAppSettings]);

  const onProfileSubmit = async (values: ManagerFormValues) => {
    if (!user) return;
    setSaving(true);
    try {
      const updatedUser = { ...user, ...values };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowSuccess(true);
    } catch (e) { setErrorMessage("Erreur lors de la sauvegarde."); setShowError(true); } 
    finally { setSaving(false); }
  };

  const onAppSettingsSubmit = async (values: AppSettingsFormValues) => {
    if (!user) return;
    setSaving(true);
    try {
      const save = async (key: string, value: string) => {
        const existing = appSettings.find(s => s.key === key);
        if (existing) await settingsService.updateSetting(existing.id, { value }, user.id);
        else await settingsService.createSetting({ key, value, type: "text", description: key, userId: user.id }, user.id);
      };
      await Promise.all([
        save("email_notifications_enabled", String(values.email_notifications_enabled)),
        save("low_stock_threshold", String(values.low_stock_threshold)),
      ]);
      setShowSuccess(true);
    } catch (e) { setErrorMessage("Erreur lors de la sauvegarde."); setShowError(true); } 
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 p-2">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-3xl bg-orange-accent/10 flex items-center justify-center text-orange-accent"><Settings className="h-7 w-7" /></div>
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Paramètres</h2>
          <p className="text-sm text-muted-foreground/70">Configuration de votre compte et du système.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-3 space-y-2">
            <button onClick={() => setActiveTab("profile")} className={cn("w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition-all", activeTab === "profile" ? "bg-orange-accent text-night shadow-xl" : "text-muted-foreground hover:bg-white/5")}><User className="h-5 w-5" /> Profil</button>
            <button onClick={() => setActiveTab("app_settings")} className={cn("w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition-all", activeTab === "app_settings" ? "bg-orange-accent text-night shadow-xl" : "text-muted-foreground hover:bg-white/5")}><Settings className="h-5 w-5" /> Système</button>
        </div>

        <div className="md:col-span-9">
          {activeTab === "profile" ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8 rounded-[2rem] border border-white/10 shadow-2xl">
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                    <h3 className="font-display font-bold text-xl text-white">Profil</h3>
                    <Button type="submit" disabled={saving} className="bg-orange-accent text-night font-black uppercase tracking-widest h-12 px-8 rounded-xl shadow-lg">Enregistrer</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Nom complet</Label><Input {...registerProfile("nom")} className="bg-white/5 border-white/10 h-12 rounded-xl" /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Email</Label><Input {...registerProfile("email")} className="bg-white/5 border-white/10 h-12 rounded-xl" /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Téléphone</Label><Input {...registerProfile("telephone")} className="bg-white/5 border-white/10 h-12 rounded-xl" /></div>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8 rounded-[2rem] border border-white/10 shadow-2xl">
              <form onSubmit={handleAppSettingsSubmit(onAppSettingsSubmit)} className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                    <h3 className="font-display font-bold text-xl text-white">Système</h3>
                    <Button type="submit" disabled={saving} className="bg-orange-accent text-night font-black uppercase tracking-widest h-12 px-8 rounded-xl shadow-lg">Enregistrer</Button>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-blue-400/10 rounded-xl flex items-center justify-center text-blue-400"><Bell className="h-5 w-5" /></div>
                        <div>
                            <Label htmlFor="email_notifications_enabled" className="text-sm font-bold text-white block">Notifications Email</Label>
                            <span className="text-[10px] text-muted-foreground uppercase">Recevoir des alertes système</span>
                        </div>
                    </div>
                    <input type="checkbox" id="email_notifications_enabled" {...registerAppSettings("email_notifications_enabled")} className="h-5 w-5 rounded-lg border-white/10 bg-white/5 text-orange-accent" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="low_stock_threshold" className="text-[10px] font-black text-white/40 uppercase flex items-center gap-2"><Gauge className="h-3 w-3" /> Seuil d'alerte stock faible</Label>
                    <Input id="low_stock_threshold" type="number" {...registerAppSettings("low_stock_threshold")} className="bg-white/5 border-white/10 h-14 rounded-xl text-lg font-mono font-black" />
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
      
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}><DialogContent className="bg-night/95 backdrop-blur-xl text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm"><div className="flex flex-col items-center gap-6"><div className="h-20 w-20 bg-forest-green/20 rounded-full flex items-center justify-center animate-bounce"><CheckCircle2 className="h-10 w-10 text-forest-green" /></div> <div className="space-y-2"><DialogTitle className="text-3xl font-display font-bold">Parfait !</DialogTitle><p className="text-muted-foreground text-sm">Modifications enregistrées avec succès.</p></div><Button onClick={() => setShowSuccess(false)} className="w-full bg-forest-green text-white rounded-xl h-12 font-bold">Continuer</Button></div></DialogContent></Dialog>
      <Dialog open={showError} onOpenChange={setShowError}><DialogContent className="bg-night/95 backdrop-blur-xl text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm"><div className="flex flex-col items-center gap-6"><div className="h-20 w-20 bg-destructive/20 rounded-full flex items-center justify-center"><AlertCircle className="h-10 w-10 text-destructive" /></div> <div className="space-y-2"><DialogTitle className="text-3xl font-display font-bold">Erreur</DialogTitle><p className="text-destructive/80 text-sm">{errorMessage}</p></div><Button onClick={() => setShowError(false)} className="w-full bg-destructive text-white rounded-xl h-12 font-bold">Reessayer</Button></div></DialogContent></Dialog>
    </div>
  );
}
