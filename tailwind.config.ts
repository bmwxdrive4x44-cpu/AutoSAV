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
        "bg-warm": "rgb(var(--bg-warm) / <alpha-value>)",
        "bg-cream": "rgb(var(--bg-cream) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-elevated": "rgb(var(--surface-elevated) / <alpha-value>)",
        "surface-hover": "rgb(var(--surface-hover) / <alpha-value>)",
        border: "rgb(var(--border-subtle) / <alpha-value>)",
        "border-accent": "rgb(var(--border-accent) / <alpha-value>)",
        foreground: "rgb(var(--text-primary) / <alpha-value>)",
        "foreground-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        muted: "rgb(var(--text-muted) / <alpha-value>)",
        primary: {
          "50": "#eef4ff",
          "100": "#dde9ff",
          "600": "#2f6fed",
          "700": "#2550d8",
          "900": "#1a2d7a",
        },
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          soft: "rgb(var(--success-soft) / <alpha-value>)",
          "500": "#1c9a5f",
        },
        warning: {
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          soft: "rgb(var(--warning-soft) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          soft: "rgb(var(--danger-soft) / <alpha-value>)",
          "500": "#d64545",
          "700": "#a63030",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          light: "rgb(var(--accent-light) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
        },
        highlight: {
          DEFAULT: "rgb(var(--highlight) / <alpha-value>)",
          soft: "rgb(var(--highlight-soft) / <alpha-value>)",
        },
        sky: {
          DEFAULT: "rgb(var(--sky) / <alpha-value>)",
          soft: "rgb(var(--sky-soft) / <alpha-value>)",
        },
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        md: "16px",
        lg: "20px",
        xl: "28px",
        "2xl": "36px",
        "3xl": "48px",
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(35, 45, 35, 0.04), 0 8px 24px rgba(35, 45, 35, 0.06)",
        "subtle-hover": "0 4px 16px rgba(35, 45, 35, 0.08), 0 16px 40px rgba(35, 45, 35, 0.1)",
        card: "0 4px 20px rgba(35, 45, 35, 0.06)",
        "card-hover": "0 12px 40px rgba(35, 45, 35, 0.12)",
        travel: "0 8px 30px rgba(45, 90, 60, 0.15)",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
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
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in": "fade-in 400ms ease-out",
        "scale-in": "scale-in 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slide-up 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 25s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
