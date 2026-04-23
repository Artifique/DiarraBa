// filepath: src/lib/services/couveuse.service.ts
import { createClient } from "@/lib/supabase";
import { CouveuseModel } from "@/lib/models/couveuse.model";
import { AuditModel } from "@/lib/models/audit.model";
import { Couveuse } from "@/types/database";

const supabase = createClient();
const couveuseModel = new CouveuseModel(supabase);
const auditModel = new AuditModel(supabase);

export const couveuseService = {
  async getAll(): Promise<Couveuse[]> {
    return couveuseModel.findAll();
  },

  async getById(id: string): Promise<Couveuse | null> {
    return couveuseModel.findById(id);
  },

  async getDisponibles(): Promise<Couveuse[]> {
    return couveuseModel.findDisponibles();
  },

  async getByFournisseur(fournisseurId: string): Promise<Couveuse[]> {
    return couveuseModel.findByFournisseur(fournisseurId);
  },

  async create(
    data: Omit<Couveuse, "id" | "date_ajout" | "date_modification">,
    managerId: string,
  ): Promise<Couveuse> {
    const couveuse = await couveuseModel.create(data);

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: couveuse.fournisseur_id,
      action: "CREATE",
      entite: "couveuses",
      entite_id: couveuse.id,
      ancienne_valeur: null,
      nouvelle_valeur: JSON.stringify(couveuse),
      adresse_ip: null,
      user_agent: null,
      client_id: null
    });

    return couveuse;
  },

  async update(
    id: string,
    data: Partial<Couveuse>,
    managerId: string,
  ): Promise<Couveuse> {
    const oldCouveuse = await couveuseModel.findById(id);
    if (!oldCouveuse) throw new Error("Couveuse non trouvée");

    const couveuse = await couveuseModel.update(id, data);

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: couveuse.fournisseur_id,
      action: "UPDATE",
      entite: "couveuses",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldCouveuse),
      nouvelle_valeur: JSON.stringify(couveuse),
      adresse_ip: null,
      user_agent: null,
      client_id: null
    });

    return couveuse;
  },

  async setDisponibilite(
    id: string,
    disponible: boolean,
    managerId: string,
  ): Promise<Couveuse> {
    return this.update(id, { disponible }, managerId);
  },

  async delete(id: string, managerId: string): Promise<void> {
    const oldCouveuse = await couveuseModel.findById(id);
    if (!oldCouveuse) throw new Error("Couveuse non trouvée");

    await couveuseModel.delete(id);

    await auditModel.create({
      manager_id: managerId,
      fournisseur_id: oldCouveuse.fournisseur_id,
      action: "DELETE",
      entite: "couveuses",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldCouveuse),
      nouvelle_valeur: null,
      adresse_ip: null,
      user_agent: null,
      client_id: null
    });
  },
};
