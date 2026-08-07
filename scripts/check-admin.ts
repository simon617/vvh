import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.adminUser.count();
  const users = await prisma.adminUser.findMany();
  console.log("AdminUser count:", count);
  console.log("AdminUsers:", JSON.stringify(users, null, 2));
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });