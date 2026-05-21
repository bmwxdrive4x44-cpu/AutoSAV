import { Header } from "@/components/layout/header";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { normalizeUserRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ShoppingBag,
  Truck,
  ClipboardList,
  Home,
  Shield,
  Send,
  Scale,
  Wallet,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const role = normalizeUserRole(user.role);
  const isAdmin = role === "ADMIN";

  const userLinks = [
    { href: "/dashboard", label: "Vue d'ensemble", icon: Home },
    { href: "/dashboard/profile", label: "Mon profil", icon: Shield },
    { href: "/dashboard/requests", label: "Mes demandes", icon: ClipboardList },
    { href: "/dashboard/create-request", label: "Creer une demande", icon: Plus },
    { href: "/dashboard/requests-market", label: "Marketplace des demandes", icon: ShoppingBag },
    { href: "/dashboard/offers-received", label: "Offres recues", icon: ClipboardList },
    { href: "/dashboard/offers-submitted", label: "Offres envoyees", icon: Send },
    { href: "/dashboard/deliveries", label: "Livraisons", icon: Truck },
    { href: "/dashboard/disputes", label: "Litiges", icon: Scale },
    { href: "/dashboard/transactions", label: "Transactions", icon: Wallet },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard admin", icon: Shield },
  ];

  const links = isAdmin ? adminLinks : userLinks;
  const roleLabel = isAdmin ? "Admin" : "Utilisateur";

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="w-full md:w-64 shrink-0">
            <div className="surface-card sticky top-20 space-y-1 p-4">
              <div className="px-3 py-2 mb-2">
                <p className="text-xs font-medium text-slate-400 uppercase">
                  {roleLabel}
                </p>
                <p className="font-semibold text-sm">{user.name}</p>
              </div>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary-700"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              <Link
                href="/"
                className="mt-4 flex items-center gap-3 border-t ui-border-color px-3 py-2 pt-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary-700"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Link>
            </div>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

