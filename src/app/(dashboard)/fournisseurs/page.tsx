"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  Trash2,
  Eye,
  Pencil,
  Star,
  Package,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialFournisseurs = [
  { id: 1, nom: "Ferme Nationale", email: "contact@ferme.ma", tel: "+212 522 444444", adresse: "Marrakech, Maroc", solde: 45000, notation: 5 },
  { id: 2, nom: "Élevage Premium", email: "info@elevage.ma", tel: "+212 522 555555", adresse: "Casablanca, Maroc", solde: -12000, notation: 4 },
  { id: 3, nom: "Volailles du Sud", email: "ventes@vds.ma", tel: "+212 522 666666", adresse: "Agadir, Maroc", solde: 0, notation: 3 },
];

export default function FournisseursPage() {
  const [fournisseurs, setFournisseurs] = useState(initialFournisseurs);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [formData, setFormData] = useState({ nom: "", email: "", tel: "", adresse: "" });

  const handleAdd = () => {
    if (!formData.nom) return;
    const item = {
      id: Date.now(),
      ...formData,
      solde: 0,
      notation: 5
    };
    setFournisseurs([item, ...fournisseurs]);
    setIsOpen(false);
    setFormData({ nom: "", email: "", tel: "", adresse: "" });
  };

  const handleEdit = () => {
    setFournisseurs(fournisseurs.map(f => f.id === selectedFournisseur.id ? { ...f, ...formData } : f));
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    setFournisseurs(fournisseurs.filter(f => f.id !== selectedFournisseur.id));
    setDeleteConfirmOpen(false);
  };

  const openEdit = (f: any) => {
    setSelectedFournisseur(f);
    setFormData({ nom: f.nom, email: f.email || "", tel: f.tel || "", adresse: f.adresse || "" });
    setIsEditOpen(true);
  };

  const openView = (f: any) => {
    setSelectedFournisseur(f);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Gestion des Fournisseurs</h2>
          <p className="text-sm text-muted-foreground">Administrez votre réseau de fournisseurs et le suivi des approvisionnements.</p>
        </div>
        <Button 
          onClick={() => { setFormData({ nom: "", email: "", tel: "", adresse: "" }); setIsOpen(true); }}
          className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl"
        >
          <Plus className="h-5 w-5 mr-2" /> Nouveau Fournisseur
        </Button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-accent transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher un fournisseur..." 
          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-accent/50 transition-all"
        />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4 font-bold">Fournisseur</th>
                <th className="px-6 py-4 font-bold">Note</th>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold text-right">Dette / Créance</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {fournisseurs.map((f) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={f.id} 
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-night border border-white/10 flex items-center justify-center text-orange-accent">
                          <Truck className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-bold text-white">{f.nom}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} className={`h-2.5 w-2.5 ${idx < f.notation ? "text-orange-accent fill-orange-accent" : "text-white/10"}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1.5 text-orange-accent/60" /> {f.email}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1.5 text-orange-accent/60" /> {f.tel}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={cn(
                        "text-sm font-mono font-bold",
                        f.solde > 0 ? "text-orange-accent" : f.solde < 0 ? "text-destructive" : "text-white"
                      )}>
                        {f.solde.toLocaleString()} FCFA
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openView(f)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white" title="Voir">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(f)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-orange-accent" title="Modifier">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => { setSelectedFournisseur(f); setDeleteConfirmOpen(true); }} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale Ajouter/Modifier */}
      <Dialog open={isOpen || isEditOpen} onOpenChange={(val) => { setIsOpen(val && !isEditOpen); setIsEditOpen(val && isEditOpen); }}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">{isEditOpen ? "Modifier Fournisseur" : "Nouveau Fournisseur"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isEditOpen ? "Mettez à jour les informations du fournisseur." : "Ajoutez un nouveau partenaire fournisseur."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Nom de l'entreprise</Label>
              <Input value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Email Contact</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Téléphone</Label>
              <Input value={formData.tel} onChange={(e) => setFormData({...formData, tel: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Localisation</Label>
              <Input value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsOpen(false); setIsEditOpen(false); }} className="border-white/10 text-white hover:bg-white/5">Annuler</Button>
            <Button onClick={isEditOpen ? handleEdit : handleAdd} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90">
              {isEditOpen ? "Enregistrer" : "Créer le partenaire"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale Voir Détails */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-lg">
          {selectedFournisseur && (
            <div className="space-y-8 py-4">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-xl bg-night border-2 border-orange-accent flex items-center justify-center text-orange-accent">
                  <Truck size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">{selectedFournisseur.nom}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className={`h-3 w-3 ${idx < selectedFournisseur.notation ? "text-orange-accent fill-orange-accent" : "text-white/10"}`} />
                    ))}
                  </div>
                  <div className={cn(
                    "mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                    selectedFournisseur.solde >= 0 ? "bg-orange-accent/10 text-orange-accent border border-orange-accent/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                  )}>
                    Dette/Créance: {selectedFournisseur.solde.toLocaleString()} FCFA
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Coordonnées</p>
                  <div className="space-y-2">
                    <p className="text-sm flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-orange-accent" /> {selectedFournisseur.email}</p>
                    <p className="text-sm flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-orange-accent" /> {selectedFournisseur.tel}</p>
                    <p className="text-sm flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-orange-accent" /> {selectedFournisseur.adresse}</p>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Livraisons</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Livraisons:</span> <span className="font-bold text-white">45</span></div>
                    <div className="flex justify-between text-sm"><span>Volume:</span> <span className="font-bold text-orange-accent">5.2k</span></div>
                    <div className="flex justify-between text-sm"><span>Qualité:</span> <span className="font-bold text-forest-green">Excellent</span></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest font-bold text-white/70 flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-accent" /> Produits fournis
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {["Poussins", "Aliments", "Couveuses"].map((item) => (
                    <div key={item} className="p-2 bg-white/5 rounded-lg border border-white/5 text-center text-xs font-medium text-white">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)} className="bg-orange-accent text-night font-bold">Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Suppression */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-xl">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Voulez-vous vraiment supprimer le fournisseur <strong>{selectedFournisseur?.nom}</strong> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="border-white/10 text-white hover:bg-white/5">Annuler</Button>
            <Button onClick={handleDelete} className="bg-destructive text-white font-bold hover:bg-destructive/90">Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
