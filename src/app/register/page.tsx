import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/app/actions/auth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthErrorMessage, normalizeLang, textDir, withLang } from "@/lib/i18n";
import { getRegisterCopy } from "@/lib/auth-copy";
import { Package, AlertCircle, Info, ArrowRight } from "lucide-react";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { redirect?: string; action?: string; role?: string; lang?: string; error?: string };
}) {
  const showOfferMessage = searchParams.action === "offer";
  const redirectUrl = searchParams.redirect || "";
  const lang = normalizeLang(searchParams.lang);
  const t = getRegisterCopy(lang);
  const isRtl = textDir(lang) === "rtl";
  const errorMessage = getAuthErrorMessage(lang, searchParams.error);

  const loginHref = withLang(
    `/login${redirectUrl ? `?redirect=${redirectUrl}&action=${searchParams.action}&role=${searchParams.role}` : ""}`,
    lang
  );

  return (
    <div className="min-h-screen">
      <Header lang={lang} />
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-primary/10 rounded-full blur-[100px] opacity-30" />
        </div>

        <div className="w-full max-w-md" dir={isRtl ? "rtl" : "ltr"}>
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/80 shadow-[0_8px_30px_rgba(255,107,74,0.3)]">
              <Package className="w-7 h-7 text-white" />
            </div>
          </div>

          <Card className="border-border/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">{t.title}</CardTitle>
              <p className="text-sm text-muted mt-2">
                {lang === "fr" ? "Créez votre compte gratuitement" : lang === "ar" ? "أنشئ حسابك مجانا" : "Create your free account"}
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {showOfferMessage && (
                <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary flex items-start gap-3">
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{t.offerMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <form action={register} className="space-y-5">
                {redirectUrl && <input type="hidden" name="redirect" value={redirectUrl} />}
                <input type="hidden" name="lang" value={lang} />
                {searchParams.action && <input type="hidden" name="action" value={searchParams.action} />}
                {searchParams.role && <input type="hidden" name="role" value={searchParams.role} />}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground-secondary">{t.name}</Label>
                  <Input id="name" name="name" placeholder={t.namePlaceholder} required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground-secondary">{t.email}</Label>
                  <Input id="email" name="email" type="email" placeholder={t.emailPlaceholder} required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground-secondary">{t.phone}</Label>
                  <Input id="phone" name="phone" placeholder={t.phonePlaceholder} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground-secondary">{t.password}</Label>
                  <Input id="password" name="password" type="password" minLength={6} required className="h-12" />
                </div>
                <Button type="submit" className="w-full h-12 text-base group">
                  {t.submit}
                  <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? "mr-2 rotate-180" : "ml-2"}`} />
                </Button>
              </form>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface px-2 text-muted">{lang === "fr" ? "ou" : lang === "ar" ? "أو" : "or"}</span>
                </div>
              </div>
              <p className="text-center text-sm text-muted">
                {t.hasAccount}{" "}
                <Link href={loginHref} className="text-accent hover:text-accent-hover font-medium transition-colors">
                  {t.signIn}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
