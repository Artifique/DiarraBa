// filepath: src/lib/services/reservation.service.ts
import { createClient } from "@/lib/supabase";
import { ReservationModel } from "@/lib/models/reservation.model";
import { PaiementModel } from "@/lib/models/paiement.model";
import { FactureModel } from "@/lib/models/facture.model";
import { LivraisonModel } from "@/lib/models/livraison.model";
import { NotificationModel } from "@/lib/models/notification.model";
import { AuditModel } from "@/lib/models/audit.model";
import {
  Reservation,
  ReservationVolaille,
  ReservationCouveuse,
  StatutReservation,
  StatutFacture,
} from "@/types/database";

const supabase = createClient();
const reservationModel = new ReservationModel(supabase);
const paiementModel = new PaiementModel(supabase);
const factureModel = new FactureModel(supabase);
const livraisonModel = new LivraisonModel(supabase);
const notificationModel = new NotificationModel(supabase);
const auditModel = new AuditModel(supabase);

export const reservationService = {
  // === CRUD Réservation ===
  async getAll(): Promise<Reservation[]> {
    return reservationModel.findAll();
  },

  async getById(id: string): Promise<Reservation | null> {
    return reservationModel.findById(id);
  },

  async getByClient(clientId: string): Promise<Reservation[]> {
    return reservationModel.findByClient(clientId);
  },

  async getByStatut(statut: StatutReservation): Promise<Reservation[]> {
    return reservationModel.findByStatut(statut);
  },

  async create(
    data: {
      client_id: string;
      date_reservation: string;
      date_livraison_prevue: string;
      prix_total: number;
      type_paiement: "Tranche" | "Totalite";
      notes?: string;
      volailles?: Array<{
        volaille_id: string;
        quantite: number;
        prix_unitaire: number;
      }>;
      couveuses?: Array<{
        couveuse_id: string;
        date_debut: string;
        date_fin: string;
      }>;
    },
    managerId: string,
  ): Promise<Reservation> {
    // Créer la réservation
    const reservation = await reservationModel.create({
      client_id: data.client_id,
      date_reservation: data.date_reservation,
      date_livraison_prevue: data.date_livraison_prevue,
      prix_total: data.prix_total,
      statut_reservation: "EnAttente",
      type_paiement: data.type_paiement,
      notes: data.notes || null,
    });

    // Ajouter les volailles
    if (data.volailles) {
      for (const v of data.volailles) {
        await reservationModel.addVolaille({
          reservation_id: reservation.id,
          volaille_id: v.volaille_id,
          quantite: v.quantite,
          prix_unitaire: v.prix_unitaire,
          sous_total: v.quantite * v.prix_unitaire,
        });
      }
    }

    // Ajouter les couveuses
    if (data.couveuses) {
      for (const c of data.couveuses) {
        const debut = new Date(c.date_debut);
        const fin = new Date(c.date_fin);
        const duree = Math.ceil(
          (fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24),
        );

        await reservationModel.addCouveuse({
          reservation_id: reservation.id,
          couveuse_id: c.couveuse_id,
          date_debut: c.date_debut,
          date_fin: c.date_fin,
          duree_jours: duree,
          prix_total: 0, // Calculer depuis le modèle couveuse
        });
      }
    }

    // Créer la facture
    const numero = await factureModel.generateNumero();
    await factureModel.create({
      reservation_id: reservation.id,
      numero,
      date_facture: new Date().toISOString(),
      montant_total: data.prix_total,
      montant_paye: 0,
      montant_restant: data.prix_total,
      statut: "Brouillon" as StatutFacture,
    });

    // Créer la livraison
    await livraisonModel.create({
      reservation_id: reservation.id,
      date_livraison: data.date_livraison_prevue,
      lieu: "",
      statut: "Planifiee",
      notes: null,
    });

    // Créer une notification
    await notificationModel.create({
      manager_id: managerId,
      client_id: data.client_id,
      fournisseur_id: null,
      type: "Reservation",
      message: `Nouvelle réservation créée: ${reservation.id}`,
      lue: false,
    });

    // Logger l'action
    await auditModel.create({
      manager_id: managerId,
      client_id: data.client_id,
      fournisseur_id: null,
      action: "CREATE",
      entite: "reservations",
      entite_id: reservation.id,
      ancienne_valeur: null,
      nouvelle_valeur: JSON.stringify(reservation),
      adresse_ip: null,
      user_agent: null
    });

    return reservation;
  },

  async update(
    id: string,
    data: Partial<Reservation>,
    managerId: string,
  ): Promise<Reservation> {
    const oldReservation = await reservationModel.findById(id);
    if (!oldReservation) throw new Error("Réservation non trouvée");

    const reservation = await reservationModel.update(id, data);

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: null,
      client_id: reservation.client_id,
      action: "UPDATE",
      entite: "reservations",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldReservation),
      nouvelle_valeur: JSON.stringify(reservation),
      adresse_ip: null,
      user_agent: null
    });

    return reservation;
  },

  async updateStatut(
    id: string,
    statut: StatutReservation,
    managerId: string,
  ): Promise<Reservation> {
    return this.update(id, { statut_reservation: statut }, managerId);
  },

  async cancel(id: string, managerId: string): Promise<void> {
    await this.updateStatut(id, "Annulee", managerId);
  },

  // === Items ===
  async getVolailles(reservationId: string): Promise<ReservationVolaille[]> {
    return reservationModel.getVolailles(reservationId);
  },

  async getCouveuses(reservationId: string): Promise<ReservationCouveuse[]> {
    return reservationModel.getCouveuses(reservationId);
  },

  async addVolaille(
    reservationId: string,
    data: {
      volaille_id: string;
      quantite: number;
      prix_unitaire: number;
    },
    managerId: string,
  ): Promise<ReservationVolaille> {
    const item = await reservationModel.addVolaille({
      reservation_id: reservationId,
      volaille_id: data.volaille_id,
      quantite: data.quantite,
      prix_unitaire: data.prix_unitaire,
      sous_total: data.quantite * data.prix_unitaire,
    });

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: null,
      client_id: null,
      action: "ADD_VOLAILLE",
      entite: "reservations",
      entite_id: reservationId,
      ancienne_valeur: null,
      nouvelle_valeur: JSON.stringify(item),
      adresse_ip: null,
      user_agent: null
    });

    return item;
  },

  async removeVolaille(itemId: string, managerId: string): Promise<void> {
    await reservationModel.removeVolaille(itemId);

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: null,
      client_id: null,
      action: "REMOVE_VOLAILLE",
      entite: "reservation_volailles",
      entite_id: itemId,
      ancienne_valeur: null,
      nouvelle_valeur: null,
      adresse_ip: null,
      user_agent: null
    });
  },

  async addCouveuse(
    reservationId: string,
    data: {
      couveuse_id: string;
      date_debut: string;
      date_fin: string;
    },
    managerId: string,
  ): Promise<ReservationCouveuse> {
    const item = await reservationModel.addCouveuse({
      reservation_id: reservationId,
      couveuse_id: data.couveuse_id,
      date_debut: data.date_debut,
      date_fin: data.date_fin,
      duree_jours: 0, // Calculer
      prix_total: 0,
    });

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: null,
      client_id: null,
      action: "ADD_COUVEUSE",
      entite: "reservations",
      entite_id: reservationId,
      ancienne_valeur: null,
      nouvelle_valeur: JSON.stringify(item),
      adresse_ip: null,
      user_agent: null
    });

    return item;
  },

  async removeCouveuse(itemId: string, managerId: string): Promise<void> {
    await reservationModel.removeCouveuse(itemId);

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: null,
      client_id: null,
      action: "REMOVE_COUVEUSE",
      entite: "reservation_couveuses",
      entite_id: itemId,
      ancienne_valeur: null,
      nouvelle_valeur: null,
      adresse_ip: null,
      user_agent: null
    });
  },
};
