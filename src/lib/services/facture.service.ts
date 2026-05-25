// src/lib/services/facture.service.ts
import prisma from "@/lib/prisma";
import { Facture, Prisma } from "../../generated/prisma/index";
import { auditService } from "./audit.service"; // Pour les logs d'audit

export const factureService = {
  async getAllFactures(): Promise<Facture[]> {
    return prisma.facture.findMany({
      include: {
        reservation: {
          include: {
            client: true, // Inclure les infos du client via la réservation
          },
        },
      },
      orderBy: {
        date_facture: "desc",
      },
    });
  },

  async getFactureById(id: string): Promise<Facture | null> {
    return prisma.facture.findUnique({
      where: { id },
      include: {
        reservation: {
          include: {
            client: true,
          },
        },
      },
    });
  },

  async createFacture(data: Prisma.FactureCreateInput, userId: string): Promise<Facture> {
    const newFacture = await prisma.facture.create({
      data,
    });

    await auditService.log({
      userId: userId,
      action: "CREATE",
      entity_type: "Facture",
      entity_id: newFacture.id,
      new_value: newFacture,
    });

    return newFacture;
  },

  async updateFacture(id: string, data: Prisma.FactureUpdateInput, userId: string): Promise<Facture> {
    const oldFacture = await prisma.facture.findUnique({ where: { id } });
    if (!oldFacture) throw new Error("Facture non trouvée.");

    const updatedFacture = await prisma.facture.update({
      where: { id },
      data,
    });

    await auditService.log({
      userId: userId,
      action: "UPDATE",
      entity_type: "Facture",
      entity_id: id,
      old_value: oldFacture,
      new_value: updatedFacture,
    });

    return updatedFacture;
  },

  async deleteFacture(id: string, userId: string): Promise<Facture> {
    const oldFacture = await prisma.facture.findUnique({ where: { id } });
    if (!oldFacture) throw new Error("Facture non trouvée.");

    const deletedFacture = await prisma.facture.delete({
      where: { id },
    });

    await auditService.log({
      userId: userId,
      action: "DELETE",
      entity_type: "Facture",
      entity_id: id,
      old_value: oldFacture,
    });

    return deletedFacture;
  },
};
