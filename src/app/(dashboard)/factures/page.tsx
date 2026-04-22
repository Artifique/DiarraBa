"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Eye,
  Download,
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Palmtree
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

const initialFactures = [
  { id: "FAC-2024-001", client: "Ahmed Bennani", montant: 85000, paye: 45000, statut: "Partielle", date: "22 Avr 2024", items: [{desc: "Poussins", qte: 500, pu: 150}, {desc: "Location Couveuse", qte: 1, pu: 10000}] },
  { id: "FAC-2024-002", client: "Fatima Alaoui", montant: 35000, paye: 35000, statut: "Payee", date: "21 Avr 2024", items: [{desc: "Canards", qte: 200, pu: 175}] },
  { id: "FAC-2024-003", client: "Mohammed Karim", montant: 50000, paye: 0, statut: "Emise", date: "20 Avr 2024", items: [{desc: "Pintades", qte: 150, pu: 333}] },
];

export default function FacturesPage() {
  const [selectedFacture, setSelectedFacture] = useState<typeof initialFactures[0] | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Toutes");

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const filteredFactures = initialFactures.filter(f => {
    const matchesSearch = f.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "Toutes" || f.statut === activeTab;
    const matchesDate = !dateFilter || f.date === dateFilter;
    return matchesSearch && matchesTab && matchesDate;
  });

  const totalPages = Math.ceil(filteredFactures.length / itemsPerPage);
  const paginatedFactures = filteredFactures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, dateFilter]);

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "Payee": return "text-forest-green";
      case "Partielle": return "text-yellow-500";
      case "Emise": return "text-blue-400";
      case "Brouillon": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "Payee": return <CheckCircle2 className="h-4 w-4" />;
      case "Partielle": return <AlertCircle className="h-4 w-4" />;
      case "Emise": return <Clock className="h-4 w-4" />;
      case "Brouillon": return <FileText className="h-4 w-4" />;
      default: return null;
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
          {["Toutes", "Payee", "Partielle", "Emise", "Brouillon"].map((tab) => (
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
              {tab === "Payee" ? "Payées" : tab === "Partielle" ? "Partielles" : tab === "Emise" ? "Émises" : tab === "Brouillon" ? "Brouillons" : tab}
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
              {paginatedFactures.map((facture) => (
                <motion.tr
                  key={facture.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-orange-accent/10 border border-orange-accent/20 flex items-center justify-center text-orange-accent font-bold text-sm">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{facture.id}</p>
                        <p className="text-[10px] text-muted-foreground">#{facture.id.split('-').pop()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white">{facture.client}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono font-bold text-white">{facture.montant.toLocaleString()} FCFA</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono font-bold text-forest-green">{facture.paye.toLocaleString()} FCFA</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(facture.statut)}
                      <span className={cn("text-xs font-bold", getStatusColor(facture.statut))}>
                        {facture.statut}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{facture.date}</p>
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
              ))}
            </tbody>
          </table>
        </div>

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

      {/* Facture Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl flex items-center gap-3">
              <FileText className="h-6 w-6 text-orange-accent" />
              Facture {selectedFacture?.id}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Détails de la facture et informations de règlement
            </DialogDescription>
          </DialogHeader>

          {selectedFacture && (
            <div className="space-y-6 py-4">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-2">Informations client</p>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">{selectedFacture.client}</p>
                      <p className="text-xs text-muted-foreground">Client enregistré</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-2">Statut</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedFacture.statut)}
                      <span className={cn("text-sm font-bold", getStatusColor(selectedFacture.statut))}>
                        {selectedFacture.statut}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-2">Informations facture</p>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Date d'émission: <span className="text-white font-bold">{selectedFacture.date}</span></p>
                      <p className="text-sm text-muted-foreground">ID Facture: <span className="text-white font-mono font-bold">#{selectedFacture.id.split('-').pop()}</span></p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-2">Règlement</p>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Montant total: <span className="text-white font-mono font-bold">{selectedFacture.montant.toLocaleString()} FCFA</span></p>
                      <p className="text-sm text-muted-foreground">Montant payé: <span className="text-forest-green font-mono font-bold">{selectedFacture.paye.toLocaleString()} FCFA</span></p>
                      <p className="text-sm text-muted-foreground">Reste à payer: <span className={cn("font-mono font-bold", selectedFacture.montant - selectedFacture.paye > 0 ? "text-destructive" : "text-forest-green")}>{(selectedFacture.montant - selectedFacture.paye).toLocaleString()} FCFA</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-4">Détail des articles</p>
                <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5">
                      <tr className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-center">Quantité</th>
                        <th className="px-4 py-3 text-right">Prix Unit.</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFacture.items.map((item, index) => (
                        <tr key={index} className="border-b border-white/5 last:border-b-0">
                          <td className="px-4 py-3">
                            <p className="text-sm text-white">{item.desc}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <p className="text-sm font-mono text-white">{item.qte}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-mono text-white">{item.pu.toLocaleString()} FCFA</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-mono font-bold text-white">{(item.qte * item.pu).toLocaleString()} FCFA</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
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
