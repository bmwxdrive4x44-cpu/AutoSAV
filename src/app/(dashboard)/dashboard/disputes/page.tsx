import Link from "next/link";
import { getUserDisputes } from "@/app/actions/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function DisputesPage() {
  const disputes = await getUserDisputes();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Litiges</h1>

      {disputes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">Aucun litige pour le moment.</div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <Card key={dispute.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{dispute.request.title}</p>
                    <p className="text-sm text-slate-500">Raison: {dispute.reason}</p>
                    <p className="text-xs text-slate-400">Statut: {dispute.status} Â· Cree le {formatDate(dispute.createdAt)}</p>
                  </div>
                  <Link href={`/request/${dispute.request.id}`} className="text-sm font-medium text-primary-700 hover:underline">Voir la demande</Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

