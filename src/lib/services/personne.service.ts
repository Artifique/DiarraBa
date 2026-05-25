// src/lib/services/personne.service.ts
import prisma from "@/lib/prisma";
import { Personne, Prisma } from "../../generated/prisma/index";
import { auditService } from "./audit.service"; // Pour les logs d'audit

export const personneService = {
  async getAllPersonnes(): Promise<Personne[]> {
    return prisma.personne.findMany({
      orderBy: {
        nom: "asc",
      },
    });
  },

  async getPersonneById(id: string): Promise<Personne | null> {
    return prisma.personne.findUnique({
      where: { id },
    });
  },

  async getPersonneByTelephone(telephone: string): Promise<Personne | null> {
    return prisma.personne.findUnique({
      where: { telephone },
    });
  },

  async getClients(): Promise<Personne[]> {
    return prisma.personne.findMany({
      where: { type: "client" },
      orderBy: { nom: "asc" },
    });
  },

  async getFournisseurs(): Promise<Personne[]> {
    return prisma.personne.findMany({
      where: { type: "fournisseur" },
      orderBy: { nom: "asc" },
    });
  },

  async createPersonne(data: Prisma.PersonneCreateInput, userId: string): Promise<Personne> {
    const newPersonne = await prisma.personne.create({
      data,
    });

    await auditService.log({
      userId: userId,
      action: "CREATE",
      entity_type: "Personne",
      entity_id: newPersonne.id,
      new_value: newPersonne,
    });

    return newPersonne;
  },

  async updatePersonne(id: string, data: Prisma.PersonneUpdateInput, userId: string): Promise<Personne> {
    const oldPersonne = await prisma.personne.findUnique({ where: { id } });
    if (!oldPersonne) throw new Error("Personne non trouvée.");

    const updatedPersonne = await prisma.personne.update({
      where: { id },
      data,
    });

    await auditService.log({
      userId: userId,
      action: "UPDATE",
      entity_type: "Personne",
      entity_id: id,
      old_value: oldPersonne,
      new_value: updatedPersonne,
    });

    return updatedPersonne;
  },

  async deletePersonne(id: string, userId: string): Promise<Personne> {
    const oldPersonne = await prisma.personne.findUnique({ where: { id } });
    if (!oldPersonne) throw new Error("Personne non trouvée.");

    const deletedPersonne = await prisma.personne.delete({
      where: { id },
    });

    await auditService.log({
      userId: userId,
      action: "DELETE",
      entity_type: "Personne",
      entity_id: id,
      old_value: oldPersonne,
    });

    return deletedPersonne;
  },
};
