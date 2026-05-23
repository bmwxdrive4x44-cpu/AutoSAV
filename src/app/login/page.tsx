import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/actions/auth";
import { Header } from "@/components/layout/header";
import { getAuthErrorMessage, normalizeLang, textDir, withLang } from "@/lib/i18n";
import { getLoginCopy } from "@/lib/auth-copy";
import { LoginSubmitButton } from "@/components/auth/login-submit-button";
import { Plane, AlertCircle, Info } from "lucide-react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; action?: string; role?: string; lang?: string; error?: string };
}) {
  const showOfferMessage = searchParams.action === "offer";
  const redirectUrl = searchParams.redirect || "";
  const lang = normalizeLang(searchParams.lang);
  const t = getLoginCopy(lang);
  const isRtl = textDir(lang) === "rtl";
  const errorMessage = getAuthErrorMessage(lang, searchParams.error);
  const pendingLabel = lang === "fr" ? "Connexion..." : lang === "ar" ? "جار تسجيل الدخول..." : "Signing in...";

  const registerHref = withLang(
    `/register${redirectUrl ? `?redirect=${redirectUrl}&action=${searchParams.action}&role=${searchParams.role}` : ""}`,
    lang
  );

  return (
    <div className="min-h-screen bg-bg">
      <Header lang={lang} />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md" dir={isRtl ? "rtl" : "ltr"}>
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent shadow-travel">
              <Plane className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Card */}
          <div className="bg-surface rounded-3xl border border-border p-8 shadow-card">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">{t.title}</h1>
              <p className="text-sm text-muted">
                {lang === "fr" ? "Connectez-vous pour acceder a votre compte" : lang === "ar" ? "سجل دخولك للوصول إلى حسابك" : "Sign in to access your account"}
              </p>
            </div>

            {showOfferMessage && (
              <div className="mb-6 p-4 rounded-xl bg-sky-soft border border-sky/20 text-sm text-sky flex items-start gap-3">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{t.offerMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-danger-soft border border-danger/20 text-sm text-danger flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form action={login} className="space-y-5">
              {redirectUrl && <input type="hidden" name="redirect" value={redirectUrl} />}
              <input type="hidden" name="lang" value={lang} />
              {searchParams.action && <input type="hidden" name="action" value={searchParams.action} />}
              {searchParams.role && <input type="hidden" name="role" value={searchParams.role} />}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">{t.email}</Label>
                <Input id="email" name="email" type="email" placeholder={t.emailPlaceholder} required className="h-12 rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">{t.password}</Label>
                <Input id="password" name="password" type="password" required className="h-12 rounded-xl" />
              </div>
              
              <LoginSubmitButton idleLabel={t.submit} pendingLabel={pendingLabel} />
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-3 text-muted">{lang === "fr" ? "ou" : lang === "ar" ? "أو" : "or"}</span>
              </div>
            </div>

            <p className="text-center text-sm text-muted">
              {t.noAccount}{" "}
              <Link href={registerHref} className="text-accent hover:text-accent-hover font-semibold transition-colors">
                {t.signUp}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
