import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { getPublicRequests } from "@/app/actions/requests";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/app/actions/categories";
import { HomeRequestFeed } from "@/components/requests/home-request-feed";
import { CategoryCard } from "@/components/categories";
import { normalizeLang, textDir, withLang } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { ArrowRight, Globe, Zap, Shield, Package, MessagesSquare, Handshake, CheckCircle2 } from "lucide-react";

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
    badge: "Ø§Ù„Ø´Ø±Ø§Ø¡ Ù…Ù† Ø§Ù„Ø®Ø§Ø±Ø¬ Ø¨Ø·Ø±ÙŠÙ‚Ø© Ø³Ù‡Ù„Ø©",
    heroTitleStart: "Ù„Ù‚Ø§Ùˆ ÙˆØ³ÙŠØ· Ø´Ø±Ø§Ø¡ Ù…ÙˆØ«ÙˆÙ‚",
    heroTitleEmphasis: "Ø¨Ø³Ø±Ø¹Ø©",
    heroSubtitle: "ØªÙˆØ§ØµÙ„Ùˆ Ù…Ø¹ Ù…ÙˆØ±Ø¯ÙŠÙ† Ù…ÙˆØ«ÙˆÙ‚ÙŠÙ† ÙˆÙ‚Ø¯Ù…Ùˆ Ø·Ù„Ø¨Ø§ØªÙƒÙ… Ø¨Ø«Ù‚Ø© ÙˆØ¨ÙˆØ¶ÙˆØ­.",
    ctaPrimary: "Ù†Ø´Ø± Ø·Ù„Ø¨",
    ctaSecondary: "ØªØµÙØ­ Ø§Ù„Ø¹Ø±ÙˆØ¶",
    trustChips: ["Ø´Ø¨ÙƒØ© Ù…ÙˆØ«ÙˆÙ‚Ø©", "Ù…Ø³Ø§Ø± Ø¢Ù…Ù†", "Ù…Ø·Ø§Ø¨Ù‚Ø© Ø³Ø±ÙŠØ¹Ø©"],
    trustStats: ["+1200", "+2.5M$"],
    trustStatLabels: ["ÙˆØ³Ø·Ø§Ø¡ Ù…ÙˆØ«Ù‚ÙˆÙ†", "Ø·Ù„Ø¨Ø§Øª ØªÙ…Øª Ø¨Ù†Ø¬Ø§Ø­"],
    showcaseLabels: ["Ø·Ù„Ø¨Ø§Øª Ù†Ø´Ø·Ø©", "ÙˆØ³Ø·Ø§Ø¡ Ù…ÙˆØ«Ù‚ÙˆÙ†", "Ù…ØªÙˆØ³Ø· Ø§Ù„Ø±Ø¯"],
    categoriesTitle: "ØªØµÙØ­ Ø­Ø³Ø¨ Ø§Ù„ÙØ¦Ø©",
    categoriesSubtitle: "Ø¬Ø¯ Ø§Ù„Ø¨Ù„Ø§ØµØ© ÙŠÙ„ÙŠ ÙƒØªØ¯ÙˆØ± Ø¹Ù„ÙŠÙ‡Ø§ Ù…Ù† Ø®Ù„Ø§Ù„ ÙØ¦Ø§ØªÙ†Ø§ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©.",
    featuresTitle: ["ÙˆØ³Ø·Ø§Ø¡ Ù…ÙˆØ«Ù‚ÙˆÙ†", "Ø±Ø¯ÙˆØ¯ Ø³Ø±ÙŠØ¹Ø©", "Ø´Ø¨ÙƒØ© Ø¯ÙˆÙ„ÙŠØ©"],
    featuresDesc: [
      "ÙƒÙ„ ÙˆØ³ÙŠØ· ÙƒÙŠØªÙ… Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù†Ùˆ Ø¨Ø§Ø´ ØªÙƒÙˆÙ† Ø§Ù„Ø®Ø¯Ù…Ø© Ù…Ø¶Ù…ÙˆÙ†Ø©.",
      "ØªÙˆØµÙ„ÙˆÙƒ Ø§Ù„Ø¹Ø±ÙˆØ¶ ÙÙ…Ø¯Ø© Ù‚ØµÙŠØ±Ø©ØŒ Ù…Ø§Ø´ÙŠ Ø¨Ø¹Ø¯ Ø£ÙŠØ§Ù….",
      "ØªÙ‚Ø¯Ø± ØªØªÙˆØ§ØµÙ„ Ù…Ø¹ Ù…ÙˆØ±Ø¯ÙŠÙ† Ù…Ù† Ø¯ÙˆÙ„ Ù…Ø®ØªÙ„ÙØ© Ø¨Ø³Ù‡ÙˆÙ„Ø©.",
    ],
    howItWorksTitle: "ÙƒÙŠÙØ§Ø´ Ø®Ø¯Ø§Ù…",
    howItWorksSubtitle: "ÙˆØ§Ø¶Ø­ ÙˆØ³Ù‡Ù„ ÙˆØ³Ø±ÙŠØ¹. Ø«Ù„Ø§Ø« Ø®Ø·ÙˆØ§Øª ÙˆØ¨Ø¯Ø§ Ø®Ø¯Ù…ØªÙƒ.",
    steps: [
      {
        title: "Ù†Ø´Ø± Ø§Ù„Ø·Ù„Ø¨ Ø¯ÙŠØ§Ù„Ùƒ",
        description: "ÙƒØªØ¨ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù†ØªÙˆØ¬ØŒ Ø§Ù„ÙƒÙ…ÙŠØ© ÙˆØ§Ù„Ù…ÙŠØ²Ø§Ù†ÙŠØ© Ø¨Ø´ÙƒÙ„ ÙˆØ§Ø¶Ø­.",
      },
      {
        title: "ØªÙˆØµÙ„ Ø¨Ø§Ù„Ø¹Ø±ÙˆØ¶",
        description: "ÙˆØ³Ø·Ø§Ø¡ Ù…ÙˆØ«Ù‚ÙˆÙ† ÙƒÙŠØ±Ø³Ù„Ùˆ Ù„ÙŠÙƒ Ø§Ù„Ø«Ù…Ù† ÙˆØ§Ù„Ù…Ø¯Ø© ÙˆØ§Ù„Ø´Ø±ÙˆØ·.",
      },
      {
        title: "ÙƒÙ…Ù„ Ø§Ù„Ø¹Ù…Ù„ÙŠØ©",
        description: "Ù‚Ø§Ø±Ù†ØŒ ÙØ§ÙˆØ¶ØŒ ÙˆØµØ§Ø¯Ù‚ Ø¹Ù„Ù‰ Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„Ù„ÙŠ Ù…Ù†Ø§Ø³Ø¨ Ù„ÙŠÙƒ.",
      },
    ],
    contactTitle: "Ø§ØªØµØ§Ù„",
    contactSubtitle: "Ø§Ù„ÙØ±ÙŠÙ‚ Ø¯ÙŠØ§Ù„Ù†Ø§ ÙƒÙŠØ¹Ø§ÙˆÙ†Ùƒ Ø¨Ø³Ø±Ø¹Ø© Ø¨Ø§Ø´ ØªÙ†Ø´Ø± Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø¯ÙŠØ§Ù„Ùƒ ÙˆÙ„Ø§ ØªØªØ§Ø¨Ø¹Ù‡Ø§.",
    contactEmailLabel: "Ø§Ù„Ø¨Ø±ÙŠØ¯",
    contactPhoneLabel: "Ø§Ù„Ù‡Ø§ØªÙ",
    contactHoursLabel: "Ø§Ù„Ø£ÙˆÙ‚Ø§Øª",
    finalCtaTitle: "ÙˆØ§Ø¬Ù€Ø¯ ØªØ¨Ø¯Ø£ØŸ",
    finalCtaSubtitle: "Ø§Ù†Ø¶Ù… Ù„Ø´Ø±ÙƒØ§Øª ÙƒØªØ¯Ø¨Ø± Ø§Ù„Ø´Ø±Ø§Ø¡ Ø¨Ø°ÙƒØ§Ø¡.",
    finalCtaAgent: "Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨",
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { lang?: string };
}) {
  const [requests, user, categories] = await Promise.all([
    getPublicRequests(),
    getCurrentUser(),
    getCategories(),
  ]);
  const lang = normalizeLang(searchParams?.lang);
  const isRtl = textDir(lang) === "rtl";
  const t = COPY[lang];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100">
      <Header lang={lang} />

      <div dir={isRtl ? "rtl" : "ltr"}>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-36">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-20 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10" />

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="space-y-5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-200">
                  <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-primary-700">{t.badge}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
                  {t.heroTitleStart} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">{t.heroTitleEmphasis}</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                  {t.heroSubtitle}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href={withLang("/dashboard/create-request", lang)} className="flex-1">
                  <Button size="lg" className="w-full h-14 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all">
                    {t.ctaPrimary}
                    <ArrowRight className={`w-5 h-5 ${isRtl ? "mr-2" : "ml-2"}`} />
                  </Button>
                </Link>
                <Link href="#requests" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full h-14 rounded-xl border-slate-300 bg-slate-100 hover:bg-slate-200">
                    {t.ctaSecondary}
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100/80 px-3 py-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-primary-600" />
                  {t.trustChips[0]}
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100/80 px-3 py-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-primary-600" />
                  {t.trustChips[1]}
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100/80 px-3 py-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-primary-600" />
                  {t.trustChips[2]}
                </div>
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{t.trustStats[0]}</p>
                  <p className="text-sm text-slate-600">{t.trustStatLabels[0]}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{t.trustStats[1]}</p>
                  <p className="text-sm text-slate-600">{t.trustStatLabels[1]}</p>
                </div>
              </div>
            </div>

            {/* Right side - Visual showcase */}
            <div className="hidden md:block relative h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-blue-100 rounded-2xl opacity-50" />
              <div className="absolute inset-4 rounded-xl border border-slate-200/80 bg-slate-50/95 shadow-xl p-6 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-100 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <Package className="h-4 w-4 text-primary-600" />
                      {t.showcaseLabels[0]}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">50+</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-100 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <Handshake className="h-4 w-4 text-primary-600" />
                      {t.showcaseLabels[1]}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">1,200+</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-100 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <MessagesSquare className="h-4 w-4 text-primary-600" />
                      {t.showcaseLabels[2]}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">2h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-16 md:py-24 border-t border-slate-200 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t.categoriesTitle}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t.categoriesSubtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={withLang(`/category/${category.slug}`, lang)}>
                <CategoryCard
                  name={category.name}
                  slug={category.slug}
                  icon={category.icon}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-16 md:py-24 border-t border-slate-200 bg-slate-100/70">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mx-auto max-w-3xl rounded-3xl border border-slate-300 bg-slate-50 p-6 md:p-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t.contactTitle}</h2>
            <p className="mt-3 text-slate-600">{t.contactSubtitle}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">{t.contactEmailLabel}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">support@dzmarket.dz</p>
              </div>
              <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">{t.contactPhoneLabel}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">+213 555 00 00 00</p>
              </div>
              <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">{t.contactHoursLabel}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">09:00 - 18:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & FEATURES SECTION */}
      <section className="py-16 md:py-24 border-t border-slate-200 bg-slate-100/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3 rounded-2xl border border-slate-300 bg-slate-50 p-6">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{t.featuresTitle[0]}</h3>
              <p className="text-slate-600">{t.featuresDesc[0]}</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-300 bg-slate-50 p-6">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{t.featuresTitle[1]}</h3>
              <p className="text-slate-600">{t.featuresDesc[1]}</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-300 bg-slate-50 p-6">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{t.featuresTitle[2]}</h3>
              <p className="text-slate-600">{t.featuresDesc[2]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* REQUESTS FEED SECTION */}
      <main>
        <HomeRequestFeed requests={requests} user={user} lang={lang} isRtl={isRtl} />
      </main>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-24 bg-slate-100 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">{t.howItWorksTitle}</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">{t.howItWorksSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: 1,
                title: t.steps[0].title,
                description: t.steps[0].description,
                icon: Package
              },
              {
                number: 2,
                title: t.steps[1].title,
                description: t.steps[1].description,
                icon: MessagesSquare
              },
              {
                number: 3,
                title: t.steps[2].title,
                description: t.steps[2].description,
                icon: Handshake
              }
            ].map((step) => (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {step.number < 3 && (
                  <div className="hidden md:block absolute top-20 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-300 to-transparent" />
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mx-auto text-primary-700">
                    <step.icon className="h-7 w-7" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-slate-900 text-lg">{step.title}</h3>
                    <p className="text-slate-600 text-sm">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 md:py-24 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-3xl border border-slate-300 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100/70 px-6 py-12 text-center shadow-sm md:px-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">{t.finalCtaTitle}</h2>
            <p className="text-xl text-slate-600">{t.finalCtaSubtitle}</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={withLang("/dashboard/create-request", lang)}>
              <Button size="lg" className="h-14 rounded-xl px-8 bg-primary-600 hover:bg-primary-700 text-white">
                {t.ctaPrimary}
              </Button>
            </Link>
            <Link href={withLang("/register", lang)}>
              <Button size="lg" variant="outline" className="h-14 rounded-xl px-8 border-slate-400 bg-slate-100 hover:bg-slate-200">
                {t.finalCtaAgent}
              </Button>
            </Link>
          </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}

