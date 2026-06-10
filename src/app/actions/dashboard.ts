"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types";

// ============================================================
// CACHE EN MÉMOIRE (TTL 25s par userId)
// ============================================================
const cache = new Map<string, { data: DashboardSummary; expiresAt: number }>();
const CACHE_TTL_MS = 25_000;

function getCached(userId: string): DashboardSummary | null {
  const entry = cache.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(userId); return null; }
  return entry.data;
}

function setCached(userId: string, data: DashboardSummary) {
  cache.set(userId, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ============================================================
// TYPES
// ============================================================
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface TrustScoreResult {
  trustScore: number;
  riskLevel: RiskLevel;
  flagged: boolean;
  details: {
    deliveriesOk: number;
    transactionsOk: number;
    disputesOpen: number;
    disputesTotal: number;
    cancellations: number;
    recentActivity: boolean;
  };
}

export interface DashboardAlert {
  type: "warning" | "danger" | "info";
  message: string;
}

export interface DashboardSummary {
  myRequestsCount: number;
  offersReceivedCount: number;
  submittedOffersCount: number;
  activeDeliveriesCount: number;
  disputesCount: number;
  transactionsCount: number;
  trust: TrustScoreResult;
  alerts: DashboardAlert[];
  cachedAt: number;
}

// ============================================================
// TRUST SCORE + ANTI-FRAUDE
// ============================================================
async function computeTrustScore(userId: string): Promise<TrustScoreResult> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  const [
    deliveriesOk,
    transactionsOk,
    disputesOpen,
    disputesTotal,
    recentDisputesCount,
    cancellations,
    recentRequest,
  ] = await Promise.all([
    prisma.shipment.count({ where: { providerId: userId, deliveredAt: { not: null } } }),
    prisma.transaction.count({ where: { requesterId: userId, status: "RELEASED" } }),
    prisma.dispute.count({ where: { reportedById: userId, status: "OPEN" } }),
    prisma.dispute.count({ where: { reportedById: userId } }),
    prisma.dispute.count({ where: { reportedById: userId, status: "OPEN", createdAt: { gte: sevenDaysAgo } } }),
    prisma.offer.count({ where: { providerId: userId, status: "CANCELLED" } }),
    prisma.productRequest.findFirst({
      where: { requesterId: userId, createdAt: { gte: thirtyDaysAgo } },
      select: { id: true },
    }),
  ]);

  const recentActivity = recentRequest !== null;

  let score = 50;
  score += deliveriesOk * 5;
  score += transactionsOk * 3;
  score -= disputesOpen * 10;
  score -= cancellations * 3;
  if (recentActivity) score += 5;
  score = Math.min(100, Math.max(0, score));

  const riskLevel: RiskLevel = score >= 70 ? "LOW" : score >= 40 ? "MEDIUM" : "HIGH";

  const flagged =
    (disputesTotal > 0 && disputesOpen / Math.max(1, disputesTotal) > 0.3) ||
    recentDisputesCount >= 3 ||
    cancellations > 10;

  return {
    trustScore: score,
    riskLevel,
    flagged,
    details: { deliveriesOk, transactionsOk, disputesOpen, disputesTotal, cancellations, recentActivity },
  };
}

// ============================================================
// ALERTS BUILDER
// ============================================================
function buildAlerts(
  counts: Pick<DashboardSummary, "disputesCount" | "offersReceivedCount" | "myRequestsCount">,
  trust: TrustScoreResult
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  if (trust.flagged) {
    alerts.push({ type: "danger", message: "Votre compte présente des comportements suspects. Contactez le support." });
  }
  if (trust.riskLevel === "HIGH" && !trust.flagged) {
    alerts.push({ type: "warning", message: "Votre score de confiance est bas. Complétez vos livraisons pour l'améliorer." });
  }
  if (counts.disputesCount > 0) {
    alerts.push({ type: "warning", message: `${counts.disputesCount} litige(s) en cours nécessite(nt) votre attention.` });
  }
  if (counts.offersReceivedCount > 0) {
    alerts.push({ type: "info", message: `${counts.offersReceivedCount} offre(s) disponible(s) sur vos demandes.` });
  }
  return alerts;
}

// ============================================================
// MAIN ACTION — OPTIMISÉE sans N+1
// ============================================================
export async function getUserDashboardSummary(): Promise<DashboardSummary> {
  const fallback: DashboardSummary = {
    myRequestsCount: 0, offersReceivedCount: 0, submittedOffersCount: 0,
    activeDeliveriesCount: 0, disputesCount: 0, transactionsCount: 0,
    trust: { trustScore: 50, riskLevel: "MEDIUM", flagged: false,
      details: { deliveriesOk: 0, transactionsOk: 0, disputesOpen: 0, disputesTotal: 0, cancellations: 0, recentActivity: false } },
    alerts: [], cachedAt: Date.now(),
  };

  try {
    const user = await requireRole([UserRole.USER]);

    const cached = getCached(user.id);
    if (cached) return cached;

    const [
      myRequestsCount, offersReceivedCount, submittedOffersCount,
      activeDeliveriesCount, disputesCount, transactionsCount, trust,
    ] = await Promise.all([
      prisma.productRequest.count({ where: { requesterId: user.id, deletedAt: null } }),
      prisma.offer.count({ where: { request: { requesterId: user.id }, deletedAt: null } }),
      prisma.offer.count({ where: { providerId: user.id, deletedAt: null } }),
      prisma.shipment.count({ where: { providerId: user.id, deliveredAt: null } }),
      prisma.dispute.count({ where: { OR: [{ reportedById: user.id }, { request: { requesterId: user.id } }] } }),
      prisma.transaction.count({ where: { requesterId: user.id } }),
      computeTrustScore(user.id),
    ]);

    const counts = { myRequestsCount, offersReceivedCount, submittedOffersCount, activeDeliveriesCount, disputesCount, transactionsCount };
    const alerts = buildAlerts({ disputesCount, offersReceivedCount, myRequestsCount }, trust);
    const result: DashboardSummary = { ...counts, trust, alerts, cachedAt: Date.now() };
    setCached(user.id, result);
    return result;
  } catch {
    return fallback;
  }
}

export async function getUserOffersReceived() {
  const user = await requireRole([UserRole.USER]);
  return prisma.productRequest.findMany({
    where: { requesterId: user.id, deletedAt: null },
    include: {
      requester: { select: { id: true, name: true } },
      offers: {
        where: { deletedAt: null },
        include: { provider: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserSubmittedOffersDetailed() {
  const user = await requireRole([UserRole.USER]);
  return prisma.offer.findMany({
    where: { providerId: user.id, deletedAt: null },
    include: {
      request: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          requester: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserDeliveries() {
  const user = await requireRole([UserRole.USER]);
  return prisma.shipment.findMany({
    where: { providerId: user.id },
    include: { request: { select: { id: true, title: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserDisputes() {
  const user = await requireRole([UserRole.USER]);
  return prisma.dispute.findMany({
    where: { OR: [{ reportedById: user.id }, { request: { requesterId: user.id } }, { request: { acceptedOffer: { providerId: user.id } } }] },
    include: {
      request: { select: { id: true, title: true, status: true } },
      reportedBy: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserTransactions() {
  const user = await requireRole([UserRole.USER]);

  return prisma.transaction.findMany({
    where: {
      OR: [
        { requesterId: user.id },
        { request: { acceptedOffer: { providerId: user.id } } },
      ],
    },
    include: {
      request: {
        select: {
          id: true,
          title: true,
          status: true,
          acceptedOffer: {
            select: {
              id: true,
              provider: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      requester: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

