// src/lib/services/user.service.ts
import prisma from "@/lib/prisma";
import { User, Prisma } from "../../generated/prisma/index";
import bcrypt from "bcryptjs"; // Importation de bcryptjs

export const userService = {
  async getAllUsers(page: number = 1, limit: number = 10): Promise<User[]> {
    const skip = (page - 1) * limit;
    return prisma.user.findMany({
      orderBy: { nom: "asc" },
      skip,
      take: limit,
    });
  },

  async countUsers(): Promise<number> {
    return prisma.user.count();
  },

  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async getUserByEmail(email: string): Promise<User | null> {
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

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10); // Hacher le mot de passe
    return prisma.user.create({
      data: {
        nom: data.nom,
        email: data.email,
        password: hashedPassword, // Utiliser le mot de passe haché
        telephone: data.telephone,
        role: data.role || "gerant",
      },
    });
  },

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: data,
    });
  },

  async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  },
};