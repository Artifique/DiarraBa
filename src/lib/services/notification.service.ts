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
    console.log("DEBUG: Lancement vérification notifications pour", userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1. Réservations
    const reservations = await prisma.reservation.findMany({
      where: {
        date_finale: {
          gte: tomorrow,
          lt: new Date(tomorrow.getTime() + 86400000)
        },
      },
      include: { client: true },
    });
    console.log("DEBUG: Réservations J-1 trouvées :", reservations.length);

    for (const res of reservations) {
      const message = `Rappel : La réservation #${res.id.slice(0, 8)} pour ${res.client?.nom || "Client"} expire demain.`;
      await createIfNotExists(userId, "Reservation", message, res.id);
    }

    // 2. Stocks faibles
    const thresholdSetting = await prisma.setting.findUnique({ where: { key: "low_stock_threshold" } });
    const threshold = thresholdSetting ? Number(thresholdSetting.value) : 5;
    const produits = await prisma.produit.findMany({ where: { quantite: { lte: threshold } } });
    console.log("DEBUG: Produits sous seuil", threshold, ":", produits.length);

    for (const prod of produits) {
      const message = `Stock faible : "${prod.nom}" (${prod.quantite} restants).`;
      await createIfNotExists(userId, "Alerte", message, prod.id);
    }

    // 3. Éclosions (J10, J20)
    const eclosions = await prisma.eclosion.findMany({
        where: { paye: true }
    });

    for (const e of eclosions) {
      const diffTime = today.getTime() - e.date_debut.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 10) {
        await createIfNotExists(userId, "Alerte", `Éclosion #${e.id.slice(0, 8)}: 10ème jour atteint.`, e.id);
      } else if (diffDays === 20) {
        await createIfNotExists(userId, "Alerte", `Éclosion #${e.id.slice(0, 8)}: 20ème jour, fin du cycle.`, e.id);
      }
    }
  },
};
