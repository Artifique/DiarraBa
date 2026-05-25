// src/lib/services/produit.service.ts
import prisma from "@/lib/prisma";
import { Produit, Prisma } from "../../generated/prisma/index";
import { auditService } from "./audit.service"; // Pour les logs d'audit

export const produitService = {
  async getAllProduits(page: number = 1, limit: number = 10): Promise<Produit[]> {
    const skip = (page - 1) * limit;
    return prisma.produit.findMany({
      include: {
        categorie: true,
        fournisseur: true,
      },
      orderBy: {
        nom: "asc",
      },
      skip,
      take: limit,
    });
  },

  async countProduits(): Promise<number> {
    return prisma.produit.count();
  },

  async getProduitById(id: string): Promise<Produit | null> {
    return prisma.produit.findUnique({
      where: { id },
      include: {
        categorie: true,
        fournisseur: true,
      },
    });
  },

  async createProduit(data: any, userId: string): Promise<Produit> {
    const { fournisseurInfo, ...produitData } = data;
    
    let finalFournisseurId = produitData.fournisseurId;

    // Si on n'a pas d'ID mais qu'on a un téléphone (Obligatoire selon la nouvelle règle)
    if (!finalFournisseurId) {
      if (!fournisseurInfo?.telephone) {
        throw new Error("Le numéro de téléphone du fournisseur est obligatoire.");
      }

      // Chercher si le fournisseur existe déjà par téléphone
      const existingFournisseur = await prisma.personne.findFirst({
        where: { 
          telephone: fournisseurInfo.telephone,
          type: "Fournisseur"
        }
      });

      if (existingFournisseur) {
        finalFournisseurId = existingFournisseur.id;
      } else {
        // Créer le nouveau fournisseur (Nom optionnel)
        const newFournisseur = await prisma.personne.create({
          data: {
            nom: fournisseurInfo.nom || null,
            telephone: fournisseurInfo.telephone,
            type: "Fournisseur"
          }
        });
        finalFournisseurId = newFournisseur.id;
      }
    }

    const { fournisseurId, ...cleanProduitData } = produitData;

    const newProduit = await prisma.produit.create({
      data: {
        ...cleanProduitData,
        fournisseur: { connect: { id: finalFournisseurId } },
      },
    });

    await auditService.log({
      userId: userId,
      action: "CREATE",
      entity_type: "Produit",
      entity_id: newProduit.id,
      new_value: newProduit,
    });

    return newProduit;
  },

  async updateProduit(id: string, data: Prisma.ProduitUpdateInput, userId: string): Promise<Produit> {
    const oldProduit = await prisma.produit.findUnique({ where: { id } });
    if (!oldProduit) throw new Error("Produit non trouvé.");

    const updatedProduit = await prisma.produit.update({
      where: { id },
      data,
    });

    await auditService.log({
      userId: userId,
      action: "UPDATE",
      entity_type: "Produit",
      entity_id: id,
      old_value: oldProduit,
      new_value: updatedProduit,
    });

    return updatedProduit;
  },

  async deleteProduit(id: string, userId: string): Promise<Produit> {
    const oldProduit = await prisma.produit.findUnique({ where: { id } });
    if (!oldProduit) throw new Error("Produit non trouvé.");

    const deletedProduit = await prisma.produit.delete({
      where: { id },
    });

    await auditService.log({
      userId: userId,
      action: "DELETE",
      entity_type: "Produit",
      entity_id: id,
      old_value: oldProduit,
    });

    return deletedProduit;
  },
};
