import prisma from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/index"; // Pour accéder aux champs et types de Prisma

export const dashboardService = {
  async getGlobalStats() {
    // Calcul du Chiffre d'affaires
    const totalCAResult = await prisma.paiement.aggregate({
      _sum: {
        montant: true,
      },
      where: {
        // Si vous avez un statut pour les paiements réussis, ajoutez-le ici
        // statut: "Completed",
      },
    });
    const totalCA = totalCAResult._sum.montant || 0;

    // Nombre de produits disponibles (anciennement volailles)
    const produitsCount = await prisma.produit.count(); // Pas de champ 'actif' sur Produit dans le schéma actuel

    // Nombre de réservations en cours (statut "EnAttente" ou "Confirmee" si ces statuts existent dans votre logique)
    const reservationsCount = await prisma.reservation.count({
      where: {
        // Statut de réservation basé sur votre logique métier, ici j'assume un champ "statut"
        // Ou en se basant sur la date_finale
        date_finale: {
          gte: new Date(), // Réservations qui ne sont pas encore terminées
        },
      },
    });

    // Nombre de réservations non payées (aucun paiement associé)
    const unpaidReservationsCount = await prisma.reservation.count({
      where: {
        paiements: {
          none: {},
        },
      },
    });

    // Couveuses actives (maintenant Éclosions en cours)
    // Cette logique doit être revue selon ce que "couveuses actives" signifie avec le modèle Eclosion
    // Par exemple, on peut compter les éclosions dont la date de fin est dans le futur
    const activeEclosionsCount = await prisma.eclosion.count({
      where: {
        date_fin_prevue: {
          gte: new Date(),
        },
      },
    });
    // L'occupancyRate de l'ancien système est difficilement traduisible directement ici sans plus de contexte.
    // Je vais le simuler pour l'instant ou le calculer différemment.
    const occupancyRate = 0; // À revoir selon la logique métier d'éclosion


    return {
      totalCA,
      produitsCount: produitsCount || 0, // Ancien nom: volaillesCount
      reservationsCount: reservationsCount || 0,
      unpaidReservationsCount: unpaidReservationsCount || 0,
      occupancyRate,
      activeEclosionsCount, // Nouvelle stat
    };
  },

  async getProductDistribution() { // Ancien nom: getPoultryDistribution
    const distribution = await prisma.produit.groupBy({
      by: ["categorieId"],
      _sum: {
        quantite: true,
      },
      orderBy: {
        categorieId: "asc",
      },
    });

    // Pour obtenir le nom de la catégorie, il faudrait inclure la relation ou faire une requête séparée
    const categories = await prisma.categorie.findMany({
      select: {
        id: true,
        nomCategorie: true,
      },
    });
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.nomCategorie]));

    return distribution.map((item) => ({
      name: categoryMap.get(item.categorieId) || "Catégorie inconnue",
      value: item._sum.quantite || 0,
    }));
  },

  async getRevenueHistory() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const payments = await prisma.paiement.findMany({
      where: {
        date_paiement: {
          gte: sixMonthsAgo,
        },
        // Si vous avez un statut pour les paiements réussis, ajoutez-le ici
        // statut: "Completed",
      },
      select: {
        montant: true,
        date_paiement: true,
      },
      orderBy: {
        date_paiement: "asc",
      },
    });

    const history: { [key: string]: number } = {};
    payments.forEach((p) => {
      const date = new Date(p.date_paiement);
      const month = date.toLocaleString("fr-FR", { month: "short" });
      history[month] = (history[month] || 0) + Number(p.montant);
    });

    return Object.entries(history).map(([name, total]) => ({
      name,
      total,
    }));
  },

  async getChartData(mode: 'week' | 'month' | 'year', options?: { year?: number; month?: number }) {
    const today = new Date();
    
    let startDate = new Date();
    let endDate = new Date();
    
    if (mode === 'week') {
      // Du lundi au dimanche de la semaine en cours
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(today);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
    } else if (mode === 'month') {
      const year = options?.year ?? today.getFullYear();
      const month = options?.month ?? today.getMonth(); // 0-indexed
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 1);
    } else if (mode === 'year') {
      const year = options?.year ?? today.getFullYear();
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    }

    // Récupérer les réservations dans cette plage
    const reservations = await prisma.reservation.findMany({
      where: {
        date_reservation: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        montant_total: true,
        date_reservation: true,
      },
    });

    // Récupérer les éclosions dans cette plage
    const eclosions = await prisma.eclosion.findMany({
      where: {
        date_debut: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        prix: true,
        date_debut: true,
      },
    });

    // Construire le tableau de retour selon le mode
    if (mode === 'week') {
      // 7 jours de Lundi à Dimanche
      const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
      const result = days.map((dayName, index) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + index);
        const dayStart = new Date(d);
        dayStart.setHours(0,0,0,0);
        const dayEnd = new Date(d);
        dayEnd.setDate(d.getDate() + 1);
        dayEnd.setHours(0,0,0,0);

        const resSum = reservations
          .filter(r => {
            const rDate = new Date(r.date_reservation);
            return rDate >= dayStart && rDate < dayEnd;
          })
          .reduce((sum, r) => sum + (r.montant_total || 0), 0);

        const eclSum = eclosions
          .filter(e => {
            const eDate = new Date(e.date_debut);
            return eDate >= dayStart && eDate < dayEnd;
          })
          .reduce((sum, e) => sum + (e.prix || 0), 0);

        return {
          name: dayName,
          reservations: resSum,
          eclosions: eclSum,
          total: resSum + eclSum,
        };
      });
      return result;
    } else if (mode === 'month') {
      // Jours du mois (1 à N)
      const numDays = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      const result = [];
      for (let i = 1; i <= numDays; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth(), i);
        const dayStart = new Date(d);
        dayStart.setHours(0,0,0,0);
        const dayEnd = new Date(d);
        dayEnd.setDate(d.getDate() + 1);
        dayEnd.setHours(0,0,0,0);

        const resSum = reservations
          .filter(r => {
            const rDate = new Date(r.date_reservation);
            return rDate >= dayStart && rDate < dayEnd;
          })
          .reduce((sum, r) => sum + (r.montant_total || 0), 0);

        const eclSum = eclosions
          .filter(e => {
            const eDate = new Date(e.date_debut);
            return eDate >= dayStart && eDate < dayEnd;
          })
          .reduce((sum, e) => sum + (e.prix || 0), 0);

        result.push({
          name: i.toString().padStart(2, '0'),
          reservations: resSum,
          eclosions: eclSum,
          total: resSum + eclSum,
        });
      }
      return result;
    } else {
      // 12 mois de Janvier à Décembre
      const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
      const result = months.map((monthName, index) => {
        const monthStart = new Date(startDate.getFullYear(), index, 1);
        const monthEnd = new Date(startDate.getFullYear(), index + 1, 1);

        const resSum = reservations
          .filter(r => {
            const rDate = new Date(r.date_reservation);
            return rDate >= monthStart && rDate < monthEnd;
          })
          .reduce((sum, r) => sum + (r.montant_total || 0), 0);

        const eclSum = eclosions
          .filter(e => {
            const eDate = new Date(e.date_debut);
            return eDate >= monthStart && eDate < monthEnd;
          })
          .reduce((sum, e) => sum + (e.prix || 0), 0);

        return {
          name: monthName,
          reservations: resSum,
          eclosions: eclSum,
          total: resSum + eclSum,
        };
      });
      return result;
    }
  },

  async getRecentActivities() {
    const reservations = await prisma.reservation.findMany({
      select: {
        id: true,
        date_reservation: true,
        montant_total: true,
        // statut_reservation: true, // Si vous avez un champ statut_reservation dans Reservation
        client: {
          select: {
            nom: true,
          },
        },
      },
      orderBy: {
        date_reservation: "desc",
      },
      take: 5,
    });

    return reservations.map((res: any) => ({ // Le type `any` est temporaire
      id: res.id,
      client: res.client?.nom || "Client inconnu",
      date: res.date_reservation,
      montant: res.montant_total,
      statut: "Confirmee", // Placeholder: à adapter avec le vrai statut si existant
    }));
  },
};
