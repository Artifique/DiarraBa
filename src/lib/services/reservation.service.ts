// src/lib/services/reservation.service.ts
import prisma from "@/lib/prisma";
import { Reservation, LigneReservation, Prisma } from "../../generated/prisma/index";
import { auditService } from "./audit.service";

// Helper : crée une notification si elle n'existe pas déjà
async function createNotifIfNotExists(userId: string, type: string, message: string, entity_id?: string) {
  const existing = await prisma.notification.findFirst({
    where: { userId, message, read: false, type, entity_id },
  });
  if (!existing) {
    await prisma.notification.create({
      data: { userId, type, message, read: false, entity_id },
    });
  }
}

export const reservationService = {
  async getAllReservations(): Promise<Reservation[]> {
    return prisma.reservation.findMany({
      include: {
        client: true,
        paiements: true,
        lignes: {
          include: {
            produit: true,
          },
        },
      },
      orderBy: {
        date_reservation: "desc",
      },
    });
  },

  async getReservationById(id: string): Promise<Reservation | null> {
    return prisma.reservation.findUnique({
      where: { id },
      include: {
        client: true,
        paiements: true,
        lignes: {
          include: {
            produit: true,
          },
        },
      },
    });
  },

  async createReservation(data: any, userId: string): Promise<Reservation> {
    const { clientNom, clientTel, clientId, ...rest } = data;

    try {
        const newReservation = await prisma.reservation.create({
          data: {
            ...rest,
            clientNom,
            clientTel,
            client: clientId ? { connect: { id: clientId } } : undefined,
          },
        });
        
        await auditService.log({
          userId: userId,
          action: "CREATE",
          entity_type: "Reservation",
          entity_id: newReservation.id,
          new_value: newReservation,
        });

        // Notification : nouvelle réservation créée
        const clientLabel = clientNom || clientTel || "Inconnu";
        await createNotifIfNotExists(
          userId,
          "Reservation",
          `Nouvelle réservation créée pour ${clientLabel}.`,
          newReservation.id
        );

        return newReservation;
    } catch (error) {
        console.error("Erreur Prisma lors de la création de la réservation :", error);
        throw error;
    }
  },

  async updateReservation(id: string, data: Prisma.ReservationUpdateInput, userId: string): Promise<Reservation> {
    const oldReservation = await prisma.reservation.findUnique({ where: { id } });
    if (!oldReservation) throw new Error("Réservation non trouvée.");

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data,
    });

    await auditService.log({
      userId: userId,
      action: "UPDATE",
      entity_type: "Reservation",
      entity_id: id,
      old_value: oldReservation,
      new_value: updatedReservation,
    });

    return updatedReservation;
  },

  async deleteReservation(id: string, userId: string): Promise<Reservation> {
    const oldReservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        lignes: true,
      },
    });
    if (!oldReservation) throw new Error("Réservation non trouvée.");

    const deletedReservation = await prisma.$transaction(async (tx) => {
      // 1. Restaurer les stocks des produits
      for (const ligne of oldReservation.lignes) {
        await tx.produit.update({
          where: { id: ligne.produitId },
          data: { quantite: { increment: ligne.quantite } },
        });
      }

      // 2. Supprimer la facture associée
      await tx.facture.deleteMany({
        where: { reservationId: id },
      });

      // 3. Supprimer les paiements associés
      await tx.paiement.deleteMany({
        where: { reservationId: id },
      });

      // 4. Supprimer les lignes de réservation associées
      await tx.ligneReservation.deleteMany({
        where: { reservationId: id },
      });

      // 5. Supprimer la réservation
      return tx.reservation.delete({
        where: { id },
      });
    });

    await auditService.log({
      userId: userId,
      action: "DELETE",
      entity_type: "Reservation",
      entity_id: id,
      old_value: oldReservation,
    });

    return deletedReservation;
  },

  async addLigneReservation(data: Prisma.LigneReservationCreateInput, userId: string): Promise<LigneReservation> {
    const newLigne = await prisma.ligneReservation.create({
      data,
    });

    // ── Décrémentation du stock ──────────────────────────────────────
    const produitId = (data.produit as any)?.connect?.id;
    const quantite  = typeof data.quantite === "number" ? data.quantite : Number(data.quantite ?? 0);

    if (produitId && quantite > 0) {
      const updatedProduit = await prisma.produit.update({
        where: { id: produitId },
        data: { quantite: { decrement: quantite } },
      });

      // ── Notification si stock faible ─────────────────────────────
      const thresholdSetting = await prisma.setting.findUnique({ where: { key: "low_stock_threshold" } });
      const threshold = thresholdSetting ? Number(thresholdSetting.value) : 5;

      if (updatedProduit.quantite <= threshold) {
        await createNotifIfNotExists(
          userId,
          "Alerte",
          `Stock faible : "${updatedProduit.nom}" (${updatedProduit.quantite} restant${updatedProduit.quantite > 1 ? "s" : ""}).`,
          updatedProduit.id
        );
      }
    }
    // ────────────────────────────────────────────────────────────────

    return newLigne;
  },

  async updateLigneReservation(id: string, data: Prisma.LigneReservationUpdateInput, userId: string): Promise<LigneReservation> {
    const updatedLigne = await prisma.ligneReservation.update({
      where: { id },
      data,
    });
    // Mettre à jour le montant total de la réservation si nécessaire
    return updatedLigne;
  },

  async deleteLigneReservation(id: string, userId: string): Promise<LigneReservation> {
    const deletedLigne = await prisma.ligneReservation.delete({
      where: { id },
    });
    // Mettre à jour le montant total de la réservation si nécessaire
    return deletedLigne;
  },
};
