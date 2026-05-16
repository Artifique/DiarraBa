"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, User, Save, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { ManagerModel } from "@/lib/models";
import { Manager, Setting } from "@/types/database";
import { settingsService } from "@/lib/services";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const formSchema = z.object({
  nom: z.string().min(1, "Le nom est requis."),
  email: z.string().email("Email invalide.").optional().or(z.literal("")),
  telephone: z.string().min(1, "Le numéro de téléphone est requis."),
  nouveau_mot_de_passe: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères.").optional().or(z.literal("")),
  confirmer_mot_de_passe: z.string().optional().or(z.literal("")),
}).refine((data) => data.nouveau_mot_de_passe === data.confirmer_mot_de_passe, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmer_mot_de_passe"],
});

const appSettingsFormSchema = z.object({
  email_notifications_enabled: z.boolean(),
  low_stock_threshold: z.number().min(0),
});

type ManagerFormValues = z.infer<typeof formSchema>;
type AppSettingsFormValues = z.infer<typeof appSettingsFormSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manager, setManager] = useState<Manager | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "app_settings">("profile");
  const [showSuccess, setShowSuccess] = useState(false);

  const [loadingAppSettings, setLoadingAppSettings] = useState(false);
  const [savingAppSettings, setSavingAppSettings] = useState(false);
  const [appSettings, setAppSettings] = useState<Setting[]>([]);

  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nom: "", email: "", telephone: "", nouveau_mot_de_passe: "", confirmer_mot_de_passe: "" },
  });

  const appSettingsForm = useForm<AppSettingsFormValues>({
    resolver: zodResolver(appSettingsFormSchema),
    defaultValues: { email_notifications_enabled: false, low_stock_threshold: 5 },
  });

  const { handleSubmit, register, reset, formState: { errors } } = form;
  const { handleSubmit: handleAppSettingsSubmit, register: registerAppSettings, reset: resetAppSettings, formState: { errors: appSettingsErrors } } = appSettingsForm;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const managerData = JSON.parse(storedUser);
          setManager(managerData);
          reset({
            nom: managerData.nom,
            email: managerData.email || "",
            telephone: managerData.telephone,
            nouveau_mot_de_passe: "",
            confirmer_mot_de_passe: "",
          });
        }

        // Fetch app settings from Supabase
        const fetchedSettings = await settingsService.getAllSettings();
        setAppSettings(fetchedSettings);

        const initialAppSettings: AppSettingsFormValues = {
          email_notifications_enabled: fetchedSettings.find(s => s.key === "email_notifications_enabled")?.value === "true",
          low_stock_threshold: Number(fetchedSettings.find(s => s.key === "low_stock_threshold")?.value) || 5,
        };
        resetAppSettings(initialAppSettings);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };    fetchInitialData();
  }, [reset]);

  const onSubmit = async (values: ManagerFormValues) => {
    if (!manager) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const model = new ManagerModel(supabase);
      const updateData: any = { nom: values.nom, email: values.email, telephone: values.telephone };
      if (values.nouveau_mot_de_passe) updateData.mot_de_passe = values.nouveau_mot_de_passe;
      const updatedManager = await model.update(manager.id, updateData);
      setManager(updatedManager);
      localStorage.setItem("user", JSON.stringify(updatedManager));
      setShowSuccess(true);
      reset({ ...values, nouveau_mot_de_passe: "", confirmer_mot_de_passe: "" });
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const onAppSettingsSubmit = async (values: AppSettingsFormValues) => {
    setSavingAppSettings(true);
    try {
      const managerId = manager?.id || "";
      const saveSetting = async (key: string, value: string, type: string, desc: string) => {
        const existing = appSettings.find(s => s.key === key);
        if (existing) await settingsService.updateSetting(existing.id, { value }, managerId);
        else await settingsService.createSetting({ key, value, type: type as any, description: desc }, managerId);
      };
      await Promise.all([
        saveSetting("email_notifications_enabled", String(values.email_notifications_enabled), "boolean", "Notifications email"),
        saveSetting("low_stock_threshold", String(values.low_stock_threshold), "number", "Seuil stock faible"),
      ]);
      setShowSuccess(true);
    } catch (e) { console.error(e); } finally { setSavingAppSettings(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-orange-accent/10 flex items-center justify-center text-orange-accent"><Settings className="h-6 w-6" /></div>
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Paramètres</h2>
          <p className="text-sm text-muted-foreground">Profil et réglages système.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
            <button onClick={() => setActiveTab("profile")} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold", activeTab === "profile" ? "bg-orange-accent text-night shadow-lg" : "text-muted-foreground hover:bg-white/5")}><User className="h-4 w-4" /> Mon Profil</button>
            <button onClick={() => setActiveTab("app_settings")} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold", activeTab === "app_settings" ? "bg-orange-accent text-night shadow-lg" : "text-muted-foreground hover:bg-white/5")}><Settings className="h-4 w-4" /> Application</button>
        </div>
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl border border-white/5">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="font-display font-bold text-white text-lg">Informations Personnelles</h3>
                  <Button type="submit" disabled={saving} className="bg-orange-accent text-night font-bold"><Save className="h-4 w-4 mr-2" /> Enregistrer</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="text-[10px] text-muted-foreground uppercase font-bold">Nom complet</Label><Input {...register("nom")} className="bg-white/5" /></div>
                  <div><Label className="text-[10px] text-muted-foreground uppercase font-bold">Email</Label><Input {...register("email")} className="bg-white/5" /></div>
                  <div><Label className="text-[10px] text-muted-foreground uppercase font-bold">Téléphone</Label><Input {...register("telephone")} className="bg-white/5" /></div>
                  <div><Label className="text-[10px] text-muted-foreground uppercase font-bold">Rôle</Label><div className="h-10 bg-white/5 rounded-md px-4 flex items-center text-sm text-orange-accent font-bold">{manager?.role || "Gérant"}</div></div>
                </div>
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <h3 className="font-display font-bold text-white text-lg">Changer mot de passe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-[10px] text-muted-foreground uppercase font-bold">Nouveau</Label><PasswordInput {...register("nouveau_mot_de_passe")} /></div>
                    <div><Label className="text-[10px] text-muted-foreground uppercase font-bold">Confirmer</Label><PasswordInput {...register("confirmer_mot_de_passe")} /></div>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-night text-white text-center"><CheckCircle2 className="h-12 w-12 text-forest-green mx-auto mb-4" /><DialogTitle>Succès !</DialogTitle><DialogDescription>Modifications enregistrées.</DialogDescription></DialogContent>
      </Dialog>
    </div>
  );
}