import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.productRequest.findMany({
    select: {
      id: true,
      title: true,
      clientId: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("Total requests:", requests.length);
  console.log("\nRequests:");
  console.log(JSON.stringify(requests, null, 2));

  // Check for duplicates
  const grouped = {};
  requests.forEach((r) => {
    const key = `${r.title}|${r.clientId}|${r.status}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  console.log("\n\nGrouped by (title|clientId|status):");
  Object.entries(grouped).forEach(([key, items]) => {
    if (items.length > 1) {
      console.log(`\n⚠️ DUPLICATE: ${key}`);
      console.log(JSON.stringify(items, null, 2));
    }
  });

  await prisma.$disconnect();
}

main().catch(console.error);
