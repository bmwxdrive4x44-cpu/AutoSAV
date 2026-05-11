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
    { href: "/dashboard/requests", label: "Mes demandes", icon: ClipboardList },
    { href: "/dashboard/create-request", label: "Creer une demande", icon: Plus },
    { href: "/dashboard/requests-market", label: "Marketplace des demandes", icon: ShoppingBag },
    { href: "/dashboard/offers-received", label: "Offres recues", icon: ClipboardList },
    { href: "/dashboard/offers-submitted", label: "Offres soumises", icon: Send },
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
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 sticky top-20">
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
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary-700 transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary-700 transition-colors mt-4 pt-4 border-t"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Link>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

