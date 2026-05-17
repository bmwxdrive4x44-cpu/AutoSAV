import { getPublicRequests } from "@/app/actions/requests";
import { getCurrentUser } from "@/lib/auth";
import { RequestCard } from "@/components/requests/request-card";

export default async function RequestsMarketPage() {
  const [requestsResult, userResult] = await Promise.allSettled([
    getPublicRequests(),
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
      {requests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">Aucune demande ouverte actuellement.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} user={user} ctaLabel="Faire une offre" />
          ))}
        </div>
      )}
    </div>
  );
}

