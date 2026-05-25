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

  async createReservation(data: Prisma.ReservationCreateInput, userId: string): Promise<Reservation> {
    // Calcul du montant total
    // IMPORTANT: Le calcul du montant total ici est une simplification.
    // Il faudrait récupérer les prix unitaires des produits et calculer le total
    // de manière sécurisée côté serveur pour éviter la fraude.
    const montantTotal = data.montant_total || 0; 

    const newReservation = await prisma.reservation.create({
      data: {
        client: {
          connect: {
            id: (data as any).clientId // Utilisation temporaire du cast pour accéder à clientId
          }
        },
        date_reservation: data.date_reservation,
        date_finale: data.date_finale,
        mode_paiement: data.mode_paiement,
        methode_paiement: data.methode_paiement,
        montant_total: montantTotal,
        // Les lignes de réservation (produits) devraient être gérées ici
        // ou via une transaction si elles sont créées en même temps.
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
