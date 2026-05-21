const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const statuses = await prisma.offer.findMany({
      select: { status: true },
      distinct: ['status'],
    });
    console.log("Distinct offer statuses:");
    statuses.forEach(s => console.log(s.status));
  } catch (err) {
    console.error("Error fetching statuses:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
