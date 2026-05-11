"use client";

import { useMemo, useState } from "react";
import {
  resetAgentKyc,
  setAgentValidationStatus,
  toggleUserBlock,
  verifyAgentEmail,
  verifyAgentPhone,
} from "@/app/actions/admin";

interface AgentsValidationManagementProps {
  users: any[];
  agentPerformance: any[];
  onReload: () => Promise<void>;
  onViewHistory: (userId: string) => Promise<void>;
}

export function AgentsValidationManagement({
  users,
  agentPerformance,
  onReload,
  onViewHistory,
}: AgentsValidationManagementProps) {
  const [pendingById, setPendingById] = useState<Record<string, boolean>>({});

  const agents = useMemo(() => users.filter((u) => u.role === "USER"), [users]);
  const perfById = useMemo(
    () => Object.fromEntries(agentPerformance.map((p: any) => [p.id, p])),
    [agentPerformance]
  );

  const pendingReview = agents.filter((a) => a.agentValidationStatus === "PENDING").length;
  const validated = agents.filter((a) => a.agentValidationStatus === "VALIDATED").length;
  const rejected = agents.filter((a) => a.agentValidationStatus === "REJECTED").length;

  async function runAction(agentId: string, action: () => Promise<any>) {
    setPendingById((prev) => ({ ...prev, [agentId]: true }));
    try {
      await action();
      await onReload();
    } finally {
      setPendingById((prev) => ({ ...prev, [agentId]: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-600">Total utilisateurs</p>
          <p className="text-2xl font-bold text-slate-900">{agents.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-700">A valider</p>
          <p className="text-2xl font-bold text-amber-900">{pendingReview}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-700">Approuves</p>
          <p className="text-2xl font-bold text-emerald-900">{validated}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-rose-200 bg-rose-50">
          <p className="text-sm text-rose-700">Rejetes</p>
          <p className="text-2xl font-bold text-rose-900">{rejected}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base font-semibold text-slate-900">Validation utilisateurs / performance</h3>
          <p className="text-xs text-slate-500 mt-1">Email, telephone, historique, score de confiance et moderation.</p>
        </div>

        {agents.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Aucun utilisateur.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Verif</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Performance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Score confiance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Validation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {agents.map((agent) => {
                const perf = perfById[agent.id];
                const score = perf?.confidenceScore ?? 0;
                return (
                  <tr key={agent.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-800">
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-slate-500">{agent.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <p>Email: {agent.email ? "OK" : "MANQUANT"}</p>
                      <p>Telephone: {agent.phone ? "OK" : "MANQUANT"}</p>
                      <p>Email verifie: {agent.emailVerifiedAt ? "OUI" : "NON"}</p>
                      <p>Telephone verifie: {agent.phoneVerifiedAt ? "OUI" : "NON"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <p>Offres: {perf?.totalOffers ?? 0}</p>
                      <p>Livrees: {perf?.deliveredShipments ?? 0}</p>
                      <p>Litiges: {perf?.disputesOnAgent ?? 0}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        score >= 75
                          ? "bg-emerald-100 text-emerald-700"
                          : score >= 50
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                      }`}>
                        {score}/100
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-2">
                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold inline-flex w-fit">
                          {agent.agentValidationStatus}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold inline-flex w-fit">
                          KYC {agent.kycStatus}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold inline-flex w-fit">
                          Score {agent.trustScore ?? score}/100
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            runAction(agent.id, () =>
                              setAgentValidationStatus(agent.id, "VALIDATED", "Approuve par admin")
                            )
                          }
                          disabled={!!pendingById[agent.id]}
                          className="px-2 py-1 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() => {
                            const note = window.prompt("Note de verification email", "Email controle par admin") || "Email controle par admin";
                            return runAction(agent.id, () => verifyAgentEmail(agent.id, true, note));
                          }}
                          disabled={!!pendingById[agent.id]}
                          className="px-2 py-1 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          Verif email
                        </button>
                        <button
                          onClick={() => {
                            const note = window.prompt("Note de verification telephone", "Telephone controle par admin") || "Telephone controle par admin";
                            return runAction(agent.id, () => verifyAgentPhone(agent.id, true, note));
                          }}
                          disabled={!!pendingById[agent.id]}
                          className="px-2 py-1 rounded text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60"
                        >
                          Verif tel
                        </button>
                        <button
                          onClick={() => {
                            const note = window.prompt("Raison du rejet", "Documents insuffisants") || "Documents insuffisants";
                            return runAction(agent.id, () => setAgentValidationStatus(agent.id, "REJECTED", note));
                          }}
                          disabled={!!pendingById[agent.id]}
                          className="px-2 py-1 rounded text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                        >
                          Rejeter
                        </button>
                        <button
                          onClick={() => {
                            const reason = window.prompt("Raison suspension", "Suspension admin") || "Suspension admin";
                            return runAction(agent.id, () => toggleUserBlock(agent.id, reason));
                          }}
                          disabled={!!pendingById[agent.id]}
                          className="px-2 py-1 rounded text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
                        >
                          {agent.isBlocked ? "Debloquer" : "Suspendre"}
                        </button>
                        <button
                          onClick={() => {
                            const note = window.prompt("Note KYC", "Revue KYC a refaire") || "Revue KYC a refaire";
                            return runAction(agent.id, () => resetAgentKyc(agent.id, note));
                          }}
                          disabled={!!pendingById[agent.id]}
                          className="px-2 py-1 rounded text-xs font-semibold border border-violet-300 text-violet-700 hover:bg-violet-50 disabled:opacity-60"
                        >
                          Reset KYC
                        </button>
                        <button
                          onClick={() => runAction(agent.id, () => onViewHistory(agent.id))}
                          disabled={!!pendingById[agent.id]}
                          className="px-2 py-1 rounded text-xs font-semibold border border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                        >
                          Voir performance
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

