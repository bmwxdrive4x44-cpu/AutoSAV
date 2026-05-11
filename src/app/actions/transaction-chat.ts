"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types";
import { notifyTransactionMessage } from "@/lib/notifications";

const chatMessageSchema = z.object({
  requestId: z.string(),
  offerId: z.string().optional().nullable(),
  message: z.string().min(2).max(1000),
});

type ChatRow = {
  id: string;
  requestId: string;
  offerId: string | null;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderTrustScore: number | null;
  body: string;
  createdAt: string;
  offerPrice: number | null;
  offerStatus: string | null;
};

let ensureSchemaPromise: Promise<void> | null = null;

async function ensureSchema() {
  if (!ensureSchemaPromise) {
    ensureSchemaPromise = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS TransactionMessage (
          id TEXT PRIMARY KEY NOT NULL,
          requestId TEXT NOT NULL,
          offerId TEXT,
          senderId TEXT NOT NULL,
          body TEXT NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (requestId) REFERENCES ProductRequest(id) ON DELETE CASCADE,
          FOREIGN KEY (offerId) REFERENCES Offer(id) ON DELETE SET NULL,
          FOREIGN KEY (senderId) REFERENCES User(id) ON DELETE CASCADE
        )
      `);
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS TransactionMessage_requestId_createdAt_idx ON TransactionMessage(requestId, createdAt)`
      );
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS TransactionMessage_offerId_createdAt_idx ON TransactionMessage(offerId, createdAt)`
      );
    })();
  }

  return ensureSchemaPromise;
}

export async function getTransactionChat(requestId: string, viewerId?: string | null) {
  await ensureSchema();

  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
    select: {
      requesterId: true,
      acceptedOfferId: true,
      offers: {
        select: {
          id: true,
          providerId: true,
          price: true,
          status: true,
          provider: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!request) {
    return { canView: false, canSend: false, defaultOfferId: null, messages: [] as ChatRow[], offerOptions: [] as any[] };
  }

  const isClient = viewerId === request.requesterId;
  const isAgentParticipant = !!viewerId && request.offers.some((offer) => offer.providerId === viewerId);

  if (!viewerId || (!isClient && !isAgentParticipant)) {
    return {
      canView: false,
      canSend: false,
      defaultOfferId: null,
      messages: [] as ChatRow[],
      offerOptions: request.offers,
    };
  }

  const messages = await prisma.$queryRaw<ChatRow[]>`
    SELECT
      m.id,
      m.requestId,
      m.offerId,
      m.senderId,
      u.name AS senderName,
      u.role AS senderRole,
      u.trustScore AS senderTrustScore,
      m.body,
      m.createdAt,
      o.price AS offerPrice,
      o.status AS offerStatus
    FROM TransactionMessage AS m
    INNER JOIN User AS u ON u.id = m.senderId
    LEFT JOIN Offer AS o ON o.id = m.offerId
    WHERE m.requestId = ${requestId}
    ORDER BY m.createdAt ASC
  `;

  const defaultOfferId = isAgentParticipant
    ? request.offers.find((offer) => offer.providerId === viewerId)?.id || request.acceptedOfferId || null
    : request.acceptedOfferId || request.offers[0]?.id || null;

  return {
    canView: true,
    canSend: request.offers.length > 0,
    defaultOfferId,
    messages,
    offerOptions: request.offers,
  };
}

export async function sendTransactionChatMessage(formData: FormData) {
  const user = await requireRole([UserRole.USER]);

  const parsed = chatMessageSchema.safeParse({
    requestId: formData.get("requestId"),
    offerId: formData.get("offerId") || null,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    throw new Error("Message invalide.");
  }

  const data = parsed.data;
  await ensureSchema();

  const request = await prisma.productRequest.findUnique({
    where: { id: data.requestId },
    select: {
      requesterId: true,
      acceptedOfferId: true,
      offers: {
        select: {
          id: true,
          providerId: true,
          provider: { select: { email: true, name: true } },
        },
      },
      requester: { select: { email: true, name: true } },
    },
  });

  if (!request) throw new Error("Request not found");

  const isClient = user.id === request.requesterId;
  const selectedOffer = data.offerId
    ? request.offers.find((offer) => offer.id === data.offerId)
    : request.offers.find((offer) => offer.id === request.acceptedOfferId) || null;

  if (!isClient && !selectedOffer) {
    throw new Error("Unauthorized");
  }

  if (selectedOffer && !isClient && selectedOffer.providerId !== user.id) {
    throw new Error("Unauthorized");
  }

  const recipientEmail = isClient ? selectedOffer?.provider.email : request.requester.email;
  const recipientName = isClient ? selectedOffer?.provider.name : request.requester.name;

  if (!recipientEmail || !recipientName) {
    throw new Error("Recipient not found");
  }

  await prisma.$executeRaw`
    INSERT INTO TransactionMessage (id, requestId, offerId, senderId, body)
    VALUES (${randomUUID()}, ${data.requestId}, ${selectedOffer?.id ?? null}, ${user.id}, ${data.message})
  `;

  revalidatePath(`/request/${data.requestId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/requests");
  revalidatePath("/dashboard/requests-market");

  await notifyTransactionMessage({
    requestId: data.requestId,
    senderId: user.id,
    message: data.message,
    recipientEmail,
    recipientName,
  }).catch((error) => {
    console.error("Notification error (transaction message):", error);
  });
}
