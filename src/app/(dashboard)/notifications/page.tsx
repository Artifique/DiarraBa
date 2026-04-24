// filepath: src/app/(dashboard)/notifications/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Package,
  CreditCard,
  Truck,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Trash2,
  Loader2, // Ajouté pour l'état de chargement
} from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationService } from "@/lib/services"; // Import du service de notification
import { Notification, NotificationType } from "@/types/database"; // Import du type Notification

// Définition des icônes pour les types de notification
const notificationIcons: { [key in NotificationType]: { icon: any; color: string; bg: string } } = {
  Reservation: { icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
  Paiement: { icon: CreditCard, color: "text-forest-green", bg: "bg-forest-green/10" },
  Alerte: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  Livraison: { icon: Truck, color: "text-orange-accent", bg: "bg-orange-accent/10" },
  Autre: { icon: Bell, color: "text-purple-400", bg: "bg-purple-400/10" },
  Facture: { icon: Package, color: "text-yellow-400", bg: "bg-yellow-400/10" }, // Ajout du type Facture
};


export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // TODO: Remplacer par l'ID réel du manager connecté
  const managerId = "CURRENT_MANAGER_ID"; // Placeholder pour l'ID du manager

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Pour l'instant, nous affichons toutes les notifications
      // Dans une application réelle, on filtrerait par manager_id si la notification est spécifique.
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications(); // Recharger les notifications après la mise à jour
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      await notificationService.delete(id);
      fetchNotifications(); // Recharger les notifications après suppression
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Marquer toutes les notifications du manager comme lues
      // NOTE: Le modèle actuel markAllAsRead prend un managerId
      await notificationService.markAllAsRead(managerId);
      fetchNotifications(); // Recharger les notifications après la mise à jour
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-orange-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-accent/10 flex items-center justify-center text-orange-accent">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">Centre de Notifications</h2>
            <p className="text-sm text-muted-foreground">Restez informé des activités et des alertes de votre exploitation.</p>
          </div>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-xs font-bold text-orange-accent hover:underline uppercase tracking-widest"
        >
          Tout marquer comme lu
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {notifications.map((n, i) => {
            // Assurez-vous que le type de notification correspond à une clé valide dans notificationIcons
            const config = notificationIcons[n.type as NotificationType] || notificationIcons.Autre;
            return (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={n.id}
                className={cn(
                  "glass-card p-4 rounded-2xl flex items-center gap-4 group hover:border-white/20 transition-all",
                  !n.lue && "border-l-4 border-l-orange-accent bg-white/[0.03]"
                )}
              >
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5", config.bg, config.color)}>
                  <config.icon className="h-6 w-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm leading-snug", !n.lue ? "text-white font-semibold" : "text-muted-foreground")}>
                    {n.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase font-bold tracking-widest">
                    {n.type} • {new Date(n.date_creation).toLocaleDateString('fr-FR')} {new Date(n.date_creation).toLocaleTimeString('fr-FR')}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.lue && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="p-2 hover:bg-forest-green/10 text-forest-green rounded-lg transition-colors" title="Marquer comme lu"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(n.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors" title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {!n.lue && (
                  <div className="h-2 w-2 rounded-full bg-orange-accent shadow-[0_0_8px_rgba(245,166,35,0.8)]" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground italic">Aucune notification pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
