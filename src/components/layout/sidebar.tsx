"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Truck,
  Bird,
  Box,
  CalendarCheck,
  CreditCard,
  FileText,
  Bell,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  group?: boolean;
};

const navigation: NavItem[] = [
  { name: "TABLEAU DE BORD", group: true },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "GESTION", group: true },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Fournisseurs", href: "/fournisseurs", icon: Truck },
  { name: "INVENTAIRE", group: true },
  { name: "Volailles", href: "/volailles", icon: Bird },
  { name: "Couveuses", href: "/couveuses", icon: Box },
  { name: "TRANSACTIONS", group: true },
  { name: "Réservations", href: "/reservations", icon: CalendarCheck },
  { name: "Paiements", href: "/paiements", icon: CreditCard },
  { name: "Factures", href: "/factures", icon: FileText },
  { name: "SYSTÈME", group: true },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Audit", href: "/audit", icon: History },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-night/95 backdrop-blur-xl border-r border-white/5",
      "w-[70px] lg:w-[260px]", // Par défaut icônes seules, large sur grand écran
      collapsed ? "lg:w-[70px]" : "lg:w-[260px]" // Toggle manuel sur desktop
    )}>
      <div className={cn("flex h-20 items-center px-4 gap-3", (collapsed) && "justify-center px-0 lg:justify-center")}>
        <div className="relative h-10 w-10 min-w-[40px] rounded-xl overflow-hidden border border-orange-accent/30 orange-glow">
          <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" />
        </div>
        <div className={cn("flex flex-col overflow-hidden lg:flex", (collapsed) ? "hidden" : "hidden lg:flex")}>
          <span className="text-lg font-display font-bold text-white tracking-wider leading-none">DIARRABA</span>
          <span className="text-[9px] font-bold text-orange-accent tracking-[0.2em] mt-1">VOLAILLES</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <div className="space-y-1">
          {navigation.map((item) => {
            if (item.group) {
              return (
                <div key={item.name} className={cn(
                  "px-3 py-2 text-[9px] font-bold tracking-widest text-muted-foreground/60 mt-4 first:mt-0 uppercase",
                  (collapsed) ? "hidden" : "hidden lg:block"
                )}>
                  {item.name}
                </div>
              );
            }

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href || "#"}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden",
                  isActive ? "text-white bg-orange-accent/10" : "text-foreground/70 hover:text-white hover:bg-white/5",
                  (collapsed) ? "justify-center px-0" : "justify-center px-0 lg:justify-start lg:px-3"
                )}
                title={item.name}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-accent shadow-[0_0_10px_rgba(245,166,35,0.8)]" />
                )}
                {Icon && (
                  <Icon className={cn(
                    "h-5 w-5 transition-colors duration-300",
                    (collapsed) ? "m-0" : "m-0 lg:mr-3",
                    isActive ? "text-orange-accent" : "text-foreground/40 group-hover:text-orange-accent/70",
                  )} />
                )}
                <span className={cn("truncate lg:block", (collapsed) ? "hidden" : "hidden lg:block")}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-white/5">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hidden lg:flex w-full items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl transition-all mb-2",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : (
            <><ChevronLeft className="h-5 w-5 mr-3" /><span>Réduire</span></>
          )}
        </button>
        <button className={cn(
          "flex w-full items-center px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors",
          (collapsed) ? "justify-center px-0" : "justify-center px-0 lg:justify-start lg:px-3"
        )}>
          <LogOut className={cn("h-5 w-5", (collapsed) ? "" : "lg:mr-3")} />
          <span className={cn("lg:block", (collapsed) ? "hidden" : "hidden lg:block")}>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
