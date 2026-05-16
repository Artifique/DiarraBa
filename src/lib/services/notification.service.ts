// filepath: src/lib/services/notification.service.ts
import { createClient } from "@/lib/supabase";
import { NotificationModel } from "../models/notification.model";
import { Notification, NotificationType } from "@/types/database";

const supabase = createClient();
const notificationModel = new NotificationModel(supabase);

// Fonction utilitaire interne pour le module
async function createIfNotExists(managerId: string, type: NotificationType, message: string) {
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("manager_id", managerId)
    .eq("message", message)
    .eq("lue", false)
    .limit(1);

  if (!existing || existing.length === 0) {
    await notificationModel.create({
      manager_id: managerId,
      type,
      message,
      lue: false,
      client_id: null,
      fournisseur_id: null
    });
  }
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    return notificationModel.findAll();
  },

  async getNonLues(managerId?: string): Promise<Notification[]> {
    return notificationModel.findNonLues(managerId);
  },

  async markAsRead(id: string): Promise<Notification> {
    return notificationModel.markAsRead(id);
  },

  async markAllAsRead(managerId: string): Promise<void> {
    return notificationModel.markAllAsRead(managerId);
  },

  async delete(id: string): Promise<void> {
    return notificationModel.delete(id);
  },

  // Méthodes originales de génération de notifications
  async checkAndGenerateNotifications(managerId: string) {
    const today = new Date().toISOString().split('T')[0];

    // Récupérer le seuil de stock faible
    const { data: thresholdSetting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "low_stock_threshold")
      .single();
    
    const threshold = thresholdSetting ? Number(thresholdSetting.value) : 5;

    // 1. Vérifier les réservations arrivant à échéance aujourd'hui
    const { data: reservations } = await supabase
      .from("reservations")
      .select("id, date_reservation, clients(nom)")
      .eq("statut_reservation", "EnAttente")
      .lte("date_reservation", today);

    if (reservations) {
      for (const res of reservations) {
        const clientNom = Array.isArray(res.clients) ? res.clients[0]?.nom : (res.clients as any)?.nom;
        const message = `La réservation #${res.id.slice(0, 8)} pour ${clientNom || "Client inconnu"} est arrivée à date.`;
        await createIfNotExists(managerId, 'Reservation', message);
      }
    }

    // 2. Vérifier les stocks de volailles
    const { data: volailles } = await supabase
      .from("volailles")
      .select("id, type, quantite_disponible")
      .eq("actif", true)
      .lte("quantite_disponible", threshold);

    if (volailles) {
      for (const v of volailles) {
        const message = `Stock faible pour les ${v.type} : seulement ${v.quantite_disponible} restants.`;
        await createIfNotExists(managerId, 'Alerte', message);
      }
    }

    // 3. Vérifier les stocks de couveuses
    const { data: couveuses } = await supabase
      .from("couveuses")
      .select("id, modele, quantite")
      .eq("actif", true)
      .lte("quantite", threshold);

    if (couveuses) {
      for (const c of couveuses) {
        const message = `Stock faible pour la couveuse ${c.modele} : seulement ${c.quantite} en inventaire.`;
        await createIfNotExists(managerId, 'Alerte', message);
      }
    }

    // 4. Vérifier les factures impayées ou en retard
    const { data: factures } = await supabase
      .from("factures")
      .select("id, date_facture, montant_total, montant_paye, reservations(clients(nom))")
      .lte("date_facture", today);

    if (factures) {
      for (const fac of factures) {
        if (fac.montant_paye < fac.montant_total) {
          const resData: any = fac.reservations;
          const clientNom = Array.isArray(resData?.clients) ? resData.clients[0]?.nom : resData?.clients?.nom;
          const message = `La facture #${fac.id.slice(0, 8)} pour ${clientNom || "Client inconnu"} n'est pas encore totalement réglée.`;
          await createIfNotExists(managerId, 'Paiement', message);
        }
      }
    }
  },
};
