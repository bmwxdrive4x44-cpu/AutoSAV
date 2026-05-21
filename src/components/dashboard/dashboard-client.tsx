"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { useTransition } from "react";
import { useRealtimeDashboard } from "@/hooks/use-realtime-dashboard";
import { AlertPanel, KpiCard, StatWidget, TrustScoreBar } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DashboardSummary } from "@/app/actions/dashboard";

interface CardItem {
  label: string;
  value: number;
  href: string;
  description?: string;
}
interface DashboardClientProps {
  initialData: DashboardSummary;
  refreshAction: () => Promise<DashboardSummary>;
}

export function DashboardClient({ initialData, refreshAction }: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  const { data, isLive, lastUpdated, refresh } = useRealtimeDashboard({
    initialData,
    onRefresh: refreshAction,
  });

  const handleRefresh = () => {
    startTransition(() => { refresh(); });
  };

  const seconds = Math.round((Date.now() - lastUpdated.getTime()) / 1000);

  const items: CardItem[] = [
    { label: "Mes demandes", value: data.myRequestsCount, href: "/dashboard/requests", description: "Demandes que vous avez créées" },
    { label: "Offres reçues", value: data.offersReceivedCount, href: "/dashboard/offers-received", description: "Offres sur vos demandes" },
    { label: "Offres envoyées", value: data.submittedOffersCount, href: "/dashboard/offers-submitted", description: "Vos propositions de livraison" },
    { label: "Livraisons actives", value: data.activeDeliveriesCount, href: "/dashboard/deliveries", description: "En cours de livraison" },
    { label: "Litiges", value: data.disputesCount, href: "/dashboard/disputes", description: "Litiges vous impliquant" },
    { label: "Transactions", value: data.transactionsCount, href: "/dashboard/transactions", description: "Historique des paiements" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-0.5">KPIs, risque, litiges et transactions en direct.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isLive ? "success" : "secondary"} className="gap-1.5">
            <Activity className={`h-3 w-3 ${isLive ? "animate-pulse" : ""}`} />
            {isLive ? "Live" : "Pause"}
          </Badge>
          <span className="text-xs text-slate-500">Mis a jour il y a {seconds}s</span>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isPending}>
            {isPending ? "Actualisation..." : "Actualiser"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <KpiCard key={item.label} label={item.label} value={item.value} delta={item.description} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatWidget title="Confiance & risque" subtitle="Systeme reputatif et anti-fraude">
          <TrustScoreBar score={data.trust.trustScore} riskLevel={data.trust.riskLevel} />
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
            <span>Livraisons: {data.trust.details.deliveriesOk}</span>
            <span>Transactions: {data.trust.details.transactionsOk}</span>
            <span>Litiges ouverts: {data.trust.details.disputesOpen}</span>
          </div>
        </StatWidget>

        <AlertPanel
          alerts={data.alerts.map((alert, index) => ({
            id: `${index}-${alert.type}`,
            title: alert.type === "danger" ? "Alerte critique" : alert.type === "warning" ? "Attention" : "Information",
            message: alert.message,
            severity: alert.type === "danger" ? "critical" : alert.type === "warning" ? "warning" : "info",
          }))}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link key={`${item.label}-link`} href={item.href} className="surface-card block p-4 transition-shadow duration-200 hover:shadow-subtle-hover">
            <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
            <p className="mt-2 text-xs text-primary-700">Voir le detail</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
