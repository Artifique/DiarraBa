// filepath: src/lib/models/notification.model.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { Notification, NotificationType } from "@/types/database";

export class NotificationModel {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from("notifications")
      .select("*")
      .order("date_creation", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération notifications: ${error.message}`);
    return data || [];
  }

  async findById(id: string): Promise<Notification | null> {
    const { data, error } = await this.supabase
      .from("notifications")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Erreur récupération notification: ${error.message}`);
    }
    return data;
  }

  async findByManager(managerId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from("notifications")
      .select("*")
      .eq("manager_id", managerId)
      .order("date_creation", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération notifications: ${error.message}`);
    return data || [];
  }

  async findNonLues(managerId?: string): Promise<Notification[]> {
    let query = this.supabase
      .from("notifications")
      .select("*")
      .eq("lue", false);

    if (managerId) {
      query = query.eq("manager_id", managerId);
    }

    const { data, error } = await query.order("date_creation", {
      ascending: false,
    });

    if (error)
      throw new Error(`Erreur récupération notifications: ${error.message}`);
    return data || [];
  }

  async create(
    notification: Omit<Notification, "id" | "date_creation">,
  ): Promise<Notification> {
    const { data, error } = await this.supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error)
      throw new Error(`Erreur création notification: ${error.message}`);
    return data;
  }

  async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await this.supabase
      .from("notifications")
      .update({ lue: true })
      .eq("id", id)
      .select()
      .single();

    if (error)
      throw new Error(`Erreur mise à jour notification: ${error.message}`);
    return data;
  }

  async markAllAsRead(managerId: string): Promise<void> {
    const { error } = await this.supabase
      .from("notifications")
      .update({ lue: true })
      .eq("manager_id", managerId)
      .eq("lue", false);

    if (error)
      throw new Error(`Erreur mise à jour notifications: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error)
      throw new Error(`Erreur suppression notification: ${error.message}`);
  }

  async createMultiple(
    notifications: Omit<Notification, "id" | "date_creation">[],
  ): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from("notifications")
      .insert(notifications)
      .select();

    if (error)
      throw new Error(`Erreur création notifications: ${error.message}`);
    return data || [];
  }
}
