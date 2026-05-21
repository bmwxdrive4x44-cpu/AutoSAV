import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe, Handshake, MessagesSquare, Package, Shield, Zap } from "lucide-react";
import { getCategories } from "@/app/actions/categories";
import { getPublicRequests } from "@/app/actions/requests";
import { CategoryCard } from "@/components/categories";
import { Header } from "@/components/layout/header";
import { HomeRequestFeed } from "@/components/requests/home-request-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryLabel, normalizeLang, textDir, withLang } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const COPY: Record<
  Lang,
  {
    badge: string;
    heroTitleStart: string;
    heroTitleEmphasis: string;
    heroSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustChips: [string, string, string];
    trustStats: [string, string];
    trustStatLabels: [string, string];
    showcaseLabels: [string, string, string];
    categoriesTitle: string;
    categoriesSubtitle: string;
    featuresTitle: [string, string, string];
    featuresDesc: [string, string, string];
    howItWorksTitle: string;
    howItWorksSubtitle: string;
    steps: Array<{ title: string; description: string }>;
    contactTitle: string;
    contactSubtitle: string;
    contactEmailLabel: string;
    contactPhoneLabel: string;
    contactHoursLabel: string;
    finalCtaTitle: string;
    finalCtaSubtitle: string;
    finalCtaAgent: string;
  }
> = {
  fr: {
    badge: "Sourcing simplifie",
    heroTitleStart: "Trouvez des offres fiables en",
    heroTitleEmphasis: "quelques secondes",
    heroSubtitle: "Connectez-vous a des fournisseurs verifies et sourcez vos produits en toute confiance.",
    ctaPrimary: "Publier une demande",
    ctaSecondary: "Parcourir les offres",
    trustChips: ["Reseau verifie", "Workflow securise", "Matching rapide"],
    trustStats: ["1,200+", "$2.5M+"],
    trustStatLabels: ["Utilisateurs verifies", "Commandes facilitees"],
    showcaseLabels: ["Demandes actives", "Utilisateurs verifies", "Reponse moyenne"],
    categoriesTitle: "Parcourir par categorie",
    categoriesSubtitle: "Trouvez exactement ce que vous cherchez en explorant nos categories principales.",
    featuresTitle: ["Vendeurs verifies", "Reponses rapides", "Reseau mondial"],
    featuresDesc: [
      "Les profils actifs sont controles pour garantir la fiabilite et la qualite.",
      "Recevez des offres en quelques heures, pas en plusieurs jours.",
      "Connectez-vous instantanement a des fournisseurs de plusieurs pays.",
    ],
    howItWorksTitle: "Comment ca marche",
    howItWorksSubtitle: "Simple, transparent et rapide. Trouvez vos produits en trois etapes.",
    steps: [
      {
        title: "Publiez votre demande",
        description: "Expliquez clairement le produit recherche, la quantite et le budget.",
      },
      {
        title: "Recevez des offres",
        description: "Des offreurs verifies repondent avec prix, delais et conditions.",
      },
      {
        title: "Finalisez la commande",
        description: "Comparez, negociez et validez. Le suivi est centralise sur la plateforme.",
      },
    ],
    contactTitle: "Contact",
    contactSubtitle: "Notre equipe vous repond rapidement pour vous aider a publier ou suivre vos demandes.",
    contactEmailLabel: "Email",
    contactPhoneLabel: "Telephone",
    contactHoursLabel: "Horaires",
    finalCtaTitle: "Pret a commencer ?",
    finalCtaSubtitle: "Rejoignez des utilisateurs qui trouvent plus intelligemment.",
    finalCtaAgent: "Creer un compte",
  },
  en: {
    badge: "Sourcing made simple",
    heroTitleStart: "Find trusted buying agents in",
    heroTitleEmphasis: "seconds",
    heroSubtitle: "Connect with verified suppliers and source products with confidence.",
    ctaPrimary: "Post a Request",
    ctaSecondary: "Browse Offers",
    trustChips: ["Verified network", "Secure workflow", "Fast matching"],
    trustStats: ["1,200+", "$2.5M+"],
    trustStatLabels: ["Verified Users", "Orders Facilitated"],
    showcaseLabels: ["Active requests", "Verified users", "Average response"],
    categoriesTitle: "Browse by Category",
    categoriesSubtitle: "Find exactly what you're looking for by exploring our main categories.",
    featuresTitle: ["Verified Sellers", "Fast Responses", "Global Network"],
    featuresDesc: [
      "Active profiles are vetted to ensure reliability and quality.",
      "Get offers within hours, not days.",
      "Connect with trusted suppliers across multiple countries instantly.",
    ],
    howItWorksTitle: "How it works",
    howItWorksSubtitle: "Simple, transparent, and fast. Source products in three clear steps.",
    steps: [
      {
        title: "Post Your Request",
        description: "Share product details, quantity, and budget.",
      },
      {
        title: "Receive Offers",
        description: "Verified providers reply with pricing, lead time, and terms.",
      },
      {
        title: "Complete the Order",
        description: "Compare, negotiate, and finalize with full visibility.",
      },
    ],
    contactTitle: "Contact",
    contactSubtitle: "Our team replies quickly to help you publish or track your requests.",
    contactEmailLabel: "Email",
    contactPhoneLabel: "Phone",
    contactHoursLabel: "Hours",
    finalCtaTitle: "Ready to get started?",
    finalCtaSubtitle: "Join businesses sourcing smarter.",
    finalCtaAgent: "Create an Account",
  },
  ar: {
    badge: "الشراء من الخارج بطريقة سهلة",
    heroTitleStart: "اعثر على وسيط شراء موثوق",
    heroTitleEmphasis: "بسرعة",
    heroSubtitle: "تواصل مع موردين موثوقين وقدم طلباتك بثقة ووضوح.",
    ctaPrimary: "نشر طلب",
    ctaSecondary: "تصفح العروض",
    trustChips: ["شبكة موثوقة", "مسار آمن", "مطابقة سريعة"],
    trustStats: ["+1200", "+2.5M$"],
    trustStatLabels: ["وسطاء موثوقون", "طلبات مكتملة"],
    showcaseLabels: ["طلبات نشطة", "وسطاء موثوقون", "متوسط الرد"],
    categoriesTitle: "تصفح حسب الفئة",
    categoriesSubtitle: "اعثر على ما تبحث عنه من خلال فئاتنا الرئيسية.",
    featuresTitle: ["وسطاء موثوقون", "ردود سريعة", "شبكة دولية"],
    featuresDesc: [
      "يتم التحقق من الملفات النشطة لضمان الموثوقية والجودة.",
      "استقبل العروض خلال ساعات بدل أيام.",
      "تواصل فورًا مع موردين موثوقين من عدة دول.",
    ],
    howItWorksTitle: "كيف تعمل المنصة",
    howItWorksSubtitle: "واضحة وسهلة وسريعة. ابدأ في ثلاث خطوات.",
    steps: [
      {
        title: "انشر طلبك",
        description: "اكتب تفاصيل المنتج والكمية والميزانية بشكل واضح.",
      },
      {
        title: "استقبل العروض",
        description: "يرد الوسطاء الموثوقون بالسعر والمدة والشروط.",
      },
      {
        title: "أكمل الطلب",
        description: "قارن وتفاوض ثم أكد العرض الأنسب لك.",
      },
    ],
    contactTitle: "اتصال",
    contactSubtitle: "فريقنا يرد بسرعة لمساعدتك في نشر أو متابعة طلباتك.",
    contactEmailLabel: "البريد",
    contactPhoneLabel: "الهاتف",
    contactHoursLabel: "الأوقات",
    finalCtaTitle: "جاهز للبدء؟",
    finalCtaSubtitle: "انضم إلى شركات تتسوق بذكاء.",
    finalCtaAgent: "إنشاء حساب",
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { lang?: string };
}) {
  const [requestsResult, userResult, categoriesResult] = await Promise.allSettled([
    getPublicRequests(),
    getCurrentUser(),
    getCategories(),
  ]);

  const requests = requestsResult.status === "fulfilled" ? requestsResult.value : [];
  const user = userResult.status === "fulfilled" ? userResult.value : null;
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  if (
    requestsResult.status === "rejected" ||
    userResult.status === "rejected" ||
    categoriesResult.status === "rejected"
  ) {
    console.error("HomePage data loading failed:", {
      requestsError: requestsResult.status === "rejected" ? requestsResult.reason : null,
      userError: userResult.status === "rejected" ? userResult.reason : null,
      categoriesError: categoriesResult.status === "rejected" ? categoriesResult.reason : null,
    });
  }
  const lang = normalizeLang(searchParams?.lang);
  const isRtl = textDir(lang) === "rtl";
  const t = COPY[lang];

  const highlights = [
    { label: t.showcaseLabels[0], value: `${requests.length}+` },
    { label: t.showcaseLabels[1], value: t.trustStats[0] },
    { label: t.showcaseLabels[2], value: "< 2h" },
  ];

  const featureIcons = [Shield, Zap, Globe] as const;

  return (
    <div className="min-h-screen bg-bg">
      <Header lang={lang} />
      <div dir={isRtl ? "rtl" : "ltr"}>
        <section className="relative overflow-hidden border-b border-slate-200/80 py-16 md:py-24">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(47,111,237,0.15),transparent_32%),radial-gradient(circle_at_10%_20%,rgba(47,111,237,0.08),transparent_28%)]" />
          <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-6 lg:grid-cols-[1.25fr_1fr] lg:items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="w-fit text-sm">{t.badge}</Badge>
              <div className="space-y-4">
                <h1>
                  {t.heroTitleStart} <span className="text-primary-700">{t.heroTitleEmphasis}</span>
                </h1>
                <p className="max-w-2xl text-base md:text-lg text-slate-600">{t.heroSubtitle}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={withLang("/dashboard/create-request", lang)}>
                  <Button size="lg" className="w-full sm:w-auto">
                    {t.ctaPrimary}
                    <ArrowRight className={`h-4 w-4 ${isRtl ? "mr-2" : "ml-2"}`} />
                  </Button>
                </Link>
                <Link href="#requests">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">{t.ctaSecondary}</Button>
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {t.trustChips.map((chip) => (
                  <div key={chip} className="surface-card flex items-center gap-2 px-3 py-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                    {chip}
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Marketplace Pulse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {highlights.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-md border ui-border-color bg-slate-50 p-3">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
                <div className="rounded-md border ui-border-color bg-primary-50 p-3 text-sm text-primary-700">
                  {t.trustStatLabels[0]}: <span className="font-semibold">{t.trustStats[0]}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-b border-slate-200/80 py-14 md:py-18">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-8 flex items-end justify-between gap-3">
              <div>
                <h2>{t.categoriesTitle}</h2>
                <p className="mt-1 text-slate-500">{t.categoriesSubtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <Link key={category.id} href={withLang(`/category/${category.slug}`, lang)}>
                  <CategoryCard
                    name={getCategoryLabel(category.slug, lang, category.name)}
                    slug={category.slug}
                    icon={category.icon}
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200/80 py-14 md:py-18">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 md:px-6 md:grid-cols-3">
            {t.featuresTitle.map((title, idx) => {
              const Icon = featureIcons[idx];
              return (
                <Card key={title}>
                  <CardContent className="space-y-3 p-6">
                    <span className="inline-flex rounded-md bg-primary-50 p-2 text-primary-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-slate-500">{t.featuresDesc[idx]}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="requests" className="border-b border-slate-200/80 py-12">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <HomeRequestFeed requests={requests} user={user} lang={lang} isRtl={isRtl} />
          </div>
        </section>

        <section className="border-b border-slate-200/80 py-14 md:py-18">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-8 text-center">
              <h2>{t.howItWorksTitle}</h2>
              <p className="mt-2 text-slate-500">{t.howItWorksSubtitle}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[Package, MessagesSquare, Handshake].map((Icon, idx) => (
                <Card key={t.steps[idx].title}>
                  <CardContent className="space-y-3 p-6 text-center">
                    <span className="mx-auto inline-flex rounded-full bg-primary-50 p-3 text-primary-700">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-base font-semibold text-foreground">{t.steps[idx].title}</h3>
                    <p className="text-sm text-slate-500">{t.steps[idx].description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="py-14 md:py-18">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.contactTitle}</CardTitle>
                <p className="text-sm text-slate-500">{t.contactSubtitle}</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-md border ui-border-color bg-slate-50 p-4">
                    <p className="text-xs uppercase text-slate-400">{t.contactEmailLabel}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">support@autosav.app</p>
                  </div>
                  <div className="rounded-md border ui-border-color bg-slate-50 p-4">
                    <p className="text-xs uppercase text-slate-400">{t.contactPhoneLabel}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">+213 555 00 00 00</p>
                  </div>
                  <div className="rounded-md border ui-border-color bg-slate-50 p-4">
                    <p className="text-xs uppercase text-slate-400">{t.contactHoursLabel}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">09:00 - 18:00</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href={withLang("/dashboard/create-request", lang)}>
                    <Button>{t.ctaPrimary}</Button>
                  </Link>
                  <Link href={withLang("/register", lang)}>
                    <Button variant="outline">{t.finalCtaAgent}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

