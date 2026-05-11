import Link from "next/link";
import { ReactNode } from "react";
import * as Icons from "lucide-react";

interface CategoryBadgeProps {
  categoryName: string;
  categorySlug: string;
  categoryIcon?: string | null;
  asLink?: boolean;
}

const ICON_MAP: Record<string, string> = {
  "Wrench": "Wrench",
  "Zap": "Zap",
  "Gamepad2": "Gamepad2",
  "Shirt": "Shirt",
  "Sparkles": "Sparkles",
  "Hammer": "Hammer",
  "Heart": "Heart",
  "Package": "Package",
};

function getIconComponent(iconName: string | null | undefined): ReactNode {
  if (!iconName || !ICON_MAP[iconName]) {
    return null;
  }

  const Icon = Icons[iconName as keyof typeof Icons] as any;
  if (!Icon) {
    return null;
  }

  return <Icon className="w-3 h-3" />;
}

export function CategoryBadge({
  categoryName,
  categorySlug,
  categoryIcon,
  asLink = true,
}: CategoryBadgeProps) {
  const content = (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium
        bg-slate-100 text-slate-700 transition-colors duration-200
        ${asLink ? "group-hover:bg-slate-200" : ""}
      `}
    >
      {getIconComponent(categoryIcon)}
      <span>{categoryName}</span>
    </span>
  );

  if (!asLink) {
    return content;
  }

  return (
    <Link href={`/category/${categorySlug}`} className="group">
      {content}
    </Link>
  );
}

