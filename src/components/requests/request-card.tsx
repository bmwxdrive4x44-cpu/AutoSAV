import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/categories";
import { getCategoryLabel } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { MapPin, Plane, ArrowRight } from "lucide-react";

type User = {
  id: string;
  role: string;
} | null;

interface RequestCardProps {
  request: {
    id: string;
    title: string;
    budget: number;
    countryToBuyFrom: string;
    status: string;
    requester?: {
      id: string;
      name?: string;
    };
    category?: {
      id: string;
      name: string;
      slug: string;
      icon: string | null;
    };
  };
  user?: User;
  ctaLabel?: string;
  labels?: Partial<{
    budget: string;
    from: string;
    active: string;
    highPriority: string;
    statusCompleted: string;
    statusInProgress: string;
    statusOpen: string;
  }>;
  isRtl?: boolean;
  lang?: Lang;
}

const DEFAULT_LABELS = {
  budget: "Budget",
  from: "From",
  active: "Active",
  highPriority: "High Priority",
  statusCompleted: "Completed",
  statusInProgress: "In Progress",
  statusOpen: "Open",
};

function getMarketplaceStatus(
  status: string,
  labels: Partial<NonNullable<RequestCardProps["labels"]>> | undefined
) {
  const t = { ...DEFAULT_LABELS, ...(labels ?? {}) };

  if (status === "SHIPPED" || status === "DELIVERED") {
    return { 
      label: t.statusCompleted,
      className: "bg-success-soft text-success",
    };
  }

  if (["OFFER_ACCEPTED", "PAYMENT_PENDING", "PURCHASE_IN_PROGRESS", "PAYMENT_RELEASED"].includes(status)) {
    return { 
      label: t.statusInProgress,
      className: "bg-sky-soft text-sky",
    };
  }

  return { 
    label: t.statusOpen,
    className: "bg-accent-soft text-accent",
  };
}

export function RequestCard({ request, user, ctaLabel = "Make an offer", labels, isRtl = false, lang = "fr" }: RequestCardProps) {
  const t = { ...DEFAULT_LABELS, ...(labels ?? {}) };
  const marketplaceStatus = getMarketplaceStatus(request.status, labels);
  const isOwnRequest = !!user && !!request.requester?.id && user.id === request.requester.id;
  const categoryLabel = request.category
    ? getCategoryLabel(request.category.slug, lang, request.category.name)
    : undefined;
  const canActAsProvider = !!user && user.role !== "ADMIN" && !isOwnRequest;
  const ctaHref = canActAsProvider
    ? `/request/${request.id}`
    : isOwnRequest
      ? "/dashboard/requests"
      : `/login?redirect=/request/${request.id}&action=offer`;
  const ctaText = isOwnRequest ? "Voir ma demande" : ctaLabel;

  return (
    <div className="travel-card group h-full flex flex-col">
      {/* Header with destination */}
      <div className="p-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
            {request.title}
          </h3>
          <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${marketplaceStatus.className}`}>
            {marketplaceStatus.label}
          </span>
        </div>

        {/* From location - prominent */}
        <div className="flex items-center gap-2 text-accent">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-soft">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-muted">{t.from}</p>
            <p className="font-semibold text-foreground">{request.countryToBuyFrom}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category */}
        {request.category && (
          <div className="mb-4">
            <CategoryBadge
              categoryName={categoryLabel ?? request.category.name}
              categorySlug={request.category.slug}
              categoryIcon={request.category.icon}
              asLink={true}
            />
          </div>
        )}

        {/* Budget - big and prominent */}
        <div className="mb-5 p-4 rounded-xl bg-accent-soft/50 border border-accent/10">
          <p className="text-xs text-muted mb-1">{t.budget}</p>
          <p className="text-2xl font-bold text-accent font-display">{formatPrice(request.budget)}</p>
        </div>

        {/* CTA Button */}
        <Link href={ctaHref} className="block mt-auto">
          <Button 
            size="sm" 
            variant={isOwnRequest ? "outline" : "default"}
            className="w-full"
          >
            {ctaText}
            {!isOwnRequest && (
              <ArrowRight className={`w-4 h-4 ${isRtl ? "mr-2 rotate-180" : "ml-2"}`} />
            )}
          </Button>
        </Link>
      </div>
    </div>
  );
}
