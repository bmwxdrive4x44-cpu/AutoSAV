import { ReactNode } from "react";
import * as Icons from "lucide-react";

interface CategoryCardProps {
  name: string;
  slug: string;
  icon?: string | null;
  href?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

/**
 * Icon map for category icons
 */
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
    return <Icons.Package className="w-6 h-6" />;
  }

  const Icon = Icons[iconName as keyof typeof Icons] as any;
  if (!Icon) {
    return <Icons.Package className="w-6 h-6" />;
  }

  return <Icon className="w-6 h-6" />;
}

export function CategoryCard({
  name,
  slug,
  icon,
  href,
  onClick,
  isSelected = false,
}: CategoryCardProps) {
  const Component = href ? "a" : "button";

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`
        group relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl
        transition-all duration-200 cursor-pointer text-center
        ${
          isSelected
            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/50 scale-105"
            : "bg-white border border-slate-200 text-slate-900 hover:border-slate-300 hover:shadow-md"
        }
      `}
    >
      {/* Icon */}
      <div
        className={`
          p-3 rounded-lg transition-all duration-200
          ${
            isSelected
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-900 group-hover:bg-slate-200"
          }
        `}
      >
        {getIconComponent(icon)}
      </div>

      {/* Name */}
      <p className="font-medium text-sm leading-tight">{name}</p>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      )}
    </Component>
  );
}

