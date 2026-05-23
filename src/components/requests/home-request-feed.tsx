"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { RequestCard } from "@/components/requests/request-card";
import { Search, Package, Smartphone, Shirt, Home, Car, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    title: "Demandes actives",
    subtitle: "Parcourez les opportunités et proposez vos meilleures offres.",
    searchPlaceholder: "Rechercher par produit, pays...",
    categoriesTitle: "Catégories populaires",
    categories: [
      { label: "Electronique", searchTerm: "electronic" },
      { label: "Mode", searchTerm: "fashion" },
      { label: "Maison & Jardin", searchTerm: "home" },
      { label: "Pièces Auto", searchTerm: "auto" },
    ],
    emptyTitle: "Aucune demande trouvée",
    emptySubtitle: "Essayez une autre recherche ou revenez plus tard.",
    requestsAvailable: "disponible",
    requestSingle: "demande",
    requestPlural: "demandes",
    makeOffer: "Faire une offre",
    card: {
      budget: "Budget",
      from: "Depuis",
      active: "Actif",
      highPriority: "Priorité haute",
      statusCompleted: "Terminé",
      statusInProgress: "En cours",
      statusOpen: "Ouvert",
    },
  },
  en: {
    title: "Active Requests",
    subtitle: "Browse ongoing sourcing opportunities and make competitive offers.",
    searchPlaceholder: "Search by product name, country...",
    categoriesTitle: "Popular categories",
    categories: [
      { label: "Electronics", searchTerm: "electronic" },
      { label: "Fashion", searchTerm: "fashion" },
      { label: "Home & Garden", searchTerm: "home" },
      { label: "Auto Parts", searchTerm: "auto" },
    ],
    emptyTitle: "No requests found",
    emptySubtitle: "Try adjusting your search or check back later.",
    requestsAvailable: "available",
    requestSingle: "request",
    requestPlural: "requests",
    makeOffer: "Make an offer",
    card: {
      budget: "Budget",
      from: "From",
      active: "Active",
      highPriority: "High Priority",
      statusCompleted: "Completed",
      statusInProgress: "In Progress",
      statusOpen: "Open",
    },
  },
  ar: {
    title: "الطلبات النشطة",
    subtitle: "تصفح الفرص الحالية وقدم عرضا مناسبا بسرعة.",
    searchPlaceholder: "ابحث باسم المنتج أو البلد...",
    categoriesTitle: "فئات شائعة",
    categories: [
      { label: "إلكترونيات", searchTerm: "electronic" },
      { label: "ملابس", searchTerm: "fashion" },
      { label: "منزل وحديقة", searchTerm: "home" },
      { label: "قطع السيارات", searchTerm: "auto" },
    ],
    emptyTitle: "لا توجد طلبات",
    emptySubtitle: "غير كلمات البحث أو عد لاحقا.",
    requestsAvailable: "متاح",
    requestSingle: "طلب",
    requestPlural: "طلبات",
    makeOffer: "قدم عرض",
    card: {
      budget: "الميزانية",
      from: "من",
      active: "نشط",
      highPriority: "أولوية عالية",
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
      <div className="mb-12 text-center space-y-4">
        <Badge className="w-fit mx-auto">
          <Sparkles className="w-3 h-3 mr-1.5" />
          Live
        </Badge>
        <h2 className="text-balance">{t.title}</h2>
        <p className="text-muted max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Search Bar */}
      <div className="mb-10 max-w-2xl mx-auto">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <Search className={`absolute top-1/2 w-5 h-5 -translate-y-1/2 text-muted ${isRtl ? "right-5" : "left-5"}`} />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
              className={`h-14 rounded-xl border-border bg-surface/80 backdrop-blur-sm text-base placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all ${isRtl ? "pr-14 pl-5 text-right" : "pl-14 pr-5"}`}
            />
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="mb-10">
        <p className="text-sm font-medium text-muted mb-4">{t.categoriesTitle}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                className={`group p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 text-center ${
                  isActive
                    ? "border-accent/50 bg-accent/10 shadow-[0_0_20px_rgba(255,107,74,0.15)]"
                    : "border-border bg-surface/40 hover:border-accent/30 hover:bg-surface/60"
                }`}
              >
                <div className={`mb-2 flex justify-center transition-transform duration-300 ${!isActive ? "group-hover:scale-110" : ""}`}>
                  <CategoryIcon className={`h-5 w-5 ${isActive ? "text-accent" : "text-muted group-hover:text-accent"}`} />
                </div>
                <p className={`text-sm font-medium ${isActive ? "text-accent" : "text-foreground-secondary"}`}>
                  {category.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-surface/30 py-16 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated">
            <Package className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t.emptyTitle}</h3>
          <p className="text-muted">{t.emptySubtitle}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted font-medium">
              <span className="text-accent font-bold">{filteredRequests.length}</span>{" "}
              {filteredRequests.length === 1 ? t.requestSingle : t.requestPlural} {t.requestsAvailable}
            </p>
          </div>
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
        </div>
      )}
    </section>
  );
}
