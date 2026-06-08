import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { withLang } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { LogOut, Package, User } from "lucide-react";

const HEADER_COPY: Record<
  Lang,
  {
    home: string;
    requests: string;
    contact: string;
    dashboard: string;
    signIn: string;
    getStarted: string;
  }
> = {
  fr: {
    home: "Accueil",
    requests: "Demandes",
    contact: "Contact",
    dashboard: "Dashboard",
    signIn: "Connexion",
    getStarted: "Inscription",
  },
  en: {
    home: "Home",
    requests: "Requests",
    contact: "Contact",
    dashboard: "Dashboard",
    signIn: "Sign In",
    getStarted: "Get Started",
  },
  ar: {
    home: "الرئيسية",
    requests: "الطلبات",
    contact: "اتصال",
    dashboard: "لوحة التحكم",
    signIn: "تسجيل الدخول",
    getStarted: "إنشاء حساب",
  },
};

export async function Header({ lang = "fr", disableUserLookup = false }: { lang?: Lang; disableUserLookup?: boolean }) {
  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;

  if (!disableUserLookup) {
    try {
      user = await getCurrentUser();
    } catch (error) {
      console.error("Header user fetch failed:", error);
    }
  }
  const t = HEADER_COPY[lang];
  const navLinks = [
    { href: withLang("/", lang), label: t.home },
    { href: withLang("/#requests", lang), label: t.requests },
    { href: withLang("/#contact", lang), label: t.contact },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b ui-border-color bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-slate-900 transition-colors hover:text-primary-600">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary-600 to-primary-700">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">AutoSAV</span>
          <Badge variant="secondary" className="hidden md:inline-flex">Marketplace</Badge>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-primary-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1 rounded-md border ui-border-color bg-slate-50 p-1 sm:flex">
            {(["fr", "en", "ar"] as const).map((code) => (
              <Link
                key={code}
                href={withLang("/", code)}
                className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                  lang === code ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {code.toUpperCase()}
              </Link>
            ))}
          </div>

          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-md border ui-border-color bg-slate-50 px-3 py-2 sm:flex">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                  <User className="w-4 h-4 text-primary-700" />
                </div>
                <span className="max-w-[140px] truncate text-sm font-medium text-slate-900">{user.name}</span>
              </div>

              <Link
                href={withLang(
                  user.role === "ADMIN"
                    ? "/admin/dashboard"
                    : "/dashboard"
                , lang)}
              >
                <Button variant="outline" size="sm">
                  {t.dashboard}
                </Button>
              </Link>

              <form action={logout}>
                <Button variant="ghost" size="sm" className="p-2">
                  <LogOut className="w-4 h-4 text-slate-600" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href={withLang("/login", lang)}>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  {t.signIn}
                </Button>
              </Link>
              <Link href={withLang("/register", lang)}>
                <Button size="sm">
                  {t.getStarted}
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

