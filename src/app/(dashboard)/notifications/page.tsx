"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Package, 
  CreditCard, 
  Truck, 
  AlertTriangle, 
  Calendar,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

const initialNotifications = [
  { id: 1, type: "Reservation", message: "Nouvelle réservation reçue de Ahmed Bennani (500 Poussins).", date: "Il y a 10 min", lue: false },
  { id: 2, type: "Paiement", message: "Paiement de 35 000 FCFA reçu pour la commande FAC-2024-002.", date: "Il y a 1 heure", lue: false },
  { id: 3, type: "Alerte", message: "Stock critique : Le niveau de 'Poulet de Chair' est descendu à 45 unités.", date: "Il y a 3 heures", lue: true },
  { id: 4, type: "Livraison", message: "La livraison pour Fatima Alaoui a été marquée comme terminée.", date: "Il y a 1 jour", lue: true },
  { id: 5, type: "Autre", message: "Rappel : Entretien hebdomadaire des couveuses prévu demain à 09h00.", date: "Il y a 1 jour", lue: true },
];

const icons = {
  Reservation: { icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
  Paiement: { icon: CreditCard, color: "text-forest-green", bg: "bg-forest-green/10" },
  Alerte: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  Livraison: { icon: Truck, color: "text-orange-accent", bg: "bg-orange-accent/10" },
  Autre: { icon: Bell, color: "text-purple-400", bg: "bg-purple-400/10" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, lue: true } : n));
  };

  const deleteNotif = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, lue: true })));
  };

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
            const config = icons[n.type as keyof typeof icons] || icons.Autre;
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
                    {n.type} • {n.date}
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

