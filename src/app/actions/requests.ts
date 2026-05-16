"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types";

const createRequestSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  budget: z.coerce.number().positive(),
  countryToBuyFrom: z.string().min(1),
  images: z.string().optional(),
});

export async function createRequest(formData: FormData) {
  const user = await requireRole([UserRole.USER]);

  const parsed = createRequestSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    budget: formData.get("budget"),
    countryToBuyFrom: formData.get("countryToBuyFrom"),
    images: formData.get("images"),
  });

  if (!parsed.success) {
    throw new Error("Champs invalides: verifiez le titre (3+), description (10+), budget et pays.");
  }

  const data = parsed.data;

  const images = data.images
    ? data.images.split(",").map((url) => url.trim()).filter(Boolean)
    : [];
  const imagesCsv = images.join(",");

  // Guard against accidental duplicate submissions in a short time window.
  const duplicateWindowStart = new Date(Date.now() - 30 * 1000);
  const existingDuplicate = await prisma.productRequest.findFirst({
    where: {
      requesterId: user.id,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      budget: data.budget,
      countryToBuyFrom: data.countryToBuyFrom,
      images: imagesCsv,
      createdAt: { gte: duplicateWindowStart },
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  if (existingDuplicate) {
    return { id: existingDuplicate.id };
  }

  const request = await prisma.productRequest.create({
    data: {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      budget: data.budget,
      countryToBuyFrom: data.countryToBuyFrom,
      images: imagesCsv,
      requesterId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/requests");

  return { id: request.id };
}

export async function getClientRequests() {
  const user = await requireRole([UserRole.USER]);

  return prisma.productRequest.findMany({
    where: { requesterId: user.id, deletedAt: null },
    include: {
      category: true,
      _count: { select: { offers: true } },
      offers: {
        include: { provider: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      acceptedOffer: {
        include: { provider: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublicRequests() {
  return prisma.productRequest.findMany({
    where: {
      status: { in: ["REQUEST_CREATED", "OFFERS_RECEIVED"] },
      deletedAt: null,
    },
    include: {
      requester: { select: { id: true, name: true } },
      category: true,
      _count: { select: { offers: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRequestById(id: string) {
  const request = await prisma.productRequest.findUnique({
    where: { id },
    include: {
      category: true,
      requester: { select: { name: true, email: true } },
      offers: {
        include: {
          provider: {
            select: {
              name: true,
              email: true,
              trustScore: true,
              emailVerifiedAt: true,
              phoneVerifiedAt: true,
              agentValidationStatus: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      acceptedOffer: {
        include: {
          provider: {
            select: {
              name: true,
              email: true,
              trustScore: true,
              emailVerifiedAt: true,
              phoneVerifiedAt: true,
              agentValidationStatus: true,
            },
          },
        },
      },
      shipment: true,
      transaction: true,
    },
  });

  if (!request) return null;

  const uniqueAgentIds = Array.from(new Set(request.offers.map((offer) => offer.providerId)));
  const agentStatsEntries = await Promise.all(
    uniqueAgentIds.map(async (providerId) => {
      const [totalOffers, deliveredShipments, disputesOnAgent] = await Promise.all([
        prisma.offer.count({ where: { providerId } }),
        prisma.shipment.count({ where: { providerId, deliveredAt: { not: null } } }),
        prisma.dispute.count({
          where: {
            request: {
              acceptedOffer: {
                providerId,
              },
            },
          },
        }),
      ]);

      return [providerId, { totalOffers, deliveredShipments, disputesOnAgent }] as const;
    })
  );

  const agentStatsById = new Map(agentStatsEntries);

  return {
    ...request,
    offers: request.offers.map((offer) => ({
      ...offer,
      agentStats: agentStatsById.get(offer.providerId) || {
        totalOffers: 0,
        deliveredShipments: 0,
        disputesOnAgent: 0,
      },
    })),
  } as any;
}

export async function getMySubmittedRequests() {
  return getClientRequests();
}

