import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe, Handshake, MessagesSquare, Package, Shield, Sparkles, TrendingUp, Zap } from "lucide-react";
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
    badge: "Sourcing simplifié",
    heroTitleStart: "Trouvez des offres fiables en",
    heroTitleEmphasis: "quelques secondes",
    heroSubtitle: "Connectez-vous à des fournisseurs vérifiés et sourcez vos produits en toute confiance.",
    ctaPrimary: "Publier une demande",
    ctaSecondary: "Parcourir les offres",
    trustChips: ["Réseau vérifié", "Workflow sécurisé", "Matching rapide"],
    trustStats: ["1,200+", "$2.5M+"],
    trustStatLabels: ["Utilisateurs vérifiés", "Commandes facilitées"],
    showcaseLabels: ["Demandes actives", "Utilisateurs vérifiés", "Réponse moyenne"],
    categoriesTitle: "Parcourir par catégorie",
    categoriesSubtitle: "Trouvez exactement ce que vous cherchez en explorant nos catégories principales.",
    featuresTitle: ["Vendeurs vérifiés", "Réponses rapides", "Réseau mondial"],
    featuresDesc: [
      "Les profils actifs sont contrôlés pour garantir la fiabilité et la qualité.",
      "Recevez des offres en quelques heures, pas en plusieurs jours.",
      "Connectez-vous instantanément à des fournisseurs de plusieurs pays.",
    ],
    howItWorksTitle: "Comment ça marche",
    howItWorksSubtitle: "Simple, transparent et rapide. Trouvez vos produits en trois étapes.",
    steps: [
      {
        title: "Publiez votre demande",
        description: "Expliquez clairement le produit recherché, la quantité et le budget.",
      },
      {
        title: "Recevez des offres",
        description: "Des offreurs vérifiés répondent avec prix, délais et conditions.",
      },
      {
        title: "Finalisez la commande",
        description: "Comparez, négociez et validez. Le suivi est centralisé sur la plateforme.",
      },
    ],
    contactTitle: "Contact",
    contactSubtitle: "Notre équipe vous répond rapidement pour vous aider à publier ou suivre vos demandes.",
    contactEmailLabel: "Email",
    contactPhoneLabel: "Téléphone",
    contactHoursLabel: "Horaires",
    finalCtaTitle: "Prêt à commencer ?",
    finalCtaSubtitle: "Rejoignez des utilisateurs qui trouvent plus intelligemment.",
    finalCtaAgent: "Créer un compte",
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
    { label: t.showcaseLabels[0], value: `${requests.length}+`, icon: Package },
    { label: t.showcaseLabels[1], value: t.trustStats[0], icon: Shield },
    { label: t.showcaseLabels[2], value: "< 2h", icon: Zap },
  ];

  const featureIcons = [Shield, Zap, Globe] as const;

  return (
    <div className="min-h-screen">
      <Header lang={lang} />
      <div dir={isRtl ? "rtl" : "ltr"}>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background Effects */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-60" />
            <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] opacity-40" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <Badge className="w-fit animate-fade-up">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  {t.badge}
                </Badge>

                <div className="space-y-6">
                  <h1 className="text-balance animate-fade-up" style={{ animationDelay: "100ms" }}>
                    {t.heroTitleStart}{" "}
                    <span className="text-accent">{t.heroTitleEmphasis}</span>
                  </h1>
                  <p className="max-w-xl text-lg text-muted leading-relaxed animate-fade-up" style={{ animationDelay: "200ms" }}>
                    {t.heroSubtitle}
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row animate-fade-up" style={{ animationDelay: "300ms" }}>
                  <Link href={withLang("/dashboard/create-request", lang)}>
                    <Button size="lg" className="w-full sm:w-auto group">
                      {t.ctaPrimary}
                      <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isRtl ? "mr-2 rotate-180" : "ml-2"}`} />
                    </Button>
                  </Link>
                  <Link href="#requests">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      {t.ctaSecondary}
                    </Button>
                  </Link>
                </div>

                {/* Trust Chips */}
                <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "400ms" }}>
                  {t.trustChips.map((chip) => (
                    <div
                      key={chip}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface/40 backdrop-blur-sm text-sm text-foreground-secondary"
                    >
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      {chip}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Stats Card */}
              <div className="relative animate-fade-up" style={{ animationDelay: "300ms" }}>
                <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-40" />
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Marketplace Pulse</CardTitle>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 text-success text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        Live
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {highlights.map((item) => (
                      <div
                        key={item.label}
                        className="group flex items-center justify-between rounded-xl border border-border bg-surface-elevated/50 p-4 transition-all duration-300 hover:border-accent/30 hover:bg-surface-elevated"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/15">
                            <item.icon className="h-5 w-5" />
                          </div>
                          <span className="text-sm text-muted">{item.label}</span>
                        </div>
                        <span className="text-xl font-bold text-foreground font-display">{item.value}</span>
                      </div>
                    ))}

                    <div className="rounded-xl border border-accent/20 bg-accent/10 p-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-secondary">{t.trustStatLabels[0]}</span>
                        <span className="font-bold text-accent">{t.trustStats[0]}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="relative py-20 md:py-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-surface/30 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-balance">{t.categoriesTitle}</h2>
              <p className="mt-3 text-muted max-w-2xl mx-auto">{t.categoriesSubtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((category, idx) => (
                <Link
                  key={category.id}
                  href={withLang(`/category/${category.slug}`, lang)}
                  className="animate-fade-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
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

        {/* Features Section */}
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-3">
              {t.featuresTitle.map((title, idx) => {
                const Icon = featureIcons[idx];
                return (
                  <Card
                    key={title}
                    className="group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="relative space-y-4 p-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent/15 group-hover:scale-110">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                      <p className="text-sm text-muted leading-relaxed">{t.featuresDesc[idx]}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Requests Feed Section */}
        <section id="requests" className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <HomeRequestFeed requests={requests} user={user} lang={lang} isRtl={isRtl} />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative py-20 md:py-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-surface/30 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-balance">{t.howItWorksTitle}</h2>
              <p className="mt-3 text-muted max-w-2xl mx-auto">{t.howItWorksSubtitle}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[Package, MessagesSquare, Handshake].map((Icon, idx) => (
                <Card key={t.steps[idx].title} className="group relative overflow-hidden text-center">
                  {/* Step Number */}
                  <div className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-bold">
                    {idx + 1}
                  </div>
                  <CardContent className="space-y-4 p-8 pt-16">
                    <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{t.steps[idx].title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{t.steps[idx].description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <CardHeader className="relative">
                <CardTitle className="text-xl">{t.contactTitle}</CardTitle>
                <p className="text-sm text-muted mt-1">{t.contactSubtitle}</p>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { label: t.contactEmailLabel, value: "support@autosav.app" },
                    { label: t.contactPhoneLabel, value: "+213 555 00 00 00" },
                    { label: t.contactHoursLabel, value: "09:00 - 18:00" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-border bg-surface-elevated/50 p-4 transition-all duration-300 hover:border-accent/30"
                    >
                      <p className="text-xs uppercase text-muted tracking-wide">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link href={withLang("/dashboard/create-request", lang)}>
                    <Button className="w-full sm:w-auto">
                      {t.ctaPrimary}
                      <ArrowRight className={`h-4 w-4 ${isRtl ? "mr-2 rotate-180" : "ml-2"}`} />
                    </Button>
                  </Link>
                  <Link href={withLang("/register", lang)}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      {t.finalCtaAgent}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
                  <Package className="w-4 h-4" />
                </div>
                <span className="font-semibold text-foreground">AutoSAV</span>
              </div>
              <p className="text-sm text-muted">
                © 2024 AutoSAV. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
