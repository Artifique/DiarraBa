// filepath: src/lib/services/settings.service.ts
import prisma from "@/lib/prisma";
import { auditService } from "./audit.service"; // Assurez-vous que c'est le bon chemin pour le service d'audit mis à jour
import { Setting } from "../../generated/prisma/index"; // Utilise le type généré par Prisma

export const settingsService = {
  async getAllSettings(): Promise<Setting[]> {
    return prisma.setting.findMany();
  },

  async getSettingById(id: string): Promise<Setting | null> {
    return prisma.setting.findUnique({ where: { id } });
  },

  async getSettingByKey(key: string): Promise<Setting | null> {
    return prisma.setting.findUnique({ where: { key } });
  },

  async createSetting(
    data: Omit<Setting, "id" | "date_creation" | "date_modification" | "user">, // 'user' est une relation, pas un champ à créer directement
    userId: string,
  ): Promise<Setting> {
    const setting = await prisma.setting.create({
      data: {
        ...data,
        userId: userId,
      },
    });

    await auditService.log({
      userId: userId,
      action: "CREATE",
      entity_type: "Setting",
      entity_id: setting.id,
      new_value: setting,
    });

    return setting;
  },

  async updateSetting(
    id: string,
    data: Partial<Omit<Setting, "id" | "date_creation" | "date_modification" | "user">>, // 'user' est une relation
    userId: string,
  ): Promise<Setting> {
    const oldSetting = await prisma.setting.findUnique({ where: { id } });
    if (!oldSetting) throw new Error("Paramètre non trouvé");
    if (oldSetting.userId !== userId) throw new Error("Accès non autorisé à ce paramètre.");

    const setting = await prisma.setting.update({
      where: { id },
      data: {
        ...data,
        userId: userId,
      },
    });

    await auditService.log({
      userId: userId,
      action: "UPDATE",
      entity_type: "Setting",
      entity_id: id,
      old_value: oldSetting,
      new_value: setting,
    });

    return setting;
  },

  async deleteSetting(id: string, userId: string): Promise<void> {
    const oldSetting = await prisma.setting.findUnique({ where: { id } });
    if (!oldSetting) throw new Error("Paramètre non trouvé");
    if (oldSetting.userId !== userId) throw new Error("Accès non autorisé à ce paramètre.");

    await prisma.setting.delete({ where: { id } });

    await auditService.log({
      userId: userId,
      action: "DELETE",
      entity_type: "Setting",
      entity_id: id,
      old_value: oldSetting,
    });
  },
};
