"use client";

import { Bell, Search, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function Header() {
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  return (
    <header className="h-20 border-b border-white/5 bg-night/50 backdrop-blur-sm sticky top-0 z-30 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-display font-semibold text-white">
          Bonjour, Admin 👋
        </h1>
        <div className="flex items-center text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
          <Calendar className="h-3 w-3 mr-1 text-orange-accent" />
          {today}
          <span className="mx-2 text-white/10">|</span>
          <span className="text-forest-green font-bold">12 réservations aujourd'hui</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="h-10 w-64 bg-white/5 border border-white/10 rounded-full pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-accent/50 focus:bg-white/10 transition-all"
          />
        </div>

        <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors group">
          <Bell className="h-5 w-5 text-foreground/70 group-hover:text-white transition-colors" />
          <span className="absolute top-1 right-1 h-4 w-4 bg-orange-accent text-[10px] font-bold text-night flex items-center justify-center rounded-full border-2 border-night animate-pulse">
            3
          </span>
        </button>

        <button className="h-10 px-6 bg-gradient-to-r from-orange-accent to-[#D48A00] text-night font-bold text-sm rounded-full shadow-lg orange-glow-hover transition-all active:scale-95">
          + Nouvelle Réservation
        </button>
      </div>
    </header>
  );
}
