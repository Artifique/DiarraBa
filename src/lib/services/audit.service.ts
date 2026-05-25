// filepath: src/lib/services/audit.service.ts
import prisma from "@/lib/prisma";
import { Audit } from "../../generated/prisma/index"; // Correction du chemin relatif

export const auditService = {
  async getAll(limit = 100): Promise<Audit[]> {
    return prisma.audit.findMany({ take: limit });
  },

  async getById(id: string): Promise<Audit | null> {
    return prisma.audit.findUnique({ where: { id } });
  },

  async getByManager(userId: string, limit = 50): Promise<Audit[]> {
    return prisma.audit.findMany({
      where: { userId },
      take: limit,
      orderBy: { date_creation: "desc" },
    });
  },

  async getByEntite(entity_type: string, entity_id: string): Promise<Audit[]> {
    return prisma.audit.findMany({
      where: { entity_type, entity_id },
      orderBy: { date_creation: "desc" },
    });
  },

  async getByAction(action: string, limit = 50): Promise<Audit[]> {
    return prisma.audit.findMany({
      where: { action },
      take: limit,
      orderBy: { date_creation: "desc" },
    });
  },

  async getRecentActivity(days = 7): Promise<Audit[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    return prisma.audit.findMany({
      where: {
        date_creation: {
          gte: dateThreshold,
        },
      },
      orderBy: { date_creation: "desc" },
    });
  },

  async log(data: {
    userId: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_value?: any;
    new_value?: any;
    ip_address?: string;
    user_agent?: string;
  }): Promise<Audit> {
    return prisma.audit.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        old_value: data.old_value,
        new_value: data.new_value,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      },
    });
  },
};
