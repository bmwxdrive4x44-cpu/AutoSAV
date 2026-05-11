const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isBlocked: true }
    });
    console.log('=== Utilisateurs dans la BD ===');
    console.table(users);

    const requests = await prisma.productRequest.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true, clientId: true, status: true }
    });
    console.log('\n=== Demandes non supprimées ===');
    console.table(requests);
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
