import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/app/actions/auth";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthErrorMessage, normalizeLang, textDir, withLang } from "@/lib/i18n";
import { getRegisterCopy } from "@/lib/auth-copy";

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
    <div className="min-h-screen bg-slate-50">
      <Header lang={lang} />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto" dir={isRtl ? "rtl" : "ltr"}>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{t.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {showOfferMessage && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
                  {t.offerMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
              <form action={register} className="space-y-4">
                {redirectUrl && <input type="hidden" name="redirect" value={redirectUrl} />}
                <input type="hidden" name="lang" value={lang} />
                {searchParams.action && <input type="hidden" name="action" value={searchParams.action} />}
                {searchParams.role && <input type="hidden" name="role" value={searchParams.role} />}
                <div className="space-y-2">
                  <Label htmlFor="name">{t.name}</Label>
                  <Input id="name" name="name" placeholder={t.namePlaceholder} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input id="email" name="email" type="email" placeholder={t.emailPlaceholder} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phone}</Label>
                  <Input id="phone" name="phone" placeholder={t.phonePlaceholder} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t.password}</Label>
                  <Input id="password" name="password" type="password" minLength={6} required />
                </div>
                <Button type="submit" className="w-full">
                  {t.submit}
                </Button>
              </form>
              <p className="text-center text-sm text-slate-500 mt-4">
                {t.hasAccount} <Link href={loginHref} className="text-primary-600 hover:underline">{t.signIn}</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

