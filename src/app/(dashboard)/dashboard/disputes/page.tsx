import Link from "next/link";
import { getUserDisputes } from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function DisputesPage() {
  const disputes = await getUserDisputes();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Litiges</h1>

      {disputes.length === 0 ? (
        <div className="surface-card p-10 text-center text-slate-500">Aucun litige pour le moment.</div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <Card key={dispute.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{dispute.request.title}</p>
                    <p className="text-sm text-slate-500">Raison: {dispute.reason}</p>
                    <p className="mt-1 text-xs text-slate-400">Cree le {formatDate(dispute.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={dispute.status === "OPEN" ? "warning" : dispute.status === "RESOLVED" ? "success" : "secondary"}>
                      {dispute.status}
                    </Badge>
                    <Link href={`/request/${dispute.request.id}`} className="text-sm font-medium text-primary-700 hover:underline">Voir la demande</Link>
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

