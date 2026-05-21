import {
  getAdminDashboardStats,
  getAllUsers,
  getAllDisputes,
  getAllTransactions,
  getNotificationLogsPage,
  getAllRequests,
  getAllOffers,
  getAgentsPerformance,
} from "@/app/actions/admin";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export default async function AdminDashboardPage() {
  const [
    stats,
    users,
    disputes,
    transactions,
    notificationLogsData,
    requests,
    offers,
    agentPerformance,
  ] = await Promise.all([
    getAdminDashboardStats(),
    getAllUsers(),
    getAllDisputes(),
    getAllTransactions(),
    getNotificationLogsPage(1, 20),
    getAllRequests(),
    getAllOffers(),
    getAgentsPerformance(),
  ]);

  return (
    <AdminDashboardClient
      initialStats={stats}
      initialUsers={users}
      initialDisputes={disputes}
      initialTransactions={transactions}
      initialRequests={requests}
      initialOffers={offers}
      initialAgentPerformance={agentPerformance}
      initialNotificationLogsData={notificationLogsData}
    />
  );
}
