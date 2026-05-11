"use client";

import { useState } from "react";
import { updateTransactionStatus } from "@/app/actions/admin";

interface TransactionsManagementProps {
  transactions: any[];
  onReload: () => Promise<void>;
}

export function TransactionsManagement({ transactions, onReload }: TransactionsManagementProps) {
  const [pendingById, setPendingById] = useState<Record<string, boolean>>({});

  const pending = transactions.filter((tx) => tx.status === "PENDING");
  const held = transactions.filter((tx) => tx.status === "HELD");
  const released = transactions.filter((tx) => tx.status === "RELEASED");
  const refunded = transactions.filter((tx) => tx.status === "REFUNDED");
  const financialDisputes = transactions.filter((tx) => tx.request?.dispute?.status === "OPEN");

  async function runAction(txId: string, action: () => Promise<void>) {
    setPendingById((prev) => ({ ...prev, [txId]: true }));
    try {
      await action();
      await onReload();
    } finally {
      setPendingById((prev) => ({ ...prev, [txId]: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-600">Paiements en attente</p>
          <p className="text-2xl font-bold text-slate-900">{pending.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-700">Argent bloque</p>
          <p className="text-2xl font-bold text-amber-900">{held.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-700">Argent libere</p>
          <p className="text-2xl font-bold text-emerald-900">{released.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-rose-200 bg-rose-50">
          <p className="text-sm text-rose-700">Remboursements</p>
          <p className="text-2xl font-bold text-rose-900">{refunded.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-violet-200 bg-violet-50">
          <p className="text-sm text-violet-700">Litiges financiers</p>
          <p className="text-2xl font-bold text-violet-900">{financialDisputes.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base font-semibold text-slate-900">Transactions / Escrow ({transactions.length})</h3>
        </div>

        {transactions.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Aucune transaction disponible.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Demande</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Agent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Litige</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-800 font-medium">{tx.request?.title || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{tx.requester?.name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {tx.request?.acceptedOffer?.provider?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{Math.floor(tx.amount)} DZD</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">{tx.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {tx.request?.dispute?.status === "OPEN" ? (
                      <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">OPEN</span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          if (!window.confirm("Liberer manuellement ce paiement ?")) return;
                          return runAction(tx.id, () => updateTransactionStatus(tx.id, "RELEASED"));
                        }}
                        disabled={!!pendingById[tx.id] || tx.status === "RELEASED"}
                        className="px-2 py-1 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Liberer
                      </button>
                      <button
                        onClick={() => {
                          if (!window.confirm("Bloquer cette transaction (escrow) ?")) return;
                          return runAction(tx.id, () => updateTransactionStatus(tx.id, "HELD"));
                        }}
                        disabled={!!pendingById[tx.id] || tx.status === "HELD"}
                        className="px-2 py-1 rounded text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
                      >
                        Bloquer
                      </button>
                      <button
                        onClick={() => {
                          if (!window.confirm("Rembourser le client pour cette transaction ?")) return;
                          return runAction(tx.id, () => updateTransactionStatus(tx.id, "REFUNDED"));
                        }}
                        disabled={!!pendingById[tx.id] || tx.status === "REFUNDED"}
                        className="px-2 py-1 rounded text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                      >
                        Rembourser
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

