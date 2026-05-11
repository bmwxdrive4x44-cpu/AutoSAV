"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types";
import { notifyPaymentReleased, notifyShipmentStatus } from "@/lib/notifications";

const updateShipmentSchema = z.object({
  requestId: z.string(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  notes: z.string().optional(),
  action: z.enum(["ship", "deliver"]),
});

export async function updateShipment(formData: FormData) {
  const user = await requireRole([UserRole.USER]);

  const data = updateShipmentSchema.parse({
    requestId: formData.get("requestId"),
    trackingNumber: formData.get("trackingNumber"),
    carrier: formData.get("carrier"),
    notes: formData.get("notes"),
    action: formData.get("action"),
  });

  const request = await prisma.productRequest.findUnique({
    where: { id: data.requestId },
    include: { acceptedOffer: true, transaction: true },
  });

  if (!request) throw new Error("Request not found");
  if (request.acceptedOffer?.providerId !== user.id) throw new Error("Unauthorized");

  if (data.action === "ship") {
    if (request.status !== "PURCHASE_IN_PROGRESS") {
      throw new Error("Request is not ready to be shipped");
    }
    if (request.transaction?.status !== "HELD") {
      throw new Error("Payment must be held before shipping");
    }

    await prisma.$transaction(async (tx) => {
      await tx.shipment.upsert({
        where: { requestId: data.requestId },
        create: {
          requestId: data.requestId,
          providerId: user.id,
          trackingNumber: data.trackingNumber || null,
          carrier: data.carrier || null,
          notes: data.notes || null,
          shippedAt: new Date(),
        },
        update: {
          trackingNumber: data.trackingNumber || undefined,
          carrier: data.carrier || undefined,
          notes: data.notes || undefined,
          shippedAt: new Date(),
        },
      });

      await tx.productRequest.update({
        where: { id: data.requestId },
        data: { status: "SHIPPED" },
      });
    });
  } else if (data.action === "deliver") {
    if (request.status !== "SHIPPED") {
      throw new Error("Request must be shipped before delivery confirmation");
    }

    await prisma.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { requestId: data.requestId },
        data: { deliveredAt: new Date() },
      });

      await tx.productRequest.update({
        where: { id: data.requestId },
        data: { status: "DELIVERED" },
      });
    });
  }

  revalidatePath(`/request/${data.requestId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/deliveries");
  revalidatePath("/dashboard/requests");

  if (data.action === "ship") {
    await notifyShipmentStatus(data.requestId, "SHIPPED").catch((error) => {
      console.error("Notification error (shipment shipped):", error);
    });
  } else {
    await notifyShipmentStatus(data.requestId, "DELIVERED").catch((error) => {
      console.error("Notification error (shipment delivered):", error);
    });
  }
}

export async function confirmDelivery(requestId: string) {
  const user = await requireRole([UserRole.USER]);

  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new Error("Request not found");
  if (request.requesterId !== user.id) throw new Error("Unauthorized");
  if (request.status !== "DELIVERED") throw new Error("Invalid status");

  await prisma.$transaction(async (tx) => {
    await tx.productRequest.update({
      where: { id: requestId },
      data: { status: "PAYMENT_RELEASED" },
    });

    await tx.transaction.updateMany({
      where: { requestId },
      data: { status: "RELEASED" },
    });
  });

  revalidatePath(`/request/${requestId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/requests");

  await notifyPaymentReleased(requestId).catch((error) => {
    console.error("Notification error (payment released):", error);
  });
}

export async function getAgentBuyerShipments() {
  const user = await requireRole([UserRole.USER]);

  return prisma.shipment.findMany({
    where: { providerId: user.id },
    include: {
      request: {
        select: { id: true, title: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserActiveShipments() {
  return getAgentBuyerShipments();
}

