"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, Search, Calendar } from "lucide-react";
import { notificationService } from "@/lib/services";
import { ManagerModel } from "@/lib/models";
import { createClient } from "@/lib/supabase";

export function Header() {
  const [unreadCount, setUnreadCount] = useState(0);
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  const fetchUnreadCount = useCallback(async () => {
    const supabase = createClient();
    const managerModel = new ManagerModel(supabase);
    const manager = await managerModel.findFirst();
    if (manager) {
      const notifications = await notificationService.getNonLues(manager.id);
      setUnreadCount(notifications.length);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // Rafraîchir toutes les 30 secondes pour le dynamisme
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <header className="h-20 border-b border-white/5 bg-night/50 backdrop-blur-sm sticky top-0 z-30 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-display font-semibold text-white">Bonjour, Admin 👋</h1>
        <div className="flex items-center text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
          <Calendar className="h-3 w-3 mr-1 text-orange-accent" />
          {today}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Link href="/notifications" onClick={fetchUnreadCount} className="relative p-2 rounded-full hover:bg-white/5 transition-colors group">
          <Bell className="h-5 w-5 text-foreground/70 group-hover:text-white transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-orange-accent text-[10px] font-bold text-night flex items-center justify-center rounded-full border-2 border-night animate-pulse">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}