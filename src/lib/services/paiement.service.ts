// src/lib/services/paiement.service.ts
import prisma from "@/lib/prisma";
import { Paiement, Prisma } from "../../generated/prisma/index";
import { auditService } from "./audit.service"; // Pour les logs d'audit

export const paiementService = {
  async getAllPaiements(): Promise<Paiement[]> {
    return prisma.paiement.findMany({
      include: {
        reservation: true,
      },
      orderBy: {
        date_paiement: "desc",
      },
    });
  },

  async getPaiementById(id: string): Promise<Paiement | null> {
    return prisma.paiement.findUnique({
      where: { id },
      include: {
        reservation: true,
      },
    });
  },

  async createPaiement(data: Prisma.PaiementCreateInput, userId: string): Promise<Paiement> {
    const newPaiement = await prisma.paiement.create({
      data,
    });

    await auditService.log({
      userId: userId,
      action: "CREATE",
      entity_type: "Paiement",
      entity_id: newPaiement.id,
      new_value: newPaiement,
    });

    return newPaiement;
  },

  async updatePaiement(id: string, data: Prisma.PaiementUpdateInput, userId: string): Promise<Paiement> {
    const oldPaiement = await prisma.paiement.findUnique({ where: { id } });
    if (!oldPaiement) throw new Error("Paiement non trouvé.");

    const updatedPaiement = await prisma.paiement.update({
      where: { id },
      data,
    });

    await auditService.log({
      userId: userId,
      action: "UPDATE",
      entity_type: "Paiement",
      entity_id: id,
      old_value: oldPaiement,
      new_value: updatedPaiement,
    });

    return updatedPaiement;
  },

  async deletePaiement(id: string, userId: string): Promise<Paiement> {
    const oldPaiement = await prisma.paiement.findUnique({ where: { id } });
    if (!oldPaiement) throw new Error("Paiement non trouvé.");

    const deletedPaiement = await prisma.paiement.delete({
      where: { id },
    });

    await auditService.log({
      userId: userId,
      action: "DELETE",
      entity_type: "Paiement",
      entity_id: id,
      old_value: oldPaiement,
    });

    return deletedPaiement;
  },
};
