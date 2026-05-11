const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const runId = Date.now();
  const requesterEmail = `smoke.dispute.requester.${runId}@example.com`;
  const providerEmail = `smoke.dispute.provider.${runId}@example.com`;
  const adminEmail = `smoke.dispute.admin.${runId}@example.com`;

  const state = {
    categoryId: null,
    requesterId: null,
    providerId: null,
    adminId: null,
    requestId: null,
    offerId: null,
    transactionId: null,
    disputeId: null,
  };

  try {
    const category = await prisma.category.create({
      data: {
        name: `Smoke Dispute Category ${runId}`,
        slug: `smoke-dispute-category-${runId}`,
        icon: "Scale",
      },
    });
    state.categoryId = category.id;

    const requester = await prisma.user.create({
      data: {
        name: "Smoke Dispute Requester",
        email: requesterEmail,
        password: "smoke-password",
        role: "USER",
      },
    });
    state.requesterId = requester.id;

    const provider = await prisma.user.create({
      data: {
        name: "Smoke Dispute Provider",
        email: providerEmail,
        password: "smoke-password",
        role: "USER",
      },
    });
    state.providerId = provider.id;

    const admin = await prisma.user.create({
      data: {
        name: "Smoke Dispute Admin",
        email: adminEmail,
        password: "smoke-password",
        role: "ADMIN",
      },
    });
    state.adminId = admin.id;

    const request = await prisma.productRequest.create({
      data: {
        title: `Smoke Dispute Request ${runId}`,
        description: "Smoke dispute arbitration validation",
        budget: 22000,
        countryToBuyFrom: "France",
        status: "SHIPPED",
        categoryId: state.categoryId,
        requesterId: state.requesterId,
      },
    });
    state.requestId = request.id;

    const offer = await prisma.offer.create({
      data: {
        price: 23000,
        estimatedDeliveryDays: 10,
        message: "Smoke dispute offer",
        status: "ACCEPTED",
        providerId: state.providerId,
        requestId: state.requestId,
      },
    });
    state.offerId = offer.id;

    await prisma.productRequest.update({
      where: { id: state.requestId },
      data: { acceptedOfferId: state.offerId },
    });

    const transaction = await prisma.transaction.create({
      data: {
        amount: 23000,
        status: "HELD",
        requestId: state.requestId,
        requesterId: state.requesterId,
      },
    });
    state.transactionId = transaction.id;

    const dispute = await prisma.dispute.create({
      data: {
        reason: "Produit non conforme",
        status: "OPEN",
        requestId: state.requestId,
        reportedById: state.requesterId,
      },
    });
    state.disputeId = dispute.id;

    // Simulate admin arbitration: refund requester.
    await prisma.dispute.update({
      where: { id: state.disputeId },
      data: {
        status: "RESOLVED",
        resolution: "ARBITRAGE: remboursement demandeur - smoke test",
        adminId: state.adminId,
      },
    });

    await prisma.transaction.update({
      where: { id: state.transactionId },
      data: { status: "REFUNDED" },
    });

    const [finalDispute, finalTransaction] = await Promise.all([
      prisma.dispute.findUnique({ where: { id: state.disputeId } }),
      prisma.transaction.findUnique({ where: { id: state.transactionId } }),
    ]);

    if (!finalDispute || finalDispute.status !== "RESOLVED") {
      throw new Error("Final dispute status mismatch");
    }
    if (!finalDispute.adminId || finalDispute.adminId !== state.adminId) {
      throw new Error("Final dispute admin assignment mismatch");
    }
    if (!finalTransaction || finalTransaction.status !== "REFUNDED") {
      throw new Error("Final transaction status mismatch");
    }

    console.log("SMOKE_DISPUTE_OK", {
      disputeStatus: finalDispute.status,
      transactionStatus: finalTransaction.status,
      decision: "REFUND_CLIENT",
    });
  } finally {
    if (state.disputeId) {
      await prisma.dispute.deleteMany({ where: { id: state.disputeId } });
    }
    if (state.transactionId) {
      await prisma.transaction.deleteMany({ where: { id: state.transactionId } });
    }
    if (state.offerId) {
      await prisma.offer.deleteMany({ where: { id: state.offerId } });
    }
    if (state.requestId) {
      await prisma.productRequest.deleteMany({ where: { id: state.requestId } });
    }
    if (state.requesterId) {
      await prisma.user.deleteMany({ where: { id: state.requesterId } });
    }
    if (state.providerId) {
      await prisma.user.deleteMany({ where: { id: state.providerId } });
    }
    if (state.adminId) {
      await prisma.user.deleteMany({ where: { id: state.adminId } });
    }
    if (state.categoryId) {
      await prisma.category.deleteMany({ where: { id: state.categoryId } });
    }
  }
}

main()
  .catch((error) => {
    console.error("SMOKE_DISPUTE_FAILED", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
