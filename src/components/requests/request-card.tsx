import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/categories";
import { formatPrice } from "@/lib/utils";
import { MapPin, TrendingUp, Clock } from "lucide-react";

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
      className: "bg-green-50 text-green-700 border border-green-200",
      badgeColor: "bg-green-100"
    };
  }

  if (["OFFER_ACCEPTED", "PAYMENT_PENDING", "PURCHASE_IN_PROGRESS", "PAYMENT_RELEASED"].includes(status)) {
    return { 
      label: t.statusInProgress,
      className: "bg-blue-50 text-blue-700 border border-blue-200",
      badgeColor: "bg-blue-100"
    };
  }

  return { 
    label: t.statusOpen,
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    badgeColor: "bg-amber-100"
  };
}

export function RequestCard({ request, user, ctaLabel = "Make an offer", labels, isRtl = false }: RequestCardProps) {
  const t = { ...DEFAULT_LABELS, ...(labels ?? {}) };
  const marketplaceStatus = getMarketplaceStatus(request.status, labels);
  const isOwnRequest = !!user && !!request.requester?.id && user.id === request.requester.id;
  const canActAsProvider = !!user && user.role !== "ADMIN" && !isOwnRequest;
  const ctaHref = canActAsProvider
    ? `/request/${request.id}`
    : isOwnRequest
      ? "/dashboard/requests"
      : `/login?redirect=/request/${request.id}&action=offer`;
  const ctaText = isOwnRequest ? "Voir ma demande" : ctaLabel;

  return (
    <Card className="group h-full overflow-hidden border border-slate-300 bg-slate-50 shadow-sm hover:shadow-xl hover:border-primary-300 transition-all duration-300">
      {/* Header with status */}
      <CardHeader className="space-y-3 pb-3 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {request.title}
            </h3>
          </div>
        </div>

        {/* Category badge */}
        {request.category && (
          <CategoryBadge
            categoryName={request.category.name}
            categorySlug={request.category.slug}
            categoryIcon={request.category.icon}
            asLink={true}
          />
        )}

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${marketplaceStatus.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${marketplaceStatus.badgeColor}`} />
            {marketplaceStatus.label}
          </span>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-6">
        {/* Budget and Location Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t.budget}</p>
            <p className="text-lg font-bold text-slate-900">{formatPrice(request.budget)}</p>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t.from}</p>
            <div className={`flex items-center gap-1.5 text-sm font-semibold text-slate-900 ${isRtl ? "justify-end" : ""}`}>
              <MapPin className="h-4 w-4 text-primary-600 flex-shrink-0" />
              <span className="truncate">{request.countryToBuyFrom}</span>
            </div>
          </div>
        </div>

        {/* Quick info */}
        <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{t.active}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>{t.highPriority}</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link href={ctaHref} className="block">
          <Button 
            size="sm" 
            variant={isOwnRequest ? "outline" : "default"}
            className={
              isOwnRequest
                ? "w-full"
                : "w-full bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md transition-all group-hover:shadow-lg"
            }
          >
            {ctaText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

