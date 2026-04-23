import { SupabaseClient } from "@supabase/supabase-js";
import { NotificationModel } from "../models/notification.model";

export class NotificationService {
  private notificationModel: NotificationModel;

  constructor(private supabase: SupabaseClient) {
    this.notificationModel = new NotificationModel(supabase);
  }

  async checkAndGenerateNotifications(managerId: string) {
    const today = new Date().toISOString().split('T')[0];

    // 1. Vérifier les réservations arrivant à échéance aujourd'hui
    const { data: reservations } = await this.supabase
      .from("reservations")
      .select("id, date_reservation, clients(nom)")
      .eq("statut_reservation", "EnAttente")
      .lte("date_reservation", today);

    if (reservations) {
      for (const res of reservations) {
        const clientNom = Array.isArray(res.clients) ? res.clients[0]?.nom : (res.clients as any)?.nom;
        const message = `La réservation #${res.id.slice(0, 8)} pour ${clientNom || "Client inconnu"} est arrivée à date.`;
        
        await this.createIfNotExists(managerId, 'Reservation', message);
      }
    }

    // 2. Vérifier les factures impayées ou en retard
    const { data: factures } = await this.supabase
      .from("factures")
      .select("id, date_facture, montant_total, montant_paye, reservations(clients(nom))")
      .lte("date_facture", today);

    if (factures) {
      for (const fac of factures) {
        if (fac.montant_paye < fac.montant_total) {
          const resData: any = fac.reservations;
          const clientNom = Array.isArray(resData?.clients) ? resData.clients[0]?.nom : resData?.clients?.nom;
          
          const message = `La facture #${fac.id.slice(0, 8)} pour ${clientNom || "Client inconnu"} n'est pas encore totalement réglée.`;
          
          await this.createIfNotExists(managerId, 'Paiement', message);
        }
      }
    }
  }

  private async createIfNotExists(managerId: string, type: any, message: string) {
    const { data: existing } = await this.supabase
      .from("notifications")
      .select("id")
      .eq("manager_id", managerId)
      .eq("message", message)
      .eq("lue", false)
      .limit(1);

    if (!existing || existing.length === 0) {
      await this.notificationModel.create({
        manager_id: managerId,
        type,
        message,
        lue: false,
        client_id: null,
        fournisseur_id: null
      });
    }
  }
}
