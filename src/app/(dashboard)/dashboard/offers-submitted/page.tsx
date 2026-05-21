import { getUserSubmittedOffersDetailed } from "@/app/actions/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { OfferStatusBadge } from "@/components/requests/status-badge";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default async function OffersSubmittedPage() {
  const offers = await getUserSubmittedOffersDetailed();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Offres soumises</h1>

      {offers.length === 0 ? (
        <div className="surface-card p-10 text-center text-slate-500">Vous n'avez pas encore soumis d'offres.</div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">Demande : {offer.request.title}</p>
                    <p className="text-sm text-slate-500">{offer.request.description}</p>
                    <p className="text-xs text-slate-400">Demandeur : {offer.request.requester?.name}</p>
                    <p className="text-xs text-slate-400">Date : {offer.request.createdAt ? new Date(offer.request.createdAt).toLocaleDateString() : ''}</p>
                    <p className="text-sm text-slate-500">Votre offre : {formatPrice(offer.price)} · {offer.estimatedDeliveryDays} jours</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <OfferStatusBadge status={offer.status} />
                    {offer.status === "PENDING" && (
                      <span className="text-xs text-slate-500">En attente de la réponse du demandeur</span>
                    )}
                    {offer.status === "ACCEPTED" && (
                      <span className="text-xs text-emerald-600 font-semibold">Votre offre a été acceptée</span>
                    )}
                    {offer.status === "REJECTED" && (
                      <span className="text-xs text-rose-600 font-semibold">Votre offre a été refusée</span>
                    )}
                    <Link href={`/request/${offer.request.id}`} className="mt-2 text-xs font-bold text-primary-700 hover:text-primary-900">Voir la demande</Link>
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

