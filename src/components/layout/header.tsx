import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { withLang } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { LogOut, Plane, User, Menu } from "lucide-react";

const HEADER_COPY: Record<
  Lang,
  {
    home: string;
    howItWorks: string;
    requests: string;
    dashboard: string;
    signIn: string;
    getStarted: string;
  }
> = {
  fr: {
    home: "Accueil",
    howItWorks: "Comment ça marche",
    requests: "Demandes",
    dashboard: "Dashboard",
    signIn: "Connexion",
    getStarted: "Commencer",
  },
  en: {
    home: "Home",
    howItWorks: "How it works",
    requests: "Requests",
    dashboard: "Dashboard",
    signIn: "Sign In",
    getStarted: "Get Started",
  },
  ar: {
    home: "الرئيسية",
    howItWorks: "كيف تعمل",
    requests: "الطلبات",
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
    { href: withLang("/#how-it-works", lang), label: t.howItWorks },
    { href: withLang("/#requests", lang), label: t.requests },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-bg/95 backdrop-blur-sm border-b border-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5 transition-all duration-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-travel transition-all duration-300 group-hover:-translate-y-0.5">
            <Plane className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-display">AutoSAV</span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-accent rounded-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <nav className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="hidden items-center gap-0.5 rounded-full border border-border bg-surface p-1 sm:flex">
            {(["fr", "en", "ar"] as const).map((code) => (
              <Link
                key={code}
                href={withLang("/", code)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  lang === code
                    ? "bg-accent text-white"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {code.toUpperCase()}
              </Link>
            ))}
          </div>

          {user ? (
            <>
              {/* User Info */}
              <div className="hidden items-center gap-2.5 rounded-full border border-border bg-surface px-3 py-1.5 sm:flex">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft">
                  <User className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="max-w-[100px] truncate text-sm font-medium text-foreground">{user.name}</span>
              </div>

              <Link
                href={withLang(
                  user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard",
                  lang
                )}
              >
                <Button size="sm" className="rounded-full bg-accent text-white hover:bg-accent-hover">
                  {t.dashboard}
                </Button>
              </Link>

              <form action={logout}>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-danger-soft hover:text-danger">
                  <LogOut className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href={withLang("/login", lang)}>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full text-muted hover:text-foreground">
                  {t.signIn}
                </Button>
              </Link>
              <Link href={withLang("/register", lang)}>
                <Button size="sm" className="rounded-full bg-accent text-white hover:bg-accent-hover shadow-travel">
                  {t.getStarted}
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-full">
            <Menu className="w-5 h-5" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
