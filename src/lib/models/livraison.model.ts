// filepath: src/lib/models/livraison.model.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { Livraison, StatutLivraison } from "@/types/database";

export class LivraisonModel {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Livraison[]> {
    const { data, error } = await this.supabase
      .from("livraisons")
      .select("*")
      .order("date_creation", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération livraisons: ${error.message}`);
    return data || [];
  }

  async findById(id: string): Promise<Livraison | null> {
    const { data, error } = await this.supabase
      .from("livraisons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Erreur récupération livraison: ${error.message}`);
    }
    return data;
  }

  async findByReservation(reservationId: string): Promise<Livraison[]> {
    const { data, error } = await this.supabase
      .from("livraisons")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("date_creation", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération livraisons: ${error.message}`);
    return data || [];
  }

  async findByStatut(statut: StatutLivraison): Promise<Livraison[]> {
    const { data, error } = await this.supabase
      .from("livraisons")
      .select("*")
      .eq("statut", statut)
      .order("date_livraison", { ascending: true });

    if (error)
      throw new Error(`Erreur récupération livraisons: ${error.message}`);
    return data || [];
  }

  async create(
    livraison: Omit<Livraison, "id" | "date_creation" | "date_modification">,
  ): Promise<Livraison> {
    const { data, error } = await this.supabase
      .from("livraisons")
      .insert(livraison)
      .select()
      .single();

    if (error) throw new Error(`Erreur création livraison: ${error.message}`);
    return data;
  }

  async update(
    id: string,
    updates: Partial<Omit<Livraison, "id" | "date_creation">>,
  ): Promise<Livraison> {
    const { data, error } = await this.supabase
      .from("livraisons")
      .update({ ...updates, date_modification: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error)
      throw new Error(`Erreur mise à jour livraison: ${error.message}`);
    return data;
  }

  async updateStatut(id: string, statut: StatutLivraison): Promise<Livraison> {
    return this.update(id, { statut });
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("livraisons")
      .update({ statut: "Annulee" as StatutLivraison })
      .eq("id", id);

    if (error) throw new Error(`Erreur annulation livraison: ${error.message}`);
  }

  async getPlanifiees(): Promise<Livraison[]> {
    const { data, error } = await this.supabase
      .from("livraisons")
      .select("*")
      .in("statut", ["Planifiee", "EnCours"])
      .order("date_livraison", { ascending: true });

    if (error)
      throw new Error(`Erreur récupération livraisons: ${error.message}`);
    return data || [];
  }
}
