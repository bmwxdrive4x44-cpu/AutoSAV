"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types";
import { getClientRequests } from "@/app/actions/requests";
import { getAgentBuyerOffers } from "@/app/actions/offers";
import { getAgentBuyerShipments } from "@/app/actions/shipments";

export async function getUserDashboardSummary() {
  const user = await requireRole([UserRole.USER]);

  const [myRequests, submittedOffers, activeDeliveries, disputes, transactions] = await Promise.all([
    getClientRequests(),
    getAgentBuyerOffers(),
    getAgentBuyerShipments(),
    prisma.dispute.findMany({
      where: {
        OR: [
          { reportedById: user.id },
          { request: { requesterId: user.id } },
          { request: { acceptedOffer: { providerId: user.id } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.transaction.findMany({
      where: {
        OR: [
          { requesterId: user.id },
          { request: { acceptedOffer: { providerId: user.id } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const offersReceived = myRequests.reduce((acc, request) => acc + request.offers.length, 0);

  return {
    myRequestsCount: myRequests.length,
    offersReceivedCount: offersReceived,
    submittedOffersCount: submittedOffers.length,
    activeDeliveriesCount: activeDeliveries.length,
    disputesCount: disputes.length,
    transactionsCount: transactions.length,
    myRequests: myRequests.slice(0, 5),
    submittedOffers: submittedOffers.slice(0, 5),
    activeDeliveries: activeDeliveries.slice(0, 5),
    disputes: disputes.slice(0, 5),
    transactions: transactions.slice(0, 5),
  };
}

export async function getUserOffersReceived() {
  const myRequests = await getClientRequests();
  return myRequests.filter((request) => request.offers.length > 0);
}

export async function getUserSubmittedOffersDetailed() {
  return getAgentBuyerOffers();
}

export async function getUserDeliveries() {
  return getAgentBuyerShipments();
}

export async function getUserDisputes() {
  const user = await requireRole([UserRole.USER]);

  return prisma.dispute.findMany({
    where: {
      OR: [
        { reportedById: user.id },
        { request: { requesterId: user.id } },
        { request: { acceptedOffer: { providerId: user.id } } },
      ],
    },
    include: {
      request: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      reportedBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
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

