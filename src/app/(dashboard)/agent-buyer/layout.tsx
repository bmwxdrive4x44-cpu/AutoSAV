import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { normalizeUserRole } from "@/lib/auth";

export default async function AgentBuyerAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const role = normalizeUserRole(user.role);
  if (role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  redirect("/dashboard");

  return <>{children}</>;
}
