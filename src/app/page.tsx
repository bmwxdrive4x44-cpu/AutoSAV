import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe, Handshake, MapPin, MessagesSquare, Package, Plane, Shield, Sparkles, Users, Zap } from "lucide-react";
import { getCategories } from "@/app/actions/categories";
import { getPublicRequests } from "@/app/actions/requests";
import { CategoryCard } from "@/components/categories";
import { Header } from "@/components/layout/header";
import { HomeRequestFeed } from "@/components/requests/home-request-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    heroTitleEnd: string;
    heroSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    marqueeItems: string[];
    stats: Array<{ value: string; label: string }>;
    howItWorksTitle: string;
    howItWorksSubtitle: string;
    steps: Array<{ title: string; description: string }>;
    categoriesTitle: string;
    categoriesSubtitle: string;
    servicesTitle: string;
    services: Array<{ title: string; description: string }>;
    faqTitle: string;
    faqs: Array<{ question: string; answer: string }>;
    ctaTitle: string;
    ctaSubtitle: string;
  }
> = {
  fr: {
    badge: "Voyagez. Rapportez. Gagnez.",
    heroTitleStart: "Faites voyager",
    heroTitleEmphasis: "vos envies",
    heroTitleEnd: "du monde entier",
    heroSubtitle: "Connectez-vous avec des voyageurs qui rapportent vos produits preferés dans leurs bagages. Simple, économique et humain.",
    ctaPrimary: "Publier une demande",
    ctaSecondary: "Devenir voyageur",
    marqueeItems: [
      "PARIS", "DUBAI", "ISTANBUL", "MILAN", "BARCELONE", "LONDRES", "NEW YORK", "TOKYO", "BANGKOK", "ALGER"
    ],
    stats: [
      { value: "2,500+", label: "Voyageurs actifs" },
      { value: "15K+", label: "Colis livrés" },
      { value: "45+", label: "Destinations" },
      { value: "98%", label: "Satisfaction" },
    ],
    howItWorksTitle: "Comment ça marche",
    howItWorksSubtitle: "Trois étapes simples pour recevoir vos produits du monde entier",
    steps: [
      {
        title: "Publiez votre demande",
        description: "Décrivez le produit que vous cherchez, sa provenance et votre budget.",
      },
      {
        title: "Trouvez un voyageur",
        description: "Des voyageurs vérifés proposent de rapporter votre colis lors de leur prochain voyage.",
      },
      {
        title: "Recevez votre colis",
        description: "Le voyageur vous livre en main propre. Sécurisé et économique.",
      },
    ],
    categoriesTitle: "Que cherchez-vous ?",
    categoriesSubtitle: "Electronique, mode, cosmétiques... trouvez ce qui est introuvable chez vous.",
    servicesTitle: "Nos services",
    services: [
      {
        title: "Pour les acheteurs",
        description: "Accédez à des produits du monde entier à prix réduits grâce aux voyageurs.",
      },
      {
        title: "Pour les voyageurs",
        description: "Rentabilisez vos voyages en transportant des colis pour d'autres.",
      },
      {
        title: "Livraison sécurisée",
        description: "Paiement sécurisé, voyageurs vérifiés, assurance colis incluse.",
      },
    ],
    faqTitle: "Questions fréquentes",
    faqs: [
      {
        question: "Comment fonctionne la livraison ?",
        answer: "Le voyageur achète le produit sur place et vous le remet en main propre à son retour. Vous fixez ensemble le lieu et l'heure de remise.",
      },
      {
        question: "Les voyageurs sont-ils vérifiés ?",
        answer: "Oui, chaque voyageur doit fournir une pièce d'identité et un justificatif de voyage. Nous vérifions également les avis des utilisateurs précédents.",
      },
      {
        question: "Que se passe-t-il en cas de problème ?",
        answer: "Notre équipe de support est disponible 7j/7. En cas de litige, le paiement est bloqué jusqu'à résolution et une assurance couvre les colis.",
      },
      {
        question: "Combien gagne un voyageur ?",
        answer: "Les voyageurs fixent leur commission, généralement entre 10% et 20% du prix du produit. C'est un excellent moyen de rentabiliser ses voyages.",
      },
    ],
    ctaTitle: "Prêt à commencer ?",
    ctaSubtitle: "Rejoignez la communauté de voyageurs et acheteurs",
  },
  en: {
    badge: "Travel. Deliver. Earn.",
    heroTitleStart: "Get products",
    heroTitleEmphasis: "you love",
    heroTitleEnd: "from anywhere",
    heroSubtitle: "Connect with travelers who bring back your favorite products in their luggage. Simple, affordable, and personal.",
    ctaPrimary: "Post a Request",
    ctaSecondary: "Become a Traveler",
    marqueeItems: [
      "PARIS", "DUBAI", "ISTANBUL", "MILAN", "BARCELONA", "LONDON", "NEW YORK", "TOKYO", "BANGKOK", "ALGIERS"
    ],
    stats: [
      { value: "2,500+", label: "Active travelers" },
      { value: "15K+", label: "Packages delivered" },
      { value: "45+", label: "Destinations" },
      { value: "98%", label: "Satisfaction" },
    ],
    howItWorksTitle: "How it works",
    howItWorksSubtitle: "Three simple steps to receive products from around the world",
    steps: [
      {
        title: "Post your request",
        description: "Describe the product you want, where it's from, and your budget.",
      },
      {
        title: "Find a traveler",
        description: "Verified travelers offer to bring back your package on their next trip.",
      },
      {
        title: "Receive your package",
        description: "The traveler delivers it to you in person. Secure and affordable.",
      },
    ],
    categoriesTitle: "What are you looking for?",
    categoriesSubtitle: "Electronics, fashion, cosmetics... find what's unavailable locally.",
    servicesTitle: "Our services",
    services: [
      {
        title: "For buyers",
        description: "Access products from around the world at reduced prices thanks to travelers.",
      },
      {
        title: "For travelers",
        description: "Make your trips profitable by carrying packages for others.",
      },
      {
        title: "Secure delivery",
        description: "Secure payment, verified travelers, package insurance included.",
      },
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        question: "How does delivery work?",
        answer: "The traveler buys the product on-site and hands it to you personally upon return. You agree on the place and time of handover together.",
      },
      {
        question: "Are travelers verified?",
        answer: "Yes, each traveler must provide an ID and proof of travel. We also check reviews from previous users.",
      },
      {
        question: "What happens if there's a problem?",
        answer: "Our support team is available 7 days a week. In case of dispute, payment is held until resolution and insurance covers packages.",
      },
      {
        question: "How much does a traveler earn?",
        answer: "Travelers set their commission, usually between 10% and 20% of the product price. It's a great way to monetize your travels.",
      },
    ],
    ctaTitle: "Ready to get started?",
    ctaSubtitle: "Join the community of travelers and buyers",
  },
  ar: {
    badge: "سافر. أحضر. اربح.",
    heroTitleStart: "احصل على المنتجات",
    heroTitleEmphasis: "التي تحبها",
    heroTitleEnd: "من أي مكان",
    heroSubtitle: "تواصل مع مسافرين يجلبون منتجاتك المفضلة في حقائبهم. بسيط واقتصادي وشخصي.",
    ctaPrimary: "نشر طلب",
    ctaSecondary: "كن مسافراً",
    marqueeItems: [
      "باريس", "دبي", "اسطنبول", "ميلان", "برشلونة", "لندن", "نيويورك", "طوكيو", "بانكوك", "الجزائر"
    ],
    stats: [
      { value: "+2500", label: "مسافر نشط" },
      { value: "+15 ألف", label: "طرد تم توصيله" },
      { value: "+45", label: "وجهة" },
      { value: "98%", label: "رضا" },
    ],
    howItWorksTitle: "كيف تعمل المنصة",
    howItWorksSubtitle: "ثلاث خطوات بسيطة لاستلام منتجاتك من جميع أنحاء العالم",
    steps: [
      {
        title: "انشر طلبك",
        description: "صف المنتج الذي تريده ومصدره وميزانيتك.",
      },
      {
        title: "ابحث عن مسافر",
        description: "مسافرون موثوقون يعرضون إحضار طردك في رحلتهم القادمة.",
      },
      {
        title: "استلم طردك",
        description: "المسافر يسلمك الطرد شخصياً. آمن واقتصادي.",
      },
    ],
    categoriesTitle: "ماذا تبحث عنه؟",
    categoriesSubtitle: "إلكترونيات، أزياء، مستحضرات تجميل... اعثر على ما لا يتوفر محلياً.",
    servicesTitle: "خدماتنا",
    services: [
      {
        title: "للمشترين",
        description: "احصل على منتجات من جميع أنحاء العالم بأسعار مخفضة بفضل المسافرين.",
      },
      {
        title: "للمسافرين",
        description: "استثمر رحلاتك بنقل طرود للآخرين.",
      },
      {
        title: "توصيل آمن",
        description: "دفع آمن، مسافرون موثوقون، تأمين على الطرود.",
      },
    ],
    faqTitle: "الأسئلة الشائعة",
    faqs: [
      {
        question: "كيف يعمل التوصيل؟",
        answer: "المسافر يشتري المنتج من المكان ويسلمه لك شخصياً عند عودته. تتفقون معاً على مكان ووقت التسليم.",
      },
      {
        question: "هل المسافرون موثوقون؟",
        answer: "نعم، كل مسافر يجب أن يقدم هوية وإثبات سفر. نتحقق أيضاً من تقييمات المستخدمين السابقين.",
      },
      {
        question: "ماذا يحدث في حالة وجود مشكلة؟",
        answer: "فريق الدعم متاح 7 أيام في الأسبوع. في حالة النزاع، يتم حجز الدفع حتى الحل والتأمين يغطي الطرود.",
      },
      {
        question: "كم يكسب المسافر؟",
        answer: "المسافرون يحددون عمولتهم، عادة بين 10% و20% من سعر المنتج. إنها طريقة رائعة لاستثمار رحلاتك.",
      },
    ],
    ctaTitle: "جاهز للبدء؟",
    ctaSubtitle: "انضم إلى مجتمع المسافرين والمشترين",
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

  return (
    <div className="min-h-screen bg-bg">
      <Header lang={lang} />
      <div dir={isRtl ? "rtl" : "ltr"}>
        
        {/* Hero Section - Bright and Travel-focused */}
        <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-soft border border-accent/20 text-accent font-semibold text-sm mb-8 animate-fade-up">
                <Plane className="w-4 h-4" />
                {t.badge}
              </div>

              {/* Main Title */}
              <h1 className="mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
                <span className="text-foreground">{t.heroTitleStart}</span>{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-accent">{t.heroTitleEmphasis}</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-highlight/40" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 T200,8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>{" "}
                <span className="text-foreground">{t.heroTitleEnd}</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: "200ms" }}>
                {t.heroSubtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up" style={{ animationDelay: "300ms" }}>
                <Link href={withLang("/dashboard/create-request", lang)}>
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-full bg-accent hover:bg-accent-hover text-white shadow-travel">
                    {t.ctaPrimary}
                    <ArrowRight className={`h-5 w-5 ${isRtl ? "mr-2 rotate-180" : "ml-2"}`} />
                  </Button>
                </Link>
                <Link href={withLang("/register", lang)}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 rounded-full border-2 border-accent text-accent hover:bg-accent hover:text-white">
                    {t.ctaSecondary}
                  </Button>
                </Link>
              </div>

              {/* Hero Images Grid */}
              <div className="relative max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "400ms" }}>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <div className="aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-card-hover bg-surface">
                    <img 
                      src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=600&fit=crop" 
                      alt="Voyageur avec valise"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-card-hover bg-surface -mt-8">
                    <img 
                      src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=600&fit=crop" 
                      alt="Vue aérienne voyage"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-card-hover bg-surface">
                    <img 
                      src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=400&h=600&fit=crop" 
                      alt="Amis en voyage"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -left-4 top-1/4 bg-white rounded-2xl shadow-card p-3 flex items-center gap-2 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-sky-soft flex items-center justify-center">
                    <Plane className="w-5 h-5 text-sky" />
                  </div>
                  <div className="pr-2">
                    <p className="text-xs text-muted">En vol vers</p>
                    <p className="text-sm font-bold text-foreground">Paris</p>
                  </div>
                </div>
                <div className="absolute -right-4 bottom-1/4 bg-white rounded-2xl shadow-card p-3 flex items-center gap-2 animate-float" style={{ animationDelay: "1s" }}>
                  <div className="w-10 h-10 rounded-xl bg-highlight-soft flex items-center justify-center">
                    <Package className="w-5 h-5 text-highlight" />
                  </div>
                  <div className="pr-2">
                    <p className="text-xs text-muted">Colis livré</p>
                    <p className="text-sm font-bold text-foreground">+150 DZD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee - Destinations */}
        <section className="py-6 bg-accent overflow-hidden">
          <div className="marquee">
            <div className="marquee-content">
              {t.marqueeItems.map((item, idx) => (
                <span key={idx} className="flex items-center gap-4 text-white/90 font-semibold text-lg whitespace-nowrap">
                  <MapPin className="w-4 h-4" />
                  {item}
                </span>
              ))}
            </div>
            <div className="marquee-content" aria-hidden="true">
              {t.marqueeItems.map((item, idx) => (
                <span key={idx} className="flex items-center gap-4 text-white/90 font-semibold text-lg whitespace-nowrap">
                  <MapPin className="w-4 h-4" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {t.stats.map((stat, idx) => (
                <div 
                  key={stat.label} 
                  className="text-center p-6 rounded-2xl bg-surface border border-border animate-fade-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <p className="text-3xl md:text-4xl font-bold text-accent mb-2 font-display">{stat.value}</p>
                  <p className="text-sm text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-warm">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="mb-4">{t.howItWorksTitle}</h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">{t.howItWorksSubtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[Package, Users, CheckCircle2].map((Icon, idx) => (
                <div 
                  key={t.steps[idx].title} 
                  className="relative text-center animate-fade-up"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  {/* Connector line */}
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-border" />
                  )}
                  
                  {/* Step number */}
                  <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-surface border-2 border-accent/20 mb-6 shadow-card">
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <Icon className="w-12 h-12 text-accent" />
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-foreground">{t.steps[idx].title}</h3>
                  <p className="text-muted leading-relaxed max-w-xs mx-auto">{t.steps[idx].description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="mb-4">{t.categoriesTitle}</h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">{t.categoriesSubtitle}</p>
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

        {/* Services Section */}
        <section className="py-16 md:py-24 bg-cream">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="mb-4">{t.servicesTitle}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Package, color: "bg-highlight-soft text-highlight" },
                { icon: Plane, color: "bg-sky-soft text-sky" },
                { icon: Shield, color: "bg-success-soft text-success" },
              ].map(({ icon: Icon, color }, idx) => (
                <div 
                  key={t.services[idx].title}
                  className="travel-card p-8 text-center animate-fade-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${color} mb-6`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{t.services[idx].title}</h3>
                  <p className="text-muted leading-relaxed">{t.services[idx].description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requests Feed Section */}
        <section id="requests" className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <HomeRequestFeed requests={requests} user={user} lang={lang} isRtl={isRtl} />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-warm">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-center mb-12">{t.faqTitle}</h2>
              <div className="space-y-0">
                {t.faqs.map((faq, idx) => (
                  <details 
                    key={idx} 
                    className="group border-b border-border"
                  >
                    <summary className="flex items-center justify-between py-5 cursor-pointer list-none">
                      <span className="font-semibold text-foreground text-lg">{faq.question}</span>
                      <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-accent transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="pb-5 text-muted leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="relative rounded-3xl overflow-hidden bg-accent p-12 md:p-16 text-center">
              {/* Background decorations */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
              
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.ctaTitle}</h2>
                <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">{t.ctaSubtitle}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={withLang("/dashboard/create-request", lang)}>
                    <Button size="lg" className="w-full sm:w-auto bg-white text-accent hover:bg-white/90 rounded-full px-8 py-6 text-base font-semibold">
                      {t.ctaPrimary}
                      <ArrowRight className={`h-5 w-5 ${isRtl ? "mr-2 rotate-180" : "ml-2"}`} />
                    </Button>
                  </Link>
                  <Link href={withLang("/register", lang)}>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-accent rounded-full px-8 py-6 text-base font-semibold">
                      {t.ctaSecondary}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">AutoSAV</span>
              </div>
              <p className="text-sm text-muted">
                © 2024 AutoSAV. Tous droits réservés.
              </p>
              <div className="flex items-center gap-6">
                <Link href="#" className="text-sm text-muted hover:text-accent transition-colors">
                  Conditions
                </Link>
                <Link href="#" className="text-sm text-muted hover:text-accent transition-colors">
                  Confidentialité
                </Link>
                <Link href="#contact" className="text-sm text-muted hover:text-accent transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
