// filepath: src/lib/models/couveuse.model.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { Couveuse } from "@/types/database";

export class CouveuseModel {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Couveuse[]> {
    const { data, error } = await this.supabase
      .from("couveuses")
      .select("*")
      .eq("actif", true)
      .order("date_ajout", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération couveuses: ${error.message}`);
    return data || [];
  }

  async findById(id: string): Promise<Couveuse | null> {
    const { data, error } = await this.supabase
      .from("couveuses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Erreur récupération couveuse: ${error.message}`);
    }
    return data;
  }

  async findDisponibles(): Promise<Couveuse[]> {
    const { data, error } = await this.supabase
      .from("couveuses")
      .select("*")
      .eq("actif", true)
      .eq("disponible", true)
      .order("modele");

    if (error)
      throw new Error(`Erreur récupération couveuses: ${error.message}`);
    return data || [];
  }

  async findByFournisseur(fournisseurId: string): Promise<Couveuse[]> {
    const { data, error } = await this.supabase
      .from("couveuses")
      .select("*")
      .eq("fournisseur_id", fournisseurId)
      .eq("actif", true)
      .order("modele");

    if (error)
      throw new Error(`Erreur récupération couveuses: ${error.message}`);
    return data || [];
  }

  async create(
    couveuse: Omit<Couveuse, "id" | "date_ajout" | "date_modification">,
  ): Promise<Couveuse> {
    const { data, error } = await this.supabase
      .from("couveuses")
      .insert(couveuse)
      .select()
      .single();

    if (error) throw new Error(`Erreur création couveuse: ${error.message}`);
    return data;
  }

  async update(
    id: string,
    updates: Partial<Omit<Couveuse, "id" | "date_ajout">>,
  ): Promise<Couveuse> {
    const { data, error } = await this.supabase
      .from("couveuses")
      .update({ ...updates, date_modification: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Erreur mise à jour couveuse: ${error.message}`);
    return data;
  }

  async setDisponibilite(id: string, disponible: boolean): Promise<Couveuse> {
    return this.update(id, { disponible });
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("couveuses")
      .update({ actif: false })
      .eq("id", id);

    if (error) throw new Error(`Erreur suppression couveuse: ${error.message}`);
  }
}
