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
  User,
  ChevronRight,
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
    { href: "/dashboard/profile", label: "Mon profil", icon: User },
    { href: "/dashboard/requests", label: "Mes demandes", icon: ClipboardList },
    { href: "/dashboard/create-request", label: "Créer une demande", icon: Plus },
    { href: "/dashboard/requests-market", label: "Marketplace des demandes", icon: ShoppingBag },
    { href: "/dashboard/offers-received", label: "Offres reçues", icon: ClipboardList },
    { href: "/dashboard/offers-submitted", label: "Offres envoyées", icon: Send },
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
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-20 rounded-2xl border border-border bg-surface/60 backdrop-blur-md p-5 space-y-2">
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-surface-elevated/50 border border-border/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 ring-2 ring-accent/20">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted">{roleLabel}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 hover:bg-surface-elevated hover:text-foreground hover:translate-x-1"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated group-hover:bg-accent/10 transition-colors">
                      <link.icon className="w-4 h-4 group-hover:text-accent transition-colors" />
                    </div>
                    <span className="flex-1">{link.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </nav>

              {/* Back to Home */}
              <div className="pt-4 mt-4 border-t border-border/50">
                <Link
                  href="/"
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 hover:bg-surface-elevated hover:text-foreground"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated group-hover:bg-accent/10 transition-colors">
                    <Home className="w-4 h-4 group-hover:text-accent transition-colors" />
                  </div>
                  <span>Accueil</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
