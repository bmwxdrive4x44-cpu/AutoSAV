import Link from "next/link";
import { getUserDeliveries } from "@/app/actions/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import { formatDate } from "@/lib/utils";

export default async function DeliveriesPage() {
  const deliveries = await getUserDeliveries();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Livraisons actives</h1>

      {deliveries.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">Aucune livraison active.</div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <Card key={delivery.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{delivery.request.title}</p>
                    <p className="text-sm text-slate-500">Tracking: {delivery.trackingNumber || "Non renseigne"} Â· Transporteur: {delivery.carrier || "Non renseigne"}</p>
                    <p className="text-xs text-slate-400">Expedie: {delivery.shippedAt ? formatDate(delivery.shippedAt) : "N/A"} Â· Livre: {delivery.deliveredAt ? formatDate(delivery.deliveredAt) : "En cours"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <RequestStatusBadge status={delivery.request.status} />
                    <Link href={`/request/${delivery.request.id}`} className="text-sm font-medium text-primary-700 hover:underline">Voir</Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

