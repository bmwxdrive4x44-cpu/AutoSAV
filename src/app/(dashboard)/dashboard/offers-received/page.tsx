import Link from "next/link";
import { getUserOffersReceived } from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OfferStatusBadge, RequestStatusBadge } from "@/components/requests/status-badge";
import { formatPrice } from "@/lib/utils";

export default async function OffersReceivedPage() {
  const requests = await getUserOffersReceived();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Offres recues</h1>

      {requests.length === 0 ? (
        <div className="surface-card p-10 text-center text-slate-500">Vous n'avez pas encore recu d'offres.</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{request.title}</p>
                    <p className="text-sm text-slate-500">{request.description}</p>
                    <p className="text-xs text-slate-400">Demandeur : {request.requester?.name}</p>
                    <p className="text-xs text-slate-400">Date : {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ''}</p>
                    <p className="text-sm text-slate-500">{request.offers.length} offre(s)</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <RequestStatusBadge status={request.status} />
                    <Link href={`/request/${request.id}`} className="text-xs font-bold text-primary-700 hover:text-primary-900">Voir la demande</Link>
                  </div>
                </div>

                <div className="space-y-2">
                  {request.offers.map((offer) => (
                    <div key={offer.id} className="flex items-center justify-between rounded-md border ui-border-color bg-slate-50 p-3">
                      <div>
                        <p className="font-medium text-slate-900">Transporteur : {offer.provider.name}</p>
                        <p className="text-sm text-slate-500">{formatPrice(offer.price)} · {offer.estimatedDeliveryDays} jours</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <OfferStatusBadge status={offer.status} />
                        {offer.status === "PENDING" && (
                          <div className="flex flex-col items-end gap-1 mt-1">
                            <span className="text-xs text-slate-500">Vous devez accepter ou refuser cette offre</span>
                            <div className="flex gap-2 mt-1">
                              <form action="/api/offers/accept" method="POST">
                                <input type="hidden" name="offerId" value={offer.id} />
                                <input type="hidden" name="requestId" value={request.id} />
                                <Button type="submit" size="sm" variant="secondary">Accepter</Button>
                              </form>
                              <form action="/api/offers/reject" method="POST">
                                <input type="hidden" name="offerId" value={offer.id} />
                                <input type="hidden" name="requestId" value={request.id} />
                                <Button type="submit" size="sm" variant="destructive">Refuser</Button>
                              </form>
                            </div>
                          </div>
                        )}
                        {offer.status === "ACCEPTED" && (
                          <span className="text-xs text-emerald-600 font-semibold">Offre acceptée</span>
                        )}
                        {offer.status === "REJECTED" && (
                          <span className="text-xs text-rose-600 font-semibold">Offre refusée</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

