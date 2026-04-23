// filepath: src/lib/services/paiement.service.ts
import { createClient } from "@/lib/supabase";
import { PaiementModel } from "@/lib/models/paiement.model";
import { ReservationModel } from "@/lib/models/reservation.model";
import { FactureModel } from "@/lib/models/facture.model";
import { AuditModel } from "@/lib/models/audit.model";
import { Paiement, MethodePaiement, StatutPaiement } from "@/types/database";

const supabase = createClient();
const paiementModel = new PaiementModel(supabase);
const reservationModel = new ReservationModel(supabase);
const factureModel = new FactureModel(supabase);
const auditModel = new AuditModel(supabase);

export const paiementService = {
  async getAll(): Promise<Paiement[]> {
    return paiementModel.findAll();
  },

  async getById(id: string): Promise<Paiement | null> {
    return paiementModel.findById(id);
  },

  async getByReservation(reservationId: string): Promise<Paiement[]> {
    return paiementModel.findByReservation(reservationId);
  },

  async create(
    data: {
      reservation_id: string;
      montant: number;
      methode: MethodePaiement;
      reference?: string;
      notes?: string;
    },
    managerId: string,
  ): Promise<Paiement> {
    // Créer le paiement
    const paiement = await paiementModel.create({
      ...data,
      statut: "Completed" as StatutPaiement,
      date_paiement: new Date().toISOString(),
      reference: data.reference || null,
      notes: data.notes || null,
    });

    // Mettre à jour le montant payé dans la facture associée
    const reservation = await reservationModel.findById(data.reservation_id);
    if (reservation) {
      const factures = await factureModel.findByReservation(data.reservation_id);
      if (factures.length > 0) {
        const totalPaye = await paiementModel.getTotalPaye(data.reservation_id);
        const montantRestant = factures[0].montant_total - totalPaye;
        
        await factureModel.update(factures[0].id, {
          montant_paye: totalPaye,
          montant_restant: montantRestant,
          statut: montantRestant <= 0 ? "Payee" : "Partielle",
        });
      }
    }

    await auditModel.create({
      manager_id: managerId,
      action: "CREATE",
      entite: "paiements",
      entite_id: paiement.id,
      ancienne_valeur: null,
      nouvelle_valeur: JSON.stringify(paiement),
      adresse_ip: null,
      user_agent: null,
      client_id: null,
      fournisseur_id: null
    });

    return paiement;
  },

  async updateStatut(
    id: string,
    statut: StatutPaiement,
    managerId: string,
  ): Promise<Paiement> {
    const oldPaiement = await paiementModel.findById(id);
    if (!oldPaiement) throw new Error("Paiement non trouvé");

    const paiement = await paiementModel.updateStatut(id, statut);

    await auditModel.create({
      manager_id: managerId,
      action: "UPDATE_STATUT",
      entite: "paiements",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldPaiement),
      nouvelle_valeur: JSON.stringify(paiement),
      adresse_ip: null,
      user_agent: null,
      client_id: null,
      fournisseur_id: null
    });

    return paiement;
  },

  async delete(id: string, managerId: string): Promise<void> {
    const oldPaiement = await paiementModel.findById(id);
    if (!oldPaiement) throw new Error("Paiement non trouvé");

    await paiementModel.delete(id);

    await auditModel.create({
      manager_id: managerId,
      action: "DELETE",
      entite: "paiements",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldPaiement),
      nouvelle_valeur: null,
      adresse_ip: null,
      user_agent: null,
      client_id: null,
      fournisseur_id: null
    });
  },
};
