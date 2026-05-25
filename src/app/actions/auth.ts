// src/app/actions/auth.ts
"use server"

import { userService } from "@/lib/services";
import bcrypt from "bcryptjs";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("LOG: Tentative de connexion pour:", email);

  try {
    const user = await userService.getUserByEmail(email);
    
    if (!user || !user.password) {
      console.log("LOG: Utilisateur non trouvé ou mot de passe absent pour:", email);
      return { error: "Utilisateur ou mot de passe incorrect" };
    }
    
    console.log("LOG: Mot de passe fourni (type):", typeof password);
    
    if (!password || typeof password !== 'string') {
      console.log("LOG: Mot de passe non fourni ou invalide");
      return { error: "Mot de passe requis" };
    }

    // EXTRACTION FORCÉE ET SÉCURISÉE
    let storedPassword = "";
    if (Buffer.isBuffer(user.password)) {
        storedPassword = user.password.toString('utf8');
    } else {
        storedPassword = String(user.password);
    }
    
    // Test de comparaison
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    
    if (!isPasswordValid) {
      console.log("LOG: Mot de passe invalide pour:", email);
      return { error: "Utilisateur ou mot de passe incorrect" };
    }
    
    // Retourner les infos utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  } catch (err: any) {
    console.error("LOG: Erreur serveur lors de la connexion :", err);
    return { error: "Erreur serveur: " + err.message };
  }
}
