// filepath: src/lib/models/volaille.model.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { Volaille, VolailleType } from "@/types/database";

export class VolailleModel {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Volaille[]> {
    const { data, error } = await this.supabase
      .from("volailles")
      .select("*")
      .eq("actif", true)
      .order("date_ajout", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération volailles: ${error.message}`);
    return data || [];
  }

  async findById(id: string): Promise<Volaille | null> {
    const { data, error } = await this.supabase
      .from("volailles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Erreur récupération volaille: ${error.message}`);
    }
    return data;
  }

  async findByFournisseur(fournisseurId: string): Promise<Volaille[]> {
    const { data, error } = await this.supabase
      .from("volailles")
      .select("*")
      .eq("fournisseur_id", fournisseurId)
      .eq("actif", true)
      .order("type");

    if (error)
      throw new Error(`Erreur récupération volailles: ${error.message}`);
    return data || [];
  }

  async findByType(type: VolailleType): Promise<Volaille[]> {
    const { data, error } = await this.supabase
      .from("volailles")
      .select("*")
      .eq("type", type)
      .eq("actif", true)
      .gt("quantite_disponible", 0)
      .order("prix_unitaire");

    if (error)
      throw new Error(`Erreur récupération volailles: ${error.message}`);
    return data || [];
  }

  async create(
    volaille: Omit<Volaille, "id" | "date_ajout" | "date_modification">,
  ): Promise<Volaille> {
    const { data, error } = await this.supabase
      .from("volailles")
      .insert(volaille)
      .select()
      .single();

    if (error) throw new Error(`Erreur création volaille: ${error.message}`);
    return data;
  }

  async update(
    id: string,
    updates: Partial<Omit<Volaille, "id" | "date_ajout">>,
  ): Promise<Volaille> {
    const { data, error } = await this.supabase
      .from("volailles")
      .update({ ...updates, date_modification: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Erreur mise à jour volaille: ${error.message}`);
    return data;
  }

  async updateQuantite(id: string, quantite: number): Promise<Volaille> {
    return this.update(id, { quantite_disponible: quantite });
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("volailles")
      .update({ actif: false })
      .eq("id", id);

    if (error) throw new Error(`Erreur suppression volaille: ${error.message}`);
  }

  async getDisponibles(): Promise<Volaille[]> {
    const { data, error } = await this.supabase
      .from("volailles")
      .select("*")
      .eq("actif", true)
      .gt("quantite_disponible", 0)
      .order("type");

    if (error)
      throw new Error(`Erreur récupération volailles: ${error.message}`);
    return data || [];
  }
}
