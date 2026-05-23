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
  "Car": "Car",
  "Smartphone": "Smartphone",
  "Home": "Home",
  "Utensils": "Utensils",
};

function getIconComponent(iconName: string | null | undefined): ReactNode {
  if (!iconName || !ICON_MAP[iconName]) {
    return <Icons.Package className="w-5 h-5" />;
  }

  const Icon = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
  if (!Icon) {
    return <Icons.Package className="w-5 h-5" />;
  }

  return <Icon className="w-5 h-5" />;
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
        group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl
        transition-all duration-300 cursor-pointer text-center
        border backdrop-blur-sm
        ${
          isSelected
            ? "bg-accent/20 text-accent border-accent/30 shadow-[0_0_30px_rgba(255,107,74,0.2)]"
            : "bg-surface/60 border-border text-foreground hover:bg-surface/80 hover:border-accent/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        }
      `}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/0 to-accent/0 opacity-0 group-hover:from-accent/5 group-hover:to-transparent group-hover:opacity-100 transition-all duration-500" />

      {/* Icon */}
      <div
        className={`
          relative p-3 rounded-xl transition-all duration-300
          ${
            isSelected
              ? "bg-accent/20 text-accent"
              : "bg-surface-elevated text-muted group-hover:bg-accent/10 group-hover:text-accent group-hover:scale-110"
          }
        `}
      >
        {getIconComponent(icon)}
      </div>

      {/* Name */}
      <p className={`relative font-medium text-sm leading-tight ${isSelected ? "text-accent" : "text-foreground-secondary group-hover:text-foreground"}`}>
        {name}
      </p>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(255,107,74,0.6)]" />
        </div>
      )}
    </Component>
  );
}
