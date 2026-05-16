import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { withLang } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { Package, LogOut, User } from "lucide-react";

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
    home: "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©",
    requests: "Ø§Ù„Ø·Ù„Ø¨Ø§Øª",
    contact: "Ø§ØªØµØ§Ù„",
    dashboard: "Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…",
    signIn: "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„",
    getStarted: "Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨",
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 hover:text-primary-600 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span>DzMarket</span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-primary-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 rounded-md border border-slate-300 bg-slate-100 p-1">
            {(["fr", "en", "ar"] as const).map((code) => (
              <Link
                key={code}
                href={withLang("/", code)}
                className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                  lang === code ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"
                }`}
              >
                {code.toUpperCase()}
              </Link>
            ))}
          </div>

          {user ? (
            <>
              {/* User Info - Hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary-700" />
                </div>
                <span className="text-sm font-medium text-slate-900 truncate">
                  {user.name}
                </span>
              </div>

              {/* Dashboard Link */}
              <Link
                href={withLang(
                  user.role === "ADMIN"
                    ? "/admin/dashboard"
                    : "/dashboard"
                , lang)}
              >
                <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50">
                  {t.dashboard}
                </Button>
              </Link>

              {/* Logout */}
              <form action={logout}>
                <Button variant="ghost" size="sm" className="hover:bg-slate-100 p-2">
                  <LogOut className="w-4 h-4 text-slate-600" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href={withLang("/login", lang)}>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex hover:bg-slate-100">
                  {t.signIn}
                </Button>
              </Link>
              <Link href={withLang("/register", lang)}>
                <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white">
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

