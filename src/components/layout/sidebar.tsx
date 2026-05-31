"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, Users, Truck, LogOut, Package, ClipboardList, Zap, Settings, Tag, User as UserIcon, X
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

export function Sidebar({ 
  collapsed,
  mobileOpen,
  setMobileOpen
}: { 
  collapsed?: boolean;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}) {
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

  const handleLinkClick = () => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen transition-transform duration-300 bg-night/95 backdrop-blur-xl border-r border-white/5 flex flex-col",
        "w-[260px] lg:w-[260px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        collapsed ? "lg:w-[70px]" : "lg:w-[260px]"
      )}>
        <div className={cn("flex h-20 items-center justify-between px-4 gap-3")} suppressHydrationWarning>
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 min-w-[40px] rounded-xl overflow-hidden border border-orange-accent/30 orange-glow" suppressHydrationWarning>
              <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" sizes="40px" />
            </div>
            <div className={cn("flex flex-col overflow-hidden lg:block", (collapsed) ? "hidden" : "block")} suppressHydrationWarning>
              <span className="text-lg font-display font-bold text-white tracking-wider leading-none">DIARRABA</span>
            </div>
          </div>
          {setMobileOpen && (
            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white cursor-pointer active:scale-95 transition-transform"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar" suppressHydrationWarning>
          <div className="space-y-1" suppressHydrationWarning>

            {navigation.map((item) => {
              if (item.name === "Utilisateurs" && userRole?.toLowerCase() !== "admin") return null;
              if (item.group) {
                return (
                  <div key={item.name} className={cn(
                    "px-3 py-2 text-[9px] font-bold tracking-widest text-muted-foreground/60 mt-4 first:mt-0 uppercase",
                    (collapsed) ? "hidden" : "block lg:block"
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
                  onClick={handleLinkClick}
                >
                  <div className={cn("relative", (collapsed) ? "lg:mr-0" : "mr-3 lg:mr-3")}>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-accent shadow-[0_0_10px_rgba(245,166,35,0.5)] rounded-full" />}
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn("block lg:block", (collapsed) ? "hidden" : "block")}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer">
            <LogOut className={cn("h-5 w-5 mr-3 lg:mr-3", (collapsed) ? "lg:mr-0" : "")} />
            <span className={cn("block lg:block", (collapsed) ? "hidden" : "block")}>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
