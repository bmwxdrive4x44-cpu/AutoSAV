import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'admin@dzmarket.com' },
    data: { role: 'CLIENT' },
  });
  console.log('Rôle modifié en CLIENT');
}

main().finally(() => prisma.$disconnect());
