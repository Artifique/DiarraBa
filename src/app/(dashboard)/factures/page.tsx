"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Eye,
  Download,
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { DateFilter } from "@/components/ui/date-filter";
import { createClient } from "@/lib/supabase";
import { FactureModel, ClientModel } from "@/lib/models";
import { Facture, Client } from "@/types/database";

export default function FacturesPage() {
  const [loading, setLoading] = useState(true);
  const [factures, setFactures] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedFacture, setSelectedFacture] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Toutes");

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const fModel = new FactureModel(supabase);
      const cModel = new ClientModel(supabase);

      const [fData, cData] = await Promise.all([
        fModel.findAllWithDetails(),
        cModel.findAll()
      ]);

      const enhancedFactures = fData.map(f => ({
        ...f,
        client_nom: f.reservations?.clients?.nom || "Inconnu",
        items: [] // In a real scenario, we would fetch details
      }));

      setFactures(enhancedFactures);
      setClients(cData);
    } catch (error) {
      console.error("Error fetching factures:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrint = () => {
    window.print();
  };

  const getStatus = (f: Facture) => {
    if (f.statut === "Payee") return "Payee";
    if (f.montant_paye > 0) return "Partielle";
    return "Emise";
  };

  const filteredFactures = factures.filter(f => {
    const statut = getStatus(f);
    const matchesSearch = f.client_nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "Toutes" || statut === activeTab;
    const matchesDate = !dateFilter || f.date_facture.startsWith(dateFilter);
    return matchesSearch && matchesTab && matchesDate;
  });

  const totalPages = Math.ceil(filteredFactures.length / itemsPerPage);
  const paginatedFactures = filteredFactures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, dateFilter]);

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "Payee": return "text-forest-green";
      case "Partielle": return "text-yellow-500";
      case "Emise": return "text-blue-400";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "Payee": return <CheckCircle2 className="h-4 w-4" />;
      case "Partielle": return <AlertCircle className="h-4 w-4" />;
      case "Emise": return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Facturation</h2>
          <p className="text-sm text-muted-foreground">Gérez vos documents comptables et le suivi des règlements clients.</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all"
        >
          <Printer className="h-5 w-5 mr-2" />
          Imprimer le rapport
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar w-full lg:w-auto">
          {["Toutes", "Payee", "Partielle", "Emise"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                activeTab === tab
                  ? "bg-orange-accent text-night border-orange-accent shadow-[0_0_15px_rgba(245,166,35,0.3)]"
                  : "bg-white/5 text-muted-foreground border-white/5 hover:border-white/20"
              )}
            >
              {tab === "Payee" ? "Payées" : tab === "Partielle" ? "Partielles" : tab === "Emise" ? "Émises" : tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher une facture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-accent/50 focus:border-orange-accent/50 transition-all"
            />
          </div>
          <DateFilter
            value={dateFilter}
            onChange={setDateFilter}
            placeholder="Filtrer par date"
            className="w-full sm:w-48"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">
                  <th className="px-6 py-4">Facture</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Payé</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {paginatedFactures.map((facture) => {
                    const statut = getStatus(facture);
                    return (
                      <motion.tr
                        key={facture.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-orange-accent/10 border border-orange-accent/20 flex items-center justify-center text-orange-accent font-bold text-sm">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{facture.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{facture.client_nom}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-mono font-bold text-white">{facture.prix_total.toLocaleString()} FCFA</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-mono font-bold text-forest-green">{facture.montant_paye.toLocaleString()} FCFA</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(statut)}
                            <span className={cn("text-xs font-bold", getStatusColor(statut))}>
                              {statut}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-muted-foreground">{new Date(facture.date_facture).toLocaleDateString('fr-FR')}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => { setSelectedFacture(facture); setIsPreviewOpen(true); }}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

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

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl flex items-center gap-3">
              <FileText className="h-6 w-6 text-orange-accent" />
              Facture {selectedFacture?.id.slice(0, 8)}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Détails de la facture et informations de règlement
            </DialogDescription>
          </DialogHeader>

          {selectedFacture && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-2">Informations client</p>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">{selectedFacture.client_nom}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-2">Statut</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(getStatus(selectedFacture))}
                      <span className={cn("text-sm font-bold", getStatusColor(getStatus(selectedFacture)))}>
                        {getStatus(selectedFacture)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-2">Informations facture</p>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Date d'émission: <span className="text-white font-bold">{new Date(selectedFacture.date_facture).toLocaleDateString('fr-FR')}</span></p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-2">Règlement</p>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Montant total: <span className="text-white font-mono font-bold">{selectedFacture.prix_total.toLocaleString()} FCFA</span></p>
                      <p className="text-sm text-muted-foreground">Montant payé: <span className="text-forest-green font-mono font-bold">{selectedFacture.montant_paye.toLocaleString()} FCFA</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                  Fermer
                </Button>
                <Button className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
