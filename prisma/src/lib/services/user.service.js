// src/lib/services/user.service.ts
import prisma from "@/lib/prisma";
export const userService = {
    async getAllUsers() {
        return prisma.user.findMany({
            select: {
                id: true,
                nom: true,
                email: true,
                telephone: true,
                role: true,
                date_creation: true,
                date_modification: true,
            },
            orderBy: { nom: "asc" },
        });
    },
    async getUserById(id) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                nom: true,
                email: true,
                telephone: true,
                role: true,
                date_creation: true,
                date_modification: true,
            },
        });
    },
    async getUserByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                nom: true,
                email: true,
                telephone: true,
                role: true,
                date_creation: true,
                date_modification: true,
                password: true, // Inclut le mot de passe pour l'authentification future
            },
        });
    },
    async createUser(data) {
        // IMPORTANT: Le mot de passe ne doit PAS être stocké en clair en production.
        // Il doit être haché avant d'être sauvegardé. C'est une simplification temporaire.
        return prisma.user.create({
            data: {
                nom: data.nom,
                email: data.email,
                password: data.password, // NON HACHÉ: À CORRIGER AVEC UNE VRAIE AUTHENTIFICATION
                telephone: data.telephone,
                role: data.role || "gerant",
            },
        });
    },
    async updateUser(id, data) {
        return prisma.user.update({
            where: { id },
            data: data,
        });
    },
    async deleteUser(id) {
        return prisma.user.delete({
            where: { id },
        });
    },
};
