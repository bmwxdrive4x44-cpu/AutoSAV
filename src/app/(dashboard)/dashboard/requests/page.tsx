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
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">Aucune demande pour le moment.</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{request.title}</p>
                    <p className="text-sm text-slate-500">{request.category.name} · {formatPrice(request.budget)} · {formatDate(request.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <RequestStatusBadge status={request.status} />
                    <Link href={`/request/${request.id}`} className="text-sm font-medium text-primary-700 hover:underline">Voir</Link>
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

