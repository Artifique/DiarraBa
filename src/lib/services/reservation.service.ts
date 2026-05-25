// src/lib/services/reservation.service.ts
import prisma from "@/lib/prisma";
import { Reservation, LigneReservation, Prisma } from "../../generated/prisma/index";
import { auditService } from "./audit.service"; // Pour les logs d'audit

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

    console.log("DEBUG: Données reçues dans createReservation :", { clientNom, clientTel, clientId, rest });

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

        return newReservation;
    } catch (error) {
        console.error("DEBUG: Erreur Prisma lors de la création de la réservation :", error);
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
    const oldReservation = await prisma.reservation.findUnique({ where: { id } });
    if (!oldReservation) throw new Error("Réservation non trouvée.");

    // IMPORTANT: Gérer la suppression des paiements et lignes de réservation associés
    // Soit en cascade dans le schema.prisma, soit manuellement ici.
    // Pour l'instant, je vais laisser Prisma gérer si des cascades sont définies.

    const deletedReservation = await prisma.reservation.delete({
      where: { id },
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
    // Mettre à jour le montant total de la réservation si nécessaire
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
