"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types";
import { notifyPaymentHeld } from "@/lib/notifications";

export async function holdPayment(requestId: string) {
  const user = await requireRole([UserRole.USER]);

  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
    include: { transaction: true },
  });

  if (!request) throw new Error("Request not found");
  if (request.requesterId !== user.id) throw new Error("Unauthorized");
  if (!request.transaction) throw new Error("Transaction not found");
  if (request.transaction.status !== "PENDING") {
    throw new Error("Payment is already processed");
  }
  if (request.status !== "PAYMENT_PENDING" && request.status !== "OFFER_ACCEPTED") {
    throw new Error("Invalid request status for payment hold");
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { requestId },
      data: { status: "HELD" },
    });

    await tx.productRequest.update({
      where: { id: requestId },
      data: { status: "PURCHASE_IN_PROGRESS" },
    });
  });

  revalidatePath(`/request/${requestId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/requests");
  revalidatePath("/dashboard/requests-market");

  await notifyPaymentHeld(requestId).catch((error) => {
    console.error("Notification error (payment held):", error);
  });
}

