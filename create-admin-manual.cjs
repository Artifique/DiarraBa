// create-admin-manual.cjs
const prisma = require('./src/lib/prisma').default;
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
  const adminEmail = "diarraba@gmail.com";
  const adminPassword = "Admin123!";
  const adminRole = "admin";

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (existingAdmin) {
      console.log(`L'administrateur avec l'email ${adminEmail} existe déjà.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const newAdmin = await prisma.user.create({
      data: {
        nom: "Admin par défaut",
        email: adminEmail,
        password: hashedPassword,
        telephone: "00000000",
        role: adminRole,
      },
    });

    console.log(`Administrateur par défaut créé :`, newAdmin);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
