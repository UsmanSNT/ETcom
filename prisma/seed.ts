import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@newhomepage.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin1234!";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "Admin", role: "admin" },
  });

  await prisma.promotionCategory.upsert({
    where: { slug: "news" },
    update: {},
    create: { slug: "news", nameKo: "뉴스", nameEn: "News", order: 0 },
  });

  console.log(`Seeded admin user: ${email} / ${password}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
