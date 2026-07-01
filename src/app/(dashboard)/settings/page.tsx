// src/app/(dashboard)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, User, Save, Loader2, CheckCircle2, AlertCircle, Mail, Phone, Lock, Bell, Gauge, Database, Cloud, FileJson, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { User as PrismaUser, Setting as PrismaSetting } from "../../../generated/prisma/index";
import { getAllSettingsAction, updateSettingAction, createSettingAction, updatePasswordAction, getCurrentUserAction, updateUserAction } from "../../actions/data";
import { triggerManualBackupAction, checkBackupConfigAction, getBackupHistoryAction } from "../../actions/backup";
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
  low_stock_threshold: z.number().min(0),
});

type ManagerFormValues = z.infer<typeof formSchema>;
type AppSettingsFormValues = z.infer<typeof appSettingsFormSchema>;

export default function SettingsPage() {
  const { user: authenticatedUser, loading: authLoading } = useAuth(); // Utiliser le hook useAuth
  const [loading, setLoading] = useState(true); // Gérer le chargement interne du composant
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<PrismaUser | null>(null); // L'utilisateur affiché et modifiable
  const [activeTab, setActiveTab] = useState<"profile" | "app_settings" | "backups">("profile");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [appSettings, setAppSettings] = useState<PrismaSetting[]>([]);

  // Backup States
  const [backupConfig, setBackupConfig] = useState<{ configured: boolean; repo?: string; error?: string } | null>(null);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);
  const [backingUp, setBackingUp] = useState(false);

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

  const fetchBackupData = async () => {
    try {
      const [config, history] = await Promise.all([
        checkBackupConfigAction(),
        getBackupHistoryAction()
      ]);
      setBackupConfig(config);
      setBackupHistory(history);
    } catch (error) {
      console.error("Error loading backup settings:", error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!authenticatedUser) { // Attendre que l'utilisateur soit chargé par useAuth
        setLoading(false); // Si pas d'utilisateur authentifié, arrêter le chargement
        return;
      }

      try {
        setLoading(true);
        const fetchedUser = await getCurrentUserAction(authenticatedUser.id); // Utiliser la nouvelle action
        if (fetchedUser) {
          setUser(fetchedUser);
          resetProfile({
            nom: fetchedUser.nom,
            email: fetchedUser.email || "",
            telephone: fetchedUser.telephone,
          });
        }
        const fetchedSettings = await getAllSettingsAction();
        setAppSettings(fetchedSettings);
        resetAppSettings({
          email_notifications_enabled: fetchedSettings.find(s => s.key === "email_notifications_enabled")?.value === "true",
          low_stock_threshold: Number(fetchedSettings.find(s => s.key === "low_stock_threshold")?.value) || 5,
        });

        // Charger les données de sauvegarde
        await fetchBackupData();

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) { // Lancer la récupération des données seulement après que useAuth ait terminé
        fetchInitialData();
    }
  }, [authenticatedUser, authLoading, resetProfile, resetAppSettings]);

  const [passwordSaving, setPasswordSaving] = useState(false);
  const passwordForm = useForm({
    resolver: zodResolver(z.object({
        currentPassword: z.string().min(1, "Requis"),
        newPassword: z.string().min(6, "6 caractères min."),
        confirmPassword: z.string().min(6, "6 caractères min.")
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    })),
  });

  const onPasswordSubmit = async (values: any) => {
    if (!user) return;
    setPasswordSaving(true);
    try {
      await updatePasswordAction(user.id, values.currentPassword, values.newPassword);
      setShowSuccess(true);
      passwordForm.reset();
    } catch (e: any) { setErrorMessage(e.message || "Erreur lors du changement."); setShowError(true); }
    finally { setPasswordSaving(false); }
  };

  const onProfileSubmit = async (values: ManagerFormValues) => {
    if (!user) return;
    setSaving(true);
    try {
      const updatedUser = await updateUserAction(user.id, values); // Utiliser updateUserAction
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser)); // Mettre à jour localStorage
        setShowSuccess(true);
      } else {
        setErrorMessage("Erreur lors de la mise à jour de l'utilisateur.");
        setShowError(true);
      }
    } catch (e: any) { setErrorMessage(e.message || "Erreur lors de la sauvegarde du profil."); setShowError(true); } 
    finally { setSaving(false); }
  };

  const onAppSettingsSubmit = async (values: AppSettingsFormValues) => {
    if (!user) return;
    setSaving(true);
    try {
      const save = async (key: string, value: string) => {
        const existing = appSettings.find(s => s.key === key);
        if (existing) await updateSettingAction(existing.id, { value }, user.id);
        else await createSettingAction({ key, value, type: "text", description: key, userId: user.id }, user.id);
      };
      await Promise.all([
        save("email_notifications_enabled", String(values.email_notifications_enabled)),
        save("low_stock_threshold", String(values.low_stock_threshold)),
      ]);
      setShowSuccess(true);
    } catch (e) { setErrorMessage("Erreur lors de la sauvegarde."); setShowError(true); } 
    finally { setSaving(false); }
  };

  const handleManualBackup = async () => {
    if (!user) return;
    setBackingUp(true);
    try {
      const result = await triggerManualBackupAction(user.id);
      if (result.success) {
        setShowSuccess(true);
        await fetchBackupData();
      } else {
        const errorMsg = (result as any).error || "Une erreur est survenue lors de la sauvegarde.";
        setErrorMessage(errorMsg);
        setShowError(true);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Erreur lors du déclenchement de la sauvegarde.");
      setShowError(true);
    } finally {
      setBackingUp(false);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading || authLoading || !user) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 p-2">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-3xl bg-orange-accent/10 flex items-center justify-center text-orange-accent"><Settings className="h-7 w-7" /></div>
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Paramètres</h2>
          <p className="text-sm text-muted-foreground/70">Configuration de votre compte, du système et des sauvegardes.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-3 space-y-2">
            <button onClick={() => setActiveTab("profile")} className={cn("w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition-all", activeTab === "profile" ? "bg-orange-accent text-night shadow-xl" : "text-muted-foreground hover:bg-white/5")}><User className="h-5 w-5" /> Profil</button>
            <button onClick={() => setActiveTab("app_settings")} className={cn("w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition-all", activeTab === "app_settings" ? "bg-orange-accent text-night shadow-xl" : "text-muted-foreground hover:bg-white/5")}><Settings className="h-5 w-5" /> Système</button>
            <button onClick={() => setActiveTab("backups")} className={cn("w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition-all", activeTab === "backups" ? "bg-orange-accent text-night shadow-xl" : "text-muted-foreground hover:bg-white/5")}><Database className="h-5 w-5" /> Sauvegardes</button>
        </div>

        <div className="md:col-span-9">
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="glass-card p-8 rounded-[2rem] border border-white/10 shadow-2xl">
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
              </div>

              <div className="glass-card p-8 rounded-[2rem] border border-white/10 shadow-2xl">
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <div className="flex items-center justify-between pb-6 border-b border-white/5">
                          <h3 className="font-display font-bold text-xl text-white">Sécurité</h3>
                          <Button type="submit" disabled={passwordSaving} className="bg-orange-accent text-night font-black uppercase tracking-widest h-12 px-8 rounded-xl shadow-lg">Changer</Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Mot de passe actuel</Label><PasswordInput {...passwordForm.register("currentPassword")} className="bg-white/5 border-white/10 h-12 rounded-xl" /></div>
                          <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Nouveau</Label><PasswordInput {...passwordForm.register("newPassword")} className="bg-white/5 border-white/10 h-12 rounded-xl" /></div>
                          <div className="space-y-2"><Label className="text-[10px] font-black text-white/40 uppercase">Confirmation</Label><PasswordInput {...passwordForm.register("confirmPassword")} className="bg-white/5 border-white/10 h-12 rounded-xl" /></div>
                      </div>
                  </form>
              </div>
            </motion.div>
          )}

          {activeTab === "app_settings" && (
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

          {activeTab === "backups" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              {/* Configuration Status */}
              <div className="glass-card p-6 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {backupConfig?.configured ? (
                    <div className="h-12 w-12 bg-forest-green/20 rounded-2xl flex items-center justify-center text-forest-green">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 bg-destructive/20 rounded-2xl flex items-center justify-center text-destructive">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-base font-bold text-white leading-tight">Dépôt GitHub</h4>
                    <p className="text-[10px] text-muted-foreground uppercase mt-0.5">
                      {backupConfig?.configured 
                        ? `Dépôt ciblé : ${backupConfig.repo}` 
                        : "Non configuré ou erreur détectée"}
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleManualBackup} 
                  disabled={backingUp || !backupConfig?.configured}
                  className="bg-orange-accent text-night font-black uppercase tracking-wider px-6 h-12 rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                  {backingUp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4" />
                      Sauvegarder maintenant
                    </>
                  )}
                </Button>
              </div>

              {!backupConfig?.configured && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-6 rounded-2xl space-y-2 text-xs">
                  <h5 className="font-bold text-white flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Détail de l'erreur :
                  </h5>
                  <p className="font-mono text-[10px] bg-black/30 p-3 rounded-xl break-all">
                    {backupConfig?.error || "Les variables d'environnement GITHUB_PAT ou GITHUB_REPO sont manquantes."}
                  </p>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    Assurez-vous que la variable d'environnement `GITHUB_PAT` (Personal Access Token GitHub avec accès en écriture au dépôt) et `GITHUB_REPO` (ex: `Artifique/DiarraBa-backups`) sont configurées dans votre fichier `.env` ou sur Vercel.
                  </p>
                </div>
              )}

              {/* History Table */}
              <div className="glass-card p-6 rounded-[2rem] border border-white/10 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">Historique des sauvegardes</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Les 10 dernières opérations de sauvegarde sur votre dépôt GitHub.</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={fetchBackupData}
                    className="text-muted-foreground hover:text-white rounded-xl hover:bg-white/5"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {backupHistory.length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground/50 italic">
                    Aucune sauvegarde enregistrée dans l'historique d'audit.
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-muted-foreground/60 font-black">
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Fichier</th>
                          <th className="pb-3 text-center">Taille</th>
                          <th className="pb-3">Déclenché par</th>
                          <th className="pb-3 text-right">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backupHistory.map((item: any) => (
                          <tr key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 font-medium text-white">
                              {new Date(item.date).toLocaleString("fr-FR")}
                            </td>
                            <td className="py-3 max-w-[200px] truncate text-muted-foreground" title={item.details?.filename}>
                              <div className="flex items-center gap-1.5">
                                <FileJson className="h-3.5 w-3.5 text-orange-accent/70 shrink-0" />
                                <span className="truncate">{item.details?.filename || "diarraba_backup.json"}</span>
                              </div>
                            </td>
                            <td className="py-3 text-center font-mono font-medium text-white/80">
                              {formatSize(item.details?.sizeBytes)}
                            </td>
                            <td className="py-3 text-muted-foreground">
                              {item.user}
                            </td>
                            <td className="py-3 text-right">
                              <span className="bg-forest-green/10 text-forest-green text-[9px] font-bold px-2 py-0.5 rounded-full border border-forest-green/20">
                                RÉUSSI
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}><DialogContent className="bg-night/95 backdrop-blur-xl text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm"><div className="flex flex-col items-center gap-6"><div className="h-20 w-20 bg-forest-green/20 rounded-full flex items-center justify-center animate-bounce"><CheckCircle2 className="h-10 w-10 text-forest-green" /></div> <div className="space-y-2"><DialogTitle className="text-3xl font-display font-bold">Parfait !</DialogTitle><p className="text-muted-foreground text-sm">Opération effectuée avec succès.</p></div><Button onClick={() => setShowSuccess(false)} className="w-full bg-forest-green text-white rounded-xl h-12 font-bold">Continuer</Button></div></DialogContent></Dialog>
      <Dialog open={showError} onOpenChange={setShowError}><DialogContent className="bg-night/95 backdrop-blur-xl text-white text-center border-white/10 rounded-[2.5rem] p-10 max-w-sm"><div className="flex flex-col items-center gap-6"><div className="h-20 w-20 bg-destructive/20 rounded-full flex items-center justify-center"><AlertCircle className="h-10 w-10 text-destructive" /></div> <div className="space-y-2"><DialogTitle className="text-3xl font-display font-bold">Erreur</DialogTitle><p className="text-destructive/80 text-sm font-medium">{errorMessage}</p></div><Button onClick={() => setShowError(false)} className="w-full bg-destructive text-white rounded-xl h-12 font-bold">Reessayer</Button></div></DialogContent></Dialog>
    </div>
  );
}

