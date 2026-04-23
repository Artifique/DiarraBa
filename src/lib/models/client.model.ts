// filepath: src/lib/models/client.model.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { Client } from "@/types/database";

export class ClientModel {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from("clients")
      .select("*")
      .order("date_inscription", { ascending: false });

    if (error) throw new Error(`Erreur récupération clients: ${error.message}`);
    return data || [];
  }

  async findById(id: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Erreur récupération client: ${error.message}`);
    }
    return data;
  }

  async create(
    client: Omit<Client, "id" | "date_inscription" | "date_modification">,
  ): Promise<Client> {
    const { data, error } = await this.supabase
      .from("clients")
      .insert(client)
      .select()
      .single();

    if (error) throw new Error(`Erreur création client: ${error.message}`);
    return data;
  }

  async update(
    id: string,
    updates: Partial<Omit<Client, "id" | "date_inscription">>,
  ): Promise<Client> {
    const { data, error } = await this.supabase
      .from("clients")
      .update({ ...updates, date_modification: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Erreur mise à jour client: ${error.message}`);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("clients")
      .update({ actif: false })
      .eq("id", id);

    if (error) throw new Error(`Erreur suppression client: ${error.message}`);
  }

  async search(query: string): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from("clients")
      .select("*")
      .or(
        `nom.ilike.%${query}%,telephone.ilike.%${query}%,email.ilike.%${query}%`,
      )
      .order("nom");

    if (error) throw new Error(`Erreur recherche clients: ${error.message}`);
    return data || [];
  }

  async getSolde(id: string): Promise<number> {
    const client = await this.findById(id);
    return client?.solde || 0;
  }
}
