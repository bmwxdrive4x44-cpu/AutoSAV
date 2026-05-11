"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types";
import { notifyOfferAccepted, notifyOfferSubmitted } from "@/lib/notifications";

const createOfferSchema = z.object({
  requestId: z.string(),
  price: z.coerce.number().positive(),
  estimatedDeliveryDays: z.coerce.number().int().positive(),
  message: z.string().min(5),
});

export async function createOffer(formData: FormData) {
  const user = await requireRole([UserRole.USER]);

  const data = createOfferSchema.parse({
    requestId: formData.get("requestId"),
    price: formData.get("price"),
    estimatedDeliveryDays: formData.get("estimatedDeliveryDays"),
    message: formData.get("message"),
  });

  const request = await prisma.productRequest.findUnique({
    where: { id: data.requestId },
    include: { requester: { select: { isBlocked: true } } },
  });

  if (!request) throw new Error("Request not found");
  if (request.requesterId === user.id) throw new Error("Cannot offer on your own request");
  if (request.status !== "REQUEST_CREATED" && request.status !== "OFFERS_RECEIVED") {
    throw new Error("Request is no longer accepting offers");
  }
  if (request.requester.isBlocked) throw new Error("Le client de cette demande a Ã©tÃ© bloquÃ©");

  await prisma.$transaction(async (tx) => {
    await tx.offer.create({
      data: {
        price: data.price,
        estimatedDeliveryDays: data.estimatedDeliveryDays,
        message: data.message,
        providerId: user.id,
        requestId: data.requestId,
      },
    });

    if (request.status === "REQUEST_CREATED") {
      await tx.productRequest.update({
        where: { id: data.requestId },
        data: { status: "OFFERS_RECEIVED" },
      });
    }
  });

  revalidatePath(`/request/${data.requestId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/offers-submitted");
  revalidatePath("/dashboard/requests-market");

  await notifyOfferSubmitted(data.requestId, user.name).catch((error) => {
    console.error("Notification error (offer submitted):", error);
  });
}

export async function acceptOffer(offerId: string, requestId: string) {
  const user = await requireRole([UserRole.USER]);

  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
    include: { 
      offers: { include: { provider: { select: { isBlocked: true } } } },
      requester: { select: { id: true } },
    },
  });

  if (!request) throw new Error("Request not found");
  if (request.requesterId !== user.id) throw new Error("Unauthorized");
  if (request.status !== "OFFERS_RECEIVED") throw new Error("Invalid status");

  const offer = request.offers.find((o) => o.id === offerId);
  if (!offer) throw new Error("Offer not found");
  if (offer.provider.isBlocked) throw new Error("L'agent de cette offre a Ã©tÃ© bloquÃ©");

  await prisma.$transaction(async (tx) => {
    // Refetch offer to ensure it hasn't changed since selection
    const currentOffer = await tx.offer.findUnique({
      where: { id: offerId },
      include: { provider: { select: { isBlocked: true } } },
    });

    if (!currentOffer || currentOffer.provider.isBlocked) {
      throw new Error("L'agent de cette offre n'est plus disponible");
    }

    await tx.offer.updateMany({
      where: { requestId },
      data: { status: "REJECTED" },
    });

    await tx.offer.update({
      where: { id: offerId },
      data: { status: "ACCEPTED" },
    });

    await tx.productRequest.update({
      where: { id: requestId },
      data: {
        status: "PAYMENT_PENDING",
        acceptedOfferId: offerId,
      },
    });

    await tx.transaction.create({
      data: {
        amount: currentOffer.price,
        status: "PENDING",
        requestId,
        requesterId: user.id,
      },
    });
  });

  revalidatePath(`/request/${requestId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/requests");
  revalidatePath("/dashboard/offers-received");

  await notifyOfferAccepted(requestId).catch((error) => {
    console.error("Notification error (offer accepted):", error);
  });
}

export async function getAgentBuyerOffers() {
  const user = await requireRole([UserRole.USER]);

  return prisma.offer.findMany({
    where: { providerId: user.id, deletedAt: null },
    include: {
      request: {
        select: {
          id: true,
          title: true,
          status: true,
          requester: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserSubmittedOffers() {
  return getAgentBuyerOffers();
}

