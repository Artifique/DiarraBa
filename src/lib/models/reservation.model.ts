// filepath: src/lib/models/reservation.model.ts
import { SupabaseClient } from "@supabase/supabase-js";
import {
  Reservation,
  ReservationVolaille,
  ReservationCouveuse,
  StatutReservation,
} from "@/types/database";

export class ReservationModel {
  constructor(private supabase: SupabaseClient) {}

  async findAllWithDetails(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("reservations")
      .select(`
        *,
        clients (nom, telephone),
        livraisons (lieu),
        reservation_volailles (
          quantite,
          prix_unitaire,
          volailles (type)
        ),
        reservation_couveuses (
          date_debut,
          date_fin,
          prix_total,
          couveuses (modele)
        )
      `)
      .order("date_reservation", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération reservations détaillées: ${error.message}`);
    return data || [];
  }

  async findAll(): Promise<Reservation[]> {
    const { data, error } = await this.supabase
      .from("reservations")
      .select("*")
      .order("date_reservation", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération reservations: ${error.message}`);
    return data || [];
  }

  async findById(id: string): Promise<Reservation | null> {
    const { data, error } = await this.supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Erreur récupération reservation: ${error.message}`);
    }
    return data;
  }

  async findByClient(clientId: string): Promise<Reservation[]> {
    const { data, error } = await this.supabase
      .from("reservations")
      .select("*")
      .eq("client_id", clientId)
      .order("date_reservation", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération reservations: ${error.message}`);
    return data || [];
  }

  async findByStatut(statut: StatutReservation): Promise<Reservation[]> {
    const { data, error } = await this.supabase
      .from("reservations")
      .select("*")
      .eq("statut_reservation", statut)
      .order("date_reservation", { ascending: false });

    if (error)
      throw new Error(`Erreur récupération reservations: ${error.message}`);
    return data || [];
  }

  async create(
    reservation: Omit<Reservation, "id" | "date_modification">,
  ): Promise<Reservation> {
    const { data, error } = await this.supabase
      .from("reservations")
      .insert(reservation)
      .select()
      .single();

    if (error) throw new Error(`Erreur création reservation: ${error.message}`);
    return data;
  }

  async update(
    id: string,
    updates: Partial<Omit<Reservation, "id">>,
  ): Promise<Reservation> {
    const { data, error } = await this.supabase
      .from("reservations")
      .update({ ...updates, date_modification: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error)
      throw new Error(`Erreur mise à jour reservation: ${error.message}`);
    return data;
  }

  async updateStatut(
    id: string,
    statut: StatutReservation,
  ): Promise<Reservation> {
    return this.update(id, { statut_reservation: statut });
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("reservations")
      .update({ statut_reservation: "Annulee" as StatutReservation })
      .eq("id", id);

    if (error)
      throw new Error(`Erreur annulation reservation: ${error.message}`);
  }

  // === Réservation Volailles ===
  async getVolailles(reservationId: string): Promise<ReservationVolaille[]> {
    const { data, error } = await this.supabase
      .from("reservation_volailles")
      .select("*")
      .eq("reservation_id", reservationId);

    if (error)
      throw new Error(`Erreur récupération volailles: ${error.message}`);
    return data || [];
  }

  async addVolaille(
    item: Omit<ReservationVolaille, "id" | "date_ajout">,
  ): Promise<ReservationVolaille> {
    const { data, error } = await this.supabase
      .from("reservation_volailles")
      .insert(item)
      .select()
      .single();

    if (error) throw new Error(`Erreur ajout volaille: ${error.message}`);
    return data;
  }

  async removeVolaille(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("reservation_volailles")
      .delete()
      .eq("id", id);

    if (error) throw new Error(`Erreur suppression volaille: ${error.message}`);
  }

  // === Réservation Couveuses ===
  async getCouveuses(reservationId: string): Promise<ReservationCouveuse[]> {
    const { data, error } = await this.supabase
      .from("reservation_couveuses")
      .select("*")
      .eq("reservation_id", reservationId);

    if (error)
      throw new Error(`Erreur récupération couveuses: ${error.message}`);
    return data || [];
  }

  async addCouveuse(
    item: Omit<ReservationCouveuse, "id" | "date_ajout">,
  ): Promise<ReservationCouveuse> {
    const { data, error } = await this.supabase
      .from("reservation_couveuses")
      .insert(item)
      .select()
      .single();

    if (error) throw new Error(`Erreur ajout couveuse: ${error.message}`);
    return data;
  }

  async removeCouveuse(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("reservation_couveuses")
      .delete()
      .eq("id", id);

    if (error) throw new Error(`Erreur suppression couveuse: ${error.message}`);
  }
}
