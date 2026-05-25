// src/lib/services/eclosion.service.ts
import prisma from "@/lib/prisma";
import { Eclosion, Prisma } from "../../generated/prisma/index";
import { auditService } from "./audit.service"; // Pour les logs d'audit

export const eclosionService = {
  async getAllEclosions(page: number = 1, limit: number = 10): Promise<Eclosion[]> {
    const skip = (page - 1) * limit;
    return prisma.eclosion.findMany({
      orderBy: {
        date_debut: "desc",
      },
      skip,
      take: limit,
    });
  },

  async countEclosions(): Promise<number> {
    return prisma.eclosion.count();
  },

  async getEclosionById(id: string): Promise<Eclosion | null> {
    return prisma.eclosion.findUnique({
      where: { id },
    });
  },

  async createEclosion(data: Prisma.EclosionCreateInput, userId: string): Promise<Eclosion> {
    const newEclosion = await prisma.eclosion.create({
      data,
    });

    await auditService.log({
      userId: userId,
      action: "CREATE",
      entity_type: "Eclosion",
      entity_id: newEclosion.id,
      new_value: newEclosion,
    });

    return newEclosion;
  },

  async updateEclosion(id: string, data: Prisma.EclosionUpdateInput, userId: string): Promise<Eclosion> {
    const oldEclosion = await prisma.eclosion.findUnique({ where: { id } });
    if (!oldEclosion) throw new Error("Éclosion non trouvée.");

    const updatedEclosion = await prisma.eclosion.update({
      where: { id },
      data,
    });

    await auditService.log({
      userId: userId,
      action: "UPDATE",
      entity_type: "Eclosion",
      entity_id: id,
      old_value: oldEclosion,
      new_value: updatedEclosion,
    });

    return updatedEclosion;
  },

  async deleteEclosion(id: string, userId: string): Promise<Eclosion> {
    const oldEclosion = await prisma.eclosion.findUnique({ where: { id } });
    if (!oldEclosion) throw new Error("Éclosion non trouvée.");

    const deletedEclosion = await prisma.eclosion.delete({
      where: { id },
    });

    await auditService.log({
      userId: userId,
      action: "DELETE",
      entity_type: "Eclosion",
      entity_id: id,
      old_value: oldEclosion,
    });

    return deletedEclosion;
  },
};
