// filepath: src/lib/services/fournisseur.service.ts
import { createClient } from "@/lib/supabase";
import { FournisseurModel } from "@/lib/models/fournisseur.model";
import { AuditModel } from "@/lib/models/audit.model";
import { Fournisseur } from "@/types/database";

const supabase = createClient();
const fournisseurModel = new FournisseurModel(supabase);
const auditModel = new AuditModel(supabase);

export const fournisseurService = {
  async getAll(): Promise<Fournisseur[]> {
    return fournisseurModel.findAll();
  },

  async getById(id: string): Promise<Fournisseur | null> {
    return fournisseurModel.findById(id);
  },

  async create(
    data: Omit<Fournisseur, "id" | "date_inscription" | "date_modification">,
    managerId: string,
  ): Promise<Fournisseur> {
    const fournisseur = await fournisseurModel.create(data);

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: fournisseur.id,
      client_id: null,
      action: "CREATE",
      entite: "fournisseurs",
      entite_id: fournisseur.id,
      ancienne_valeur: null,
      nouvelle_valeur: JSON.stringify(fournisseur),
      adresse_ip: null,
      user_agent: null
    });

    return fournisseur;
  },

  async update(
    id: string,
    data: Partial<Fournisseur>,
    managerId: string,
  ): Promise<Fournisseur> {
    const oldFournisseur = await fournisseurModel.findById(id);
    if (!oldFournisseur) throw new Error("Fournisseur non trouvé");

    const fournisseur = await fournisseurModel.update(id, data);

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: id,
      client_id: null,
      action: "UPDATE",
      entite: "fournisseurs",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldFournisseur),
      nouvelle_valeur: JSON.stringify(fournisseur),
      adresse_ip: null,
      user_agent: null
    });

    return fournisseur;
  },

  async delete(id: string, managerId: string): Promise<void> {
    const oldFournisseur = await fournisseurModel.findById(id);
    if (!oldFournisseur) throw new Error("Fournisseur non trouvé");

    await fournisseurModel.delete(id);

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: id,
      client_id: null,
      action: "DELETE",
      entite: "fournisseurs",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldFournisseur),
      nouvelle_valeur: null,
      adresse_ip: null,
      user_agent: null
    });
  },

  async search(query: string): Promise<Fournisseur[]> {
    return fournisseurModel.search(query);
  },
};
