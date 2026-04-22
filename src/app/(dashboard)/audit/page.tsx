"use client";

import { motion } from "framer-motion";
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck,
  Globe,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";

const logsMock = [
  { id: 1, action: "UPDATE", entite: "volailles", manager: "Admin Manager", date: "22 Avr 2024 10:45", ip: "192.168.1.1", details: "Modification stock Poussin (+500)" },
  { id: 2, action: "INSERT", entite: "reservations", manager: "Admin Manager", date: "22 Avr 2024 10:30", ip: "192.168.1.1", details: "Nouvelle réservation RES-2024-001" },
  { id: 3, action: "DELETE", entite: "fournisseurs", manager: "Super Admin", date: "21 Avr 2024 16:20", ip: "41.140.2.15", details: "Suppression fournisseur ID: 12" },
  { id: 4, action: "LOGIN", entite: "auth", manager: "Admin Manager", date: "21 Avr 2024 08:00", ip: "192.168.1.1", details: "Connexion réussie" },
];

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Journal d'Audit</h2>
          <p className="text-sm text-muted-foreground">Historique complet des actions effectuées pour une traçabilité totale.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 transition-all">
            <ShieldCheck className="h-4 w-4 mr-2 text-forest-green" />
            Vérifier l'intégrité
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-2 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher par action, entité ou gérant..." 
            className="w-full h-10 bg-night/50 border border-white/10 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-accent/50"
          />
        </div>
        <button className="flex items-center px-4 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
          <Filter className="h-4 w-4 mr-2 text-orange-accent" />
          Période
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="px-6 py-4 font-semibold">Action / Entité</th>
              <th className="px-6 py-4 font-semibold">Gérant</th>
              <th className="px-6 py-4 font-semibold">Détails</th>
              <th className="px-6 py-4 font-semibold">Origine</th>
              <th className="px-6 py-4 font-semibold text-right">Horodatage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logsMock.map((log) => (
              <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase",
                      log.action === "UPDATE" ? "bg-blue-400/20 text-blue-400" :
                      log.action === "INSERT" ? "bg-forest-green/20 text-forest-green" :
                      log.action === "DELETE" ? "bg-destructive/20 text-destructive" :
                      "bg-white/10 text-white"
                    )}>
                      {log.action}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">{log.entite}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-white font-medium">{log.manager}</td>
                <td className="px-6 py-4 text-xs text-muted-foreground italic truncate max-w-[250px]">{log.details}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center text-[10px] text-muted-foreground">
                      <Globe className="h-3 w-3 mr-1 text-orange-accent/50" />
                      {log.ip}
                    </div>
                    <div className="flex items-center text-[10px] text-muted-foreground">
                      <Monitor className="h-3 w-3 mr-1 text-orange-accent/50" />
                      Chrome / Win10
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-xs font-mono font-medium text-white">{log.date}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
