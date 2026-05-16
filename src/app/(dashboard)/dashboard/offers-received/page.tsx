import Link from "next/link";
import { getUserOffersReceived } from "@/app/actions/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { OfferStatusBadge, RequestStatusBadge } from "@/components/requests/status-badge";
import { formatPrice } from "@/lib/utils";

export default async function OffersReceivedPage() {
  const requests = await getUserOffersReceived();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Offres recues</h1>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">Vous n'avez pas encore recu d'offres.</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{request.title}</p>
                    <p className="text-sm text-slate-500">{request.offers.length} offre(s)</p>
                  </div>
                  <RequestStatusBadge status={request.status} />
                </div>

                <div className="space-y-2">
                  {request.offers.map((offer) => (
                    <div key={offer.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                      <div>
                        <p className="font-medium text-slate-900">{offer.provider.name}</p>
                        <p className="text-sm text-slate-500">{formatPrice(offer.price)} · {offer.estimatedDeliveryDays} jours</p>
                      </div>
                      <OfferStatusBadge status={offer.status} />
                    </div>
                  ))}
                </div>

                <Link href={`/request/${request.id}`} className="text-sm font-medium text-primary-700 hover:underline">Voir le detail</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

