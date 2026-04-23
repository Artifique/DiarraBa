// filepath: src/lib/models/fournisseur.model.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { Fournisseur } from "@/types/database";

export class FournisseurModel {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Fournisseur[]> {
    const { data, error } = await this.supabase
      .from("fournisseurs")
      .select("*")
      .order("date_inscription", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération fournisseurs: ${error.message}`);
    return data || [];
  }

  async findById(id: string): Promise<Fournisseur | null> {
    const { data, error } = await this.supabase
      .from("fournisseurs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Erreur récupération fournisseur: ${error.message}`);
    }
    return data;
  }

  async create(
    fournisseur: Omit<
      Fournisseur,
      "id" | "date_inscription" | "date_modification"
    >,
  ): Promise<Fournisseur> {
    const { data, error } = await this.supabase
      .from("fournisseurs")
      .insert(fournisseur)
      .select()
      .single();

    if (error) throw new Error(`Erreur création fournisseur: ${error.message}`);
    return data;
  }

  async update(
    id: string,
    updates: Partial<Omit<Fournisseur, "id" | "date_inscription">>,
  ): Promise<Fournisseur> {
    const { data, error } = await this.supabase
      .from("fournisseurs")
      .update({ ...updates, date_modification: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error)
      throw new Error(`Erreur mise à jour fournisseur: ${error.message}`);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("fournisseurs")
      .update({ actif: false })
      .eq("id", id);

    if (error)
      throw new Error(`Erreur suppression fournisseur: ${error.message}`);
  }

  async search(query: string): Promise<Fournisseur[]> {
    const { data, error } = await this.supabase
      .from("fournisseurs")
      .select("*")
      .or(`nom.ilike.%${query}%,telephone.ilike.%${query}%`)
      .order("nom");

    if (error)
      throw new Error(`Erreur recherche fournisseurs: ${error.message}`);
    return data || [];
  }
}
