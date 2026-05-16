import { notFound } from "next/navigation";
import Link from "next/link";
import { getRequestById } from "@/app/actions/requests";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { RequestStatusBadge } from "@/components/requests/status-badge";
import { OfferCard } from "@/components/offers/offer-card";
import { SubmitOfferForm } from "@/components/offers/submit-offer-form";
import { TransactionChatPanel } from "@/components/requests/transaction-chat-panel";
import { formatPrice } from "@/lib/utils";
import { MapPin, ArrowLeft } from "lucide-react";
import { getTransactionChat } from "@/app/actions/transaction-chat";

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const request = await getRequestById(params.id);
  const user = await getCurrentUser();

  if (!request) notFound();

  const isRequester = user?.id === request.requesterId;
  const canAcceptOffers = isRequester && request.status === "OFFERS_RECEIVED";
  const canSubmitOffer =
    !!user &&
    user.role !== "ADMIN" &&
    user.id !== request.requesterId &&
    (request.status === "REQUEST_CREATED" || request.status === "OFFERS_RECEIVED");
  const chat = await getTransactionChat(request.id, user?.id ?? null);

  const workflowSteps = [
    "Demande",
    "Offres",
    "Paiement",
    "Expédition",
    "Réception",
    "Paiement libéré",
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-primary-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour
        </Link>

        <Card className="mb-6 border-slate-200 bg-white">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">{request.title}</h1>
                <RequestStatusBadge status={request.status} />
              </div>

              <p className="text-slate-600">{request.description}</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Budget</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{formatPrice(request.budget)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-base font-semibold text-slate-900">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {request.countryToBuyFrom}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Demandeur</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{request.requester.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {workflowSteps.map((step, index) => {
                  const order = ["REQUEST_CREATED", "OFFERS_RECEIVED", "PAYMENT_PENDING", "SHIPPED", "DELIVERED", "PAYMENT_RELEASED"];
                  const currentIndex = order.indexOf(request.status);
                  const isDone = currentIndex >= index && currentIndex !== -1;
                  const isCurrent = currentIndex === index;

                  return (
                    <div
                      key={step}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                        isCurrent
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : isDone
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Offres des fournisseurs</h2>

          {canSubmitOffer && <SubmitOfferForm requestId={request.id} />}

          {request.offers.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              No offers yet.
            </div>
          ) : (
            <div className="space-y-4">
              {request.offers.map((offer: any) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  requestId={request.id}
                  canAccept={!!canAcceptOffers}
                />
              ))}
            </div>
          )}

          <TransactionChatPanel
            requestId={request.id}
            canSend={!!chat.canSend}
            defaultOfferId={chat.defaultOfferId}
            messages={chat.messages}
            offers={request.offers}
          />
        </div>
      </div>
    </div>
  );
}

