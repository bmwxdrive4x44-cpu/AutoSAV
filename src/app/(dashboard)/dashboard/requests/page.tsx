import Link from "next/link";
import { getClientRequests } from "@/app/actions/requests";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function UserRequestsPage() {
  const requests = await getClientRequests();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Mes demandes</h1>
        <Link href="/dashboard/create-request">
          <Button>Creer une demande</Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="surface-card p-10 text-center text-slate-500">Aucune demande pour le moment.</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{request.title}</p>
                    <p className="text-sm text-slate-500">{request.category.name} · {formatPrice(request.budget)} · {formatDate(request.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <RequestStatusBadge status={request.status} />
                    <Link href={`/request/${request.id}`} className="text-sm font-bold text-primary-700 hover:text-primary-900">Voir la demande</Link>
                  </div>
                </div>
                {request.offers.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-slate-500 font-semibold">Offres reçues :</p>
                    {request.offers.map((offer) => (
                      <div key={offer.id} className="flex items-center justify-between rounded-md border ui-border-color bg-slate-50 p-3">
                        <div>
                          <p className="font-medium text-slate-900">Transporteur : {offer.provider.name}</p>
                          <p className="text-sm text-slate-500">{formatPrice(offer.price)} · {offer.estimatedDeliveryDays} jours</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <RequestStatusBadge status={offer.status} />
                          {offer.status === "PENDING" && (
                            <div className="flex gap-2 mt-1">
                              <form action="/api/offers/accept" method="POST">
                                <input type="hidden" name="offerId" value={offer.id} />
                                <input type="hidden" name="requestId" value={request.id} />
                                <Button size="sm" variant="default">Accepter</Button>
                              </form>
                              <form action="/api/offers/reject" method="POST">
                                <input type="hidden" name="offerId" value={offer.id} />
                                <input type="hidden" name="requestId" value={request.id} />
                                <Button size="sm" variant="destructive">Refuser</Button>
                              </form>
                            </div>
                          )}
                          {offer.status !== "PENDING" && (
                            <span className="text-xs text-slate-400">Action terminée</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

