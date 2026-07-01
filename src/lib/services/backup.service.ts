// src/lib/services/backup.service.ts
import prisma from "@/lib/prisma";
import { auditService } from "./audit.service";

export const backupService = {
  async getCredentials(): Promise<{ pat: string; repo: string }> {
    const pat = process.env.GITHUB_PAT;
    const repo = process.env.GITHUB_REPO || "Artifique/DiarraBa-backups";

    if (!pat) {
      throw new Error("Le jeton d'accès GitHub (GITHUB_PAT) n'est pas configuré dans les variables d'environnement.");
    }
    if (!repo) {
      throw new Error("Le dépôt GitHub (GITHUB_REPO) n'est pas configuré.");
    }

    return { pat, repo };
  },

  async executeBackup(userId: string): Promise<{ success: boolean; filename: string; fileId: string; size: number }> {
    const startTime = Date.now();
    
    // A. Récupérer les identifiants
    const { pat, repo } = await this.getCredentials();
    
    // B. Récupérer les données de la base de données
    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: {
        users: await prisma.user.findMany(),
        personnes: await prisma.personne.findMany(),
        categories: await prisma.categorie.findMany(),
        produits: await prisma.produit.findMany(),
        reservations: await prisma.reservation.findMany(),
        lignesReservation: await prisma.ligneReservation.findMany(),
        paiements: await prisma.paiement.findMany(),
        eclosions: await prisma.eclosion.findMany(),
        factures: await prisma.facture.findMany(),
        notifications: await prisma.notification.findMany(),
        settings: await prisma.setting.findMany(),
        audits: await prisma.audit.findMany({ take: 2000, orderBy: { date_creation: "desc" } }),
      }
    };

    const backupJsonString = JSON.stringify(backupData, null, 2);
    const backupSize = Buffer.byteLength(backupJsonString, "utf8");
    const base64Content = Buffer.from(backupJsonString, "utf8").toString("base64");

    // C. Téléverser sur GitHub
    const now = new Date();
    const dateStr = now.toISOString().replace(/T/, "_").replace(/:/g, "-").split(".")[0];
    const filename = `diarraba_backup_${dateStr}.json`;

    const uploadResponse = await fetch(`https://api.github.com/repos/${repo}/contents/${filename}`, {
      method: "PUT",
      headers: {
        "Authorization": `token ${pat}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "Diarraba-Backup-App"
      },
      body: JSON.stringify({
        message: `Sauvegarde automatique de la base de données : ${filename}`,
        content: base64Content
      })
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`L'upload GitHub a échoué: ${uploadResponse.statusText} - ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    const fileId = uploadResult.content?.sha || filename;

    // D. Gérer la rétention (limite de 30 fichiers)
    try {
      const listResponse = await fetch(`https://api.github.com/repos/${repo}/contents/`, {
        headers: {
          "Authorization": `token ${pat}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "Diarraba-Backup-App"
        }
      });

      if (listResponse.ok) {
        const files = await listResponse.json();
        if (Array.isArray(files)) {
          const backupFiles = files
            .filter(f => f.name.startsWith("diarraba_backup_") && f.name.endsWith(".json"))
            .sort((a, b) => a.name.localeCompare(b.name));

          if (backupFiles.length > 30) {
            const filesToDelete = backupFiles.slice(0, backupFiles.length - 30);
            for (const file of filesToDelete) {
              console.log(`Suppression de l'ancienne sauvegarde sur GitHub : ${file.name} (${file.sha})`);
              await fetch(`https://api.github.com/repos/${repo}/contents/${file.name}`, {
                method: "DELETE",
                headers: {
                  "Authorization": `token ${pat}`,
                  "Accept": "application/vnd.github+json",
                  "X-GitHub-Api-Version": "2022-11-28",
                  "Content-Type": "application/json",
                  "User-Agent": "Diarraba-Backup-App"
                },
                body: JSON.stringify({
                  message: `Nettoyage de l'ancienne sauvegarde : ${file.name}`,
                  sha: file.sha
                })
              });
            }
          }
        }
      }
    } catch (pruningError) {
      console.error("Erreur lors de la suppression de l'ancienne sauvegarde GitHub :", pruningError);
    }

    // E. Logger l'action dans la base de données
    const duration = Date.now() - startTime;
    await auditService.log({
      userId,
      action: "BACKUP",
      entity_type: "Database",
      entity_id: fileId,
      new_value: {
        filename,
        sizeBytes: backupSize,
        durationMs: duration,
        repo
      }
    });

    return {
      success: true,
      filename,
      fileId,
      size: backupSize
    };
  }
};
