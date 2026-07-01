// src/app/(dashboard)/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0B10]">
        <Loader2 className="h-12 w-12 animate-spin text-orange-accent" />
      </div>
    );
  }

  if (!user) {
    return null; // Prévient le clignotement de l'interface avant redirection
  }

  return (
    <div className="flex min-h-screen bg-[#0A0B10] text-foreground relative overflow-hidden">
      {/* Sidebar with mobile toggle state passed */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col transition-all duration-300 min-w-0 ml-0 lg:ml-[260px]">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-3 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

