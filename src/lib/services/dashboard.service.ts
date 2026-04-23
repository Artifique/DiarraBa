import { SupabaseClient } from "@supabase/supabase-js";

export class DashboardService {
  constructor(private supabase: SupabaseClient) {}

  async getGlobalStats() {
    const { data: caData } = await this.supabase
      .from("paiements")
      .select("montant")
      .eq("statut", "Completed");
    
    const totalCA = caData?.reduce((acc, curr) => acc + Number(curr.montant), 0) || 0;

    const { count: volaillesCount } = await this.supabase
      .from("volailles")
      .select("*", { count: 'exact', head: true })
      .eq("actif", true);

    const { count: reservationsCount } = await this.supabase
      .from("reservations")
      .select("*", { count: 'exact', head: true })
      .in("statut_reservation", ["EnAttente", "Confirmee"]);

    const { data: couveusesData } = await this.supabase
      .from("couveuses")
      .select("disponible");
    
    const activeCouveuses = couveusesData?.filter(c => !c.disponible).length || 0;
    const totalCouveuses = couveusesData?.length || 1;
    const occupancyRate = Math.round((activeCouveuses / totalCouveuses) * 100);

    return {
      totalCA,
      volaillesCount: volaillesCount || 0,
      reservationsCount: reservationsCount || 0,
      occupancyRate
    };
  }

  async getPoultryDistribution() {
    const { data, error } = await this.supabase
      .from("volailles")
      .select("type, quantite_disponible")
      .eq("actif", true);

    if (error) throw error;

    const distribution = data.reduce((acc: any, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + curr.quantite_disponible;
      return acc;
    }, {});

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value
    }));
  }

  async getRevenueHistory() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data, error } = await this.supabase
      .from("paiements")
      .select("montant, date_paiement")
      .eq("statut", "Completed")
      .gte("date_paiement", sixMonthsAgo.toISOString())
      .order("date_paiement");

    if (error) throw error;

    // Group by month
    const history = data.reduce((acc: any, curr) => {
      const date = new Date(curr.date_paiement);
      const month = date.toLocaleString('fr-FR', { month: 'short' });
      acc[month] = (acc[month] || 0) + Number(curr.montant);
      return acc;
    }, {});

    return Object.entries(history).map(([name, total]) => ({
      name,
      total
    }));
  }

  async getRecentActivities() {
    const { data, error } = await this.supabase
      .from("reservations")
      .select(`
        id,
        date_reservation,
        prix_total,
        statut_reservation,
        clients (nom)
      `)
      .order("date_reservation", { ascending: false })
      .limit(5);

    if (error) throw error;

    return data.map((res: any) => ({
      id: res.id,
      client: res.clients?.nom || "Client inconnu",
      date: res.date_reservation,
      montant: res.prix_total,
      statut: res.statut_reservation
    }));
  }
}
