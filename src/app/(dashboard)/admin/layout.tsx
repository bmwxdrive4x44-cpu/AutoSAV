import { getCurrentUser } from "@/lib/auth";
import { normalizeUserRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (normalizeUserRole(user.role) !== "ADMIN") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

