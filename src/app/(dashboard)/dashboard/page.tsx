import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserDashboardSummary } from "@/app/actions/dashboard";

export default async function UnifiedDashboardPage() {
  const summary = await getUserDashboardSummary();

  const items = [
    { label: "Mes demandes", value: summary.myRequestsCount, href: "/dashboard/requests" },
    { label: "Offres recues", value: summary.offersReceivedCount, href: "/dashboard/offers-received" },
    { label: "Offres soumises", value: summary.submittedOffersCount, href: "/dashboard/offers-submitted" },
    { label: "Livraisons actives", value: summary.activeDeliveriesCount, href: "/dashboard/deliveries" },
    { label: "Litiges", value: summary.disputesCount, href: "/dashboard/disputes" },
    { label: "Transactions", value: summary.transactionsCount, href: "/dashboard/transactions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Tableau de bord utilisateur</h1>
        <p className="text-sm text-slate-600">Un espace unique pour gerer vos demandes, offres, livraisons, litiges et paiements.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold text-slate-900">{item.value}</p>
              <Link href={item.href} className="text-sm font-medium text-primary-700 hover:underline">
                Ouvrir
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

