// src/app/actions/data.ts
"use server"

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
export async function getReservationsAction() { return reservationService.getAllReservations(); }
export async function createReservationAction(data: any, userId: string) { return reservationService.createReservation(data, userId); }
export async function addLigneReservationAction(data: any, userId: string) { return reservationService.addLigneReservation(data, userId); }
export async function deleteReservationAction(id: string, userId: string) { return reservationService.deleteReservation(id, userId); }

// Paiement
export async function createPaiementAction(data: any, userId: string) { return paiementService.createPaiement(data, userId); }

// Facture
export async function createFactureAction(data: any, userId: string) { return factureService.createFacture(data, userId); }

// Notifications
export async function getNonLuesAction(userId: string) { return notificationService.getNonLues(userId); }
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
export async function getSettingByIdAction(id: string) { return settingsService.getSettingById(id); }
export async function createSettingAction(data: any, userId: string) { return settingsService.createSetting(data, userId); }
export async function updateSettingAction(id: string, data: any, userId: string) { return settingsService.updateSetting(id, data, userId); }

// User
export async function getAllUsersAction(page: number, limit: number) { return userService.getAllUsers(page, limit); }
export async function countUsersAction() { return userService.countUsers(); }
export async function createUserAction(data: any) { return userService.createUser(data); }
export async function deleteUserAction(id: string) { return userService.deleteUser(id); }

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
