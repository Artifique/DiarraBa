"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Wallet, 
  Trash2,
  Eye,
  Pencil,
  Clock,
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

const initialClients = [
  { id: 1, nom: "Ahmed Bennani", email: "ahmed@email.com", tel: "+212 612 111111", adresse: "Rabat, Maroc", solde: 12500, date: "12 Oct 2023" },
  { id: 2, nom: "Fatima Alaoui", email: "fatima@email.com", tel: "+212 612 222222", adresse: "Fès, Maroc", solde: -5000, date: "05 Nov 2023" },
  { id: 3, nom: "Mohammed Karim", email: "mohammed@email.com", tel: "+212 612 333333", adresse: "Tangier, Maroc", solde: 0, date: "20 Dec 2023" },
];

export default function ClientsPage() {
  const [clients, setClients] = useState(initialClients);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [formData, setFormData] = useState({ nom: "", email: "", tel: "", adresse: "" });

  const handleAdd = () => {
    if (!formData.nom) return;
    const item = {
      id: Date.now(),
      ...formData,
      solde: 0,
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setClients([item, ...clients]);
    setIsOpen(false);
    setFormData({ nom: "", email: "", tel: "", adresse: "" });
  };

  const handleEdit = () => {
    setClients(clients.map(c => c.id === selectedClient.id ? { ...c, ...formData } : c));
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    setClients(clients.filter(c => c.id !== selectedClient.id));
    setDeleteConfirmOpen(false);
  };

  const openEdit = (client: any) => {
    setSelectedClient(client);
    setFormData({ nom: client.nom, email: client.email || "", tel: client.tel || "", adresse: client.adresse || "" });
    setIsEditOpen(true);
  };

  const openView = (client: any) => {
    setSelectedClient(client);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Gestion des Clients</h2>
          <p className="text-sm text-muted-foreground">Administrez vos comptes clients et leur historique de paiement.</p>
        </div>
        <Button 
          onClick={() => { setFormData({ nom: "", email: "", tel: "", adresse: "" }); setIsOpen(true); }}
          className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90 orange-glow-hover rounded-xl"
        >
          <Plus className="h-5 w-5 mr-2" /> Nouveau Client
        </Button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-orange-accent transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher un client..." 
          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-accent/50 transition-all"
        />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4 font-bold">Client</th>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold">Localisation</th>
                <th className="px-6 py-4 font-bold text-right">Solde</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {clients.map((client) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={client.id} 
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-accent/10 border border-orange-accent/20 flex items-center justify-center text-orange-accent font-bold text-sm">
                          {client.nom.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{client.nom}</p>
                          <p className="text-[10px] text-muted-foreground">ID: #{client.id.toString().slice(-4)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1.5 text-orange-accent/60" /> {client.email}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1.5 text-orange-accent/60" /> {client.tel}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1.5 text-orange-accent/60" /> {client.adresse}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={cn(
                        "text-sm font-mono font-bold",
                        client.solde > 0 ? "text-forest-green" : client.solde < 0 ? "text-destructive" : "text-white"
                      )}>
                        {client.solde.toLocaleString()} FCFA
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openView(client)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white" title="Voir">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(client)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-orange-accent" title="Modifier">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => { setSelectedClient(client); setDeleteConfirmOpen(true); }} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive" title="Supprimer">
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
            <DialogTitle className="text-white font-display text-xl">{isEditOpen ? "Modifier Client" : "Nouveau Client"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isEditOpen ? "Mettez à jour les informations du client." : "Ajoutez un nouveau client à votre base de données."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Nom Complet</Label>
              <Input value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Téléphone</Label>
              <Input value={formData.tel} onChange={(e) => setFormData({...formData, tel: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold text-white/70">Adresse</Label>
              <Input value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsOpen(false); setIsEditOpen(false); }} className="border-white/10 text-white hover:bg-white/5">Annuler</Button>
            <Button onClick={isEditOpen ? handleEdit : handleAdd} className="bg-orange-accent text-night font-bold hover:bg-orange-accent/90">
              {isEditOpen ? "Enregistrer les modifications" : "Créer le profil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale Voir Détails */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-night border-white/10 text-white sm:max-w-lg">
          {selectedClient && (
            <div className="space-y-8 py-4">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-orange-accent/10 border-2 border-orange-accent flex items-center justify-center text-orange-accent text-3xl font-bold">
                  {selectedClient.nom.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">{selectedClient.nom}</h3>
                  <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Client depuis le {selectedClient.date}</p>
                  <div className={cn(
                    "mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                    selectedClient.solde >= 0 ? "bg-forest-green/10 text-forest-green border border-forest-green/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                  )}>
                    Solde: {selectedClient.solde.toLocaleString()} FCFA
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Coordonnées</p>
                  <div className="space-y-2">
                    <p className="text-sm flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-orange-accent" /> {selectedClient.email}</p>
                    <p className="text-sm flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-orange-accent" /> {selectedClient.tel}</p>
                    <p className="text-sm flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-orange-accent" /> {selectedClient.adresse}</p>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Statistiques</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Commandes:</span> <span className="font-bold text-white">12</span></div>
                    <div className="flex justify-between text-sm"><span>Total payé:</span> <span className="font-bold text-forest-green">450k</span></div>
                    <div className="flex justify-between text-sm"><span>Dernier achat:</span> <span className="font-bold text-white">Hier</span></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest font-bold text-white/70 flex items-center gap-2">
                  <History className="h-4 w-4 text-orange-accent" /> Historique récent
                </h4>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-colors">
                      <div>
                        <p className="text-xs font-bold text-white">Réservation RES-2024-00{i}</p>
                        <p className="text-[10px] text-muted-foreground">Livraison effectuée le 15 Avr</p>
                      </div>
                      <p className="text-xs font-mono font-bold">45 000 FCFA</p>
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
              Voulez-vous vraiment supprimer le client <strong>{selectedClient?.nom}</strong> ? Cette action effacera tout son historique.
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
