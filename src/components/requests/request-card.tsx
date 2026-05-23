import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/categories";
import { getCategoryLabel } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { MapPin, TrendingUp, Clock, ArrowUpRight } from "lucide-react";

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
      className: "bg-success/15 text-success border border-success/25",
      dotColor: "bg-success"
    };
  }

  if (["OFFER_ACCEPTED", "PAYMENT_PENDING", "PURCHASE_IN_PROGRESS", "PAYMENT_RELEASED"].includes(status)) {
    return { 
      label: t.statusInProgress,
      className: "bg-primary/15 text-primary border border-primary/25",
      dotColor: "bg-primary"
    };
  }

  return { 
    label: t.statusOpen,
    className: "bg-warning/15 text-warning border border-warning/25",
    dotColor: "bg-warning"
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
    <Card className="group h-full relative overflow-hidden">
      {/* Hover Glow Effect */}
      <div className="absolute -inset-px bg-gradient-to-r from-accent/0 via-accent/0 to-accent/0 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:from-accent/10 group-hover:via-accent/5 group-hover:to-transparent transition-all duration-500 -z-10 blur-xl" />
      
      {/* Header */}
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors duration-300">
            {request.title}
          </h3>
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowUpRight className="h-5 w-5 text-accent" />
          </div>
        </div>

        {/* Category & Status Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {request.category && (
            <CategoryBadge
              categoryName={categoryLabel ?? request.category.name}
              categorySlug={request.category.slug}
              categoryIcon={request.category.icon}
              asLink={true}
            />
          )}
          
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${marketplaceStatus.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${marketplaceStatus.dotColor} animate-pulse`} />
            {marketplaceStatus.label}
          </span>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-5">
        {/* Budget and Location Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 p-3 rounded-xl bg-surface-elevated/50 border border-border/50">
            <p className="text-[10px] font-medium text-muted uppercase tracking-wider">{t.budget}</p>
            <p className="text-lg font-bold text-accent font-display">{formatPrice(request.budget)}</p>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-surface-elevated/50 border border-border/50">
            <p className="text-[10px] font-medium text-muted uppercase tracking-wider">{t.from}</p>
            <div className={`flex items-center gap-1.5 text-sm font-semibold text-foreground ${isRtl ? "justify-end" : ""}`}>
              <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
              <span className="truncate">{request.countryToBuyFrom}</span>
            </div>
          </div>
        </div>

        {/* Quick Info Tags */}
        <div className="flex items-center gap-3 text-xs text-muted pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.active}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.highPriority}</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link href={ctaHref} className="block">
          <Button 
            size="sm" 
            variant={isOwnRequest ? "outline" : "default"}
            className="w-full group/btn"
          >
            {ctaText}
            {!isOwnRequest && (
              <ArrowUpRight className="w-4 h-4 ml-1.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            )}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
