// filepath: src/lib/services/notification.service.ts
import prisma from "@/lib/prisma";
import { Notification, Reservation, Facture, Produit } from "../../generated/prisma/index";

// Fonction utilitaire interne pour le module
async function createIfNotExists(userId: string, type: string, message: string, entity_id?: string) {
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      message,
      read: false,
      type,
      entity_id,
    },
  });

  if (!existing) {
    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        read: false,
        entity_id,
      },
    });
  }
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    return prisma.notification.findMany();
  },

  async getNonLues(userId?: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
    });
  },

  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  },

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.notification.delete({ where: { id } });
  },

  async checkAndGenerateNotifications(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Pour comparer uniquement la date

    // Récupérer le seuil de stock faible
    const thresholdSetting = await prisma.setting.findUnique({
      where: { key: "low_stock_threshold" },
    });
    const threshold = thresholdSetting ? Number(thresholdSetting.value) : 5;

    // 1. Vérifier les réservations arrivant à échéance aujourd'hui ou passées
    const reservations = await prisma.reservation.findMany({
      where: {
        date_finale: {
          lte: today, // date_finale est égale ou antérieure à aujourd'hui
        },
        // Ajoutez ici d'autres critères si nécessaire (ex: statut "EnAttente")
      },
      include: {
        client: true, // Inclure les infos du client
      },
    });

    for (const res of reservations) {
      const clientNom = res.client?.nom || "Client inconnu";
      const message = `La réservation #${res.id.slice(0, 8)} pour ${clientNom} est arrivée à date.`;
      await createIfNotExists(userId, "Reservation", message, res.id);
    }

    // 2. Vérifier les stocks de produits
    const produits = await prisma.produit.findMany({
      where: {
        quantite: {
          lte: threshold,
        },
      },
      select: {
        id: true,
        nom: true,
        quantite: true,
      },
    });

    for (const prod of produits) {
      const message = `Stock faible pour le produit "${prod.nom}" : seulement ${prod.quantite} restants.`;
      await createIfNotExists(userId, "Alerte", message, prod.id);
    }

    // 3. Vérifier les éclosions (10e et 20e jour)
    const eclosions = await prisma.eclosion.findMany({
      where: {
        date_debut: {
          lte: today,
        },
      },
    });

    for (const eclosion of eclosions) {
      const diffTime = Math.abs(today.getTime() - eclosion.date_debut.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 10) {
        const message = `Rappel: C'est le 10ème jour de l'éclosion #${eclosion.id.slice(0, 8)}.`;
        await createIfNotExists(userId, "Alerte", message, eclosion.id);
      } else if (diffDays === 20) {
        const message = `Alerte: C'est le 20ème et dernier jour de l'éclosion #${eclosion.id.slice(0, 8)}.`;
        await createIfNotExists(userId, "Alerte", message, eclosion.id);
      }
    }

    // 4. Vérifier les factures impayées ou en retard
    const factures = await prisma.facture.findMany({
      where: {
        date_facture: {
          lte: today,
        },
        montant_paye: {
          lt: prisma.facture.fields.montant_total, // montant_paye est inférieur au montant_total
        },
      },
      include: {
        reservation: {
          include: {
            client: true, // Inclure le client via la réservation
          },
        },
      },
    });

    for (const fac of factures) {
      if (fac.montant_paye < fac.montant_total) {
        const clientNom = fac.reservation?.client?.nom || "Client inconnu";
        const message = `La facture #${fac.id.slice(0, 8)} pour ${clientNom} n'est pas encore totalement réglée.`;
        await createIfNotExists(userId, "Paiement", message, fac.id);
      }
    }
  },
};
