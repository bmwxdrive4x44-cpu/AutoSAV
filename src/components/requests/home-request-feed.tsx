"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { RequestCard } from "@/components/requests/request-card";
import { Search, Package, Smartphone, Shirt, Home, Car, Plane } from "lucide-react";

type HomeRequest = {
  id: string;
  title: string;
  budget: number;
  countryToBuyFrom: string;
  status: string;
};

type User = {
  id: string;
  role: string;
} | null;

type Lang = "fr" | "en" | "ar";

interface HomeRequestFeedProps {
  requests: HomeRequest[];
  user: User;
  lang: Lang;
  isRtl: boolean;
}

const FEED_COPY: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    categoriesTitle: string;
    categories: Array<{ label: string; searchTerm: string }>;
    emptyTitle: string;
    emptySubtitle: string;
    requestsAvailable: string;
    requestSingle: string;
    requestPlural: string;
    makeOffer: string;
    card: {
      budget: string;
      from: string;
      active: string;
      highPriority: string;
      statusCompleted: string;
      statusInProgress: string;
      statusOpen: string;
    };
  }
> = {
  fr: {
    title: "Demandes en attente de voyageurs",
    subtitle: "Ces acheteurs cherchent quelqu'un pour leur ramener un produit. Proposez votre aide !",
    searchPlaceholder: "Rechercher par produit, pays...",
    categoriesTitle: "Filtrer par categorie",
    categories: [
      { label: "Electronique", searchTerm: "electronic" },
      { label: "Mode", searchTerm: "fashion" },
      { label: "Maison", searchTerm: "home" },
      { label: "Auto", searchTerm: "auto" },
    ],
    emptyTitle: "Aucune demande pour le moment",
    emptySubtitle: "Revenez plus tard ou soyez le premier a publier une demande !",
    requestsAvailable: "disponible",
    requestSingle: "demande",
    requestPlural: "demandes",
    makeOffer: "Proposer mon aide",
    card: {
      budget: "Budget",
      from: "Depuis",
      active: "Actif",
      highPriority: "Urgent",
      statusCompleted: "Termine",
      statusInProgress: "En cours",
      statusOpen: "Ouvert",
    },
  },
  en: {
    title: "Requests waiting for travelers",
    subtitle: "These buyers are looking for someone to bring them a product. Offer your help!",
    searchPlaceholder: "Search by product, country...",
    categoriesTitle: "Filter by category",
    categories: [
      { label: "Electronics", searchTerm: "electronic" },
      { label: "Fashion", searchTerm: "fashion" },
      { label: "Home", searchTerm: "home" },
      { label: "Auto", searchTerm: "auto" },
    ],
    emptyTitle: "No requests at the moment",
    emptySubtitle: "Check back later or be the first to post a request!",
    requestsAvailable: "available",
    requestSingle: "request",
    requestPlural: "requests",
    makeOffer: "Offer my help",
    card: {
      budget: "Budget",
      from: "From",
      active: "Active",
      highPriority: "Urgent",
      statusCompleted: "Completed",
      statusInProgress: "In Progress",
      statusOpen: "Open",
    },
  },
  ar: {
    title: "طلبات بانتظار المسافرين",
    subtitle: "هؤلاء المشترون يبحثون عن شخص يجلب لهم منتجا. قدم مساعدتك!",
    searchPlaceholder: "ابحث بالمنتج او البلد...",
    categoriesTitle: "فلتر حسب الفئة",
    categories: [
      { label: "الكترونيات", searchTerm: "electronic" },
      { label: "ازياء", searchTerm: "fashion" },
      { label: "منزل", searchTerm: "home" },
      { label: "سيارات", searchTerm: "auto" },
    ],
    emptyTitle: "لا توجد طلبات حاليا",
    emptySubtitle: "عد لاحقا او كن اول من ينشر طلبا!",
    requestsAvailable: "متاح",
    requestSingle: "طلب",
    requestPlural: "طلبات",
    makeOffer: "قدم مساعدتي",
    card: {
      budget: "الميزانية",
      from: "من",
      active: "نشط",
      highPriority: "عاجل",
      statusCompleted: "مكتمل",
      statusInProgress: "قيد التنفيذ",
      statusOpen: "مفتوح",
    },
  },
};

const CATEGORY_ICONS = [Smartphone, Shirt, Home, Car];

export function HomeRequestFeed({ requests, user, lang, isRtl }: HomeRequestFeedProps) {
  const t = FEED_COPY[lang];
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesQuery = !normalized || 
        request.title.toLowerCase().includes(normalized) ||
        request.countryToBuyFrom.toLowerCase().includes(normalized);

      const matchesCategory = !selectedCategory || 
        request.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        request.countryToBuyFrom.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesQuery && matchesCategory;
    });
  }, [query, requests, selectedCategory]);

  return (
    <section className="relative" id="requests">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-highlight-soft text-highlight font-semibold text-sm mb-4">
          <Plane className="w-4 h-4" />
          {filteredRequests.length} {filteredRequests.length === 1 ? t.requestSingle : t.requestPlural}
        </div>
        <h2 className="mb-3">{t.title}</h2>
        <p className="text-muted max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-xl mx-auto">
        <div className="relative">
          <Search className={`absolute top-1/2 w-5 h-5 -translate-y-1/2 text-muted ${isRtl ? "right-4" : "left-4"}`} />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            className={`h-12 rounded-full border-border bg-surface text-base placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 ${isRtl ? "pr-12 pl-4 text-right" : "pl-12 pr-4"}`}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-10">
        <p className="text-sm font-medium text-muted mb-4 text-center">{t.categoriesTitle}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {t.categories.map((category, index) => {
            const CategoryIcon = CATEGORY_ICONS[index];
            const isActive = selectedCategory === category.searchTerm;

            return (
              <button
                key={category.label}
                onClick={() => {
                  if (selectedCategory === category.searchTerm) {
                    setSelectedCategory(null);
                    setQuery("");
                    return;
                  }
                  setSelectedCategory(category.searchTerm);
                  setQuery(category.searchTerm);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 ${
                  isActive
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-muted hover:border-accent/50 hover:text-accent"
                }`}
              >
                <CategoryIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-surface py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft">
            <Package className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t.emptyTitle}</h3>
          <p className="text-muted">{t.emptySubtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request, idx) => (
            <div
              key={request.id}
              className="animate-fade-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <RequestCard
                request={request}
                user={user}
                ctaLabel={t.makeOffer}
                labels={t.card}
                isRtl={isRtl}
                lang={lang}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
