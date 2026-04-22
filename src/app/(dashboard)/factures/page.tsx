"use client";

import { useState } from "react";
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

  const handlePrint = () => {
    window.print();
  };

  const filteredFactures = initialFactures.filter(f => {
    const matchesSearch = f.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         f.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "Toutes" || f.statut === activeTab;
    return matchesSearch && matchesTab;
  });

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

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Rechercher une facture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-accent/50 focus:border-orange-accent/50 transition-all"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">
                <th className="px-6 py-4">ID Facture</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Montant Total</th>
                <th className="px-6 py-4">Montant Payé</th>
                <th className="px-6 py-4">Reste</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {filteredFactures.length > 0 ? filteredFactures.map((f, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={f.id} 
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-medium text-white">{f.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-orange-accent/10 flex items-center justify-center text-[10px] font-bold text-orange-accent mr-3 border border-orange-accent/20">
                        {f.client.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-white font-medium">{f.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{f.date}</td>
                  <td className="px-6 py-4 font-mono font-medium text-white">{f.montant.toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 font-mono text-forest-green">{f.paye.toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 font-mono font-bold text-orange-accent">{(f.montant - f.paye).toLocaleString()} FCFA</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      f.statut === "Payee" ? "bg-forest-green/10 text-forest-green border-forest-green/20" : 
                      f.statut === "Partielle" ? "bg-blue-400/10 text-blue-400 border-blue-400/20" : 
                      f.statut === "Emise" ? "bg-orange-accent/10 text-orange-accent border-orange-accent/20" :
                      "bg-white/5 text-muted-foreground border-white/10"
                    )}>
                      {f.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedFacture(f); setIsPreviewOpen(true); }}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                        title="Voir la facture"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedFacture(f); handlePrint(); }}
                        className="p-2 bg-orange-accent/10 hover:bg-orange-accent hover:text-night rounded-lg text-orange-accent transition-all"
                        title="Télécharger PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground italic">
                    Aucune facture trouvée correspondant à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale d'aperçu de facture */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-white text-night p-0 sm:max-w-2xl overflow-hidden print:shadow-none">
          {selectedFacture && (
            <div className="p-8 space-y-8" id="invoice-content">
              {/* Header Facture */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-night rounded-xl flex items-center justify-center">
                    <Palmtree className="text-orange-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display uppercase tracking-tighter">Diarraba Volailles</h3>
                    <p className="text-[10px] text-muted-foreground">Gestion de ferme moderne</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-display font-black text-night/20 uppercase">Facture</h2>
                  <p className="font-mono font-bold text-night">{selectedFacture.id}</p>
                </div>
              </div>

              {/* Infos Client & Date */}
              <div className="grid grid-cols-2 gap-12 border-y border-night/5 py-6">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Facturé à :</p>
                  <p className="font-bold text-lg">{selectedFacture.client}</p>
                  <p className="text-sm text-muted-foreground">Client ID: #12345</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Date d'émission :</p>
                  <p className="font-bold">{selectedFacture.date}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-4">Statut :</p>
                  <span className="text-xs font-bold text-orange-accent uppercase">{selectedFacture.statut}</span>
                </div>
              </div>

              {/* Table des articles */}
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-night text-[10px] uppercase font-bold">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Qté</th>
                    <th className="py-2 text-right">Prix Unit.</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-night/5">
                  {selectedFacture.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-medium">{item.desc}</td>
                      <td className="py-3 text-center">{item.qte}</td>
                      <td className="py-3 text-right font-mono">{item.pu.toLocaleString()}</td>
                      <td className="py-3 text-right font-mono font-bold">{(item.qte * item.pu).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-mono">{selectedFacture.montant.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Montant payé</span>
                    <span className="font-mono text-forest-green">-{selectedFacture.paye.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 border-night">
                    <span className="font-bold uppercase text-xs">Net à payer</span>
                    <span className="text-xl font-mono font-black text-orange-accent">{(selectedFacture.montant - selectedFacture.paye).toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Footer PDF */}
              <div className="pt-12 text-center">
                <p className="text-[10px] text-muted-foreground italic">
                  Merci de votre confiance. Pour toute question, contactez-nous au +212 612 345678.
                </p>
              </div>
            </div>
          )}
          <div className="p-4 bg-night/5 border-t flex justify-end gap-3 print:hidden">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Fermer</Button>
            <Button className="bg-orange-accent text-night font-bold" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" /> Télécharger / Imprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

