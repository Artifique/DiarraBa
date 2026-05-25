"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, Search, Calendar } from "lucide-react";
import { getNonLuesAction } from "@/app/actions/data"; // Import de la Server Action

export function Header() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    setToday(format(new Date(), "EEEE d MMMM yyyy", { locale: fr }));
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userId = user?.id;

      if (userId) {
        const notifications = await getNonLuesAction(userId);
        setUnreadCount(notifications.length);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <header className="h-auto min-h-[80px] border-b border-white/5 bg-night/50 backdrop-blur-sm sticky top-0 z-30 px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-lg md:text-xl font-display font-semibold text-white">Bonjour, Admin 👋</h1>
        <div className="flex items-center text-[9px] md:text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
          <Calendar className="h-3 w-3 mr-1 text-orange-accent" />
          {today}
        </div>
      </div>

      <div className="flex items-center gap-4">
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