// src/app/api/backup/route.ts
import { NextResponse } from "next/server";
import { backupService } from "@/lib/services/backup.service";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const secretParam = searchParams.get("secret");
    
    const cronSecret = process.env.CRON_SECRET;

    // Validation de la sécurité
    if (cronSecret) {
      const expectedAuth = `Bearer ${cronSecret}`;
      if (authHeader !== expectedAuth && secretParam !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Récupérer un gérant/administrateur valide pour l'audit log
    const systemUser = await prisma.user.findFirst({
      where: { role: "admin" }
    }) || await prisma.user.findFirst();

    if (!systemUser) {
      return NextResponse.json({ error: "No user found in database to associate with backup audit log" }, { status: 500 });
    }

    // Exécuter la sauvegarde
    const result = await backupService.executeBackup(systemUser.id);

    return NextResponse.json({
      message: "Backup completed successfully",
      ...result
    });
  } catch (error: any) {
    console.error("LOG: Erreur lors de la sauvegarde automatique (API) :", error);
    return NextResponse.json({
      error: "Backup failed",
      details: error.message || error
    }, { status: 500 });
  }
}
