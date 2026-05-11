import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const allRequests = await prisma.productRequest.findMany({
    where: {},
    include: {
      client: {
        select: { id: true, name: true, email: true, isBlocked: true },
      },
      offers: {
        select: { id: true, price: true, agentBuyerId: true },
      },
      acceptedOffer: {
        select: { id: true, price: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("\n=== getAllRequests() output ===");
  console.log(`Total: ${allRequests.length}`);
  
  allRequests.forEach((r) => {
    console.log(`  - ID: ${r.id.slice(0, 8)}... | Title: ${r.title} | Status: ${r.status} | Client: ${r.client?.name} | Deleted: ${r.deletedAt ? 'YES' : 'NO'}`);
  });

  const activeCount = allRequests.filter(
    (r) => (r.status === "REQUEST_CREATED" || r.status === "OFFERS_RECEIVED") && !r.deletedAt
  ).length;
  
  console.log(`\nActive requests (REQUEST_CREATED + OFFERS_RECEIVED, not deleted): ${activeCount}`);

  await prisma.$disconnect();
}

main().catch(console.error);
