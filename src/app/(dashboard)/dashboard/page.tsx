
import { getUserDashboardSummary } from "@/app/actions/dashboard";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

// Rafraîchissement côté serveur (appelé par le client toutes les 30s)
async function refreshDashboard() {
  "use server";
  return getUserDashboardSummary();
}

export default async function UnifiedDashboardPage() {
  const summary = await getUserDashboardSummary();

  return (
    <DashboardClient
      initialData={summary}
      refreshAction={refreshDashboard}
    />
  );
}

