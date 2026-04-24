// filepath: src/app/(dashboard)/audit/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Globe,
  Monitor,
  Loader2, // Ajouté pour l'état de chargement
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { Pagination } from "@/components/ui/pagination";
import { DateFilter } from "@/components/ui/date-filter";
import { createClient } from "@/lib/supabase"; // Import de createClient
import { AuditModel } from "@/lib/models"; // Import de AuditModel
import { AuditLog } from "@/types/database"; // Import de AuditLog

export default function AuditPage() {
  const [loading, setLoading] = useState(true); // Ajout de l'état de chargement
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]); // Renommé de logs à auditLogs
  const [managerNames, setManagerNames] = useState<{ [key: string]: string }>({}); // Pour stocker les noms des managers

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const model = new AuditModel(supabase);
      
      const logsData = await model.findAll();

      const { data: managersData, error: managersError } = await supabase
        .from('managers')
        .select('id, nom');
      if (managersError) {
        console.error("Error fetching managers for audit logs:", managersError);
        // Ne pas throw l'erreur, car les logs peuvent être affichés même sans noms de manager
      }

      const namesMap: { [key: string]: string } = {};
      managersData?.forEach(manager => { // Utiliser managersData?. pour gérer le cas où managersData est null
        namesMap[manager.id] = manager.nom;
      });
      setManagerNames(namesMap);

      setAuditLogs(logsData);
    } catch (error) {
      console.error("Error fetching audit logs:", error); // Log d'erreur détaillé
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Filtered and paginated logs
  const filteredLogs = auditLogs.filter((log) => { // Utilise auditLogs
    const managerNom = log.manager_id ? managerNames[log.manager_id] || "Inconnu" : "Système";
    const details = log.nouvelle_valeur || log.ancienne_valeur || ""; // Choisir l'une ou l'autre valeur pour les détails

    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entite.toLowerCase().includes(searchTerm.toLowerCase()) ||
      managerNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || new Date(log.date_action).toLocaleDateString('fr-FR').includes(dateFilter); // Utilise date_action

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">
            Journal d'Audit
          </h2>
          <p className="text-sm text-muted-foreground">
            Historique complet des actions effectuées pour une traçabilité
            totale.
          </p>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 bg-night/50 border border-white/10 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-accent/50"
          />
        </div>
        <DateFilter
          value={dateFilter}
          onChange={setDateFilter}
          placeholder="Filtrer par date"
          className="max-w-xs"
        />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        {loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-accent" />
          </div>
        ) : (
          paginatedLogs.length === 0 ? ( // Condition pour afficher le message "Aucun log"
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground italic">Aucun log d'audit pour le moment.</p>
            </div>
          ) : (
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
                {paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase",
                            log.action === "UPDATE"
                              ? "bg-blue-400/20 text-blue-400"
                              : log.action === "CREATE" // Changement de INSERT à CREATE
                                ? "bg-forest-green/20 text-forest-green"
                                : log.action === "DELETE"
                                  ? "bg-destructive/20 text-destructive"
                                  : "bg-white/10 text-white",
                          )}
                        >
                          {log.action}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.entite}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {log.manager_id ? managerNames[log.manager_id] || "Inconnu" : "Système"}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground italic truncate max-w-[250px]">
                      {log.nouvelle_valeur || log.ancienne_valeur || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-[10px] text-muted-foreground">
                          <Globe className="h-3 w-3 mr-1 text-orange-accent/50" />
                          {log.adresse_ip || "N/A"}
                        </div>
                        <div className="flex items-center text-[10px] text-muted-foreground">
                          <Monitor className="h-3 w-3 mr-1 text-orange-accent/50" />
                          {log.user_agent || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs font-mono font-medium text-white">
                        {new Date(log.date_action).toLocaleDateString('fr-FR')} {new Date(log.date_action).toLocaleTimeString('fr-FR')}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
