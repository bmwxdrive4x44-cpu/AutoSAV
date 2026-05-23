import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-sora)", "var(--font-manrope)", "ui-sans-serif"],
      },
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-gradient": "rgb(var(--bg-gradient) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-elevated": "rgb(var(--surface-elevated) / <alpha-value>)",
        "surface-hover": "rgb(var(--surface-hover) / <alpha-value>)",
        border: "rgb(var(--border-subtle) / <alpha-value>)",
        "border-accent": "rgb(var(--border-accent) / <alpha-value>)",
        foreground: "rgb(var(--text-primary) / <alpha-value>)",
        "foreground-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        muted: "rgb(var(--text-muted) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          50: "rgb(var(--primary-soft) / 0.15)",
          100: "rgb(var(--primary-soft) / 0.25)",
          500: "rgb(var(--primary) / <alpha-value>)",
          600: "rgb(var(--primary) / 0.9)",
          700: "rgb(var(--primary) / 0.8)",
          soft: "rgb(var(--primary-soft) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          50: "rgb(var(--success-soft) / <alpha-value>)",
          500: "rgb(var(--success) / <alpha-value>)",
          700: "rgb(var(--success) / 0.8)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          50: "rgb(var(--warning-soft) / <alpha-value>)",
          500: "rgb(var(--warning) / <alpha-value>)",
          700: "rgb(var(--warning) / 0.8)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          50: "rgb(var(--danger-soft) / <alpha-value>)",
          500: "rgb(var(--danger) / <alpha-value>)",
          700: "rgb(var(--danger) / 0.8)",
        },
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        md: "14px",
        lg: "18px",
        xl: "24px",
        "2xl": "32px",
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(0, 0, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.12)",
        "subtle-hover": "0 4px 16px rgba(0, 0, 0, 0.12), 0 16px 48px rgba(0, 0, 0, 0.16)",
        glow: "0 0 40px rgba(255, 107, 74, 0.25)",
        "glow-lg": "0 0 60px rgba(255, 107, 74, 0.35)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-up": "fade-up 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in": "fade-in 300ms ease-out",
        "scale-in": "scale-in 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slide-up 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "grid-pattern": "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
