"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, Users, Truck, LogOut, Package, ClipboardList, Zap, Settings, Tag, User as UserIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { group: true, name: "TABLEAU DE BORD" },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { group: true, name: "GESTION DES STOCKS" },
  { name: "Produit", href: "/produit", icon: Package },
  { name: "Categorie", href: "/categorie", icon: Tag },
  { group: true, name: "OPERATIONS" },
  { name: "Reservation", href: "/reservation", icon: ClipboardList },
  { name: "Eclosion", href: "/eclosion", icon: Zap },
  { name: "Utilisateurs", href: "/users", icon: Users },
  { group: true, name: "SYSTÈME" },
  { name: "Notifications", href: "/notifications", icon: Truck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("DEBUG Sidebar - Rôle utilisateur:", user.role);
        setUserRole(user.role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-night/95 backdrop-blur-xl border-r border-white/5 flex flex-col",
      "w-[70px] lg:w-[260px]",
      collapsed ? "lg:w-[70px]" : "lg:w-[260px]"
    )}>
      <div className={cn("flex h-20 items-center px-4 gap-3", (collapsed) && "justify-center px-0 lg:justify-center")} suppressHydrationWarning>
        <div className="relative h-10 w-10 min-w-[40px] rounded-xl overflow-hidden border border-orange-accent/30 orange-glow" suppressHydrationWarning>
          <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" sizes="40px" />
        </div>
        <div className={cn("flex flex-col overflow-hidden lg:flex", (collapsed) ? "hidden" : "hidden lg:block")} suppressHydrationWarning>
          <span className="text-lg font-display font-bold text-white tracking-wider leading-none">DIARRABA</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar" suppressHydrationWarning>
        <div className="space-y-1" suppressHydrationWarning>

          {navigation.map((item) => {
            if (item.name === "Utilisateurs" && userRole?.toLowerCase() !== "admin") return null;
            if (item.group) {
              return (
                <div key={item.name} className={cn(
                  "px-3 py-2 text-[9px] font-bold tracking-widest text-muted-foreground/60 mt-4 first:mt-0 uppercase",
                  (collapsed) ? "hidden" : "hidden lg:block"
                )} suppressHydrationWarning>
                  {item.name}
                </div>
              );
            }

            const isActive = pathname === item.href;
            const Icon = item.icon as React.ElementType;

            return (
              <Link
                key={item.name}
                href={item.href || "#"}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive ? "bg-orange-accent/10 text-orange-accent" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
                suppressHydrationWarning
              >
                <div className={cn("relative", (collapsed) ? "" : "lg:mr-3")}>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-accent shadow-[0_0_10px_rgba(245,166,35,0.5)] rounded-full" />}
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn("lg:block", (collapsed) ? "hidden" : "hidden lg:block")}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-white/5">
        <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
          <LogOut className={cn("h-5 w-5", (collapsed) ? "" : "lg:mr-3")} />
          <span className={cn("lg:block", (collapsed) ? "hidden" : "hidden lg:block")}>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
