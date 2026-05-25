// prisma/seed.ts
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma/index.js';
import { userService } from '../src/lib/services/user.service.js';
async function main() {
    const adminEmail = "diarraba@gmail.com";
    const adminPassword = "Admin123!";
    const adminRole = "admin"; // Assurez-vous que le rôle correspond à votre schéma Prisma
    // Vérifier si l'administrateur existe déjà
    const existingAdmin = await userService.getUserByEmail(adminEmail);
    if (existingAdmin) {
        console.log(`L'administrateur avec l'email ${adminEmail} existe déjà. Saut de la création.`);
        return;
    }
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 10); // 10 est le nombre de rounds de salage
    // Créer l'administrateur
    const newAdmin = await userService.createUser({
        nom: "Admin par défaut",
        email: adminEmail,
        password: hashedPassword,
        telephone: "00000000", // Un numéro de téléphone par défaut
        role: adminRole,
    });
    console.log(`Administrateur par défaut créé :`, newAdmin);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
