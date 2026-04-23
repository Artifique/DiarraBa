// filepath: src/lib/services/audit.service.ts
import { createClient } from "@/lib/supabase";
import { AuditModel } from "@/lib/models/audit.model";
import { AuditLog } from "@/types/database";

const supabase = createClient();
const auditModel = new AuditModel(supabase);

export const auditService = {
  async getAll(limit = 100): Promise<AuditLog[]> {
    return auditModel.findAll(limit);
  },

  async getById(id: string): Promise<AuditLog | null> {
    return auditModel.findById(id);
  },

  async getByManager(managerId: string, limit = 50): Promise<AuditLog[]> {
    return auditModel.findByManager(managerId, limit);
  },

  async getByEntite(entite: string, entiteId: string): Promise<AuditLog[]> {
    return auditModel.findByEntite(entite, entiteId);
  },

  async getByAction(action: string, limit = 50): Promise<AuditLog[]> {
    return auditModel.findByAction(action, limit);
  },

  async getRecentActivity(days = 7): Promise<AuditLog[]> {
    return auditModel.getRecentActivity(days);
  },

  async log(data: {
    manager_id?: string;
    client_id?: string;
    fournisseur_id?: string;
    action: string;
    entite: string;
    entite_id?: string;
    ancienne_valeur?: string;
    nouvelle_valeur?: string;
  }): Promise<AuditLog> {
    return auditModel.create({
      ...data,
      manager_id: data.manager_id || null,
      client_id: data.client_id || null,
      fournisseur_id: data.fournisseur_id || null,
      entite_id: data.entite_id || null,
      ancienne_valeur: data.ancienne_valeur || null,
      nouvelle_valeur: data.nouvelle_valeur || null,
      adresse_ip: null,
      user_agent: null
    });
  },
};
