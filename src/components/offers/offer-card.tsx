"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status-badge";
import { formatPrice } from "@/lib/utils";
import { Clock, User, MessageSquare, MapPin, ShieldCheck, Star, TrendingUp, AlertTriangle } from "lucide-react";
import { acceptOffer } from "@/app/actions/offers";
import { useTransition } from "react";

interface OfferCardProps {
  offer: {
    id: string;
    price: number;
    estimatedDeliveryDays: number;
    message: string;
    status: string;
    provider: {
      name: string;
      email: string;
      trustScore?: number | null;
      emailVerifiedAt?: string | Date | null;
      phoneVerifiedAt?: string | Date | null;
      agentValidationStatus?: string;
    };
    agentLocation?: string;
    agentStats?: {
      totalOffers: number;
      deliveredShipments: number;
      disputesOnAgent: number;
    };
  };
  requestId: string;
  canAccept: boolean;
}

export function OfferCard({ offer, requestId, canAccept }: OfferCardProps) {
  const [isPending, startTransition] = useTransition();
  const location = offer.agentLocation || "Abroad";
  const trustScore = offer.provider.trustScore ?? 0;
  const deliveredShipments = offer.agentStats?.deliveredShipments ?? 0;
  const disputesOnAgent = offer.agentStats?.disputesOnAgent ?? 0;
  const totalOffers = offer.agentStats?.totalOffers ?? 0;

  return (
    <Card className={offer.status === "ACCEPTED" ? "border-green-500 border-2" : ""}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base">{formatPrice(offer.price)}</CardTitle>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <User className="w-3 h-3" />
              {offer.provider.name}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                <Star className="h-3 w-3 text-amber-500" />
                Score {trustScore}/100
              </span>
              {offer.provider.emailVerifiedAt && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                  <ShieldCheck className="h-3 w-3" />
                  Email vérifié
                </span>
              )}
              {offer.provider.phoneVerifiedAt && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-1 font-semibold text-cyan-700">
                  <ShieldCheck className="h-3 w-3" />
                  Téléphone vérifié
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={offer.status} />
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <Clock className="h-4 w-4" />
              Livraison estimée
            </div>
            <p className="mt-1 text-sm text-slate-900">{offer.estimatedDeliveryDays} jours</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <TrendingUp className="h-4 w-4" />
              Livraisons
            </div>
            <p className="mt-1 text-sm text-slate-900">{deliveredShipments} réussies</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <AlertTriangle className="h-4 w-4" />
              Litiges
            </div>
            <p className="mt-1 text-sm text-slate-900">{disputesOnAgent} signalé(s)</p>
          </div>
        </div>
        <div className="flex items-start gap-1 text-sm text-slate-600">
          <MessageSquare className="w-4 h-4 mt-0.5" />
          <p className="text-sm">{offer.message}</p>
        </div>
        <p className="text-xs text-slate-500">{totalOffers} offre(s) publiées par cet agent.</p>
        {canAccept && offer.status === "PENDING" && (
          <Button
            className="w-full"
            onClick={() => {
              startTransition(() => {
                acceptOffer(offer.id, requestId);
              });
            }}
            disabled={isPending}
          >
            {isPending ? "Traitement..." : "Accepter cette offre"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

