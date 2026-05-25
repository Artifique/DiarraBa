"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Package, CreditCard, Truck, AlertTriangle, Calendar, CheckCircle2, Trash2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getNonLuesAction, markAsReadAction, markAllAsReadAction, deleteNotifAction } from "../../actions/data";
import { Notification } from "../../../generated/prisma/index";

const notificationIcons: { [key: string]: { icon: any; color: string; bg: string } } = {
  Reservation: { icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
  Paiement: { icon: CreditCard, color: "text-forest-green", bg: "bg-forest-green/10" },
  Alerte: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  Livraison: { icon: Truck, color: "text-orange-accent", bg: "bg-orange-accent/10" },
  Autre: { icon: Bell, color: "text-purple-400", bg: "bg-purple-400/10" },
  Facture: { icon: Package, color: "text-yellow-400", bg: "bg-yellow-400/10" },
};

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (currentUserId: string) => {
    setLoading(true);
    try {
      const data = await getNonLuesAction(currentUserId);
      setNotifications(data);
    } catch (error) { console.error("Error fetching notifications:", error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const tempUserId = user?.id;
      if (tempUserId) {
        setUserId(tempUserId);
        fetchNotifications(tempUserId);
      } else {
        setLoading(false);
      }
    };
    init();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    if (!userId) return;
    await markAsReadAction(id);
    fetchNotifications(userId);
  };

  const deleteNotif = async (id: string) => {
    if (!userId) return;
    await deleteNotifAction(id);
    fetchNotifications(userId);
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await markAllAsReadAction(userId);
    fetchNotifications(userId);
  };

  if (loading) return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-accent/10 flex items-center justify-center text-orange-accent shrink-0"><Bell className="h-6 w-6" /></div>
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-white">Notifications</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Alertes de stock et activités.</p>
          </div>
        </div>
        <button onClick={markAllAsRead} className="text-[10px] md:text-xs font-bold text-orange-accent hover:underline uppercase shrink-0">Tout lire</button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground italic">Aucune notification.</div>
          ) : (
            notifications.map((n) => {
              const config = notificationIcons[n.type as string] || notificationIcons.Autre;
              return (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={n.id} className="glass-card p-3 md:p-4 rounded-2xl flex items-center gap-3 md:gap-4">
                  <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center shrink-0", config.bg, config.color)}><config.icon className="h-5 w-5 md:h-6 md:w-6" /></div>
                  <div className="flex-1"><p className="text-xs md:text-sm text-white font-semibold">{n.message}</p></div>
                  <div className="flex gap-1 md:gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)} className="h-8 w-8 p-0"><CheckCircle2 className="h-4 w-4 text-forest-green" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteNotif(n.id)} className="h-8 w-8 p-0"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}