"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { RequestCard } from "@/components/requests/request-card";
import { Search, Package, Smartphone, Shirt, Home, Car } from "lucide-react";

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
    subtitle: "Parcourez les opportunites et proposez vos meilleures offres.",
    searchPlaceholder: "Rechercher par produit, pays...",
    categoriesTitle: "Categories populaires",
    categories: [
      { label: "Electronique", searchTerm: "electronic" },
      { label: "Mode", searchTerm: "fashion" },
      { label: "Maison & Jardin", searchTerm: "home" },
      { label: "Pieces Auto", searchTerm: "auto" },
    ],
    emptyTitle: "Aucune demande trouvee",
    emptySubtitle: "Essayez une autre recherche ou revenez plus tard.",
    requestsAvailable: "disponible",
    requestSingle: "demande",
    requestPlural: "demandes",
    makeOffer: "Faire une offre",
    card: {
      budget: "Budget",
      from: "Depuis",
      active: "Actif",
      highPriority: "Priorite haute",
      statusCompleted: "Termine",
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
    <section className="py-16 md:py-24 border-t border-slate-200 bg-slate-50/70" id="requests">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">{t.title}</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search className={`absolute top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
              className={`h-14 rounded-xl border-slate-300 bg-slate-100 text-base shadow-sm focus:ring-2 focus:ring-primary-500 ${isRtl ? "pr-12 pl-5 text-right" : "pl-12 pr-5"}`}
            />
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mb-12">
          <p className="text-sm font-semibold text-slate-600 mb-4">{t.categoriesTitle}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {t.categories.map((category, index) => {
              const CategoryIcon = CATEGORY_ICONS[index];

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
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  selectedCategory === category.searchTerm
                    ? "border-primary-600 bg-primary-50"
                    : "border-slate-300 bg-slate-100 hover:border-slate-400"
                }`}
              >
                <div className="mb-2 flex justify-center">
                  <CategoryIcon className="h-5 w-5 text-slate-700" />
                </div>
                <p className="text-sm font-medium text-slate-900">{category.label}</p>
              </button>
              );
            })}
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t.emptyTitle}</h3>
            <p className="text-slate-600">{t.emptySubtitle}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-slate-600 font-medium">
              {filteredRequests.length} {filteredRequests.length === 1 ? t.requestSingle : t.requestPlural} {t.requestsAvailable}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  user={user}
                  ctaLabel={t.makeOffer}
                  labels={t.card}
                  isRtl={isRtl}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

