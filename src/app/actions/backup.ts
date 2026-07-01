// src/app/actions/backup.ts
"use server"

import { backupService } from "@/lib/services/backup.service";
import prisma from "@/lib/prisma";

export async function triggerManualBackupAction(userId: string) {
  try {
    const result = await backupService.executeBackup(userId);
    return result;
  } catch (error: any) {
    console.error("LOG: Erreur lors de la sauvegarde manuelle :", error);
    return { success: false, error: error.message || "Erreur inconnue" };
  }
}

export async function checkBackupConfigAction() {
  try {
    const { repo } = await backupService.getCredentials();
    return {
      configured: true,
      repo
    };
  } catch (error: any) {
    return {
      configured: false,
      error: error.message
    };
  }
}

export async function getBackupHistoryAction() {
  try {
    const audits = await prisma.audit.findMany({
      where: { action: "BACKUP" },
      orderBy: { date_creation: "desc" },
      take: 10,
      include: {
        user: true
      }
    });

    return audits.map(a => ({
      id: a.id,
      date: a.date_creation,
      user: a.user.nom,
      details: a.new_value as any
    }));
  } catch (error) {
    console.error("LOG: Erreur lors de la récupération de l'historique des sauvegardes :", error);
    return [];
  }
}
