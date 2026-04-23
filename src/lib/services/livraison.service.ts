// filepath: src/lib/services/livraison.service.ts
import { createClient } from "@/lib/supabase";
import { LivraisonModel } from "@/lib/models/livraison.model";
import { AuditModel } from "@/lib/models/audit.model";
import { Livraison, StatutLivraison } from "@/types/database";

const supabase = createClient();
const livraisonModel = new LivraisonModel(supabase);
const auditModel = new AuditModel(supabase);

export const livraisonService = {
  async getAll(): Promise<Livraison[]> {
    return livraisonModel.findAll();
  },

  async getById(id: string): Promise<Livraison | null> {
    return livraisonModel.findById(id);
  },

  async getByReservation(reservationId: string): Promise<Livraison | null> {
    const data = await livraisonModel.findByReservation(reservationId);
    return data.length > 0 ? data[0] : null;
  },

  async getByStatut(statut: StatutLivraison): Promise<Livraison[]> {
    return livraisonModel.findByStatut(statut);
  },

  async create(
    data: Omit<Livraison, "id" | "date_creation" | "date_modification">,
    managerId: string,
  ): Promise<Livraison> {
    const livraison = await livraisonModel.create(data);

    await auditModel.create({
      manager_id: managerId,
      action: "CREATE",
      entite: "livraisons",
      entite_id: livraison.id,
      ancienne_valeur: null,
      nouvelle_valeur: JSON.stringify(livraison),
      adresse_ip: null,
      user_agent: null,
      client_id: null,
      fournisseur_id: null
    });

    return livraison;
  },

  async update(
    id: string,
    data: Partial<Livraison>,
    managerId: string,
  ): Promise<Livraison> {
    const oldLivraison = await livraisonModel.findById(id);
    if (!oldLivraison) throw new Error("Livraison non trouvée");

    const livraison = await livraisonModel.update(id, data);

    await auditModel.create({
      manager_id: managerId,
      action: "UPDATE",
      entite: "livraisons",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldLivraison),
      nouvelle_valeur: JSON.stringify(livraison),
      adresse_ip: null,
      user_agent: null,
      client_id: null,
      fournisseur_id: null
    });

    return livraison;
  },

  async updateStatut(
    id: string,
    statut: StatutLivraison,
    managerId: string,
  ): Promise<Livraison> {
    return this.update(id, { statut }, managerId);
  },

  async delete(id: string, managerId: string): Promise<void> {
    const oldLivraison = await livraisonModel.findById(id);
    if (!oldLivraison) throw new Error("Livraison non trouvée");

    await livraisonModel.delete(id);

    await auditModel.create({
      manager_id: managerId,
      action: "DELETE",
      entite: "livraisons",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldLivraison),
      nouvelle_valeur: null,
      adresse_ip: null,
      user_agent: null,
      client_id: null,
      fournisseur_id: null
    });
  },
};
