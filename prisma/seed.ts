import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { userService } from '@/lib/services/user.service';

async function main() {
  const adminEmail = "diarraba@gmail.com";
  const adminPassword = "Admin123!";
  const adminRole = "admin";

  // Vérifier si l'administrateur existe déjà
  const existingAdmin = await userService.getUserByEmail(adminEmail);
  if (existingAdmin) {
    console.log(`L'administrateur avec l'email ${adminEmail} existe déjà. Saut de la création.`);
    return;
  }

  // Hacher le mot de passe
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Créer l'administrateur
  const newAdmin = await userService.createUser({
    nom: "Admin par défaut",
    email: adminEmail,
    password: hashedPassword,
    telephone: "00000000",
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
