// src/lib/services/categorie.service.ts
import prisma from "@/lib/prisma";
import { Categorie, Prisma } from "../../generated/prisma/index";
import { auditService } from "./audit.service"; // Pour les logs d'audit

export const categorieService = {
  async getAllCategories(page: number = 1, limit: number = 10): Promise<Categorie[]> {
    const skip = (page - 1) * limit;
    return prisma.categorie.findMany({
      orderBy: {
        nomCategorie: "asc",
      },
      skip,
      take: limit,
    });
  },

  async countCategories(): Promise<number> {
    return prisma.categorie.count();
  },

  async getCategorieById(id: string): Promise<Categorie | null> {
    return prisma.categorie.findUnique({
      where: { id },
    });
  },

  async createCategorie(data: Prisma.CategorieCreateInput, userId: string): Promise<Categorie> {
    const newCategorie = await prisma.categorie.create({
      data,
    });

    await auditService.log({
      userId: userId,
      action: "CREATE",
      entity_type: "Categorie",
      entity_id: newCategorie.id,
      new_value: newCategorie,
    });

    return newCategorie;
  },

  async updateCategorie(id: string, data: Prisma.CategorieUpdateInput, userId: string): Promise<Categorie> {
    const oldCategorie = await prisma.categorie.findUnique({ where: { id } });
    if (!oldCategorie) throw new Error("Catégorie non trouvée.");

    const updatedCategorie = await prisma.categorie.update({
      where: { id },
      data,
    });

    await auditService.log({
      userId: userId,
      action: "UPDATE",
      entity_type: "Categorie",
      entity_id: id,
      old_value: oldCategorie,
      new_value: updatedCategorie,
    });

    return updatedCategorie;
  },

  async deleteCategorie(id: string, userId: string): Promise<Categorie> {
    const oldCategorie = await prisma.categorie.findUnique({ where: { id } });
    if (!oldCategorie) throw new Error("Catégorie non trouvée.");

    const deletedCategorie = await prisma.categorie.delete({
      where: { id },
    });

    await auditService.log({
      userId: userId,
      action: "DELETE",
      entity_type: "Categorie",
      entity_id: id,
      old_value: oldCategorie,
    });

    return deletedCategorie;
  },
};
