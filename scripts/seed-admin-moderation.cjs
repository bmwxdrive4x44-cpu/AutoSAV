const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const request = await prisma.productRequest.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  const agent = await prisma.user.findFirst({
    where: { role: 'AGENT_BUYER' },
    orderBy: { createdAt: 'asc' },
  });

  if (!request || !agent) {
    console.log('No eligible request or agent found.');
    return;
  }

  const suspiciousReason = 'Seed moderation: suspicious request';
  const abusiveReason = 'Seed moderation: abusive offer';

  await prisma.productRequest.update({
    where: { id: request.id },
    data: {
      isSuspicious: true,
      suspiciousReason,
      markedAsScam: false,
      scamReason: null,
      scamMarkedAt: null,
    },
  });

  const targetPrice = Math.max(request.budget * 4, request.budget + 10000);

  const existingOffer = await prisma.offer.findFirst({
    where: {
      requestId: request.id,
      providerId: agent.id,
      deletedAt: null,
    },
  });

  let offerId;

  if (existingOffer) {
    const updated = await prisma.offer.update({
      where: { id: existingOffer.id },
      data: {
        price: targetPrice,
        estimatedDeliveryDays: 30,
        isSuspicious: true,
        suspiciousReason: 'Seed moderation: extreme price',
        isReportedAsAbuse: true,
        abuseReason: abusiveReason,
        abuseReportedAt: new Date(),
      },
    });
    offerId = updated.id;
    console.log('Updated existing offer for moderation tests.');
  } else {
    const created = await prisma.offer.create({
      data: {
        requestId: request.id,
        providerId: agent.id,
        price: targetPrice,
        estimatedDeliveryDays: 30,
        message: 'Seed moderation offer for admin tests',
        isSuspicious: true,
        suspiciousReason: 'Seed moderation: extreme price',
        isReportedAsAbuse: true,
        abuseReason: abusiveReason,
        abuseReportedAt: new Date(),
      },
    });
    offerId = created.id;
    console.log('Created moderation offer seed.');
  }

  console.log('Moderation seed ready:');
  console.log(`- Request: ${request.id}`);
  console.log(`- Offer:   ${offerId}`);
  console.log(`- Agent:   ${agent.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

