import Link from "next/link";
import { getUserTransactions } from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function TransactionsPage() {
  const transactions = await getUserTransactions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Historique des transactions</h1>

      {transactions.length === 0 ? (
        <div className="surface-card p-10 text-center text-slate-500">Aucune transaction pour le moment.</div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{transaction.request.title}</p>
                    <p className="text-sm text-slate-500">Montant: {formatPrice(transaction.amount)}</p>
                    <p className="text-xs text-slate-400">{formatDate(transaction.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={transaction.status === "RELEASED" ? "success" : transaction.status === "DISPUTED" ? "destructive" : "secondary"}>
                      {transaction.status}
                    </Badge>
                    <Link href={`/request/${transaction.request.id}`} className="text-sm font-medium text-primary-700 hover:underline">Voir</Link>
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

