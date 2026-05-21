import { getPublicRequestsForMatchingPreview } from "@/app/actions/requests";
import { getCurrentUser } from "@/lib/auth";
import { RequestCard } from "@/components/requests/request-card";
import { applyMatchDisplayThreshold, matchLogisticsRequest } from "@/lib/logistics-matching";
import { formatPrice } from "@/lib/utils";

export default async function RequestsMarketPage() {
  const [requestsResult, userResult] = await Promise.allSettled([
    getPublicRequestsForMatchingPreview(),
    getCurrentUser(),
  ]);

  const requests = requestsResult.status === "fulfilled" ? requestsResult.value : [];
  const user = userResult.status === "fulfilled" ? userResult.value : null;

  if (requestsResult.status === "rejected" || userResult.status === "rejected") {
    console.error("RequestsMarketPage data loading failed:", {
      requestsError: requestsResult.status === "rejected" ? requestsResult.reason : null,
      userError: userResult.status === "rejected" ? userResult.reason : null,
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Marketplace des demandes</h1>
      <div className="surface-card border-primary-100 bg-primary-50 p-4 text-sm text-primary-700">
        Apercu matching intelligent actif: seuil d'affichage 55/100 avec conservation du meilleur candidat si aucun ne depasse le seuil.
        Le moteur utilise prioritairement les donnees reelles (poids, volume, trajet, dates, capacite), puis applique un fallback si un champ est absent.
      </div>
      {requests.length === 0 ? (
        <div className="surface-card p-10 text-center text-slate-500">Aucune demande ouverte actuellement.</div>
      ) : (
        <div className="space-y-8">
          {requests.map((request) => {
            const now = new Date();
            const desiredDate = request.desiredShippingDate
              ? new Date(request.desiredShippingDate)
              : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            const rawMatches = matchLogisticsRequest(
              {
                id: request.id,
                from: {
                  country: request.countryToBuyFrom,
                  city: request.pickupCity || undefined,
                },
                to: {
                  country: request.destinationCountry || "Algeria",
                  city: request.destinationCity || undefined,
                },
                weightKg: request.packageWeightKg ?? 5,
                volumeM3: request.packageVolumeM3 ?? 0.04,
                budget: request.budget,
                desiredDate,
                urgency:
                  request.urgency === "LOW" ||
                  request.urgency === "MEDIUM" ||
                  request.urgency === "HIGH" ||
                  request.urgency === "CRITICAL"
                    ? request.urgency
                    : request.status === "OFFERS_RECEIVED"
                      ? "HIGH"
                      : "MEDIUM",
                dateToleranceDays: 3,
              },
              request.offers.map((offer) => {
                const departureDate = offer.departureDate ? new Date(offer.departureDate) : new Date(offer.createdAt);
                const arrivalDate = offer.arrivalDate
                  ? new Date(offer.arrivalDate)
                  : new Date(departureDate.getTime() + offer.estimatedDeliveryDays * 24 * 60 * 60 * 1000);

                return {
                  carrierId: offer.providerId,
                  routeFrom: {
                    country: offer.routeFromCountry || request.countryToBuyFrom,
                    city: offer.routeFromCity || request.pickupCity || undefined,
                  },
                  routeTo: {
                    country: offer.routeToCountry || request.destinationCountry || "Algeria",
                    city: offer.routeToCity || request.destinationCity || undefined,
                  },
                  departureDate,
                  arrivalDate,
                  capacityKg: offer.capacityKg ?? 30,
                  capacityM3: offer.capacityM3 ?? 0.25,
                  price: offer.price,
                  restrictions: offer.restrictions
                    ? offer.restrictions.split(",").map((item) => item.trim()).filter(Boolean)
                    : [],
                  reliabilityScore: offer.provider.trustScore ?? 0,
                };
              })
            );

            const ranked = applyMatchDisplayThreshold(rawMatches, 55);

            return (
              <div key={request.id} className="surface-card space-y-4 p-4">
                <RequestCard request={request} user={user} ctaLabel="Faire une offre" />

                <div className="rounded-md border ui-border-color bg-slate-50 p-4">
                  <h2 className="text-sm font-semibold text-slate-900">Meilleurs transporteurs (matching data reelle)</h2>

                  {ranked.matches.length === 0 ? (
                    <p className="mt-2 text-xs text-slate-600">aucun match disponible</p>
                  ) : (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {ranked.matches.slice(0, 3).map((match, index) => {
                        const provider = request.offers.find((offer) => offer.providerId === match.carrierId)?.provider;
                        const price = request.offers.find((offer) => offer.providerId === match.carrierId)?.price;

                        return (
                          <div key={`${request.id}-${match.carrierId}`} className="rounded-md border ui-border-color bg-white p-3">
                            <p className="text-xs text-slate-500">#{index + 1} {provider?.name || match.carrierId}</p>
                            <p className="mt-1 text-xl font-bold text-slate-900">{Math.round(match.totalScore)}/100</p>
                            <p className="mt-1 text-xs font-semibold text-slate-700">{match.status}</p>
                            {typeof price === "number" && (
                              <p className="mt-1 text-xs text-slate-600">Prix propose: {formatPrice(price)}</p>
                            )}
                            <p className="mt-2 line-clamp-3 text-xs text-slate-600">{match.explanation}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

