import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log("=== Password Reset Tool ===\n");

  const username = await askQuestion("Enter new username: ");
  const password = await askQuestion("Enter new password: ");
  const confirmPassword = await askQuestion("Confirm new password: ");

  if (!username || !password) {
    console.error("Error: Username and password are required.");
    process.exit(1);
  }

  if (password !== confirmPassword) {
    console.error("Error: Passwords do not match.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Error: Password must be at least 8 characters.");
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    // Upsert: update if exists, create if not
    await prisma.adminUser.upsert({
      where: { username },
      update: { password: hashedPassword },
      create: {
        username,
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log(`\nSuccess: Admin user "${username}" has been updated.`);
  } catch (error) {
    console.error("Error updating admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();