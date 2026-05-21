export const designTokens = {
  colors: {
    background: "rgb(var(--bg))",
    surface: "rgb(var(--surface))",
    surfaceElevated: "rgb(var(--surface-elevated))",
    borderSubtle: "rgb(var(--border-subtle))",
    primary: "rgb(var(--primary))",
    success: "rgb(var(--success))",
    warning: "rgb(var(--warning))",
    danger: "rgb(var(--danger))",
    textPrimary: "rgb(var(--text-primary))",
    textSecondary: "rgb(var(--text-secondary))",
    textMuted: "rgb(var(--text-muted))",
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    6: "24px",
    8: "32px",
    12: "48px",
  },
  radius: {
    sm: "10px",
    md: "14px",
    lg: "18px",
    xl: "24px",
  },
  shadows: {
    subtle: "0 1px 2px rgba(15, 23, 42, 0.03), 0 8px 24px rgba(15, 23, 42, 0.04)",
    subtleHover: "0 2px 8px rgba(15, 23, 42, 0.04), 0 14px 32px rgba(15, 23, 42, 0.06)",
  },
  typography: {
    h1: "clamp(1.6rem, 1.1rem + 1.8vw, 2.25rem)",
    h2: "clamp(1.2rem, 1rem + 0.9vw, 1.6rem)",
    body: "15px",
    caption: "12px",
  },
  motion: {
    duration: {
      fast: 0.15,
      base: 0.22,
      slow: 0.3,
    },
    easing: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
} as const;

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export const riskBadgeTone: Record<RiskLevel, "success" | "warning" | "destructive"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "destructive",
};

export type PriorityLevel = "HIGH" | "NORMAL" | "LOW";

export const priorityBadgeTone: Record<PriorityLevel, "priority-high" | "priority-normal" | "priority-low"> = {
  HIGH: "priority-high",
  NORMAL: "priority-normal",
  LOW: "priority-low",
};
