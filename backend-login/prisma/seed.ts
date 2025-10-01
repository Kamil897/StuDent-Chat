import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Пароли для теста
  const creatorPassword = await bcrypt.hash("admin123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  // Создатель
  await prisma.user.upsert({
    where: { email: "creator@example.com" },
    update: {},
    create: {
      email: "creator@example.com",
      password: creatorPassword,
      name: "Super Creator",
      role: "creator",
    },
  });

  // Админ
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "First Admin",
      role: "admin",
    },
  });

  console.log("✅ Creator & Admin created:");
  console.log("   Creator -> Email: creator@example.com | Password: admin123");
  console.log("   Admin   -> Email: admin@example.com   | Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
