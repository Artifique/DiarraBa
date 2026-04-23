import { SupabaseClient } from "@supabase/supabase-js";
import { Manager } from "@/types/database";

export class ManagerModel {
  constructor(private supabase: SupabaseClient) {}

  async findFirst(): Promise<Manager | null> {
    const { data, error } = await this.supabase
      .from("managers")
      .select("*")
      .eq("actif", true)
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Erreur récupération gérant: ${error.message}`);
    }
    return data;
  }

  async update(id: string, updates: Partial<Omit<Manager, "id" | "date_creation">>): Promise<Manager> {
    const { data, error } = await this.supabase
      .from("managers")
      .update({ ...updates, date_modification: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Erreur mise à jour gérant: ${error.message}`);
    return data;
  }
}
