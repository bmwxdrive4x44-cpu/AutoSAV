import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { withLang } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { LogOut, Package, User, Menu } from "lucide-react";

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
    getStarted: "Commencer",
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
    getStarted: "ابدأ الآن",
  },
};

export async function Header({ lang = "fr" }: { lang?: Lang }) {
  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;

  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("Header user fetch failed:", error);
  }
  const t = HEADER_COPY[lang];
  const navLinks = [
    { href: withLang("/", lang), label: t.home },
    { href: withLang("/#requests", lang), label: t.requests },
    { href: withLang("/#contact", lang), label: t.contact },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3 transition-all duration-300">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/80 shadow-[0_4px_14px_rgba(255,107,74,0.35)] transition-all duration-300 group-hover:shadow-[0_6px_20px_rgba(255,107,74,0.45)] group-hover:-translate-y-0.5">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-foreground font-display">AutoSAV</span>
            <Badge variant="outline" className="hidden md:inline-flex text-[10px] px-2 py-0.5">
              Beta
            </Badge>
          </div>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 text-sm font-medium text-muted transition-all duration-200 hover:text-foreground rounded-lg hover:bg-surface-elevated/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <nav className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="hidden items-center gap-0.5 rounded-xl border border-border bg-surface/50 p-1 backdrop-blur-sm sm:flex">
            {(["fr", "en", "ar"] as const).map((code) => (
              <Link
                key={code}
                href={withLang("/", code)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  lang === code
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-surface-elevated/80"
                }`}
              >
                {code.toUpperCase()}
              </Link>
            ))}
          </div>

          {user ? (
            <>
              {/* User Info */}
              <div className="hidden items-center gap-3 rounded-xl border border-border bg-surface/50 px-3 py-2 backdrop-blur-sm sm:flex">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 ring-2 ring-accent/20">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <span className="max-w-[120px] truncate text-sm font-medium text-foreground">{user.name}</span>
              </div>

              <Link
                href={withLang(
                  user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard",
                  lang
                )}
              >
                <Button variant="secondary" size="sm">
                  {t.dashboard}
                </Button>
              </Link>

              <form action={logout}>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <LogOut className="w-4 h-4 text-muted" />
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

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
            <Menu className="w-5 h-5" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
