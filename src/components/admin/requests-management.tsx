"use client";

import { useState } from "react";
import {
  deleteRequest,
  toggleFeaturedRequest,
  markRequestAsScam,
  closeRequest,
} from "@/app/actions/admin";

interface RequestsManagementProps {
  requests: any[];
  onReload: () => Promise<void>;
}

export function RequestsManagement({ requests, onReload }: RequestsManagementProps) {
  const [actionPending, setActionPending] = useState<Record<string, boolean>>({});

  function askReason(title: string, defaultValue: string): string | null {
    const value = window.prompt(title, defaultValue);
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  async function handleAction(requestId: string, action: () => Promise<any>) {
    setActionPending((prev) => ({ ...prev, [requestId]: true }));
    try {
      await action();
      await onReload();
    } finally {
      setActionPending((prev) => ({ ...prev, [requestId]: false }));
    }
  }

  const suspiciousRequests = requests.filter((r) => r.isSuspicious && !r.deletedAt);
  const activeRequests = requests.filter(
    (r) => (r.status === "REQUEST_CREATED" || r.status === "OFFERS_RECEIVED") && !r.deletedAt
  );
  const closedRequests = requests.filter((r) => r.status === "REQUEST_CLOSED" && !r.deletedAt);
  const deletedRequests = requests.filter((r) => r.deletedAt);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-600">Total demandes</p>
          <p className="text-2xl font-bold text-slate-900">{requests.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-700">Demandes suspectes</p>
          <p className="text-2xl font-bold text-amber-900">{suspiciousRequests.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-700">Demandes actives</p>
          <p className="text-2xl font-bold text-emerald-900">{activeRequests.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-700">Demandes supprimÃ©es</p>
          <p className="text-2xl font-bold text-slate-900">{deletedRequests.length}</p>
        </div>
      </div>

      {/* Suspicious Requests */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
          <h3 className="text-base font-semibold text-amber-900">Demandes suspectes ({suspiciousRequests.length})</h3>
        </div>
        {suspiciousRequests.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Aucune demande suspecte.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Raison</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {suspiciousRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">{req.title}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{req.requester?.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{Math.floor(req.budget)} DZD</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{req.suspiciousReason || "-"}</td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (!window.confirm("Confirmer le marquage de cette demande en fraude ?")) {
                            return;
                          }
                          const reason = askReason(
                            "Raison de la fraude :",
                            "Fraude suspectÃ©e par modÃ©ration admin"
                          );
                          if (!reason) return;
                          return handleAction(req.id, () => markRequestAsScam(req.id, reason));
                        }}
                        disabled={!!actionPending[req.id]}
                        className="px-2 py-1 rounded text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Marquer fraude
                      </button>
                      <button
                        onClick={() => {
                          if (!window.confirm("Confirmer la suppression de cette demande ?")) {
                            return;
                          }
                          const reason = askReason(
                            "Raison de suppression :",
                            "SupprimÃ©e par modÃ©ration admin"
                          );
                          if (!reason) return;
                          return handleAction(req.id, () => deleteRequest(req.id, reason));
                        }}
                        disabled={!!actionPending[req.id]}
                        className="px-2 py-1 rounded text-xs font-semibold bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-60"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Active Requests */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200">
          <h3 className="text-base font-semibold text-emerald-900">Demandes actives ({activeRequests.length})</h3>
        </div>
        {activeRequests.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Aucune demande active.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Offres</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">{req.title}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{req.requester?.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{Math.floor(req.budget)} DZD</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{req.offers?.length || 0}</td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const actionLabel = req.isFeatured ? "retirer de la mise en avant" : "mettre en avant";
                          if (!window.confirm(`Confirmer: ${actionLabel} cette demande ?`)) {
                            return;
                          }
                          return handleAction(req.id, () => toggleFeaturedRequest(req.id, !req.isFeatured));
                        }}
                        disabled={!!actionPending[req.id]}
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          req.isFeatured
                            ? "bg-yellow-600 text-white"
                            : "bg-slate-300 text-slate-700"
                        } hover:opacity-90 disabled:opacity-60`}
                      >
                        {req.isFeatured ? "En avant" : "Avant"}
                      </button>
                      <button
                        onClick={() => {
                          if (!window.confirm("Confirmer la fermeture de cette demande ?")) {
                            return;
                          }
                          return handleAction(req.id, () => closeRequest(req.id));
                        }}
                        disabled={!!actionPending[req.id]}
                        className="px-2 py-1 rounded text-xs font-semibold bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-60"
                      >
                        Fermer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Closed Requests */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">Demandes fermÃ©es ({closedRequests.length})</h3>
        </div>
        {closedRequests.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Aucune demande fermÃ©e.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Offre acceptÃ©e</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {closedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">{req.title}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{req.requester?.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{Math.floor(req.budget)} DZD</td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    {req.acceptedOffer ? `${Math.floor(req.acceptedOffer.price)} DZD` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Archived deleted requests */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-slate-100 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">Demandes supprimÃ©es ({deletedRequests.length})</h3>
        </div>
        {deletedRequests.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Aucune demande supprimÃ©e.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Raison suppression</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deletedRequests.map((req) => (
                <tr key={req.id} className="bg-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">{req.title}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{req.requester?.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{Math.floor(req.budget)} DZD</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{req.deletionReason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

