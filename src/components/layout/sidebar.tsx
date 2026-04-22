"use client";

import React from "react";
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
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href?: string;
  icon?: LucideIcon;
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

  return (
    <div className="flex h-full w-[260px] flex-col bg-night/95 backdrop-blur-xl border-r border-white/5 fixed left-0 top-0 z-40">
      <div className="flex h-24 items-center px-6 gap-3">
        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-orange-accent/30 orange-glow">
          <Image
            src="/logo.jpeg"
            alt="Diarraba Logo"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-display font-bold text-white tracking-wider leading-none">
            DIARRABA
          </span>
          <span className="text-[10px] font-bold text-orange-accent tracking-[0.2em] mt-1">
            VOLAILLES
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
        <div className="space-y-1">
          {navigation.map((item) => {
            if (item.group) {
              return (
                <div
                  key={item.name}
                  className="px-3 py-2 text-[10px] font-bold tracking-widest text-muted-foreground/60 mt-4 first:mt-0"
                >
                  {item.name}
                </div>
              );
            }

            const isActive = pathname === item.href;
            const Icon = item.icon!;

            return (
              <Link
                key={item.name}
                href={item.href!}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "text-white bg-orange-accent/10"
                    : "text-foreground/70 hover:text-white hover:bg-white/5",
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-accent shadow-[0_0_10px_rgba(245,166,35,0.8)]" />
                )}
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 transition-colors duration-300",
                    isActive
                      ? "text-orange-accent"
                      : "text-foreground/40 group-hover:text-orange-accent/70",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center p-2 rounded-lg bg-white/5 mb-4">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white border border-white/10">
            AD
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-xs font-medium text-white truncate">
              Admin Manager
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              admin@volaille.com
            </p>
          </div>
        </div>
        <button className="flex w-full items-center px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors">
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
