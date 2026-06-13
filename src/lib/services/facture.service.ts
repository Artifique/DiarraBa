// src/lib/services/facture.service.ts
import prisma from "@/lib/prisma";
import { Facture, Prisma } from "../../generated/prisma/index";
import { auditService } from "./audit.service";

export const factureService = {
  async getAllFactures(): Promise<Facture[]> {
    return prisma.facture.findMany({
      include: {
        reservation: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        date_facture: "desc",
      },
    });
  },

  async createFacture(data: Prisma.FactureCreateInput, userId: string): Promise<Facture> {
    const newFacture = await prisma.facture.create({ data });
    await auditService.log({
      userId,
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
    const updatedFacture = await prisma.facture.update({ where: { id }, data });
    await auditService.log({
      userId,
      action: "UPDATE",
      entity_type: "Facture",
      entity_id: id,
      old_value: oldFacture,
      new_value: updatedFacture,
    });
    return updatedFacture;
  },

  async upsertFacture(data: Prisma.FactureCreateInput, userId: string): Promise<Facture> {
    const reservationId = (data.reservation as any)?.connect?.id;
    if (!reservationId) {
      throw new Error("reservationId is required for upsertFacture");
    }
    const newFacture = await prisma.facture.upsert({
      where: { reservationId },
      update: data,
      create: { ...data, reservation: { connect: { id: reservationId } } },
    });
    await auditService.log({
      userId,
      action: "UPSERT",
      entity_type: "Facture",
      entity_id: newFacture.id,
      new_value: newFacture,
    });
    return newFacture;
  },

  async deleteFacture(id: string, userId: string): Promise<Facture> {
    const oldFacture = await prisma.facture.findUnique({ where: { id } });
    if (!oldFacture) throw new Error("Facture non trouvée.");
    const deletedFacture = await prisma.facture.delete({ where: { id } });
    await auditService.log({
      userId,
      action: "DELETE",
      entity_type: "Facture",
      entity_id: id,
      old_value: oldFacture,
    });
    return deletedFacture;
  },
};
