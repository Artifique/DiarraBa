// filepath: src/lib/services/notification.service.ts
import prisma from "@/lib/prisma";
import { Notification } from "../../generated/prisma/index";

async function createIfNotExists(userId: string, type: string, message: string, entity_id?: string, link?: string) {
  const existing = await prisma.notification.findFirst({
    where: { userId, message, read: false, type, entity_id },
  });

  if (!existing) {
    await prisma.notification.create({
      data: { userId, type, message, read: false, entity_id },
    });
  }
}

export const notificationService = {
  async getAll(): Promise<Notification[]> { return prisma.notification.findMany(); },
  async getNonLues(userId?: string): Promise<Notification[]> { return prisma.notification.findMany({ where: { userId, read: false } }); },
  async markAsRead(id: string): Promise<Notification> { return prisma.notification.update({ where: { id }, data: { read: true } }); },
  async markAllAsRead(userId: string): Promise<void> { await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } }); },
  async delete(id: string): Promise<void> { await prisma.notification.delete({ where: { id } }); },

  async checkAndGenerateNotifications(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1. Réservations à J-1
    const reservations = await prisma.reservation.findMany({
      where: { date_finale: { gte: tomorrow, lt: new Date(tomorrow.getTime() + 86400000) } },
      include: { client: true },
    });
    for (const res of reservations) {
      await createIfNotExists(userId, "Reservation", `Rappel : Réservation client ${res.client?.telephone || res.clientTel} expire demain.`, res.id, "/reservation");
    }

    // 2. Stocks faibles
    const thresholdSetting = await prisma.setting.findUnique({ where: { key: "low_stock_threshold" } });
    const threshold = thresholdSetting ? Number(thresholdSetting.value) : 5;
    const produits = await prisma.produit.findMany({ where: { quantite: { lte: threshold } } });
    for (const prod of produits) {
      await createIfNotExists(userId, "Alerte", `Stock faible : "${prod.nom}" (${prod.quantite} restants).`, prod.id, "/produit");
    }

    // 3. Éclosions (J10, J20)
    const eclosions = await prisma.eclosion.findMany({ where: { paye: true } });
    for (const e of eclosions) {
      const diffDays = Math.floor((today.getTime() - e.date_debut.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 10) await createIfNotExists(userId, "Eclosion", `Éclosion client ${e.telephone}: 10ème jour.`, e.id, "/eclosion");
      else if (diffDays === 20) await createIfNotExists(userId, "Eclosion", `Éclosion client ${e.telephone}: 20ème jour, fin cycle.`, e.id, "/eclosion");
    }
  },
};
