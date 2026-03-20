import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@avg.com";
  const adminPassword = "admin123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        employee: {
          create: {
            fullName: "System Admin",
            position: "Administrator",
            dailySalary: 450,
            lateDeduction: 100,
          },
        },
      },
    });

    console.log("Admin account created.");
  } else {
    console.log("Admin account already exists.");
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });