// filepath: src/lib/models/paiement.model.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { Paiement, MethodePaiement, StatutPaiement } from "@/types/database";

export class PaiementModel {
  constructor(private supabase: SupabaseClient) {}

  async findAllWithDetails(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("paiements")
      .select(`
        *,
        reservations (
          clients (id, nom)
        )
      `)
      .order("date_paiement", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération paiements détaillées: ${error.message}`);
    return data || [];
  }

  async findAll(): Promise<Paiement[]> {
    const { data, error } = await this.supabase
      .from("paiements")
      .select("*")
      .order("date_paiement", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération paiements: ${error.message}`);
    return data || [];
  }


  async findById(id: string): Promise<Paiement | null> {
    const { data, error } = await this.supabase
      .from("paiements")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Erreur récupération paiement: ${error.message}`);
    }
    return data;
  }

  async findByReservation(reservationId: string): Promise<Paiement[]> {
    const { data, error } = await this.supabase
      .from("paiements")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("date_paiement", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération paiements: ${error.message}`);
    return data || [];
  }

  async findByStatut(statut: StatutPaiement): Promise<Paiement[]> {
    const { data, error } = await this.supabase
      .from("paiements")
      .select("*")
      .eq("statut", statut)
      .order("date_paiement", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération paiements: ${error.message}`);
    return data || [];
  }

  async create(
    paiement: Omit<Paiement, "id" | "date_modification">,
  ): Promise<Paiement> {
    const { data, error } = await this.supabase
      .from("paiements")
      .insert(paiement)
      .select()
      .single();

    if (error) throw new Error(`Erreur création paiement: ${error.message}`);
    return data;
  }

  async update(
    id: string,
    updates: Partial<Omit<Paiement, "id">>,
  ): Promise<Paiement> {
    const { data, error } = await this.supabase
      .from("paiements")
      .update({ ...updates, date_modification: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Erreur mise à jour paiement: ${error.message}`);
    return data;
  }

  async updateStatut(id: string, statut: StatutPaiement): Promise<Paiement> {
    return this.update(id, { statut });
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("paiements")
      .delete()
      .eq("id", id);

    if (error) throw new Error(`Erreur suppression paiement: ${error.message}`);
  }

  async getTotalPaye(reservationId: string): Promise<number> {
    const paiements = await this.findByReservation(reservationId);
    return paiements
      .filter((p) => p.statut === "Completed")
      .reduce((sum, p) => sum + p.montant, 0);
  }
}
