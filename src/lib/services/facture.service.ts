// filepath: src/lib/services/facture.service.ts
import { createClient } from "@/lib/supabase";
import { FactureModel } from "@/lib/models/facture.model";
import { AuditModel } from "@/lib/models/audit.model";
import { Facture, StatutFacture } from "@/types/database";

const supabase = createClient();
const factureModel = new FactureModel(supabase);
const auditModel = new AuditModel(supabase);

export const factureService = {
  async getAll(): Promise<Facture[]> {
    return factureModel.findAll();
  },

  async getById(id: string): Promise<Facture | null> {
    return factureModel.findById(id);
  },

  async getByReservation(reservationId: string): Promise<Facture[]> {
    return factureModel.findByReservation(reservationId);
  },

  async create(
    data: Omit<Facture, "id" | "date_modification">,
    managerId: string,
  ): Promise<Facture> {
    const facture = await factureModel.create(data);

    await auditModel.create({
      manager_id: managerId,
      action: "CREATE",
      entite: "factures",
      entite_id: facture.id,
      ancienne_valeur: null,
      nouvelle_valeur: JSON.stringify(facture),
      adresse_ip: null,
      user_agent: null,
      client_id: null,
      fournisseur_id: null
    });

    return facture;
  },

  async updateStatut(
    id: string,
    statut: StatutFacture,
    managerId: string,
  ): Promise<Facture> {
    const oldFacture = await factureModel.findById(id);
    if (!oldFacture) throw new Error("Facture non trouvée");

    const facture = await factureModel.updateStatut(id, statut);

    await auditModel.create({
      manager_id: managerId,
      action: "UPDATE_STATUT",
      entite: "factures",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldFacture),
      nouvelle_valeur: JSON.stringify(facture),
      adresse_ip: null,
      user_agent: null,
      client_id: null,
      fournisseur_id: null
    });

    return facture;
  },

  async delete(id: string, managerId: string): Promise<void> {
    const oldFacture = await factureModel.findById(id);
    if (!oldFacture) throw new Error("Facture non trouvée");

    await factureModel.delete(id);

    await auditModel.create({
      manager_id: managerId,
      action: "DELETE",
      entite: "factures",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldFacture),
      nouvelle_valeur: null,
      adresse_ip: null,
      user_agent: null,
      client_id: null,
      fournisseur_id: null
    });
  },
};
