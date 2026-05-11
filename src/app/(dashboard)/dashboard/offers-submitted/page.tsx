import Link from "next/link";
import { getUserSubmittedOffersDetailed } from "@/app/actions/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { OfferStatusBadge } from "@/components/requests/status-badge";
import { formatPrice } from "@/lib/utils";

export default async function OffersSubmittedPage() {
  const offers = await getUserSubmittedOffersDetailed();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Offres soumises</h1>

      {offers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">Vous n'avez pas encore soumis d'offres.</div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{offer.request.title}</p>
                    <p className="text-sm text-slate-500">{formatPrice(offer.price)} Â· {offer.estimatedDeliveryDays} jours Â· Demandeur: {offer.request.requester.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OfferStatusBadge status={offer.status} />
                    <Link href={`/request/${offer.request.id}`} className="text-sm font-medium text-primary-700 hover:underline">Voir</Link>
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

