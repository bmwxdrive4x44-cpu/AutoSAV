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

const ICON_MAP: Record<string, string> = {
  "Wrench": "Wrench",
  "Zap": "Zap",
  "Gamepad2": "Gamepad2",
  "Shirt": "Shirt",
  "Sparkles": "Sparkles",
  "Hammer": "Hammer",
  "Heart": "Heart",
  "Package": "Package",
  "Car": "Car",
  "Smartphone": "Smartphone",
  "Home": "Home",
  "Utensils": "Utensils",
};

function getIconComponent(iconName: string | null | undefined): ReactNode {
  if (!iconName || !ICON_MAP[iconName]) {
    return <Icons.Package className="w-6 h-6" />;
  }

  const Icon = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
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
        group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl
        transition-all duration-300 cursor-pointer text-center
        border bg-surface
        ${
          isSelected
            ? "border-accent bg-accent-soft text-accent shadow-travel"
            : "border-border hover:border-accent/30 hover:shadow-card-hover hover:-translate-y-1"
        }
      `}
    >
      {/* Icon */}
      <div
        className={`
          p-3 rounded-xl transition-all duration-300
          ${
            isSelected
              ? "bg-accent text-white"
              : "bg-accent-soft text-accent group-hover:bg-accent group-hover:text-white group-hover:scale-110"
          }
        `}
      >
        {getIconComponent(icon)}
      </div>

      {/* Name */}
      <p className={`font-semibold text-sm leading-tight ${isSelected ? "text-accent" : "text-foreground"}`}>
        {name}
      </p>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 rounded-full bg-accent" />
        </div>
      )}
    </Component>
  );
}
