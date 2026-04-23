// filepath: src/lib/models/audit.model.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { AuditLog } from "@/types/database";

export class AuditModel {
  constructor(private supabase: SupabaseClient) {}

  async findAll(limit = 100): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from("audit_logs")
      .select("*")
      .order("date_action", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Erreur récupération audit: ${error.message}`);
    return data || [];
  }

  async findById(id: string): Promise<AuditLog | null> {
    const { data, error } = await this.supabase
      .from("audit_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Erreur récupération log: ${error.message}`);
    }
    return data;
  }

  async findByManager(managerId: string, limit = 50): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from("audit_logs")
      .select("*")
      .eq("manager_id", managerId)
      .order("date_action", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Erreur récupération audit: ${error.message}`);
    return data || [];
  }

  async findByEntite(entite: string, entiteId: string): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from("audit_logs")
      .select("*")
      .eq("entite", entite)
      .eq("entite_id", entiteId)
      .order("date_action", { ascending: false });

    if (error) throw new Error(`Erreur récupération audit: ${error.message}`);
    return data || [];
  }

  async findByAction(action: string, limit = 50): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from("audit_logs")
      .select("*")
      .eq("action", action)
      .order("date_action", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Erreur récupération audit: ${error.message}`);
    return data || [];
  }

  async create(log: Omit<AuditLog, "id" | "date_action">): Promise<AuditLog> {
    const { data, error } = await this.supabase
      .from("audit_logs")
      .insert(log)
      .select()
      .single();

    if (error) throw new Error(`Erreur création log: ${error.message}`);
    return data;
  }

  async getRecentActivity(days = 7): Promise<AuditLog[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const { data, error } = await this.supabase
      .from("audit_logs")
      .select("*")
      .gte("date_action", date.toISOString())
      .order("date_action", { ascending: false });

    if (error) throw new Error(`Erreur récupération audit: ${error.message}`);
    return data || [];
  }
}
