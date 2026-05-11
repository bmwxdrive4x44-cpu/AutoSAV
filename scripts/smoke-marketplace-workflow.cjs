const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const runId = Date.now();
  const requesterEmail = `smoke.requester.${runId}@example.com`;
  const providerEmail = `smoke.provider.${runId}@example.com`;
  const categorySlug = `smoke-category-${runId}`;

  const state = {
    categoryId: null,
    requesterId: null,
    providerId: null,
    requestId: null,
    offerId: null,
    transactionId: null,
    shipmentId: null,
  };

  try {
    const category = await prisma.category.create({
      data: {
        name: `Smoke Category ${runId}`,
        slug: categorySlug,
        icon: "Package",
      },
    });
    state.categoryId = category.id;

    const requester = await prisma.user.create({
      data: {
        name: "Smoke Requester",
        email: requesterEmail,
        password: "smoke-password",
        role: "USER",
      },
    });
    state.requesterId = requester.id;

    const provider = await prisma.user.create({
      data: {
        name: "Smoke Provider",
        email: providerEmail,
        password: "smoke-password",
        role: "USER",
      },
    });
    state.providerId = provider.id;

    const request = await prisma.productRequest.create({
      data: {
        title: `Smoke Request ${runId}`,
        description: "Smoke workflow validation request",
        budget: 12500,
        countryToBuyFrom: "France",
        status: "REQUEST_CREATED",
        categoryId: state.categoryId,
        requesterId: state.requesterId,
      },
    });
    state.requestId = request.id;

    const offer = await prisma.offer.create({
      data: {
        price: 13000,
        estimatedDeliveryDays: 8,
        message: "Smoke test offer",
        status: "PENDING",
        providerId: state.providerId,
        requestId: state.requestId,
      },
    });
    state.offerId = offer.id;

    await prisma.productRequest.update({
      where: { id: state.requestId },
      data: { status: "OFFERS_RECEIVED" },
    });

    await prisma.offer.updateMany({
      where: { requestId: state.requestId },
      data: { status: "REJECTED" },
    });

    await prisma.offer.update({
      where: { id: state.offerId },
      data: { status: "ACCEPTED" },
    });

    await prisma.productRequest.update({
      where: { id: state.requestId },
      data: {
        status: "PAYMENT_PENDING",
        acceptedOfferId: state.offerId,
      },
    });

    const transaction = await prisma.transaction.create({
      data: {
        amount: 13000,
        status: "PENDING",
        requestId: state.requestId,
        requesterId: state.requesterId,
      },
    });
    state.transactionId = transaction.id;

    await prisma.transaction.update({
      where: { id: state.transactionId },
      data: { status: "HELD" },
    });

    await prisma.productRequest.update({
      where: { id: state.requestId },
      data: { status: "PURCHASE_IN_PROGRESS" },
    });

    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber: `SMOKE-${runId}`,
        carrier: "SmokeCarrier",
        shippedAt: new Date(),
        requestId: state.requestId,
        providerId: state.providerId,
      },
    });
    state.shipmentId = shipment.id;

    await prisma.productRequest.update({
      where: { id: state.requestId },
      data: { status: "SHIPPED" },
    });

    await prisma.shipment.update({
      where: { id: state.shipmentId },
      data: { deliveredAt: new Date() },
    });

    await prisma.productRequest.update({
      where: { id: state.requestId },
      data: { status: "DELIVERED" },
    });

    await prisma.transaction.update({
      where: { id: state.transactionId },
      data: { status: "RELEASED" },
    });

    await prisma.productRequest.update({
      where: { id: state.requestId },
      data: { status: "PAYMENT_RELEASED" },
    });

    const [finalRequest, finalOffer, finalTransaction, finalShipment] = await Promise.all([
      prisma.productRequest.findUnique({ where: { id: state.requestId } }),
      prisma.offer.findUnique({ where: { id: state.offerId } }),
      prisma.transaction.findUnique({ where: { id: state.transactionId } }),
      prisma.shipment.findUnique({ where: { id: state.shipmentId } }),
    ]);

    if (!finalRequest || finalRequest.status !== "PAYMENT_RELEASED") {
      throw new Error("Final request status mismatch");
    }
    if (!finalOffer || finalOffer.status !== "ACCEPTED") {
      throw new Error("Final offer status mismatch");
    }
    if (!finalTransaction || finalTransaction.status !== "RELEASED") {
      throw new Error("Final transaction status mismatch");
    }
    if (!finalShipment || !finalShipment.deliveredAt) {
      throw new Error("Final shipment status mismatch");
    }

    console.log("SMOKE_WORKFLOW_OK", {
      requestStatus: finalRequest.status,
      offerStatus: finalOffer.status,
      transactionStatus: finalTransaction.status,
      shipmentDelivered: Boolean(finalShipment.deliveredAt),
    });
  } finally {
    if (state.requestId) {
      await prisma.dispute.deleteMany({ where: { requestId: state.requestId } });
      await prisma.shipment.deleteMany({ where: { requestId: state.requestId } });
      await prisma.transaction.deleteMany({ where: { requestId: state.requestId } });
      await prisma.offer.deleteMany({ where: { requestId: state.requestId } });
      await prisma.productRequest.deleteMany({ where: { id: state.requestId } });
    }

    if (state.requesterId) {
      await prisma.user.deleteMany({ where: { id: state.requesterId } });
    }
    if (state.providerId) {
      await prisma.user.deleteMany({ where: { id: state.providerId } });
    }
    if (state.categoryId) {
      await prisma.category.deleteMany({ where: { id: state.categoryId } });
    }
  }
}

main()
  .catch((error) => {
    console.error("SMOKE_WORKFLOW_FAILED", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
