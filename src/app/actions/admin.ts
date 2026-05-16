"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types";
import { notifyDisputeOpened, sendTestNotificationEmail } from "@/lib/notifications";

const adminDb: any = prisma;

// ============================================
// USERS MANAGEMENT
// ============================================

export async function getAllUsers() {
  await requireRole([UserRole.ADMIN]);

  return adminDb.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      emailVerifiedAt: true,
      phoneVerifiedAt: true,
      agentValidationStatus: true,
      agentValidationNote: true,
      agentReviewedAt: true,
      kycStatus: true,
      kycNotes: true,
      kycReviewedAt: true,
      trustScore: true,
      isBlocked: true,
      blockedAt: true,
      blockReason: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          requestedRequests: true,
          submittedOffers: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

function computeAgentTrustScore(user: {
  isBlocked: boolean;
  agentValidationStatus: string;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
}) {
  let score = 0;

  if (user.emailVerifiedAt) score += 25;
  if (user.phoneVerifiedAt) score += 25;
  if (user.agentValidationStatus === "VALIDATED") score += 30;
  if (user.agentValidationStatus === "PENDING") score += 10;
  if (user.agentValidationStatus === "REJECTED") score -= 20;
  if (user.isBlocked) score -= 35;

  return Math.max(0, Math.min(100, score));
}

export async function setAgentValidationStatus(
  userId: string,
  status: "PENDING" | "VALIDATED" | "REJECTED",
  note?: string
) {
  await requireRole([UserRole.ADMIN]);

  const user = (await prisma.user.findUnique({ where: { id: userId } })) as any;
  if (!user) throw new Error("User not found");
  if (user.role === UserRole.ADMIN) {
    throw new Error("Validation workflow does not apply to admin users");
  }

  const updated = await adminDb.user.update({
    where: { id: userId },
    data: {
      agentValidationStatus: status,
      agentValidationNote: note || null,
      agentReviewedAt: new Date(),
      kycStatus: status,
      kycNotes: note || null,
      kycReviewedAt: new Date(),
      trustScore: computeAgentTrustScore({
        isBlocked: user.isBlocked,
        agentValidationStatus: status,
        emailVerifiedAt: user.emailVerifiedAt,
        phoneVerifiedAt: user.phoneVerifiedAt,
      }),
    },
    select: {
      id: true,
      agentValidationStatus: true,
      agentValidationNote: true,
      agentReviewedAt: true,
      kycStatus: true,
      kycNotes: true,
      kycReviewedAt: true,
      trustScore: true,
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function verifyAgentEmail(userId: string, verified: boolean, note?: string) {
  await requireRole([UserRole.ADMIN]);

  const user = (await prisma.user.findUnique({ where: { id: userId } })) as any;
  if (!user) throw new Error("User not found");
  if (user.role === UserRole.ADMIN) throw new Error("Email verification in this workflow applies only to standard users");

  const updated = await adminDb.user.update({
    where: { id: userId },
    data: {
      emailVerifiedAt: verified ? new Date() : null,
      kycNotes: note || null,
      kycReviewedAt: new Date(),
      trustScore: computeAgentTrustScore({
        isBlocked: user.isBlocked,
        agentValidationStatus: user.agentValidationStatus,
        emailVerifiedAt: verified ? new Date() : null,
        phoneVerifiedAt: user.phoneVerifiedAt,
      }),
    },
    select: {
      id: true,
      emailVerifiedAt: true,
      kycNotes: true,
      kycReviewedAt: true,
      trustScore: true,
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function verifyAgentPhone(userId: string, verified: boolean, note?: string) {
  await requireRole([UserRole.ADMIN]);

  const user = (await prisma.user.findUnique({ where: { id: userId } })) as any;
  if (!user) throw new Error("User not found");
  if (user.role === UserRole.ADMIN) throw new Error("Phone verification in this workflow applies only to standard users");

  const updated = await adminDb.user.update({
    where: { id: userId },
    data: {
      phoneVerifiedAt: verified ? new Date() : null,
      kycNotes: note || null,
      kycReviewedAt: new Date(),
      trustScore: computeAgentTrustScore({
        isBlocked: user.isBlocked,
        agentValidationStatus: user.agentValidationStatus,
        emailVerifiedAt: user.emailVerifiedAt,
        phoneVerifiedAt: verified ? new Date() : null,
      }),
    },
    select: {
      id: true,
      phoneVerifiedAt: true,
      kycNotes: true,
      kycReviewedAt: true,
      trustScore: true,
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function resetAgentKyc(userId: string, note?: string) {
  await requireRole([UserRole.ADMIN]);

  const user = (await prisma.user.findUnique({ where: { id: userId } })) as any;
  if (!user) throw new Error("User not found");
  if (user.role === UserRole.ADMIN) throw new Error("KYC reset in this workflow applies only to standard users");

  const updated = await adminDb.user.update({
    where: { id: userId },
    data: {
      agentValidationStatus: "PENDING",
      agentValidationNote: note || null,
      agentReviewedAt: new Date(),
      emailVerifiedAt: null,
      phoneVerifiedAt: null,
      kycStatus: "PENDING",
      kycNotes: note || null,
      kycReviewedAt: new Date(),
      trustScore: computeAgentTrustScore({
        isBlocked: user.isBlocked,
        agentValidationStatus: "PENDING",
        emailVerifiedAt: null,
        phoneVerifiedAt: null,
      }),
    },
    select: {
      id: true,
      agentValidationStatus: true,
      emailVerifiedAt: true,
      phoneVerifiedAt: true,
      kycStatus: true,
      trustScore: true,
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function changeUserRole(userId: string, role: UserRole) {
  await requireRole([UserRole.ADMIN]);

  const user = (await prisma.user.findUnique({ where: { id: userId } })) as any;
  if (!user) throw new Error("User not found");

  if (user.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
    const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } });
    if (adminCount <= 1) {
      throw new Error("Cannot downgrade the last admin user");
    }
  }

  const updated = await adminDb.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      role: true,
      updatedAt: true,
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function getUserAdminHistory(userId: string) {
  await requireRole([UserRole.ADMIN]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      isBlocked: true,
      blockedAt: true,
      blockReason: true,
    },
  });

  if (!user) throw new Error("User not found");

  const [recentRequests, recentOffers, recentDisputes] = await Promise.all([
    prisma.productRequest.findMany({
      where: { requesterId: userId },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.offer.findMany({
      where: { providerId: userId },
      select: {
        id: true,
        price: true,
        status: true,
        createdAt: true,
        request: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.dispute.findMany({
      where: { reportedById: userId },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    user,
    recentRequests,
    recentOffers,
    recentDisputes,
  };
}

export async function toggleUserBlock(userId: string, reason?: string) {
  await requireRole([UserRole.ADMIN]);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  if (user.role === UserRole.ADMIN) {
    throw new Error("Cannot block an admin user");
  }

  const isCurrentlyBlocked = user.isBlocked;
  const nextBlockedState = !isCurrentlyBlocked;
  const nextTrustScore = computeAgentTrustScore({
    isBlocked: nextBlockedState,
    agentValidationStatus: user.agentValidationStatus,
    emailVerifiedAt: user.emailVerifiedAt,
    phoneVerifiedAt: user.phoneVerifiedAt,
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      isBlocked: nextBlockedState,
      blockedAt: nextBlockedState ? new Date() : null,
      blockReason: nextBlockedState ? reason || "Blocked by admin" : null,
      trustScore: nextTrustScore,
    },
  });

  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      isBlocked: true,
      blockedAt: true,
    },
  });
}

export async function deleteUser(userId: string, reason: string) {
  await requireRole([UserRole.ADMIN]);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  if (user.role === UserRole.ADMIN) {
    throw new Error("Cannot delete an admin user");
  }

  // Soft delete : marquer comme bloqué avec raison
  await prisma.user.update({
    where: { id: userId },
    data: {
      isBlocked: true,
      blockedAt: new Date(),
      blockReason: `Deleted: ${reason}`,
    },
  });

  revalidatePath("/admin/users");
  return user;
}

// ============================================
// TRANSACTIONS MANAGEMENT
// ============================================

export async function getAllTransactions() {
  await requireRole([UserRole.ADMIN]);

  return prisma.transaction.findMany({
    include: {
      requester: { select: { name: true, email: true } },
      request: {
        select: {
          id: true,
          title: true,
          countryToBuyFrom: true,
          dispute: {
            select: {
              id: true,
              status: true,
            },
          },
          acceptedOffer: {
            select: { provider: { select: { name: true, email: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTransactionStatus(
  transactionId: string,
  status: "PENDING" | "HELD" | "RELEASED" | "REFUNDED"
) {
  await requireRole([UserRole.ADMIN]);

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) throw new Error("Transaction not found");

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status },
  });

  revalidatePath("/admin/dashboard");
}

// ============================================
// SHIPMENTS MANAGEMENT
// ============================================

export async function getAllShipments() {
  await requireRole([UserRole.ADMIN]);

  return prisma.shipment.findMany({
    include: {
      request: { select: { title: true, status: true } },
      provider: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ============================================
// DASHBOARD GLOBAL
// ============================================

export async function getAdminDashboardStats() {
  await requireRole([UserRole.ADMIN]);

  const openRequestStatuses = ["REQUEST_CREATED", "OFFERS_RECEIVED"];
  const dealInProgressStatuses = [
    "OFFER_ACCEPTED",
    "PAYMENT_PENDING",
    "PURCHASE_IN_PROGRESS",
    "SHIPPED",
  ];

  const fromDate = new Date();
  fromDate.setHours(0, 0, 0, 0);
  fromDate.setDate(fromDate.getDate() - 6);

  const [
    totalUsers,
    totalRequests,
    totalOffers,
    totalTransactions,
    pendingTransactions,
    activeUsers,
    activeProviders,
    openRequests,
    dealsInProgress,
    requestsByStatus,
    recentRequests,
    recentOffers,
    requestsWithOffers,
    totalShipments,
    deliveredShipments,
    volumeByCountry,
    agents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.productRequest.count(),
    prisma.offer.count(),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: UserRole.USER, isBlocked: false } }),
    prisma.user.count({
      where: {
        role: UserRole.USER,
        isBlocked: false,
        submittedOffers: { some: { deletedAt: null } },
      },
    }),
    prisma.productRequest.count({ where: { status: { in: openRequestStatuses } } }),
    prisma.productRequest.count({ where: { status: { in: dealInProgressStatuses } } }),
    prisma.productRequest.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.productRequest.findMany({
      where: { createdAt: { gte: fromDate } },
      select: { createdAt: true },
    }),
    prisma.offer.findMany({
      where: { createdAt: { gte: fromDate } },
      select: { createdAt: true },
    }),
    prisma.productRequest.count({
      where: { offers: { some: { deletedAt: null } } },
    }),
    prisma.shipment.count(),
    prisma.shipment.count({ where: { deliveredAt: { not: null } } }),
    prisma.productRequest.groupBy({
      by: ["countryToBuyFrom"],
      _count: true,
      orderBy: { _count: { countryToBuyFrom: "desc" } },
      take: 8,
    }),
    prisma.user.findMany({
      where: { role: UserRole.USER },
      select: {
        id: true,
        name: true,
        email: true,
        agentValidationStatus: true,
        isBlocked: true,
      },
    }),
  ]);

  const clients = await prisma.user.count({
    where: { role: UserRole.USER },
  });

  const intermediaries = await prisma.user.count({
    where: { role: UserRole.USER },
  });

  const totalRevenue = await prisma.transaction.aggregate({
    where: { status: "RELEASED" },
    _sum: { amount: true },
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(fromDate);
    date.setDate(fromDate.getDate() + i);
    return date;
  });

  const toKey = (date: Date) => date.toISOString().slice(0, 10);
  const requestByDayMap = new Map<string, number>();
  const offerByDayMap = new Map<string, number>();

  for (const day of days) {
    const key = toKey(day);
    requestByDayMap.set(key, 0);
    offerByDayMap.set(key, 0);
  }

  for (const item of recentRequests) {
    const key = toKey(item.createdAt);
    requestByDayMap.set(key, (requestByDayMap.get(key) || 0) + 1);
  }

  for (const item of recentOffers) {
    const key = toKey(item.createdAt);
    offerByDayMap.set(key, (offerByDayMap.get(key) || 0) + 1);
  }

  const requestsPerDay = days.map((day) => {
    const key = toKey(day);
    return {
      day: day.toLocaleDateString("fr-FR", { weekday: "short" }),
      count: requestByDayMap.get(key) || 0,
    };
  });

  const offersPerDay = days.map((day) => {
    const key = toKey(day);
    return {
      day: day.toLocaleDateString("fr-FR", { weekday: "short" }),
      count: offerByDayMap.get(key) || 0,
    };
  });

  const conversionRate = totalRequests > 0 ? (requestsWithOffers / totalRequests) * 100 : 0;
  const deliverySuccessRate = totalShipments > 0 ? (deliveredShipments / totalShipments) * 100 : 0;

  const reliableAgents = await Promise.all(
    agents.map(async (agent) => {
      const [totalAgentOffers, deliveredCount, disputesOnAgent] = await Promise.all([
        prisma.offer.count({
          where: {
            providerId: agent.id,
            deletedAt: null,
          },
        }),
        prisma.shipment.count({
          where: {
            providerId: agent.id,
            deliveredAt: { not: null },
          },
        }),
        prisma.dispute.count({
          where: {
            request: {
              acceptedOffer: {
                providerId: agent.id,
              },
            },
          },
        }),
      ]);

      const successRate = totalAgentOffers > 0 ? deliveredCount / totalAgentOffers : 0;
      const score = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            successRate * 100 -
              disputesOnAgent * 15 +
              (agent.agentValidationStatus === "VALIDATED" ? 10 : 0) -
              (agent.isBlocked ? 25 : 0)
          )
        )
      );

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        totalOffers: totalAgentOffers,
        deliveredCount,
        disputesOnAgent,
        successRate: Number((successRate * 100).toFixed(1)),
        confidenceScore: score,
      };
    })
  );

  const topReliableAgents = reliableAgents
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 5);

  return {
    totalUsers,
    clients,
    intermediaries,
    activeUsers,
    activeProviders,
    totalRequests,
    openRequests,
    dealsInProgress,
    totalOffers,
    totalTransactions,
    pendingTransactions,
    totalRevenue: totalRevenue._sum.amount || 0,
    conversionRate: Number(conversionRate.toFixed(1)),
    deliverySuccessRate: Number(deliverySuccessRate.toFixed(1)),
    requestsPerDay,
    offersPerDay,
    topReliableAgents,
    volumeByCountry: volumeByCountry.map((item) => ({
      country: item.countryToBuyFrom,
      count: item._count,
    })),
    requestsByStatus: requestsByStatus.map((item) => ({
      status: item.status,
      count: item._count,
    })),
  };
}

// ============================================
// DISPUTE MANAGEMENT
// ============================================

export async function createDispute(requestId: string, reason: string) {
  const user = await requireRole([UserRole.USER]);

  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
    include: { acceptedOffer: true },
  });

  if (!request) throw new Error("Request not found");

  // Vérifier que l'utilisateur est impliqué dans la transaction
  if (
    request.requesterId !== user.id &&
    request.acceptedOffer?.providerId !== user.id
  ) {
    throw new Error("Unauthorized");
  }

  const dispute = await prisma.dispute.create({
    data: {
      reason,
      requestId,
      reportedById: user.id,
    },
  });

  revalidatePath(`/request/${requestId}`);
  await notifyDisputeOpened(requestId, reason).catch((error) => {
    console.error("Notification error (dispute opened):", error);
  });
  return dispute;
}

export async function getAllDisputes() {
  await requireRole([UserRole.ADMIN]);

  return prisma.dispute.findMany({
    include: {
      request: {
        select: {
          id: true,
          title: true,
          status: true,
          transaction: {
            select: {
              id: true,
              status: true,
              amount: true,
            },
          },
          acceptedOffer: {
            select: {
              provider: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
      reportedBy: {
        select: { name: true, email: true, role: true },
      },
      admin: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAdminDispute(requestId: string, reason: string) {
  const admin = await requireRole([UserRole.ADMIN]);

  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
    select: { id: true, title: true },
  });

  if (!request) throw new Error("Request not found");

  const existing = await prisma.dispute.findUnique({ where: { requestId } });
  if (existing) throw new Error("A dispute already exists for this request");

  const dispute = await prisma.dispute.create({
    data: {
      requestId,
      reason,
      reportedById: admin.id,
      status: "OPEN",
    },
  });

  revalidatePath("/admin/dashboard");
  await notifyDisputeOpened(requestId, reason).catch((error) => {
    console.error("Notification error (admin dispute opened):", error);
  });
  return dispute;
}

export async function requestDisputeEvidence(disputeId: string, note: string) {
  const admin = await requireRole([UserRole.ADMIN]);

  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw new Error("Dispute not found");

  const updated = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: "OPEN",
      resolution: `PREUVE_DEMANDEE: ${note}`,
      adminId: admin.id,
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function arbitrateDispute(
  disputeId: string,
  decision: "REFUND_CLIENT" | "PAY_AGENT",
  note?: string
) {
  const admin = await requireRole([UserRole.ADMIN]);

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      request: {
        select: {
          id: true,
          transaction: {
            select: { id: true, status: true },
          },
        },
      },
    },
  });

  if (!dispute) throw new Error("Dispute not found");

  const resolution =
    decision === "REFUND_CLIENT"
      ? `ARBITRAGE: remboursement client${note ? ` - ${note}` : ""}`
      : `ARBITRAGE: paiement agent${note ? ` - ${note}` : ""}`;

  const updated = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: "RESOLVED",
      resolution,
      adminId: admin.id,
    },
  });

  if (dispute.request.transaction) {
    await prisma.transaction.update({
      where: { id: dispute.request.transaction.id },
      data: {
        status: decision === "REFUND_CLIENT" ? "REFUNDED" : "RELEASED",
      },
    });
  }

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function resolveDispute(disputeId: string, resolution: string) {
  await requireRole([UserRole.ADMIN]);

  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw new Error("Dispute not found");

  const user = await requireRole([UserRole.ADMIN]);

  const updated = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: "RESOLVED",
      resolution,
      adminId: user.id,
    },
  });

  revalidatePath("/admin/disputes");
  return updated;
}

export async function sendAdminTestNotification() {
  const user = await requireRole([UserRole.ADMIN]);

  await sendTestNotificationEmail(user.email, user.name);
  return { success: true };
}

export async function getNotificationLogs() {
  await requireRole([UserRole.ADMIN]);

  return prisma.notificationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getNotificationLogsPage(page = 1, pageSize = 20) {
  await requireRole([UserRole.ADMIN]);

  const safePage = Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1);
  const safePageSize = Math.min(100, Math.max(5, Number.isFinite(pageSize) ? Math.floor(pageSize) : 20));
  const skip = (safePage - 1) * safePageSize;

  const [total, logs] = await Promise.all([
    prisma.notificationLog.count(),
    prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: safePageSize,
    }),
  ]);

  return {
    logs,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  };
}

// ============================================
// REQUEST MANAGEMENT
// ============================================

export async function getAllRequests(filterStatus?: string) {
  await requireRole([UserRole.ADMIN]);

  return prisma.productRequest.findMany({
    where: filterStatus ? { status: filterStatus } : {},
    include: {
      requester: {
        select: { id: true, name: true, email: true, isBlocked: true },
      },
      offers: {
        select: { id: true, price: true, providerId: true },
      },
      acceptedOffer: {
        select: { id: true, price: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteRequest(requestId: string, reason: string) {
  await requireRole([UserRole.ADMIN]);

  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new Error("Request not found");

  const updated = await prisma.productRequest.update({
    where: { id: requestId },
    data: {
      deletedAt: new Date(),
      deletionReason: reason,
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function toggleFeaturedRequest(requestId: string, featured: boolean) {
  await requireRole([UserRole.ADMIN]);

  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new Error("Request not found");

  const updated = await prisma.productRequest.update({
    where: { id: requestId },
    data: {
      isFeatured: featured,
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function markRequestAsScam(requestId: string, reason: string) {
  await requireRole([UserRole.ADMIN]);

  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new Error("Request not found");

  const updated = await prisma.productRequest.update({
    where: { id: requestId },
    data: {
      markedAsScam: true,
      scamReason: reason,
      scamMarkedAt: new Date(),
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function closeRequest(requestId: string) {
  await requireRole([UserRole.ADMIN]);

  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new Error("Request not found");

  const updated = await prisma.productRequest.update({
    where: { id: requestId },
    data: {
      status: "REQUEST_CLOSED",
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

// ============================================
// OFFER MANAGEMENT
// ============================================

export async function getAllOffers(filterSuspicious?: boolean) {
  await requireRole([UserRole.ADMIN]);

  return prisma.offer.findMany({
    where: {
      ...(filterSuspicious && { isSuspicious: true }),
    },
    include: {
      request: {
        select: { id: true, title: true, budget: true },
      },
      provider: {
        select: { id: true, name: true, email: true, isBlocked: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteOffer(offerId: string, reason: string) {
  await requireRole([UserRole.ADMIN]);

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
  });

  if (!offer) throw new Error("Offer not found");

  const updated = await prisma.offer.update({
    where: { id: offerId },
    data: {
      deletedAt: new Date(),
      deletionReason: reason,
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function suspendOfferAgent(agentId: string, reason: string) {
  await requireRole([UserRole.ADMIN]);

  const agent = await prisma.user.findUnique({
    where: { id: agentId },
  });

  if (!agent) throw new Error("Agent not found");

  const updated = await prisma.user.update({
    where: { id: agentId },
    data: {
      isBlocked: true,
      blockedAt: new Date(),
      blockReason: `Suspended due to: ${reason}`,
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function reportOfferAsAbuse(offerId: string, reason: string) {
  await requireRole([UserRole.ADMIN]);

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
  });

  if (!offer) throw new Error("Offer not found");

  const updated = await prisma.offer.update({
    where: { id: offerId },
    data: {
      isReportedAsAbuse: true,
      abuseReason: reason,
      abuseReportedAt: new Date(),
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function markOfferAsSuspicious(offerId: string, reason: string) {
  await requireRole([UserRole.ADMIN]);

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
  });

  if (!offer) throw new Error("Offer not found");

  const updated = await prisma.offer.update({
    where: { id: offerId },
    data: {
      isSuspicious: true,
      suspiciousReason: reason,
    },
  });

  revalidatePath("/admin/dashboard");
  return updated;
}

export async function getAgentsPerformance() {
  await requireRole([UserRole.ADMIN]);

  const agents = await prisma.user.findMany({
    where: { role: UserRole.USER },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isBlocked: true,
      agentValidationStatus: true,
      agentReviewedAt: true,
      _count: {
        select: {
          submittedOffers: true,
          providedShipments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const performance = await Promise.all(
    agents.map(async (agent) => {
      const [deliveredShipments, disputesOnAgent] = await Promise.all([
        prisma.shipment.count({
          where: {
            providerId: agent.id,
            deliveredAt: { not: null },
          },
        }),
        prisma.dispute.count({
          where: {
            request: {
              acceptedOffer: {
                providerId: agent.id,
              },
            },
          },
        }),
      ]);

      const totalOffers = agent._count.submittedOffers;
      const deliverySuccessRate = totalOffers > 0 ? (deliveredShipments / totalOffers) * 100 : 0;
      const confidenceScore = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            deliverySuccessRate -
              disputesOnAgent * 15 +
              (agent.agentValidationStatus === "VALIDATED" ? 10 : 0) -
              (agent.isBlocked ? 25 : 0)
          )
        )
      );

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        isBlocked: agent.isBlocked,
        agentValidationStatus: agent.agentValidationStatus,
        agentReviewedAt: agent.agentReviewedAt,
        totalOffers,
        totalShipments: agent._count.providedShipments,
        deliveredShipments,
        disputesOnAgent,
        deliverySuccessRate: Number(deliverySuccessRate.toFixed(1)),
        confidenceScore,
      };
    })
  );

  return performance.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

