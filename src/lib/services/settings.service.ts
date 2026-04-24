// filepath: src/lib/services/settings.service.ts
import { createClient } from "@/lib/supabase";
import { SettingsModel } from "@/lib/models/settings.model";
import { AuditModel } from "@/lib/models/audit.model";
import { Setting } from "@/types/database";

const supabase = createClient();
const settingsModel = new SettingsModel(supabase);
const auditModel = new AuditModel(supabase);

export const settingsService = {
  async getAllSettings(): Promise<Setting[]> {
    return settingsModel.findAll();
  },

  async getSettingById(id: string): Promise<Setting | null> {
    return settingsModel.findById(id);
  },

  async getSettingByKey(key: string): Promise<Setting | null> {
    return settingsModel.findByKey(key);
  },

  async createSetting(
    data: Omit<Setting, "id" | "date_creation" | "date_modification">,
    managerId: string,
  ): Promise<Setting> {
    const setting = await settingsModel.create(data);

    await auditModel.create({
      manager_id: managerId,
      client_id: null,
      fournisseur_id: null,
      action: "CREATE",
      entite: "settings",
      entite_id: setting.id,
      ancienne_valeur: null,
      nouvelle_valeur: JSON.stringify(setting),
      adresse_ip: null,
      user_agent: null
    });

    return setting;
  },

  async updateSetting(
    id: string,
    data: Partial<Omit<Setting, "id" | "date_creation" | "date_modification">>,
    managerId: string,
  ): Promise<Setting> {
    const oldSetting = await settingsModel.findById(id);
    if (!oldSetting) throw new Error("Paramètre non trouvé");

    const setting = await settingsModel.update(id, data);

    await auditModel.create({
      manager_id: managerId,
      client_id: null,
      fournisseur_id: null,
      action: "UPDATE",
      entite: "settings",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldSetting),
      nouvelle_valeur: JSON.stringify(setting),
      adresse_ip: null,
      user_agent: null
    });

    return setting;
  },

  async deleteSetting(id: string, managerId: string): Promise<void> {
    const oldSetting = await settingsModel.findById(id);
    if (!oldSetting) throw new Error("Paramètre non trouvé");

    await settingsModel.delete(id);

    await auditModel.create({
      manager_id: managerId,
      client_id: null,
      fournisseur_id: null,
      action: "DELETE",
      entite: "settings",
      entite_id: id,
      ancienne_valeur: JSON.stringify(oldSetting),
      nouvelle_valeur: null,
      adresse_ip: null,
      user_agent: null
    });
  },
};
