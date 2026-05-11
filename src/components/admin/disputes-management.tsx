"use client";

import { useMemo, useState } from "react";
import {
  createAdminDispute,
  requestDisputeEvidence,
  arbitrateDispute,
} from "@/app/actions/admin";

interface DisputesManagementProps {
  disputes: any[];
  requests: any[];
  onReload: () => Promise<void>;
}

export function DisputesManagement({ disputes, requests, onReload }: DisputesManagementProps) {
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [reason, setReason] = useState("");
  const [pendingById, setPendingById] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);

  const openDisputes = useMemo(() => disputes.filter((d) => d.status === "OPEN"), [disputes]);

  const requestOptions = useMemo(() => {
    const withNoDispute = requests.filter((r) => !disputes.some((d) => d.requestId === r.id));
    return withNoDispute.map((r) => ({ id: r.id, label: `${r.title} (${Math.floor(r.budget)} DZD)` }));
  }, [requests, disputes]);

  async function runAction(disputeId: string, action: () => Promise<any>) {
    setPendingById((prev) => ({ ...prev, [disputeId]: true }));
    try {
      await action();
      await onReload();
    } finally {
      setPendingById((prev) => ({ ...prev, [disputeId]: false }));
    }
  }

  async function handleCreateDispute() {
    if (!selectedRequestId) return;
    if (!reason.trim()) return;
    setCreating(true);
    try {
      await createAdminDispute(selectedRequestId, reason.trim());
      setReason("");
      setSelectedRequestId("");
      await onReload();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border border-slate-200 p-4">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Ouvrir dossier litige (Admin)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          >
            <option value="">Choisir une demande</option>
            {requestOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motif du litige (produit non recu, mauvais produit, agent disparu...)"
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm md:col-span-2"
          />
        </div>
        <div className="mt-3">
          <button
            onClick={handleCreateDispute}
            disabled={creating || !selectedRequestId || !reason.trim()}
            className="px-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-60"
          >
            {creating ? "Ouverture..." : "Ouvrir dossier"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-600">Total litiges</p>
          <p className="text-2xl font-bold text-slate-900">{disputes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-rose-200 bg-rose-50">
          <p className="text-sm text-rose-700">Litiges ouverts</p>
          <p className="text-2xl font-bold text-rose-900">{openDisputes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-700">Litiges resolus</p>
          <p className="text-2xl font-bold text-emerald-900">{disputes.length - openDisputes.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base font-semibold text-slate-900">Litiges ({disputes.length})</h3>
        </div>

        {disputes.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Aucun litige pour le moment.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Demande</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Motif</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Signale par</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Transaction</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Arbitrage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {disputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-800 font-medium">{dispute.request?.title || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-[220px] truncate" title={dispute.reason}>{dispute.reason}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{dispute.reportedBy?.name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{dispute.request?.transaction?.status || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">{dispute.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-[220px] truncate" title={dispute.resolution || ""}>
                    {dispute.resolution || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          const note = window.prompt("Demande de preuve (note)", "Merci de fournir preuves et tracking");
                          if (!note || !note.trim()) return;
                          return runAction(dispute.id, () => requestDisputeEvidence(dispute.id, note.trim()));
                        }}
                        disabled={!!pendingById[dispute.id]}
                        className="px-2 py-1 rounded text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                      >
                        Demander preuve
                      </button>
                      <button
                        onClick={() => {
                          if (!window.confirm("Arbitrer ce litige en remboursant le client ?")) return;
                          const note = window.prompt("Note arbitrage", "Remboursement valide par admin") || undefined;
                          return runAction(dispute.id, () => arbitrateDispute(dispute.id, "REFUND_CLIENT", note?.trim()));
                        }}
                        disabled={!!pendingById[dispute.id]}
                        className="px-2 py-1 rounded text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                      >
                        Rembourser client
                      </button>
                      <button
                        onClick={() => {
                          if (!window.confirm("Arbitrer ce litige en payant l'agent ?")) return;
                          const note = window.prompt("Note arbitrage", "Paiement agent valide par admin") || undefined;
                          return runAction(dispute.id, () => arbitrateDispute(dispute.id, "PAY_AGENT", note?.trim()));
                        }}
                        disabled={!!pendingById[dispute.id]}
                        className="px-2 py-1 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Payer agent
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

