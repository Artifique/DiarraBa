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

  const handlePrint = () => {
    window.print();
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

      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {["Toutes", "Payées", "Partielles", "Emises", "Brouillons"].map((tab, i) => (
          <button 
            key={tab}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
              i === 0 ? "bg-orange-accent text-night border-orange-accent" : "bg-white/5 text-muted-foreground border-white/5 hover:border-white/20"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialFactures.map((f, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={f.id} 
            className="glass-card p-6 rounded-2xl border border-white/5 group hover:border-orange-accent/30 transition-all relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 rounded-xl bg-night flex items-center justify-center border border-white/10">
                <FileText className="h-6 w-6 text-orange-accent" />
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                f.statut === "Payee" ? "bg-forest-green/10 text-forest-green border-forest-green/20" : 
                f.statut === "Partielle" ? "bg-blue-400/10 text-blue-400 border-blue-400/20" : 
                f.statut === "Emise" ? "bg-orange-accent/10 text-orange-accent border-orange-accent/20" :
                "bg-white/5 text-muted-foreground border-white/10"
              )}>
                {f.statut}
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <h4 className="text-white font-bold">{f.id}</h4>
              <p className="text-xs text-muted-foreground">{f.client}</p>
              <p className="text-[10px] text-muted-foreground/60">{f.date}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Montant Total</span>
                <span className="text-sm font-mono font-bold text-white">{f.montant.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Reste à payer</span>
                <span className="text-sm font-mono font-bold text-orange-accent">{(f.montant - f.paye).toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { setSelectedFacture(f); setIsPreviewOpen(true); }}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-colors flex items-center justify-center"
              >
                <Eye className="h-3.5 w-3.5 mr-2" />
                Voir
              </button>
              <button 
                onClick={() => { setSelectedFacture(f); handlePrint(); }}
                className="flex-1 py-2 bg-orange-accent/10 hover:bg-orange-accent text-orange-accent hover:text-night rounded-lg text-xs font-bold transition-all flex items-center justify-center"
              >
                <Download className="h-3.5 w-3.5 mr-2" />
                PDF
              </button>
            </div>
          </motion.div>
        ))}
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

