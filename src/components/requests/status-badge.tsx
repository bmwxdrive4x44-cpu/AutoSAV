"use client";

import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  REQUEST_CREATED: { label: "Nouvelle demande", variant: "secondary" },
  OFFERS_RECEIVED: { label: "Offres reçues", variant: "warning" },
  OFFER_ACCEPTED: { label: "Offre acceptée", variant: "default" },
  PAYMENT_PENDING: { label: "Paiement en attente", variant: "warning" },
  PURCHASE_IN_PROGRESS: { label: "Achat en cours", variant: "default" },
  SHIPPED: { label: "Expédié", variant: "default" },
  DELIVERED: { label: "Livré", variant: "success" },
  PAYMENT_RELEASED: { label: "Terminé", variant: "success" },
  PENDING: { label: "En attente", variant: "warning" },
  ACCEPTED: { label: "Acceptée", variant: "success" },
  REJECTED: { label: "Refusée", variant: "destructive" },
    EXPIRED: { label: "Expirée", variant: "destructive" },
  };

export function RequestStatusBadge({ status }: { status: string }) {
  const config = statusMap[status] || { label: status, variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function OfferStatusBadge({ status }: { status: string }) {
  const config = statusMap[status] || { label: status, variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status] || { label: status, variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

