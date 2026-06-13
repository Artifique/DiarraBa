// src/app/actions/data.ts
"use server"

import prisma from "@/lib/prisma";
import { 
    categorieService, 
    produitService, 
    reservationService, 
    eclosionService, 
    personneService, 
    paiementService, 
    factureService,
    userService,
    notificationService,
    settingsService 
} from "@/lib/services";

// Categorie
export async function getCategoriesAction(page: number, limit: number) {
    return categorieService.getAllCategories(page, limit);
}
export async function countCategoriesAction() { return categorieService.countCategories(); }
export async function createCategorieAction(data: any, userId: string) { return categorieService.createCategorie(data, userId); }
export async function updateCategorieAction(id: string, data: any, userId: string) { return categorieService.updateCategorie(id, data, userId); }
export async function deleteCategorieAction(id: string, userId: string) { return categorieService.deleteCategorie(id, userId); }

// Produit
export async function getProduitsAction(page: number, limit: number) { return produitService.getAllProduits(page, limit); }
export async function countProduitsAction() { return produitService.countProduits(); }
export async function createProduitAction(data: any, userId: string) { return produitService.createProduit(data, userId); }
export async function updateProduitAction(id: string, data: any, userId: string) { return produitService.updateProduit(id, data, userId); }
export async function deleteProduitAction(id: string, userId: string) { return produitService.deleteProduit(id, userId); }

// Personne
export async function getFournisseursAction() { return personneService.getFournisseurs(); }
export async function getClientsAction() { return personneService.getClients(); }

// Reservation
export async function createReservationAction(data: any, userId: string) {
    // 1. Trouver ou créer le client par téléphone
    const tel = data.clientTel;
    let client = await prisma.personne.findUnique({ where: { telephone: tel } });
    
    if (!client) {
        client = await prisma.personne.create({
            data: {
                type: "Client",
                nom: data.clientNom || null, // Nom optionnel
                telephone: tel,
            }
        });
    } else if (data.clientNom && !client.nom) {
        // Mise à jour optionnelle du nom si le client existait sans nom
        client = await prisma.personne.update({
            where: { id: client.id },
            data: { nom: data.clientNom }
        });
    }
    
    // 2. Préparer les données pour Reservation (sans les champs temporaires)
    const { clientNom, clientTel, clientId, ...reservationData } = data;
    
    // 3. Créer la réservation en utilisant l'ID récupéré ou créé
    return reservationService.createReservation({
        ...reservationData,
        clientId: client.id
    }, userId);
}
export async function updateReservationAction(id: string, data: any, userId: string) { return reservationService.updateReservation(id, data, userId); }
export async function addLigneReservationAction(data: any, userId: string) { return reservationService.addLigneReservation(data, userId); }
export async function deleteReservationAction(id: string, userId: string) { return reservationService.deleteReservation(id, userId); }
export async function getReservationsAction() { return reservationService.getAllReservations(); }

// Paiement
export async function createPaiementAction(data: any, userId: string) {
    console.log("DEBUG: Données de paiement reçues :", data);
    try {
        const result = await paiementService.createPaiement(data, userId);
        return result;
    } catch (e) {
        console.error("DEBUG: Erreur dans paiementService :", e);
        throw e;
    }
}

// Facture
export async function createFactureAction(data: any, userId: string) { return factureService.createFacture(data, userId); }

// Notifications
export async function getNonLuesAction(userId: string) { 
    try {
        return await notificationService.getNonLues(userId);
    } catch (e) {
        console.error("Erreur récupération notifications:", e);
        return [];
    }
}
export async function markAsReadAction(id: string) { return notificationService.markAsRead(id); }
export async function markAllAsReadAction(userId: string) { return notificationService.markAllAsRead(userId); }
export async function deleteNotifAction(id: string) { return notificationService.delete(id); }
export async function checkAndGenerateNotificationsAction(userId: string) { return notificationService.checkAndGenerateNotifications(userId); }

// Eclosion
export async function getEclosionsAction(page: number, limit: number) { return eclosionService.getAllEclosions(page, limit); }
export async function countEclosionsAction() { return eclosionService.countEclosions(); }
export async function createEclosionAction(data: any, userId: string) { return eclosionService.createEclosion(data, userId); }
export async function updateEclosionAction(id: string, data: any, userId: string) { return eclosionService.updateEclosion(id, data, userId); }
export async function deleteEclosionAction(id: string, userId: string) { return eclosionService.deleteEclosion(id, userId); }

// Settings
export async function getAllSettingsAction() { return settingsService.getAllSettings(); }
export async function createSettingAction(data: any, userId: string) { return settingsService.createSetting(data, userId); }
export async function updateSettingAction(id: string, data: any, userId: string) { return settingsService.updateSetting(id, data, userId); }

// User
export async function getAllUsersAction(page: number, limit: number) { return userService.getAllUsers(page, limit); }
export async function countUsersAction() { return userService.countUsers(); }
export async function createUserAction(data: any) { return userService.createUser(data); }
export async function updateUserAction(id: string, data: any) { return userService.updateUser(id, data); }
export async function deleteUserAction(id: string) { return userService.deleteUser(id); }
export async function updatePasswordAction(id: string, currentPassword: string, newPassword: string) { return userService.updatePassword(id, currentPassword, newPassword); }

export async function getCurrentUserAction(id: string) { return userService.getUserById(id); }

// Dashboard
import { dashboardService } from "@/lib/services/dashboard.service";
export async function getDashboardDataAction() {
    const [globalStats, distribution, history, recentActivities] = await Promise.all([
        dashboardService.getGlobalStats(),
        dashboardService.getProductDistribution(),
        dashboardService.getRevenueHistory(),
        dashboardService.getRecentActivities()
    ]);
    return { globalStats, distribution, history, recentActivities };
}
export async function getGlobalStatsAction() { return dashboardService.getGlobalStats(); }
export async function getDashboardChartDataAction(mode: 'week' | 'month' | 'year', year?: number, month?: number) {
    return dashboardService.getChartData(mode, { year, month });
}
