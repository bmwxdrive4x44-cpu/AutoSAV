import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { RequestCard } from "@/components/requests/request-card";
import { getRequestsByCategory, getCategoryBySlug } from "@/app/actions/categories";
import { getCurrentUser } from "@/lib/auth";
import { normalizeLang, textDir, withLang } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { ChevronRight, Package } from "lucide-react";

const COPY: Record<
  Lang,
  {
    breadcrumbs: [string, string];
    requests: string;
    noRequests: string;
    noRequestsDesc: string;
    browseAll: string;
  }
> = {
  fr: {
    breadcrumbs: ["Accueil", "Catégories"],
    requests: "demandes",
    noRequests: "Aucune demande dans cette catégorie",
    noRequestsDesc: "Revenez bientôt pour découvrir les demandes disponibles.",
    browseAll: "Voir toutes les catégories",
  },
  en: {
    breadcrumbs: ["Home", "Categories"],
    requests: "requests",
    noRequests: "No requests in this category",
    noRequestsDesc: "Check back soon for upcoming requests.",
    browseAll: "Browse all categories",
  },
  ar: {
    breadcrumbs: ["Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©", "Ø§Ù„ÙØ¦Ø§Øª"],
    requests: "Ø·Ù„Ø¨Ø§Øª",
    noRequests: "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª ÙÙŠ Ù‡Ø°Ù‡ Ø§Ù„ÙØ¦Ø©",
    noRequestsDesc: "Ø¹Ø¯ Ù…Ø¬Ø¯Ø¯Ø§ Ù‚Ø±ÙŠØ¨Ø§ Ù„Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø·Ù„Ø¨Ø§Øª Ù…ØªØ§Ø­Ø©.",
    browseAll: "Ø´ÙˆÙ ÙƒÙ„ Ø§Ù„ÙØ¦Ø§Øª",
  },
};

export default async function CategoryPage({
  params: { slug },
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { lang?: string; page?: string };
}) {
  const lang = normalizeLang(searchParams?.lang);
  const isRtl = textDir(lang) === "rtl";
  const t = COPY[lang];
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10));

  // Fetch category and requests
  let category, requests, total, totalPages;
  try {
    const data = await getRequestsByCategory(slug, page, 12);
    category = data.category;
    requests = data.requests;
    total = data.total;
    totalPages = data.totalPages;
  } catch (error) {
    notFound();
  }

  if (!category) {
    notFound();
  }

  const user = await getCurrentUser();

  const cardLabels = {
    budget: lang === "fr" ? "Budget" : lang === "ar" ? "Ø§Ù„Ù…ÙŠØ²Ø§Ù†ÙŠØ©" : "Budget",
    from: lang === "fr" ? "Depuis" : lang === "ar" ? "Ù…Ù†" : "From",
    active: lang === "fr" ? "Actif" : lang === "ar" ? "Ù†Ø´Ø·" : "Active",
  };

  const ctaLabel =
    lang === "fr" ? "Faire une offre" : lang === "ar" ? "Ù‚Ø¯Ù‘Ù… Ø¹Ø±Ø¶" : "Make an offer";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100">
      <Header lang={lang} />

      <div dir={isRtl ? "rtl" : "ltr"} className="pt-16 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm text-slate-600">
            <Link
              href={withLang("/", lang)}
              className="hover:text-slate-900 transition-colors"
            >
              {t.breadcrumbs[0]}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{category.name}</span>
          </div>

          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              {category.icon && (
                <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center">
                  <span className="text-2xl">ðŸ“¦</span>
                </div>
              )}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                  {category.name}
                </h1>
                <p className="text-slate-600 mt-2">
                  {total} {total === 1 ? t.requests.slice(0, -1) : t.requests}
                </p>
              </div>
            </div>
          </div>

          {/* Requests Grid */}
          {requests.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-20 text-center">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t.noRequests}
              </h3>
              <p className="text-slate-600 mb-8">{t.noRequestsDesc}</p>
              <Link
                href={withLang("/", lang)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                {t.browseAll}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
                {requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    user={user}
                    ctaLabel={ctaLabel}
                    labels={cardLabels}
                    isRtl={isRtl}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  {page > 1 && (
                    <Link
                      href={withLang(
                        `/category/${slug}?page=${page - 1}`,
                        lang
                      )}
                      className="px-6 py-3 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors"
                    >
                      ← {lang === "fr" ? "Précédent" : "Previous"}
                    </Link>
                  )}

                  <div className="text-slate-600">
                    {lang === "fr"
                      ? `Page ${page} sur ${totalPages}`
                      : `Page ${page} of ${totalPages}`}
                  </div>

                  {page < totalPages && (
                    <Link
                      href={withLang(
                        `/category/${slug}?page=${page + 1}`,
                        lang
                      )}
                      className="px-6 py-3 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors"
                    >
                      {lang === "fr" ? "Suivant" : "Next"} →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

