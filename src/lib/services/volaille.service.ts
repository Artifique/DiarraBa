// filepath: src/lib/services/volaille.service.ts
import { createClient } from "@/lib/supabase";
import { VolailleModel } from "@/lib/models/volaille.model";
import { AuditModel } from "@/lib/models/audit.model";
import { Volaille, VolailleType } from "@/types/database";

const supabase = createClient();
const volailleModel = new VolailleModel(supabase);
const auditModel = new AuditModel(supabase);

export const volailleService = {
  async getAll(): Promise<Volaille[]> {
    return volailleModel.findAll();
  },

  async getById(id: string): Promise<Volaille | null> {
    return volailleModel.findById(id);
  },

  async getDisponibles(): Promise<Volaille[]> {
    return volailleModel.getDisponibles();
  },

  async getByType(type: VolailleType): Promise<Volaille[]> {
    return volailleModel.findByType(type);
  },

  async getByFournisseur(fournisseurId: string): Promise<Volaille[]> {
    return volailleModel.findByFournisseur(fournisseurId);
  },

  async create(
    data: Omit<Volaille, "id" | "date_ajout" | "date_modification">,
    managerId: string,
  ): Promise<Volaille> {
    const volaille = await volailleModel.create(data);

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: volaille.fournisseur_id,
      action: "CREATE",
      entite: "volailles",
      entite_id: volaille.id,
      ancienne_valeur: null,
      nouvelle_valeur: JSON.stringify(volaille),
      adresse_ip: null,
      user_agent: null,
      client_id: null
    });

    return volaille;
  },

  async update(
    id: string,
    data: Partial<Volaille>,
    managerId: string,
  ): Promise<Volaille> {
    const oldVolaille = await volailleModel.findById(id);
    if (!oldVolaille) throw new Error("Volaille non trouvée");

    const volaille = await volailleModel.update(id, data);

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: volaille.fournisseur_id,
      action: "UPDATE",
      entite: "volailles",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldVolaille),
      nouvelle_valeur: JSON.stringify(volaille),
      adresse_ip: null,
      user_agent: null,
      client_id: null
    });

    return volaille;
  },

  async updateQuantite(
    id: string,
    quantite: number,
    managerId: string,
  ): Promise<Volaille> {
    return this.update(id, { quantite_disponible: quantite }, managerId);
  },

  async delete(id: string, managerId: string): Promise<void> {
    const oldVolaille = await volailleModel.findById(id);
    if (!oldVolaille) throw new Error("Volaille non trouvée");

    await volailleModel.delete(id);

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: oldVolaille.fournisseur_id,
      action: "DELETE",
      entite: "volailles",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldVolaille),
      nouvelle_valeur: null,
      adresse_ip: null,
      user_agent: null,
      client_id: null
    });
  },
};
