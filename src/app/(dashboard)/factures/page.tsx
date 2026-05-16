"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Search, Eye, Download, Printer, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { createClient } from "@/lib/supabase";
import { FactureModel, ClientModel } from "@/lib/models";
import { Facture, Client } from "@/types/database";

export default function FacturesPage() {
  const [loading, setLoading] = useState(true);
  const [factures, setFactures] = useState<any[]>([]);
  const [selectedFacture, setSelectedFacture] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const fModel = new FactureModel(supabase);
      const cModel = new ClientModel(supabase);
      const [fData, cData] = await Promise.all([fModel.findAllWithDetails(), cModel.findAll()]);
      const enhancedFactures = fData.map(f => ({
        ...f,
        client_nom: f.reservations?.clients?.nom || "Inconnu",
      }));
      setFactures(enhancedFactures);
    } catch (error) { console.error("Error fetching factures:", error); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const downloadPDF = async (facture: any) => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    try {
        const response = await fetch('/logo.jpeg');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function() {
            const base64data = reader.result as string;
            doc.addImage(base64data, 'JPEG', 10, 10, 30, 30);
            doc.setFontSize(18);
            doc.text("FACTURE", 150, 20);
            doc.setFontSize(10);
            doc.text(`N°: ${facture.id.slice(0, 8)}`, 150, 30);
            doc.text(`Client: ${facture.client_nom}`, 10, 50);
            doc.text(`Date: ${new Date(facture.date_facture).toLocaleDateString()}`, 10, 55);
            autoTable(doc, {
                startY: 70,
                head: [['Description', 'Montant']],
                body: [
                    ['Facture pour réservation', facture.montant_total.toLocaleString() + ' FCFA'],
                    ['Montant Payé', facture.montant_paye.toLocaleString() + ' FCFA'],
                    ['Reste à payer', (facture.montant_total - facture.montant_paye).toLocaleString() + ' FCFA']
                ],
            });
            doc.save(`Facture_${facture.id.slice(0, 8)}.pdf`);
        }
    } catch (e) { console.error("Logo non trouvé"); }
  };

  const getStatus = (f: Facture) => f.statut === "Payee" ? "Payee" : f.montant_paye > 0 ? "Partielle" : "Emise";

  const paginatedFactures = factures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(factures.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold text-white">Facturation</h2>
        <Button onClick={() => typeof window !== 'undefined' && window.print()} className="bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all">
          <Printer className="h-5 w-5 mr-2" /> Imprimer
        </Button>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-orange-accent" /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-white/5 uppercase text-[10px] tracking-[0.15em] text-muted-foreground font-bold">
              <tr><th className="p-6">Facture</th><th className="p-6">Client</th><th className="p-6">Montant</th><th className="p-6">Payé</th><th className="p-6 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {paginatedFactures.map(f => (
                <tr key={f.id} className="border-t border-white/5">
                  <td className="p-6 font-bold text-white">{f.id.slice(0, 8)}</td>
                  <td className="p-6 text-sm">{f.client_nom}</td>
                  <td className="p-6 font-mono font-bold text-white">{f.montant_total.toLocaleString()} FCFA</td>
                  <td className="p-6 font-mono font-bold text-forest-green">{f.montant_paye.toLocaleString()} FCFA</td>
                  <td className="p-6 text-right flex gap-2 justify-end">
                    <Button variant="ghost" className="h-8 w-8" onClick={() => { setSelectedFacture(f); setIsPreviewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" className="h-8 w-8" onClick={() => downloadPDF(f)}><Download className="h-4 w-4 text-orange-accent" /></Button>
                  </td>
                </tr>))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && <div className="p-4 border-t border-white/5"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader><DialogTitle>Facture {selectedFacture?.id.slice(0, 8)}</DialogTitle></DialogHeader>
          {selectedFacture && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-4">
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase">Client</Label>
                  <p className="font-bold text-white">{selectedFacture.client_nom}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase">Date</Label>
                  <p className="font-bold text-white">{new Date(selectedFacture.date_facture).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase">Montant Total</Label>
                  <p className="font-mono font-bold text-white">{selectedFacture.montant_total.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase">Statut</Label>
                  <p className={cn("font-bold", getStatus(selectedFacture) === "Payee" ? "text-forest-green" : "text-yellow-500")}>
                    {getStatus(selectedFacture)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-white/5 rounded">
                  <span className="text-muted-foreground">Total Payé</span>
                  <span className="font-bold text-forest-green">{selectedFacture.montant_paye.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between p-3 bg-white/5 rounded">
                  <span className="text-muted-foreground">Reste à payer</span>
                  <span className="font-bold text-destructive">{(selectedFacture.montant_total - selectedFacture.montant_paye).toLocaleString()} FCFA</span>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-white/5">
                <Button onClick={() => downloadPDF(selectedFacture)} className="bg-orange-accent text-night font-bold"><Download className="h-4 w-4 mr-2" /> PDF</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}