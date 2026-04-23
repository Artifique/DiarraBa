// filepath: src/lib/models/facture.model.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { Facture, StatutFacture } from "@/types/database";

export class FactureModel {
  constructor(private supabase: SupabaseClient) {}

  async findAllWithDetails(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("factures")
      .select(`
        *,
        reservations (
          clients (id, nom)
        )
      `)
      .order("date_facture", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération factures détaillées: ${error.message}`);
    return data || [];
  }

  async findAll(): Promise<Facture[]> {
    const { data, error } = await this.supabase
      .from("factures")
      .select("*")
      .order("date_facture", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération factures: ${error.message}`);
    return data || [];
  }

  async findById(id: string): Promise<Facture | null> {
    const { data, error } = await this.supabase
      .from("factures")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Erreur récupération facture: ${error.message}`);
    }
    return data;
  }

  async findByReservation(reservationId: string): Promise<Facture[]> {
    const { data, error } = await this.supabase
      .from("factures")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("date_facture", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération factures: ${error.message}`);
    return data || [];
  }

  async findByStatut(statut: StatutFacture): Promise<Facture[]> {
    const { data, error } = await this.supabase
      .from("factures")
      .select("*")
      .eq("statut", statut)
      .order("date_facture", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération factures: ${error.message}`);
    return data || [];
  }

  async create(
    facture: Omit<Facture, "id" | "date_modification">,
  ): Promise<Facture> {
    const { data, error } = await this.supabase
      .from("factures")
      .insert(facture)
      .select()
      .single();

    if (error) throw new Error(`Erreur création facture: ${error.message}`);
    return data;
  }

  async update(
    id: string,
    updates: Partial<Omit<Facture, "id">>,
  ): Promise<Facture> {
    const { data, error } = await this.supabase
      .from("factures")
      .update({ ...updates, date_modification: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Erreur mise à jour facture: ${error.message}`);
    return data;
  }

  async updateStatut(id: string, statut: StatutFacture): Promise<Facture> {
    return this.update(id, { statut });
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("factures")
      .delete()
      .eq("id", id);

    if (error) throw new Error(`Erreur suppression facture: ${error.message}`);
  }

  async generateNumero(): Promise<string> {
    const annee = new Date().getFullYear();
    const { data } = await this.supabase
      .from("factures")
      .select("numero")
      .like("numero", `FA-${annee}%`)
      .order("numero", { ascending: false })
      .limit(1);

    let numero = 1;
    if (data && data.length > 0) {
      const lastNum = data[0].numero.split("-")[2];
      numero = parseInt(lastNum) + 1;
    }

    return `FA-${annee}-${numero.toString().padStart(4, "0")}`;
  }
}
