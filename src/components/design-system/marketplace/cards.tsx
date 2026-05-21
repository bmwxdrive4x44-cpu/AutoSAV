"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Clock3, PackageCheck, ShieldAlert, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hoverLift, scaleSoft } from "@/lib/motion/presets";
import { cn, formatPrice } from "@/lib/utils";

type Priority = "HIGH" | "NORMAL" | "LOW";
type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface CardMeta {
  title: string;
  subtitle: string;
  amount?: number;
  statusLabel: string;
  priority?: Priority;
  riskLevel?: RiskLevel;
}

interface MarketplaceCardProps {
  meta: CardMeta;
  ctaLabel?: string;
  className?: string;
}

const priorityVariant: Record<Priority, "priority-high" | "priority-normal" | "priority-low"> = {
  HIGH: "priority-high",
  NORMAL: "priority-normal",
  LOW: "priority-low",
};

const riskVariant: Record<RiskLevel, "success" | "warning" | "destructive"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "destructive",
};

function MarketplaceCardFrame({ icon, meta, ctaLabel = "Voir", className }: MarketplaceCardProps & { icon: ReactNode }) {
  return (
    <motion.div variants={hoverLift} initial="initial" whileHover="hover" className={className}>
      <Card className="group h-full transition-shadow duration-200 ease-soft hover:shadow-subtle-hover">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary-50 p-2 text-primary-700">{icon}</span>
              <CardTitle className="text-base">{meta.title}</CardTitle>
            </div>
            <Badge variant="secondary">{meta.statusLabel}</Badge>
          </div>
          <p className="text-sm text-slate-500">{meta.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {typeof meta.amount === "number" ? <p className="kpi-value">{formatPrice(meta.amount)}</p> : null}
          <div className="flex flex-wrap gap-2">
            {meta.priority ? <Badge variant={priorityVariant[meta.priority]}>Priorite {meta.priority}</Badge> : null}
            {meta.riskLevel ? <Badge variant={riskVariant[meta.riskLevel]}>Risque {meta.riskLevel}</Badge> : null}
          </div>
          <motion.div variants={scaleSoft} initial="initial" whileHover="hover">
            <Button variant="ghost" className="group/btn w-full justify-between">
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function OfferCard({ meta, className, ctaLabel }: MarketplaceCardProps) {
  return <MarketplaceCardFrame icon={<Truck className="h-4 w-4" />} meta={meta} ctaLabel={ctaLabel ?? "Voir l'offre"} className={className} />;
}

export function RequestCard({ meta, className, ctaLabel }: MarketplaceCardProps) {
  return <MarketplaceCardFrame icon={<PackageCheck className="h-4 w-4" />} meta={meta} ctaLabel={ctaLabel ?? "Voir la demande"} className={className} />;
}

export function ShipmentCard({ meta, className, ctaLabel }: MarketplaceCardProps) {
  return <MarketplaceCardFrame icon={<Clock3 className="h-4 w-4" />} meta={meta} ctaLabel={ctaLabel ?? "Suivre la livraison"} className={className} />;
}

export function DisputeCard({ meta, className, ctaLabel }: MarketplaceCardProps) {
  return (
    <MarketplaceCardFrame
      icon={meta.riskLevel === "HIGH" ? <AlertTriangle className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
      meta={meta}
      ctaLabel={ctaLabel ?? "Ouvrir le litige"}
      className={cn("border-danger-500/20", className)}
    />
  );
}
