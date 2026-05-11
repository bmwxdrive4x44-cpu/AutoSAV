import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";


const USER_ROLE_CLIENT = "CLIENT";
const USER_ROLE_AGENT_BUYER = "AGENT_BUYER";
const USER_ROLE_ADMIN = "ADMIN";

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      name: "Admin",
      email: "admin@test.com",
      password: await bcrypt.hash("123456", 10),
      role: USER_ROLE_ADMIN,
    },
    {
      name: "Client",
      email: "client@test.com",
      password: await bcrypt.hash("123456", 10),
      role: USER_ROLE_CLIENT,
    },
    {
      name: "Inter",
      email: "inter@test.com",
      password: await bcrypt.hash("123456", 10),
      role: USER_ROLE_AGENT_BUYER,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log("Utilisateurs seedés !");
}

main().finally(() => prisma.$disconnect());
