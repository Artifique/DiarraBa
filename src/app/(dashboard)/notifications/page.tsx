// src/app/(dashboard)/notifications/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, Calendar, CheckCircle2, Trash2, Loader2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getNonLuesAction, deleteNotifAction, checkAndGenerateNotificationsAction } from "../../actions/data";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);

  const fetchNotifications = useCallback(async (userId: string) => {
    setLoading(true);
    const data = await getNonLuesAction(userId);
    setNotifications(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user?.id) {
        await checkAndGenerateNotificationsAction(user.id);
        fetchNotifications(user.id);
      } else {
        setLoading(false);
      }
    };
    init();
  }, [fetchNotifications]);

  const handleDelete = async (id: string) => {
    await deleteNotifAction(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedNotif(null);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "Alerte": return { icon: <AlertTriangle className="h-6 w-6" />, color: "text-orange-500", bg: "bg-orange-500/10" };
      case "Reservation": return { icon: <Calendar className="h-6 w-6" />, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "Eclosion": return { icon: <CheckCircle2 className="h-6 w-6" />, color: "text-purple-500", bg: "bg-purple-500/10" };
      default: return { icon: <Bell className="h-6 w-6" />, color: "text-white", bg: "bg-white/10" };
    }
  };

  const getLink = (type: string) => {
      switch(type) {
          case "Alerte": return "/produit";
          case "Reservation": return "/reservation";
          case "Eclosion": return "/eclosion";
          default: return "#";
      }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h2 className="text-3xl font-display font-bold text-white">Notifications</h2>
      
      {loading ? (
        <div className="flex justify-center pt-20"><Loader2 className="h-10 w-10 animate-spin text-orange-accent" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center pt-20 text-muted-foreground italic">Aucune nouvelle notification.</div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((n) => {
                const { icon, color, bg } = getIcon(n.type);
                return (
                    <motion.div 
                        key={n.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                        onClick={() => setSelectedNotif(n)}
                        className="glass-card p-6 rounded-[2rem] border border-white/10 flex items-center gap-6 cursor-pointer hover:bg-white/[0.03] transition-all"
                    >
                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-white/5", bg, color)}>
                            {icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-bold">{n.message}</p>
                            <p className="text-xs text-muted-foreground">{new Date(n.date_creation).toLocaleString()}</p>
                        </div>
                    </motion.div>
                );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Détails */}
      <Dialog open={!!selectedNotif} onOpenChange={() => setSelectedNotif(null)}>
        <DialogContent className="bg-night/95 backdrop-blur-2xl border-white/10 text-white rounded-[2.5rem] p-8 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-orange-accent">Détail</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-white/90 text-sm leading-relaxed">{selectedNotif?.message}</div>
          <DialogFooter className="gap-3 flex-col sm:flex-row">
            <Button variant="outline" className="rounded-xl flex-1" onClick={() => {
                window.location.href = getLink(selectedNotif?.type || "");
            }}>Aller à la ressource</Button>
            <Button variant="destructive" className="rounded-xl flex-1" onClick={() => selectedNotif && handleDelete(selectedNotif.id)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
