"use client";

import { useMemo, useState } from "react";
import {
  getAdminDashboardStats,
  getAllUsers,
  getAllDisputes,
  getAllTransactions,
  toggleUserBlock,
  changeUserRole,
  setAgentValidationStatus,
  getUserAdminHistory,
  sendAdminTestNotification,
  getNotificationLogsPage,
  getAllRequests,
  getAllOffers,
  getAgentsPerformance,
} from "@/app/actions/admin";
import { RequestsManagement } from "@/components/admin/requests-management";
import { OffersManagement } from "@/components/admin/offers-management";
import { TransactionsManagement } from "@/components/admin/transactions-management";
import { DisputesManagement } from "@/components/admin/disputes-management";
import { AgentsValidationManagement } from "@/components/admin/agents-validation-management";
import { AnalyticsSimple } from "@/components/admin/analytics-simple";
import { formatDateTimeStable } from "@/lib/utils";
import { UserRole } from "@/types";

type NotificationLogsData = {
  logs: any[];
  page: number;
  totalPages: number;
  total: number;
};

type AdminDashboardClientProps = {
  initialStats: any;
  initialUsers: any[];
  initialDisputes: any[];
  initialTransactions: any[];
  initialRequests: any[];
  initialOffers: any[];
  initialAgentPerformance: any[];
  initialNotificationLogsData: NotificationLogsData;
};

export function AdminDashboardClient({
  initialStats,
  initialUsers,
  initialDisputes,
  initialTransactions,
  initialRequests,
  initialOffers,
  initialAgentPerformance,
  initialNotificationLogsData,
}: AdminDashboardClientProps) {
  const [stats, setStats] = useState<any>(initialStats);
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [disputes, setDisputes] = useState<any[]>(initialDisputes);
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const [requests, setRequests] = useState<any[]>(initialRequests);
  const [offers, setOffers] = useState<any[]>(initialOffers);
  const [agentPerformance, setAgentPerformance] = useState<any[]>(initialAgentPerformance);
  const [userActionPending, setUserActionPending] = useState<Record<string, boolean>>({});
  const [historyUser, setHistoryUser] = useState<any | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<any[]>(initialNotificationLogsData.logs);
  const [notificationPage, setNotificationPage] = useState(initialNotificationLogsData.page);
  const [notificationTotalPages, setNotificationTotalPages] = useState(initialNotificationLogsData.totalPages);
  const [notificationTotal, setNotificationTotal] = useState(initialNotificationLogsData.total);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [error, setError] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifPending, setNotifPending] = useState(false);
  const [notifStatusFilter, setNotifStatusFilter] = useState<"ALL" | "SENT" | "FAILED" | "MOCK">("ALL");
  const [notifEventFilter, setNotifEventFilter] = useState("ALL");
  const [notifQuery, setNotifQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "agents" | "transactions" | "disputes" | "notifications" | "requests" | "offers" | "analytics"
  >(
    "overview"
  );

  const tabClass = (tab: typeof activeTab) =>
    `px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
      activeTab === tab
        ? "bg-accent text-white border-accent shadow-sm"
        : "bg-surface text-slate-700 border-border hover:border-accent/40 hover:text-accent"
    }`;

  async function reloadAdminData() {
    const [statsData, usersData, disputesData, transactionsData, requestsData, offersData, agentsPerfData] = await Promise.all([
      getAdminDashboardStats(),
      getAllUsers(),
      getAllDisputes(),
      getAllTransactions(),
      getAllRequests(),
      getAllOffers(),
      getAgentsPerformance(),
    ]);
    setStats(statsData);
    setUsers(usersData);
    setDisputes(disputesData);
    setTransactions(transactionsData);
    setRequests(requestsData);
    setOffers(offersData);
    setAgentPerformance(agentsPerfData);
  }

  async function withUserPending(userId: string, fn: () => Promise<void>) {
    setUserActionPending((prev) => ({ ...prev, [userId]: true }));
    try {
      await fn();
    } finally {
      setUserActionPending((prev) => ({ ...prev, [userId]: false }));
    }
  }

  async function handleToggleUserBlock(userId: string, isBlocked: boolean) {
    await withUserPending(userId, async () => {
      const reason = !isBlocked ? "Blocked by admin dashboard" : undefined;
      await toggleUserBlock(userId, reason);
      await reloadAdminData();
    });
  }

  async function handleChangeRole(userId: string, roleValue: string) {
    const role = roleValue as UserRole;
    await withUserPending(userId, async () => {
      await changeUserRole(userId, role);
      await reloadAdminData();
    });
  }

  async function handleViewHistory(userId: string) {
    await withUserPending(userId, async () => {
      const data = await getUserAdminHistory(userId);
      setHistoryUser(data);
      setHistoryOpen(true);
    });
  }

  async function handleAgentValidation(userId: string, status: "PENDING" | "VALIDATED" | "REJECTED") {
    await withUserPending(userId, async () => {
      const note =
        status === "REJECTED"
          ? "Profil incomplet ou confiance insuffisante"
          : status === "VALIDATED"
            ? "Agent validé par admin"
            : "Repassé en attente de revue";

      await setAgentValidationStatus(userId, status, note);
      await reloadAdminData();
    });
  }

  async function loadNotificationLogs(page = notificationPage) {
    setNotificationLoading(true);
    try {
      const data = await getNotificationLogsPage(page, 20);
      setNotificationLogs(data.logs);
      setNotificationPage(data.page);
      setNotificationTotalPages(data.totalPages);
      setNotificationTotal(data.total);
    } finally {
      setNotificationLoading(false);
    }
  }

  const notificationEvents = useMemo(() => {
    return Array.from(new Set(notificationLogs.map((log) => log.event))).sort();
  }, [notificationLogs]);

  const filteredNotificationLogs = useMemo(() => {
    const query = notifQuery.trim().toLowerCase();

    return notificationLogs.filter((log) => {
      const statusOk = notifStatusFilter === "ALL" || log.status === notifStatusFilter;
      const eventOk = notifEventFilter === "ALL" || log.event === notifEventFilter;
      const searchTarget = `${log.event} ${log.toEmail} ${log.subject || ""} ${log.error || ""}`.toLowerCase();
      const queryOk = !query || searchTarget.includes(query);
      return statusOk && eventOk && queryOk;
    });
  }, [notificationLogs, notifStatusFilter, notifEventFilter, notifQuery]);

  function exportNotificationsCsv() {
    const headers = ["createdAt", "event", "toEmail", "subject", "provider", "status", "error", "requestId"];
    const escapeCsv = (value: unknown) => {
      const raw = value == null ? "" : String(value);
      return `"${raw.replace(/"/g, '""')}"`;
    };

    const rows = filteredNotificationLogs.map((log) => [
      new Date(log.createdAt).toISOString(),
      log.event,
      log.toEmail,
      log.subject,
      log.provider,
      log.status,
      log.error || "",
      log.requestId || "",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notification-logs-page-${notificationPage}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleSendTestNotification() {
    try {
      setNotifPending(true);
      setNotifMessage("");
      await sendAdminTestNotification();
      await loadNotificationLogs(notificationPage);
      setNotifMessage("Notification de test envoyee (ou loggee en mode mock).");
    } catch (err: any) {
      setNotifMessage(`Echec envoi test: ${err.message}`);
    } finally {
      setNotifPending(false);
    }
  }



  const maxRequests = Math.max(1, ...(stats?.requestsPerDay || []).map((item: any) => item.count));
  const maxOffers = Math.max(1, ...(stats?.offersPerDay || []).map((item: any) => item.count));

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-6">
      <div className="mx-auto max-w-7xl rounded-3xl border border-border bg-[radial-gradient(circle_at_top_right,rgba(45,90,60,0.14),transparent_38%),radial-gradient(circle_at_top_left,rgba(235,120,90,0.14),transparent_44%)] p-5 sm:p-7">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">Tableau de Bord Admin</h1>
          <p className="text-muted">Gestion globale de la plateforme.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm font-semibold text-danger">Erreur : {error}</div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={tabClass("overview")}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={tabClass("users")}
          >
            Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={tabClass("requests")}
          >
            Demandes
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={tabClass("offers")}
          >
            Offres
          </button>
          <button
            onClick={() => setActiveTab("disputes")}
            className={tabClass("disputes")}
          >
            Litiges
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={tabClass("transactions")}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab("agents")}
            className={tabClass("agents")}
          >
            Validation utilisateurs
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={tabClass("analytics")}
          >
            Analytique
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={tabClass("notifications")}
          >
            Notifications
          </button>
        </div>

        {activeTab === "overview" && stats && (
          <>
            <div className="surface-card mb-4 flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Notifications de test</p>
                <p className="text-xs text-slate-500">Envoie un email de test à l'admin connecté.</p>
              </div>
              <button
                onClick={handleSendTestNotification}
                disabled={notifPending}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
              >
                {notifPending ? "Envoi..." : "Envoyer un test"}
              </button>
            </div>

            {notifMessage && (
              <div className="mb-4 rounded-lg border border-sky/30 bg-sky-soft p-3 text-sm text-slate-700">{notifMessage}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="surface-card p-6">
                <p className="mb-2 text-sm text-muted">Utilisateurs totaux</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
              </div>
              <div className="surface-card p-6">
                <p className="mb-2 text-sm text-muted">Utilisateurs actifs</p>
                <p className="text-3xl font-bold text-foreground">{stats.activeUsers}</p>
              </div>
              <div className="surface-card p-6">
                <p className="mb-2 text-sm text-muted">Offreurs actifs</p>
                <p className="text-3xl font-bold text-foreground">{stats.activeProviders}</p>
              </div>
              <div className="surface-card p-6">
                <p className="mb-2 text-sm text-muted">Demandes ouvertes</p>
                <p className="text-3xl font-bold text-foreground">{stats.openRequests}</p>
              </div>
              <div className="surface-card p-6">
                <p className="mb-2 text-sm text-muted">Transactions en cours</p>
                <p className="text-3xl font-bold text-foreground">{stats.dealsInProgress}</p>
              </div>
              <div className="surface-card p-6">
                <p className="mb-2 text-sm text-muted">Transactions en attente</p>
                <p className="text-3xl font-bold text-foreground">{stats.pendingTransactions}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <div className="surface-card p-6">
                <p className="mb-4 text-sm font-semibold text-slate-700">Demandes / jour (7 jours)</p>
                <div className="space-y-2">
                  {(stats.requestsPerDay || []).map((item: any) => (
                    <div key={item.day} className="flex items-center gap-3">
                      <span className="w-10 text-xs text-gray-500 uppercase">{item.day}</span>
                      <div className="h-2.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${Math.max(6, (item.count / maxRequests) * 100)}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs font-semibold text-slate-700">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-card p-6">
                <p className="mb-4 text-sm font-semibold text-slate-700">Offres / jour (7 jours)</p>
                <div className="space-y-2">
                  {(stats.offersPerDay || []).map((item: any) => (
                    <div key={item.day} className="flex items-center gap-3">
                      <span className="w-10 text-xs text-gray-500 uppercase">{item.day}</span>
                      <div className="h-2.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-highlight"
                          style={{ width: `${Math.max(6, (item.count / maxOffers) * 100)}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs font-semibold text-slate-700">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <div className="surface-card overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100/80">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rôle</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Validation agent</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3 text-sm text-slate-800">{user.name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className="rounded-full bg-sky-soft px-3 py-1 text-xs font-semibold text-sky">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isBlocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {user.isBlocked ? "Bloqué" : "Actif"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {user.role === "USER" ? (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.agentValidationStatus === "VALIDATED"
                              ? "bg-emerald-100 text-emerald-700"
                              : user.agentValidationStatus === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {user.agentValidationStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleToggleUserBlock(user.id, user.isBlocked)}
                          disabled={!!userActionPending[user.id] || user.role === "ADMIN"}
                          className={`rounded-md px-3 py-1 text-xs font-semibold ${user.isBlocked ? "bg-success text-white" : "bg-warning text-white"} disabled:opacity-60`}
                        >
                          {user.isBlocked ? "Débloquer" : "Bloquer"}
                        </button>
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value)}
                          disabled={!!userActionPending[user.id]}
                          className="h-8 rounded-md border border-border bg-surface px-2 text-xs"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <button
                          onClick={() => handleViewHistory(user.id)}
                          disabled={!!userActionPending[user.id]}
                          className="rounded-md border border-border px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                        >
                          Historique
                        </button>
                        {user.role === "USER" && (
                          <>
                            <button
                              onClick={() => handleAgentValidation(user.id, "VALIDATED")}
                              disabled={!!userActionPending[user.id]}
                              className="rounded-md bg-success px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              Valider
                            </button>
                            <button
                              onClick={() => handleAgentValidation(user.id, "REJECTED")}
                              disabled={!!userActionPending[user.id]}
                              className="rounded-md bg-danger px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              Rejeter
                            </button>
                            <button
                              onClick={() => handleAgentValidation(user.id, "PENDING")}
                              disabled={!!userActionPending[user.id]}
                              className="rounded-md border border-border px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
                            >
                              En attente
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "requests" && <RequestsManagement requests={requests} onReload={reloadAdminData} />}

        {activeTab === "offers" && <OffersManagement offers={offers} onReload={reloadAdminData} />}

        {activeTab === "transactions" && (
          <TransactionsManagement transactions={transactions} onReload={reloadAdminData} />
        )}

        {activeTab === "agents" && (
          <AgentsValidationManagement
            users={users}
            agentPerformance={agentPerformance}
            onReload={reloadAdminData}
            onViewHistory={handleViewHistory}
          />
        )}

        {activeTab === "disputes" && (
          <DisputesManagement disputes={disputes} requests={requests} onReload={reloadAdminData} />
        )}

        {activeTab === "analytics" && <AnalyticsSimple stats={stats} />}

        {activeTab === "notifications" && (
          <div className="surface-card overflow-hidden">
            <div className="grid grid-cols-1 gap-3 border-b border-border p-4 md:grid-cols-4">
              <select
                value={notifStatusFilter}
                onChange={(e) => setNotifStatusFilter(e.target.value as "ALL" | "SENT" | "FAILED" | "MOCK")}
                className="h-10 rounded-lg border border-border bg-surface px-3 text-sm"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="SENT">Envoyées</option>
                <option value="FAILED">Échec</option>
                <option value="MOCK">Simulées</option>
              </select>
              <select
                value={notifEventFilter}
                onChange={(e) => setNotifEventFilter(e.target.value)}
                className="h-10 rounded-lg border border-border bg-surface px-3 text-sm"
              >
                <option value="ALL">Tous les événements</option>
                {notificationEvents.map((event) => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
              <input
                value={notifQuery}
                onChange={(e) => setNotifQuery(e.target.value)}
                placeholder="Rechercher..."
                className="h-10 rounded-lg border border-border bg-surface px-3 text-sm md:col-span-2"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 text-xs text-slate-600">
              <div>Logs: {notificationTotal} • Page {notificationPage} / {notificationTotalPages}</div>
              <button onClick={exportNotificationsCsv} disabled={filteredNotificationLogs.length === 0} className="rounded-lg border border-border px-3 py-1.5 hover:bg-slate-50 disabled:opacity-60">
                Exporter CSV
              </button>
            </div>

            {filteredNotificationLogs.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">Aucune notification.</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-100/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Événement</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Destinataire</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredNotificationLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2 text-slate-600">{formatDateTimeStable(log.createdAt)}</td>
                      <td className="px-4 py-2 text-slate-800">{log.event}</td>
                      <td className="px-4 py-2 text-slate-600">{log.toEmail}</td>
                      <td className="px-4 py-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{log.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
              <button
                onClick={() => loadNotificationLogs(notificationPage - 1)}
                disabled={notificationPage <= 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-60"
              >
                Précédent
              </button>
              <button
                onClick={() => loadNotificationLogs(notificationPage + 1)}
                disabled={notificationPage >= notificationTotalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-60"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {historyOpen && historyUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-3xl rounded-xl border border-border bg-surface shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Historique utilisateur</h3>
                  <p className="text-xs text-slate-500">{historyUser.user.name} • {historyUser.user.email}</p>
                </div>
                <button onClick={() => setHistoryOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                  Fermer
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[70vh] overflow-auto">
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">Demandes</p>
                  <div className="space-y-2">
                    {historyUser.recentRequests.length === 0 ? (
                      <p className="text-xs text-slate-500">Aucune.</p>
                    ) : (
                      historyUser.recentRequests.map((item: any) => (
                        <div key={item.id} className="rounded-lg border border-slate-200 p-2">
                          <p className="text-xs font-semibold text-slate-800 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-500">{item.status}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">Offres</p>
                  <div className="space-y-2">
                    {historyUser.recentOffers.length === 0 ? (
                      <p className="text-xs text-slate-500">Aucune.</p>
                    ) : (
                      historyUser.recentOffers.map((item: any) => (
                        <div key={item.id} className="rounded-lg border border-slate-200 p-2">
                          <p className="text-xs font-semibold text-slate-800 truncate">{item.request?.title}</p>
                          <p className="text-[11px] text-slate-500">{item.status}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">Litiges</p>
                  <div className="space-y-2">
                    {historyUser.recentDisputes.length === 0 ? (
                      <p className="text-xs text-slate-500">Aucun.</p>
                    ) : (
                      historyUser.recentDisputes.map((item: any) => (
                        <div key={item.id} className="rounded-lg border border-slate-200 p-2">
                          <p className="text-xs font-semibold text-slate-800 truncate">{item.reason}</p>
                          <p className="text-[11px] text-slate-500">{item.status}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

